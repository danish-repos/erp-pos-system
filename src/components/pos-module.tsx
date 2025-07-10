"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Minus, Trash2, User, CreditCard, Smartphone, Banknote, Printer, MessageSquare, ShoppingCart, AlertTriangle } from "lucide-react"
import { ProductService, SalesService, EmployeeService, BargainingService, type Product, type Employee, type SaleItem } from "@/lib/firebase-services"
import { useToast } from "@/hooks/use-toast"

// Defining the types for cart items
interface CartItem {
  id: string
  name: string
  code: string
  price: number
  quantity: number
  discount: number
  finalPrice: number
  availableStock: number
}

export function POSModule() {
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [staffMember, setStaffMember] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Load products and employees from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, employeesData] = await Promise.all([
          ProductService.getAllProducts(),
          EmployeeService.getAllEmployees(),
        ])
        setProducts(productsData)
        setEmployees(employeesData)
        setLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please refresh the page.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id)
    
    if (existingItem) {
      // Check if adding one more would exceed stock
      if (existingItem.quantity + 1 > product.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} units available for ${product.name}`,
          variant: "destructive",
        })
        return
      }
      
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, finalPrice: (item.quantity + 1) * (item.price - item.discount) }
            : item,
        ),
      )
    } else {
      // Check if product has stock
      if (product.stock <= 0) {
        toast({
          title: "Out of Stock",
          description: `${product.name} is out of stock`,
          variant: "destructive",
        })
        return
      }
      
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          code: product.code,
          price: product.currentPrice,
          quantity: 1,
          discount: 0,
          finalPrice: product.currentPrice,
          availableStock: product.stock,
        },
      ])
    }
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== id))
      return
    }

    const product = products.find((p) => p.id === id)
    if (!product) return

    // Check if new quantity exceeds available stock
    if (newQuantity > product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} units available for ${product.name}`,
        variant: "destructive",
      })
      return
    }

    setCart(
      cart.map((item) =>
        item.id === id
          ? { ...item, quantity: newQuantity, finalPrice: newQuantity * (item.price - item.discount) }
          : item,
      ),
    )
  }

  const updateDiscount = (id: string, discount: number) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, discount, finalPrice: item.quantity * (item.price - discount) } : item,
      ),
    )
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount * item.quantity, 0)
  const total = cart.reduce((sum, item) => sum + item.finalPrice, 0)

  // Check if any cart item exceeds stock
  const hasStockIssues = cart.some((item) => {
    const product = products.find((p) => p.id === item.id)
    return product ? item.quantity > product.stock : false
  })

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout",
        variant: "destructive",
      })
      return
    }

    if (!paymentMethod || !staffMember) {
      toast({
        title: "Missing Information",
        description: "Please select payment method and staff member",
        variant: "destructive",
      })
      return
    }

    // Final stock validation before checkout
    const stockValidation = cart.map((item) => {
      const product = products.find((p) => p.id === item.id)
      return {
        item,
        product,
        hasStock: product ? item.quantity <= product.stock : false,
        availableStock: product?.stock || 0,
      }
    })

    const itemsWithoutStock = stockValidation.filter((validation) => !validation.hasStock)

    if (itemsWithoutStock.length > 0) {
      const errorMessage = itemsWithoutStock
        .map((validation) => `${validation.item.name}: Need ${validation.item.quantity}, Available ${validation.availableStock}`)
        .join(", ")
      
      toast({
        title: "Insufficient Stock",
        description: `Cannot complete sale. ${errorMessage}`,
        variant: "destructive",
      })
      return
    }

    try {
      const saleItems: SaleItem[] = cart.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        quantity: item.quantity,
        originalPrice: item.price,
        finalPrice: item.price - item.discount,
        discount: item.discount,
      }))

      const saleData = {
        invoiceNumber: `INV-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString(),
        customerName: customerName || "Walk-in Customer",
        customerPhone: customerPhone || "",
        customerType: (customerName ? "regular" : "walk-in") as "walk-in" | "regular" | "vip",
        items: saleItems,
        subtotal,
        discount: totalDiscount,
        tax: 0,
        total,
        paymentMethod: paymentMethod as "cash" | "card" | "mobile" | "credit",
        paymentStatus: (paymentMethod === "credit" ? "pending" : "paid") as "paid" | "partial" | "pending",
        deliveryStatus: "pickup" as "pickup" | "delivered" | "pending" | "cancelled",
        staffMember: employees.find((emp) => emp.id === staffMember)?.name || "",
        notes: "",
        returnStatus: "none" as "none" | "partial" | "full",
      }

      await SalesService.createSale(saleData)

      // Update product stock
      for (const item of cart) {
        const product = products.find((p) => p.id === item.id)
        if (product) {
          await ProductService.updateProduct(item.id, {
            stock: product.stock - item.quantity,
          })
        }
      }

      // Create bargain records for discounted items
      for (const item of cart) {
        if (item.discount > 0) {
          await BargainingService.createBargainRecord({
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString(),
            productName: item.name,
            productCode: item.code,
            originalPrice: item.price,
            finalPrice: item.price - item.discount,
            discountAmount: item.discount,
            discountPercentage: item.price > 0 ? Math.round((item.discount / item.price) * 100) : 0,
            customerName: customerName || "Walk-in Customer",
            customerPhone: customerPhone || "",
            staffMember: employees.find((emp) => emp.id === staffMember)?.name || "",
            reason: "POS Sale Discount",
            invoiceNumber: saleData.invoiceNumber,
            category: products.find((p) => p.id === item.id)?.fabricType || "",
            profitMargin: item.price > 0 ? Math.round(((item.price - item.discount - (products.find((p) => p.id === item.id)?.purchaseCost || 0)) / item.price) * 100) : 0,
            status: "approved",
          })
        }
      }

      // Update local products state to reflect new stock levels
      setProducts(products.map(product => {
        const cartItem = cart.find(item => item.id === product.id)
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity }
        }
        return product
      }))

      // Update employee's monthly sales and performance score
      if (staffMember) {
        const selectedEmployee = employees.find((emp) => emp.id === staffMember);
        if (selectedEmployee) {
          const newMonthlySales = selectedEmployee.monthlySales + total;
          
          // Calculate new performance score based on sales performance
          // Performance score can be based on meeting targets, sales growth, etc.
          const targetAchievement = (newMonthlySales / selectedEmployee.monthlyTarget) * 100;
          const currentPerformance = selectedEmployee.performanceScore;
          
          // Update performance score: 70% weight to current performance, 30% to new achievement
          const newPerformanceScore = Math.min(100, Math.max(0, 
            (currentPerformance * 0.7) + (Math.min(targetAchievement, 100) * 0.3)
          ));
          
          await EmployeeService.updateEmployee(staffMember, {
            monthlySales: newMonthlySales,
            totalSales: selectedEmployee.totalSales + total,
            performanceScore: Math.round(newPerformanceScore),
          });
        }
      }

      toast({
        title: "Sale Completed",
        description: `Sale completed successfully! Total: Rs${total.toLocaleString()}`,
      })

      // Reset form
      setCart([])
      setCustomerName("")
      setCustomerPhone("")
      setPaymentMethod("")
      
    } catch {
      toast({
        title: "Error",
        description: "Failed to complete sale. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Print invoice handler
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return

    // Format invoice HTML
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h2 { margin-bottom: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
            .totals { margin-top: 24px; }
            .totals td { border: none; }
          </style>
        </head>
        <body>
          <h2>Invoice</h2>
          <p><strong>Invoice #:</strong> INV-${Date.now()}<br/>
          <strong>Date:</strong> ${new Date().toLocaleDateString()}<br/>
          <strong>Time:</strong> ${new Date().toLocaleTimeString()}<br/>
          <strong>Customer:</strong> ${customerName || 'Walk-in Customer'}<br/>
          <strong>Phone:</strong> ${customerPhone || '-'}<br/>
          <strong>Staff:</strong> ${employees.find((emp) => emp.id === staffMember)?.name || ''}</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.code}</td>
                  <td>${item.quantity}</td>
                  <td>Rs${item.price}</td>
                  <td>Rs${item.discount}</td>
                  <td>Rs${item.finalPrice}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <table class="totals">
            <tr><td><strong>Subtotal:</strong></td><td>Rs${subtotal.toLocaleString()}</td></tr>
            <tr><td><strong>Total Discount:</strong></td><td>-Rs${totalDiscount.toLocaleString()}</td></tr>
            <tr><td><strong>Total:</strong></td><td>Rs${total.toLocaleString()}</td></tr>
          </table>
        </body>
      </html>
    `
    printWindow.document.write(invoiceHtml)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  // WhatsApp invoice handler
  const handleWhatsAppInvoice = () => {
    if (!customerPhone) {
      toast({
        title: "Missing Phone Number",
        description: "Please enter the customer's phone number to send the invoice via WhatsApp.",
        variant: "destructive",
      })
      return
    }
    // Format WhatsApp message
    const message =
      `*Invoice*\n` +
      `Invoice #: INV-${Date.now()}\n` +
      `Date: ${new Date().toLocaleDateString()}\n` +
      `Time: ${new Date().toLocaleTimeString()}\n` +
      `Customer: ${customerName || 'Walk-in Customer'}\n` +
      `Staff: ${employees.find((emp) => emp.id === staffMember)?.name || ''}\n` +
      `\n*Items:*\n` +
      cart.map(item => `${item.name} (${item.code}) x${item.quantity} - Rs${item.finalPrice}`).join("\n") +
      `\n\nSubtotal: Rs${subtotal.toLocaleString()}\n` +
      `Discount: -Rs${totalDiscount.toLocaleString()}\n` +
      `Total: Rs${total.toLocaleString()}`
    // WhatsApp API URL (international format, no + or leading 0)
    const phone = customerPhone.replace(/[^0-9]/g, "")
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading POS data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Product Search & Selection */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Product Search
            </CardTitle>
            <CardDescription>Search by product name or code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer ${
                      product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => product.stock > 0 && addToCart(product)}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Code: {product.code}</p>
                      <p className={`text-sm ${product.stock <= 0 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                        Stock: {product.stock}
                        {product.stock <= 0 && (
                          <span className="ml-2 text-red-500 font-medium">Out of Stock</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rs{product.currentPrice}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled={product.stock <= 0}
                        className={product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={staffMember} onValueChange={setStaffMember}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member handling this sale" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
              {hasStockIssues && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Cart is empty</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => {
                  const product = products.find((p) => p.id === item.id)
                  const exceedsStock = product ? item.quantity > product.stock : false
                  
                  return (
                    <div key={item.id} className={`space-y-2 p-3 border rounded-lg ${exceedsStock ? 'border-red-200 bg-red-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.code}</p>
                          {exceedsStock && (
                            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Exceeds stock ({product?.stock || 0} available)
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={product ? item.quantity >= product.stock : false}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Price:</span>
                          <span>Rs{item.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Discount:</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.discount}
                            onChange={(e) => updateDiscount(item.id, Number(e.target.value))}
                            className="h-6 text-xs"
                          />
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>Total:</span>
                          <span>Rs{item.finalPrice}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Total Discount:</span>
                <span>-Rs{totalDiscount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>Rs{total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </CardTitle>
            <CardDescription>Optional customer information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                placeholder="Enter phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Cash
                  </div>
                </SelectItem>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card
                  </div>
                </SelectItem>
                <SelectItem value="mobile">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Transfer
                  </div>
                </SelectItem>
                <SelectItem value="credit">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Credit Sale
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleCheckout}
                disabled={cart.length === 0 || !paymentMethod || !staffMember || hasStockIssues}
                className="w-full"
              >
                Complete Sale
              </Button>
              <Button variant="outline" className="w-full bg-transparent" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>

            <Button variant="outline" className="w-full bg-transparent" onClick={handleWhatsAppInvoice}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send WhatsApp Invoice
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
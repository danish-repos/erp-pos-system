"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Minus, Trash2, User, CreditCard, Smartphone, Banknote, Printer, MessageSquare, ShoppingCart} from "lucide-react"

interface CartItem {
  id: string
  name: string
  code: string
  price: number
  quantity: number
  discount: number
  finalPrice: number
}

export function POSModule() {
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [staffMember, setStaffMember] = useState("")

  // Sample products
  const products = [
    { id: "1", name: "Cotton Kurta - Blue", code: "CK001", price: 1200, stock: 15 },
    { id: "2", name: "Silk Dupatta - Red", code: "SD002", price: 800, stock: 8 },
    { id: "3", name: "Linen Shirt - White", code: "LS003", price: 1500, stock: 12 },
    { id: "4", name: "Cotton Pants - Black", code: "CP004", price: 900, stock: 20 },
    { id: "5", name: "Silk Saree - Green", code: "SS005", price: 3500, stock: 5 },
  ]

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addToCart = (product: (typeof products)[0]) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, finalPrice: (item.quantity + 1) * (item.price - item.discount) }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          code: product.code,
          price: product.price,
          quantity: 1,
          discount: 0,
          finalPrice: product.price,
        },
      ])
    }
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== id))
    } else {
      setCart(
        cart.map((item) =>
          item.id === id
            ? { ...item, quantity: newQuantity, finalPrice: newQuantity * (item.price - item.discount) }
            : item,
        ),
      )
    }
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

  const handleCheckout = () => {
    if (cart.length === 0) return

    // Here you would typically process the sale
    alert(`Sale completed! Total: Rs${total.toLocaleString()}`)

    // Reset form
    setCart([])
    setCustomerName("")
    setCustomerPhone("")
    setPaymentMethod("")
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
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">Code: {product.code}</p>
                      <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rs{product.price}</p>
                      <Button size="sm" variant="outline">
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
                <SelectItem value="ahmed">Ahmed Ali</SelectItem>
                <SelectItem value="fatima">Fatima Khan</SelectItem>
                <SelectItem value="hassan">Hassan Sheikh</SelectItem>
                <SelectItem value="sara">Sara Ahmed</SelectItem>
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
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Cart is empty</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.code}</p>
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
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
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
                ))}
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
                disabled={cart.length === 0 || !paymentMethod || !staffMember}
                className="w-full"
              >
                Complete Sale
              </Button>
              <Button variant="outline" className="w-full">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>

            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send WhatsApp Invoice
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

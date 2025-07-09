"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Search,
  Download,
  Eye,
  Phone,
  MessageSquare,
  Truck,
  CheckCircle,
  DollarSign,
  User,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SalesService, type SaleRecord } from "@/lib/firebase-services"

export function SalesLedger() {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<SaleRecord | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSalesData()

    // Set up real-time listener
    const unsubscribe = SalesService.subscribeToSales((sales) => {
      setSalesRecords(sales)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loadSalesData = async () => {
    try {
      setLoading(true)
      const sales = await SalesService.getAllSales()
      setSalesRecords(sales)
    } catch (error) {
      console.error("Error loading sales data:", error)
      toast({
        title: "Error",
        description: "Failed to load sales data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateDeliveryStatus = async (saleId: string, status: "pickup" | "delivered" | "pending" | "cancelled") => {
    try {
      await SalesService.updateSale(saleId, {
        deliveryStatus: status,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Success",
        description: `Delivery status updated to ${status}`,
      })
    } catch (error) {
      console.error("Error updating delivery status:", error)
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      })
    }
  }

  const updatePaymentStatus = async (saleId: string, status: "paid" | "partial" | "pending") => {
    try {
      await SalesService.updateSale(saleId, {
        paymentStatus: status,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Success",
        description: `Payment status updated to ${status}`,
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      })
    }
  }

  const filteredRecords = salesRecords.filter((record) => {
    const matchesSearch =
      record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customerPhone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || record.deliveryStatus === statusFilter
    const matchesPayment = paymentFilter === "all" || record.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const totalSales = salesRecords.reduce((sum, record) => sum + record.total, 0)
  const totalDiscount = salesRecords.reduce((sum, record) => sum + record.discount, 0)
  const pendingDeliveries = salesRecords.filter((record) => record.deliveryStatus === "pending").length
  const pendingPayments = salesRecords.filter((record) => record.paymentStatus === "pending").length

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case "vip":
        return "default"
      case "regular":
        return "secondary"
      case "walk-in":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "partial":
        return "secondary"
      case "pending":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "default"
      case "pickup":
        return "secondary"
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading sales data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Sales Ledger</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Sales
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{salesRecords.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalDiscount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalSales > 0 ? ((totalDiscount / (totalSales + totalDiscount)) * 100).toFixed(1) : 0}% of gross sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingDeliveries}</div>
            <p className="text-xs text-muted-foreground">Orders awaiting delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Credit sales outstanding</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-sales">All Sales</TabsTrigger>
          <TabsTrigger value="pending-delivery">Pending Delivery</TabsTrigger>
          <TabsTrigger value="pending-payment">Pending Payment</TabsTrigger>
          <TabsTrigger value="customer-history">Customer History</TabsTrigger>
        </TabsList>

        <TabsContent value="all-sales" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by invoice, customer name, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sales Records
              </CardTitle>
              <CardDescription>Complete transaction history with customer and delivery details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {record.date} • {record.time}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.customerName}</p>
                            <p className="text-sm text-muted-foreground">{record.customerPhone}</p>
                            <Badge variant={getCustomerTypeColor(record.customerType) as any} className="text-xs">
                              {record.customerType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{record.items.length} items</p>
                            <p className="text-xs text-muted-foreground">
                              {record.items.reduce((sum, item) => sum + item.quantity, 0)} units
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">₹{record.total.toLocaleString()}</p>
                            {record.discount > 0 && (
                              <p className="text-xs text-red-600">-₹{record.discount.toLocaleString()} discount</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={getPaymentStatusColor(record.paymentStatus) as any}>
                              {record.paymentStatus}
                            </Badge>
                            <p className="text-xs text-muted-foreground">{record.paymentMethod}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={getDeliveryStatusColor(record.deliveryStatus) as any}>
                              {record.deliveryStatus}
                            </Badge>
                            {record.deliveryDate && (
                              <p className="text-xs text-muted-foreground">{record.deliveryDate}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{record.staffMember}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRecord(record)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Pending Deliveries
              </CardTitle>
              <CardDescription>Orders awaiting delivery or pickup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesRecords
                  .filter((record) => record.deliveryStatus === "pending")
                  .map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{record.invoiceNumber}</p>
                          <Badge variant="outline">{record.customerType}</Badge>
                        </div>
                        <p className="text-sm">{record.customerName}</p>
                        <p className="text-sm text-muted-foreground">{record.deliveryAddress}</p>
                        <p className="text-xs text-muted-foreground">
                          Expected: {record.deliveryDate} • ₹{record.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateDeliveryStatus(record.id, "delivered")}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Delivered
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {salesRecords.filter((record) => record.deliveryStatus === "pending").length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-muted-foreground">No pending deliveries</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pending Payments
              </CardTitle>
              <CardDescription>Credit sales awaiting payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesRecords
                  .filter((record) => record.paymentStatus === "pending")
                  .map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{record.invoiceNumber}</p>
                          <Badge variant="destructive">Credit Sale</Badge>
                        </div>
                        <p className="text-sm">{record.customerName}</p>
                        <p className="text-sm text-muted-foreground">{record.customerPhone}</p>
                        <p className="text-xs text-muted-foreground">
                          Sale Date: {record.date} • Amount: ₹{record.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updatePaymentStatus(record.id, "paid")}>
                          <DollarSign className="h-4 w-4 mr-1" />
                          Record Payment
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {salesRecords.filter((record) => record.paymentStatus === "pending").length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-muted-foreground">No pending payments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Purchase History
              </CardTitle>
              <CardDescription>Track individual customer purchase patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Group sales by customer */}
                {Object.entries(
                  salesRecords.reduce(
                    (acc, record) => {
                      if (!acc[record.customerName]) {
                        acc[record.customerName] = {
                          customer: record,
                          totalPurchases: 0,
                          totalAmount: 0,
                          lastPurchase: record.date,
                          purchases: [],
                        }
                      }
                      acc[record.customerName].totalPurchases += 1
                      acc[record.customerName].totalAmount += record.total
                      acc[record.customerName].purchases.push(record)
                      if (record.date > acc[record.customerName].lastPurchase) {
                        acc[record.customerName].lastPurchase = record.date
                      }
                      return acc
                    },
                    {} as Record<string, any>,
                  ),
                ).map(([customerName, data]) => (
                  <div key={customerName} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{customerName}</p>
                          <Badge variant={getCustomerTypeColor(data.customer.customerType) as any}>
                            {data.customer.customerType}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{data.customer.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{data.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{data.totalPurchases} purchases</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Purchase</p>
                        <p>{data.lastPurchase}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Average Order</p>
                        <p>₹{Math.round(data.totalAmount / data.totalPurchases).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Customer Since</p>
                        <p>{data.purchases[data.purchases.length - 1].date}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {salesRecords.length === 0 && (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No customer data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState } from "react"
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

interface SaleRecord {
  id: string
  invoiceNumber: string
  date: string
  time: string
  customerName: string
  customerPhone: string
  customerType: "walk-in" | "regular" | "vip"
  items: SaleItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: "cash" | "card" | "mobile" | "credit"
  paymentStatus: "paid" | "partial" | "pending"
  deliveryStatus: "pickup" | "delivered" | "pending" | "cancelled"
  deliveryAddress?: string
  deliveryDate?: string
  staffMember: string
  notes: string
  returnStatus: "none" | "partial" | "full"
}

interface SaleItem {
  id: string
  name: string
  code: string
  quantity: number
  originalPrice: number
  finalPrice: number
  discount: number
}

export function SalesLedger() {
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      date: "2024-01-15",
      time: "14:30",
      customerName: "Ali Hassan",
      customerPhone: "+92-300-1234567",
      customerType: "regular",
      items: [
        {
          id: "1",
          name: "Cotton Kurta - Blue",
          code: "CK001",
          quantity: 2,
          originalPrice: 1200,
          finalPrice: 950,
          discount: 250,
        },
        {
          id: "2",
          name: "Cotton Pants - Black",
          code: "CP004",
          quantity: 1,
          originalPrice: 900,
          finalPrice: 900,
          discount: 0,
        },
      ],
      subtotal: 2800,
      discount: 250,
      tax: 0,
      total: 2550,
      paymentMethod: "cash",
      paymentStatus: "paid",
      deliveryStatus: "pickup",
      staffMember: "Ahmed Ali",
      notes: "Regular customer, wedding purchase",
      returnStatus: "none",
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      date: "2024-01-15",
      time: "16:45",
      customerName: "Fatima Khan",
      customerPhone: "+92-301-9876543",
      customerType: "vip",
      items: [
        {
          id: "1",
          name: "Silk Dupatta - Red",
          code: "SD002",
          quantity: 3,
          originalPrice: 800,
          finalPrice: 650,
          discount: 150,
        },
      ],
      subtotal: 2400,
      discount: 450,
      tax: 0,
      total: 1950,
      paymentMethod: "card",
      paymentStatus: "paid",
      deliveryStatus: "delivered",
      deliveryAddress: "123 Garden Town, Lahore",
      deliveryDate: "2024-01-16",
      staffMember: "Fatima Khan",
      notes: "VIP customer, bulk purchase discount",
      returnStatus: "none",
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-003",
      date: "2024-01-16",
      time: "11:20",
      customerName: "Hassan Sheikh",
      customerPhone: "+92-302-5555555",
      customerType: "walk-in",
      items: [
        {
          id: "1",
          name: "Linen Shirt - White",
          code: "LS003",
          quantity: 1,
          originalPrice: 1500,
          finalPrice: 1250,
          discount: 250,
        },
      ],
      subtotal: 1500,
      discount: 250,
      tax: 0,
      total: 1250,
      paymentMethod: "mobile",
      paymentStatus: "paid",
      deliveryStatus: "pending",
      deliveryAddress: "456 Model Town, Lahore",
      deliveryDate: "2024-01-18",
      staffMember: "Hassan Sheikh",
      notes: "First-time customer",
      returnStatus: "none",
    },
    {
      id: "4",
      invoiceNumber: "INV-2024-004",
      date: "2024-01-16",
      time: "17:10",
      customerName: "Sara Ahmed",
      customerPhone: "+92-304-1111111",
      customerType: "regular",
      items: [
        {
          id: "1",
          name: "Cotton Kurta - Blue",
          code: "CK001",
          quantity: 1,
          originalPrice: 1200,
          finalPrice: 1200,
          discount: 0,
        },
      ],
      subtotal: 1200,
      discount: 0,
      tax: 0,
      total: 1200,
      paymentMethod: "credit",
      paymentStatus: "pending",
      deliveryStatus: "pickup",
      staffMember: "Ahmed Ali",
      notes: "Credit sale, 30 days payment terms",
      returnStatus: "none",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<SaleRecord | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

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
            <div className="text-2xl font-bold">Rs{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{salesRecords.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Rs{totalDiscount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((totalDiscount / (totalSales + totalDiscount)) * 100).toFixed(1)}% of gross sales
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
                            <p className="font-medium">Rs{record.total.toLocaleString()}</p>
                            {record.discount > 0 && (
                              <p className="text-xs text-red-600">-Rs{record.discount.toLocaleString()} discount</p>
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
                          Expected: {record.deliveryDate} • Rs{record.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Delivered
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                          Sale Date: {record.date} • Amount: Rs{record.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Record Payment
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                        <p className="font-medium">Rs{data.totalAmount.toLocaleString()}</p>
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
                        <p>Rs{Math.round(data.totalAmount / data.totalPurchases).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Customer Since</p>
                        <p>{data.purchases[data.purchases.length - 1].date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingDown, TrendingUp, Users, AlertTriangle, BarChart3, Filter, Download, Eye, Target } from "lucide-react"

interface BargainRecord {
  id: string
  date: string
  time: string
  productName: string
  productCode: string
  originalPrice: number
  finalPrice: number
  discountAmount: number
  discountPercentage: number
  customerName?: string
  customerPhone?: string
  staffMember: string
  reason: string
  invoiceNumber: string
  category: string
  profitMargin: number
  status: "approved" | "rejected" | "pending"
}

interface DailyBargainSummary {
  date: string
  totalSales: number
  totalDiscount: number
  averageDiscount: number
  bargainCount: number
  topBargainedItem: string
  staffWithMostBargains: string
}

export function BargainingTracker() {
  const [bargainRecords, setBargainRecords] = useState<BargainRecord[]>([
    {
      id: "1",
      date: "2024-01-15",
      time: "14:30",
      productName: "Cotton Kurta - Blue",
      productCode: "CK001",
      originalPrice: 1200,
      finalPrice: 950,
      discountAmount: 250,
      discountPercentage: 20.8,
      customerName: "Ali Hassan",
      customerPhone: "+92-300-1234567",
      staffMember: "Ahmed Ali",
      reason: "Regular customer discount",
      invoiceNumber: "INV-2024-001",
      category: "Kurtas",
      profitMargin: 35,
      status: "approved",
    },
    {
      id: "2",
      date: "2024-01-15",
      time: "16:45",
      productName: "Silk Dupatta - Red",
      productCode: "SD002",
      originalPrice: 800,
      finalPrice: 650,
      discountAmount: 150,
      discountPercentage: 18.8,
      customerName: "Fatima Khan",
      customerPhone: "+92-301-9876543",
      staffMember: "Fatima Khan",
      reason: "Bulk purchase discount",
      invoiceNumber: "INV-2024-002",
      category: "Dupatta",
      profitMargin: 42,
      status: "approved",
    },
    {
      id: "3",
      date: "2024-01-16",
      time: "11:20",
      productName: "Linen Shirt - White",
      productCode: "LS003",
      originalPrice: 1500,
      finalPrice: 1250,
      discountAmount: 250,
      discountPercentage: 16.7,
      customerName: "Hassan Sheikh",
      staffMember: "Hassan Sheikh",
      reason: "Minor defect compensation",
      invoiceNumber: "INV-2024-003",
      category: "Shirts",
      profitMargin: 28,
      status: "approved",
    },
    {
      id: "4",
      date: "2024-01-16",
      time: "17:10",
      productName: "Cotton Pants - Black",
      productCode: "CP004",
      originalPrice: 900,
      finalPrice: 600,
      discountAmount: 300,
      discountPercentage: 33.3,
      customerName: "Sara Ahmed",
      staffMember: "Ahmed Ali",
      reason: "End of season clearance",
      invoiceNumber: "INV-2024-004",
      category: "Pants",
      profitMargin: 15,
      status: "approved",
    },
  ])

  const [dateFilter, setDateFilter] = useState("today")
  const [staffFilter, setStaffFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredRecords = bargainRecords.filter((record) => {
    const matchesStaff = staffFilter === "all" || record.staffMember === staffFilter
    const matchesCategory = categoryFilter === "all" || record.category === categoryFilter
    // Add date filtering logic here
    return matchesStaff && matchesCategory
  })

  const totalDiscountGiven = bargainRecords.reduce((sum, record) => sum + record.discountAmount, 0)
  const averageDiscountPercentage =
    bargainRecords.reduce((sum, record) => sum + record.discountPercentage, 0) / bargainRecords.length
  const totalBargainTransactions = bargainRecords.length

  // Staff performance analysis
  const staffBargainStats = bargainRecords.reduce(
    (acc, record) => {
      if (!acc[record.staffMember]) {
        acc[record.staffMember] = {
          name: record.staffMember,
          totalBargains: 0,
          totalDiscount: 0,
          averageDiscount: 0,
        }
      }
      acc[record.staffMember].totalBargains += 1
      acc[record.staffMember].totalDiscount += record.discountAmount
      acc[record.staffMember].averageDiscount =
        acc[record.staffMember].totalDiscount / acc[record.staffMember].totalBargains
      return acc
    },
    {} as Record<string, any>,
  )

  // Product bargain frequency
  const productBargainStats = bargainRecords.reduce(
    (acc, record) => {
      if (!acc[record.productCode]) {
        acc[record.productCode] = {
          name: record.productName,
          code: record.productCode,
          bargainCount: 0,
          totalDiscount: 0,
          averageDiscount: 0,
        }
      }
      acc[record.productCode].bargainCount += 1
      acc[record.productCode].totalDiscount += record.discountAmount
      acc[record.productCode].averageDiscount =
        acc[record.productCode].totalDiscount / acc[record.productCode].bargainCount
      return acc
    },
    {} as Record<string, any>,
  )

  const getDiscountSeverity = (percentage: number) => {
    if (percentage >= 30) return { color: "destructive", label: "High Risk" }
    if (percentage >= 20) return { color: "secondary", label: "Moderate" }
    if (percentage >= 10) return { color: "default", label: "Normal" }
    return { color: "outline", label: "Low" }
  }

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 40) return "text-green-600"
    if (margin >= 25) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bargaining Tracker</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Discount Given
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Rs{totalDiscountGiven.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDiscountPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bargain Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBargainTransactions}</div>
            <p className="text-xs text-muted-foreground">Total negotiations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {((totalDiscountGiven / (totalDiscountGiven + 100000)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Revenue impact</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Bargain Records</TabsTrigger>
          <TabsTrigger value="staff-analysis">Staff Analysis</TabsTrigger>
          <TabsTrigger value="product-analysis">Product Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={staffFilter} onValueChange={setStaffFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    <SelectItem value="Ahmed Ali">Ahmed Ali</SelectItem>
                    <SelectItem value="Fatima Khan">Fatima Khan</SelectItem>
                    <SelectItem value="Hassan Sheikh">Hassan Sheikh</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Kurtas">Kurtas</SelectItem>
                    <SelectItem value="Dupatta">Dupatta</SelectItem>
                    <SelectItem value="Shirts">Shirts</SelectItem>
                    <SelectItem value="Pants">Pants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bargain Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Bargain Records
              </CardTitle>
              <CardDescription>Detailed log of all bargaining transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Original Price</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Profit Margin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const discountSeverity = getDiscountSeverity(record.discountPercentage)

                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.date}</p>
                              <p className="text-sm text-muted-foreground">{record.time}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.productName}</p>
                              <p className="text-sm text-muted-foreground">{record.productCode}</p>
                              <Badge variant="outline" className="text-xs">
                                {record.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>Rs{record.originalPrice.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="font-medium">Rs{record.finalPrice.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-red-600">-Rs{record.discountAmount}</p>
                              <Badge variant={discountSeverity.color as any} className="text-xs">
                                {record.discountPercentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{record.customerName || "Walk-in"}</p>
                              {record.customerPhone && (
                                <p className="text-xs text-muted-foreground">{record.customerPhone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{record.staffMember}</p>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getProfitMarginColor(record.profitMargin)}`}>
                              {record.profitMargin}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.status === "approved" ? "default" : "secondary"}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Bargaining Performance
              </CardTitle>
              <CardDescription>Analysis of discount approvals by staff members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(staffBargainStats).map((staff: any) => (
                  <div key={staff.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{staff.name}</h3>
                      <Badge variant="outline">{staff.totalBargains} bargains</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Discount Given</p>
                        <p className="font-medium text-red-600">Rs{staff.totalDiscount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Average Discount</p>
                        <p className="font-medium">Rs{staff.averageDiscount.toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Performance</p>
                        <p className={`font-medium ${staff.averageDiscount > 200 ? "text-red-600" : "text-green-600"}`}>
                          {staff.averageDiscount > 200 ? "High Discount" : "Controlled"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={Math.min((staff.totalDiscount / totalDiscountGiven) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Product Bargaining Frequency
              </CardTitle>
              <CardDescription>Items that are frequently bargained and their impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(productBargainStats).map((product: any) => (
                  <div key={product.code} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.code}</p>
                      </div>
                      <Badge variant="outline">{product.bargainCount} times bargained</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Discount</p>
                        <p className="font-medium text-red-600">Rs{product.totalDiscount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Discount</p>
                        <p className="font-medium">Rs{product.averageDiscount.toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bargain Rate</p>
                        <p className="font-medium">
                          {((product.bargainCount / totalBargainTransactions) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={(product.bargainCount / totalBargainTransactions) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  High Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Excessive Discounting Detected</p>
                    <p className="text-xs text-red-600">
                      Cotton Pants category showing 33% average discount - review pricing strategy
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-800">Staff Training Needed</p>
                    <p className="text-xs text-orange-600">
                      Ahmed Ali has approved 40% more discounts than average this week
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Profit Margin Warning</p>
                    <p className="text-xs text-yellow-600">
                      15% of transactions have profit margins below 20% - monitor closely
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Set Discount Limits</p>
                    <p className="text-xs text-green-600">
                      Implement maximum 25% discount policy for items with margins below 30%
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Staff Incentives</p>
                    <p className="text-xs text-blue-600">
                      Reward staff who maintain profit margins above 35% with bonus structure
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">Price Review</p>
                    <p className="text-xs text-purple-600">
                      Consider repricing frequently bargained items to reduce negotiation frequency
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

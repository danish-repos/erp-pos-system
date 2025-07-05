"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  Target,
  BarChart3,
  PieChartIcon,
} from "lucide-react"

export function ReportsModule() {
  const [dateRange, setDateRange] = useState("month")
  const [reportType, setReportType] = useState("sales")

  // Sample data for charts
  const salesData = [
    { month: "Jan", sales: 125000, profit: 45000, orders: 156 },
    { month: "Feb", sales: 142000, profit: 52000, orders: 178 },
    { month: "Mar", sales: 138000, profit: 48000, orders: 165 },
    { month: "Apr", sales: 165000, profit: 62000, orders: 198 },
    { month: "May", sales: 158000, profit: 58000, orders: 187 },
    { month: "Jun", sales: 175000, profit: 68000, orders: 210 },
  ]

  const categoryData = [
    { name: "Kurtas", value: 35, sales: 245000, color: "#8884d8" },
    { name: "Dupatta", value: 25, sales: 175000, color: "#82ca9d" },
    { name: "Shirts", value: 20, sales: 140000, color: "#ffc658" },
    { name: "Pants", value: 15, sales: 105000, color: "#ff7300" },
    { name: "Others", value: 5, sales: 35000, color: "#00ff00" },
  ]

  const employeePerformance = [
    { name: "Ahmed Ali", sales: 125000, target: 150000, commission: 3125 },
    { name: "Fatima Khan", sales: 98000, target: 100000, commission: 1960 },
    { name: "Hassan Sheikh", sales: 65000, target: 80000, commission: 975 },
    { name: "Sara Ahmed", sales: 45000, target: 60000, commission: 450 },
  ]

  const inventoryData = [
    { category: "Kurtas", inStock: 145, lowStock: 12, outOfStock: 3 },
    { category: "Dupatta", inStock: 89, lowStock: 8, outOfStock: 2 },
    { category: "Shirts", inStock: 67, lowStock: 15, outOfStock: 5 },
    { category: "Pants", inStock: 123, lowStock: 6, outOfStock: 1 },
  ]

  const customerData = [
    { type: "New Customers", count: 45, percentage: 35 },
    { type: "Returning Customers", count: 78, percentage: 60 },
    { type: "VIP Customers", count: 12, percentage: 5 },
  ]

  const profitMarginData = [
    { product: "Cotton Kurta", margin: 45, sales: 25000 },
    { product: "Silk Dupatta", margin: 52, sales: 18000 },
    { product: "Linen Shirt", margin: 38, sales: 22000 },
    { product: "Cotton Pants", margin: 42, sales: 15000 },
  ]

  const generateReport = () => {
    // In a real app, this would generate and download the report
    alert(`Generating ${reportType} report for ${dateRange}...`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales Report</SelectItem>
              <SelectItem value="inventory">Inventory Report</SelectItem>
              <SelectItem value="employee">Employee Report</SelectItem>
              <SelectItem value="financial">Financial Report</SelectItem>
              <SelectItem value="customer">Customer Report</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs1,003,000</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38.2%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-purple-600" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,094</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +8.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">135</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +15.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          <TabsTrigger value="employee">Employee Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
          <TabsTrigger value="customer">Customer Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sales Trend
                </CardTitle>
                <CardDescription>Monthly sales and profit analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sales: {
                      label: "Sales",
                      color: "hsl(var(--chart-1))",
                    },
                    profit: {
                      label: "Profit",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" name="Sales (Rs)" />
                      <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" name="Profit (Rs)" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Sales by Category
                </CardTitle>
                <CardDescription>Product category performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    kurtas: { label: "Kurtas", color: "#8884d8" },
                    dupatta: { label: "Dupatta", color: "#82ca9d" },
                    shirts: { label: "Shirts", color: "#ffc658" },
                    pants: { label: "Pants", color: "#ff7300" },
                    others: { label: "Others", color: "#00ff00" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profitMarginData.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.product}</p>
                      <p className="text-sm text-muted-foreground">Sales: Rs{product.sales.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.margin}% margin</p>
                      <Badge variant={product.margin > 45 ? "default" : product.margin > 35 ? "secondary" : "outline"}>
                        {product.margin > 45 ? "Excellent" : product.margin > 35 ? "Good" : "Average"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Status
                </CardTitle>
                <CardDescription>Stock levels across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    inStock: { label: "In Stock", color: "hsl(var(--chart-1))" },
                    lowStock: { label: "Low Stock", color: "hsl(var(--chart-2))" },
                    outOfStock: { label: "Out of Stock", color: "hsl(var(--chart-3))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="inStock" stackId="a" fill="var(--color-inStock)" name="In Stock" />
                      <Bar dataKey="lowStock" stackId="a" fill="var(--color-lowStock)" name="Low Stock" />
                      <Bar dataKey="outOfStock" stackId="a" fill="var(--color-outOfStock)" name="Out of Stock" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Stock Alerts
                </CardTitle>
                <CardDescription>Items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-800">Critical Stock Level</p>
                        <p className="text-sm text-red-600">5 items out of stock</p>
                      </div>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-orange-800">Low Stock Warning</p>
                        <p className="text-sm text-orange-600">41 items below minimum level</p>
                      </div>
                      <Badge variant="secondary">Monitor</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800">Reorder Suggestions</p>
                        <p className="text-sm text-blue-600">12 items recommended for reorder</p>
                      </div>
                      <Badge variant="outline">Action</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Valuation</CardTitle>
              <CardDescription>Current inventory value by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-2xl font-bold">Rs{category.sales.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{category.value}% of total inventory</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employee" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Performance
              </CardTitle>
              <CardDescription>Sales performance vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: { label: "Sales", color: "hsl(var(--chart-1))" },
                  target: { label: "Target", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="sales" fill="var(--color-sales)" name="Actual Sales (Rs)" />
                    <Bar dataKey="target" fill="var(--color-target)" name="Target (Rs)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {employeePerformance.map((employee, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Sales Achievement:</span>
                    <span className="font-medium">
                      {Math.round((employee.sales / employee.target) * 100)}% of target
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Sales:</span>
                    <span className="font-medium">Rs{employee.sales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission Earned:</span>
                    <span className="font-medium">Rs{employee.commission.toLocaleString()}</span>
                  </div>
                  <Badge
                    variant={
                      employee.sales >= employee.target
                        ? "default"
                        : employee.sales >= employee.target * 0.8
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {employee.sales >= employee.target
                      ? "Target Achieved"
                      : employee.sales >= employee.target * 0.8
                        ? "On Track"
                        : "Needs Improvement"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Gross Sales:</span>
                    <span className="font-medium">Rs1,003,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Returns:</span>
                    <span className="font-medium text-red-600">-Rs15,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discounts:</span>
                    <span className="font-medium text-red-600">-Rs45,000</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Net Sales:</span>
                    <span>Rs943,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cost of Goods:</span>
                    <span className="font-medium">Rs583,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff Salaries:</span>
                    <span className="font-medium">Rs133,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Expenses:</span>
                    <span className="font-medium">Rs67,000</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total Costs:</span>
                    <span>Rs783,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Profit Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Gross Profit:</span>
                    <span className="font-medium text-green-600">Rs360,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Profit:</span>
                    <span className="font-medium text-green-600">Rs160,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Margin:</span>
                    <span className="font-medium">17.0%</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Net Profit:</span>
                    <span>Rs160,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>Monthly cash inflow and outflow</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  inflow: { label: "Cash Inflow", color: "hsl(var(--chart-1))" },
                  outflow: { label: "Cash Outflow", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "Jan", inflow: 125000, outflow: 95000 },
                      { month: "Feb", inflow: 142000, outflow: 108000 },
                      { month: "Mar", inflow: 138000, outflow: 102000 },
                      { month: "Apr", inflow: 165000, outflow: 125000 },
                      { month: "May", inflow: 158000, outflow: 118000 },
                      { month: "Jun", inflow: 175000, outflow: 135000 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="inflow" stroke="var(--color-inflow)" name="Cash Inflow (Rs)" />
                    <Line type="monotone" dataKey="outflow" stroke="var(--color-outflow)" name="Cash Outflow (Rs)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Segmentation
                </CardTitle>
                <CardDescription>Customer distribution by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerData.map((segment, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span>{segment.type}</span>
                        <span className="font-medium">{segment.count} customers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${segment.percentage}%` }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground">{segment.percentage}% of total customers</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
                <CardDescription>Key customer metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">Customer Retention</p>
                        <p className="text-sm text-green-600">78% repeat purchase rate</p>
                      </div>
                      <Badge variant="default">Excellent</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800">Average Order Value</p>
                        <p className="text-sm text-blue-600">Rs2,450 per transaction</p>
                      </div>
                      <Badge variant="secondary">+15% vs last month</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-purple-800">Customer Lifetime Value</p>
                        <p className="text-sm text-purple-600">Rs18,500 average CLV</p>
                      </div>
                      <Badge variant="outline">Growing</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Highest value customers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Ali Hassan", purchases: 8, value: 45000, type: "VIP" },
                  { name: "Fatima Sheikh", purchases: 6, value: 32000, type: "Regular" },
                  { name: "Ahmed Khan", purchases: 5, value: 28000, type: "Regular" },
                  { name: "Sara Ahmed", purchases: 7, value: 38000, type: "VIP" },
                ].map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.purchases} purchases • {customer.type} Customer
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rs{customer.value.toLocaleString()}</p>
                      <Badge variant={customer.type === "VIP" ? "default" : "secondary"}>{customer.type}</Badge>
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

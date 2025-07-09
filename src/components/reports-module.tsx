"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import {
  SalesService,
  ProductService,
  EmployeeService,
  InventoryService,
  type SaleRecord,
  type Product,
  type Employee,
  type InventoryItem,
} from "@/lib/firebase-services"

interface ReportData {
  salesData: any[]
  categoryData: any[]
  employeePerformance: any[]
  inventoryData: any[]
  customerData: any[]
  profitMarginData: any[]
}

export function ReportsModule() {
  const [dateRange, setDateRange] = useState("month")
  const [reportType, setReportType] = useState("sales")
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData>({
    salesData: [],
    categoryData: [],
    employeePerformance: [],
    inventoryData: [],
    customerData: [],
    profitMarginData: [],
  })
  const [keyMetrics, setKeyMetrics] = useState({
    totalRevenue: 0,
    profitMargin: 0,
    totalOrders: 0,
    activeCustomers: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadReportData()
  }, [dateRange])

  const loadReportData = async () => {
    try {
      setLoading(true)

      // Load data from Firebase
      const [sales, products, employees, inventory] = await Promise.all([
        SalesService.getAllSales(),
        ProductService.getAllProducts(),
        EmployeeService.getAllEmployees(),
        InventoryService.getAllInventoryItems(),
      ])

      // Process sales data for charts
      const processedData = processSalesData(sales, products, employees, inventory)
      setReportData(processedData)

      // Calculate key metrics
      const metrics = calculateKeyMetrics(sales, products)
      setKeyMetrics(metrics)
    } catch (error) {
      console.error("Error loading report data:", error)
      toast({
        title: "Error",
        description: "Failed to load report data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const processSalesData = (
    sales: SaleRecord[],
    products: Product[],
    employees: Employee[],
    inventory: InventoryItem[],
  ): ReportData => {
    // Process sales by month
    const salesByMonth = sales.reduce(
      (acc, sale) => {
        const month = new Date(sale.date).toLocaleDateString("en-US", { month: "short" })
        if (!acc[month]) {
          acc[month] = { month, sales: 0, profit: 0 }
        }
        acc[month].sales += sale.total
        acc[month].profit += sale.total * 0.3 // Assuming 30% profit margin
        return acc
      },
      {} as Record<string, any>,
    )

    // Process sales by category
    const categoryStats = sales.reduce(
      (acc, sale) => {
        sale.items.forEach((item) => {
          const product = products.find((p) => p.name === item.name)
          const category = product?.fabricType || "Others"
          if (!acc[category]) {
            acc[category] = { name: category, value: 0, sales: 0, color: getRandomColor() }
          }
          acc[category].value += item.quantity
          acc[category].sales += item.finalPrice * item.quantity
        })
        return acc
      },
      {} as Record<string, any>,
    )

    // Calculate percentages for category data
    const totalCategorySales = Object.values(categoryStats).reduce((sum: number, cat: any) => sum + cat.sales, 0)
    Object.values(categoryStats).forEach((cat: any) => {
      cat.value = totalCategorySales > 0 ? ((cat.sales / totalCategorySales) * 100).toFixed(1) : 0
    })

    // Process employee performance
    const employeeStats = employees.map((emp) => ({
      name: emp.name,
      sales: emp.totalSales || 0,
      target: emp.monthlyTarget || 50000,
      commission: emp.totalCommission || 0,
    }))

    // Process inventory data
    const inventoryStats = inventory.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = { category: item.category, inStock: 0, lowStock: 0, outOfStock: 0 }
        }
        if (item.currentStock === 0) {
          acc[item.category].outOfStock += 1
        } else if (item.currentStock <= item.minStock) {
          acc[item.category].lowStock += 1
        } else {
          acc[item.category].inStock += 1
        }
        return acc
      },
      {} as Record<string, any>,
    )

    // Process customer data
    const customerStats = sales.reduce(
      (acc, sale) => {
        if (!acc[sale.customerType]) {
          acc[sale.customerType] = { type: sale.customerType, count: 0, percentage: 0 }
        }
        acc[sale.customerType].count += 1
        return acc
      },
      {} as Record<string, any>,
    )

    const totalCustomers = Object.values(customerStats).reduce((sum: number, cust: any) => sum + cust.count, 0)
    Object.values(customerStats).forEach((cust: any) => {
      cust.percentage = totalCustomers > 0 ? ((cust.count / totalCustomers) * 100).toFixed(1) : 0
    })

    // Process profit margin data
    const profitMarginData = products.slice(0, 5).map((product) => ({
      product: product.name,
      sales: product.currentPrice * (product.stock || 1),
      margin: (((product.currentPrice - product.purchaseCost) / product.currentPrice) * 100).toFixed(1),
    }))

    return {
      salesData: Object.values(salesByMonth),
      categoryData: Object.values(categoryStats),
      employeePerformance: employeeStats,
      inventoryData: Object.values(inventoryStats),
      customerData: Object.values(customerStats),
      profitMarginData,
    }
  }

  const calculateKeyMetrics = (sales: SaleRecord[], products: Product[]) => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const totalCost = sales.reduce((sum, sale) => {
      return (
        sum +
        sale.items.reduce((itemSum, item) => {
          const product = products.find((p) => p.name === item.name)
          return itemSum + (product?.purchaseCost || 0) * item.quantity
        }, 0)
      )
    }, 0)

    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
    const totalOrders = sales.length
    const uniqueCustomers = new Set(sales.map((sale) => sale.customerPhone)).size

    return {
      totalRevenue,
      profitMargin,
      totalOrders,
      activeCustomers: uniqueCustomers,
    }
  }

  const getRandomColor = () => {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const generateReport = () => {
    toast({
      title: "Report Generated",
      description: `Generating ${reportType} report for ${dateRange}...`,
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading reports data...</div>
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
            <div className="text-2xl font-bold">₹{keyMetrics.totalRevenue.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">{keyMetrics.profitMargin.toFixed(1)}%</div>
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
            <div className="text-2xl font-bold">{keyMetrics.totalOrders}</div>
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
            <div className="text-2xl font-bold">{keyMetrics.activeCustomers}</div>
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
                    <LineChart data={reportData.salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" name="Sales (₹)" />
                      <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" name="Profit (₹)" />
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
                        data={reportData.categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {reportData.categoryData.map((entry, index) => (
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
                {reportData.profitMarginData.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.product}</p>
                      <p className="text-sm text-muted-foreground">Sales: ₹{product.sales.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.margin}% margin</p>
                      <Badge
                        variant={
                          Number.parseFloat(product.margin) > 45
                            ? "default"
                            : Number.parseFloat(product.margin) > 35
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {Number.parseFloat(product.margin) > 45
                          ? "Excellent"
                          : Number.parseFloat(product.margin) > 35
                            ? "Good"
                            : "Average"}
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
                    <BarChart data={reportData.inventoryData}>
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
                        <p className="text-sm text-red-600">
                          {reportData.inventoryData.reduce((sum, cat) => sum + cat.outOfStock, 0)} items out of stock
                        </p>
                      </div>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-orange-800">Low Stock Warning</p>
                        <p className="text-sm text-orange-600">
                          {reportData.inventoryData.reduce((sum, cat) => sum + cat.lowStock, 0)} items below minimum
                          level
                        </p>
                      </div>
                      <Badge variant="secondary">Monitor</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800">Reorder Suggestions</p>
                        <p className="text-sm text-blue-600">
                          {Math.floor(reportData.inventoryData.reduce((sum, cat) => sum + cat.lowStock, 0) * 0.3)} items
                          recommended for reorder
                        </p>
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
                {reportData.categoryData.map((category, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-2xl font-bold">₹{category.sales.toLocaleString()}</p>
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
                  <BarChart data={reportData.employeePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="sales" fill="var(--color-sales)" name="Actual Sales (₹)" />
                    <Bar dataKey="target" fill="var(--color-target)" name="Target (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {reportData.employeePerformance.map((employee, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Sales Achievement:</span>
                    <span className="font-medium">
                      {employee.target > 0 ? Math.round((employee.sales / employee.target) * 100) : 0}% of target
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Sales:</span>
                    <span className="font-medium">₹{employee.sales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission Earned:</span>
                    <span className="font-medium">₹{employee.commission.toLocaleString()}</span>
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
                    <span className="font-medium">₹{keyMetrics.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Returns:</span>
                    <span className="font-medium text-red-600">
                      -₹{Math.round(keyMetrics.totalRevenue * 0.015).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discounts:</span>
                    <span className="font-medium text-red-600">
                      -₹{Math.round(keyMetrics.totalRevenue * 0.045).toLocaleString()}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Net Sales:</span>
                    <span>₹{Math.round(keyMetrics.totalRevenue * 0.94).toLocaleString()}</span>
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
                    <span className="font-medium">₹{Math.round(keyMetrics.totalRevenue * 0.58).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff Salaries:</span>
                    <span className="font-medium">₹{Math.round(keyMetrics.totalRevenue * 0.13).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Expenses:</span>
                    <span className="font-medium">₹{Math.round(keyMetrics.totalRevenue * 0.067).toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total Costs:</span>
                    <span>₹{Math.round(keyMetrics.totalRevenue * 0.777).toLocaleString()}</span>
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
                    <span className="font-medium text-green-600">
                      ₹{Math.round(keyMetrics.totalRevenue * 0.36).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Profit:</span>
                    <span className="font-medium text-green-600">
                      ₹{Math.round(keyMetrics.totalRevenue * 0.16).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Margin:</span>
                    <span className="font-medium">{keyMetrics.profitMargin.toFixed(1)}%</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Net Profit:</span>
                    <span>
                      ₹{Math.round(keyMetrics.totalRevenue * (keyMetrics.profitMargin / 100)).toLocaleString()}
                    </span>
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
                    <Line type="monotone" dataKey="inflow" stroke="var(--color-inflow)" name="Cash Inflow (₹)" />
                    <Line type="monotone" dataKey="outflow" stroke="var(--color-outflow)" name="Cash Outflow (₹)" />
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
                  {reportData.customerData.map((segment, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{segment.type}</span>
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
                        <p className="text-sm text-blue-600">
                          ₹
                          {keyMetrics.totalOrders > 0
                            ? Math.round(keyMetrics.totalRevenue / keyMetrics.totalOrders).toLocaleString()
                            : 0}{" "}
                          per transaction
                        </p>
                      </div>
                      <Badge variant="secondary">+15% vs last month</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-purple-800">Customer Lifetime Value</p>
                        <p className="text-sm text-purple-600">₹18,500 average CLV</p>
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
                      <p className="font-medium">₹{customer.value.toLocaleString()}</p>
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

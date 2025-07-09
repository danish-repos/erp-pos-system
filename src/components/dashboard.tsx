"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Users, Package, ShoppingCart, AlertTriangle, DollarSign, Clock } from "lucide-react"
import { ProductService, EmployeeService, SalesService, LedgerService, type SaleRecord } from "@/lib/firebase-services"

// Defining the types of the things used in the dashboard page. 
interface StockAlert {
  id: string
  name: string
  currentStock: number
  minStock: number
  status: "out" | "low" | "critical"
}

interface DashboardStats {
  totalProducts: number
  totalEmployees: number
  todaySales: number
  monthlyRevenue: number
  pendingCredits: number
  pendingDebits: number
  lowStockItems: number
  activeEmployees: number
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalEmployees: 0,
    todaySales: 0,
    monthlyRevenue: 0,
    pendingCredits: 0,
    pendingDebits: 0,
    lowStockItems: 0,
    activeEmployees: 0,
  })

  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [recentSales, setRecentSales] = useState<SaleRecord[]>([])
  const [topProducts, setTopProducts] = useState<unknown[]>([])
  const [salesTrend, setSalesTrend] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  // Loading all the data needed for the dashboard from the database.
  useEffect(() => {
    const loadDashboardData = async () => {
      try {

        const [products, employees, sales, credits, debits] = await Promise.all([
          ProductService.getAllProducts(),
          EmployeeService.getAllEmployees(),
          SalesService.getAllSales(),
          LedgerService.getAllCreditEntries(),
          LedgerService.getAllDebitEntries(),
        ])

        // Calculate stats
        const today = new Date().toISOString().split("T")[0]
        const currentMonth = new Date().toISOString().slice(0, 7)

        const todaySalesData = sales.filter((sale) => sale.date === today)
        const monthlySalesData = sales.filter((sale) => sale.date.startsWith(currentMonth))

        const newStats: DashboardStats = {
          totalProducts: products.length,
          totalEmployees: employees.length,
          todaySales: todaySalesData.reduce((sum, sale) => sum + sale.total, 0),
          monthlyRevenue: monthlySalesData.reduce((sum, sale) => sum + sale.total, 0),
          pendingCredits: credits.filter((c) => c.status === "pending" || c.status === "partial").length,
          pendingDebits: debits.filter((d) => d.status === "pending" || d.status === "partial").length,
          lowStockItems: products.filter((p) => p.stock <= (p.minStock || 5)).length,
          activeEmployees: employees.filter((e) => e.status === "active").length,
        }

        setStats(newStats)

        // Generate stock alerts
        const alerts: StockAlert[] = products
          .filter((product) => product.stock <= (product.minStock || 5))
          .map((product) => ({
            id: product.id,
            name: product.name,
            currentStock: product.stock,
            minStock: product.minStock || 5,
            status: (product.stock === 0 ? "out" : product.stock <= 2 ? "critical" : "low") as
              | "out"
              | "low"
              | "critical",
          }))

        setStockAlerts(alerts)

        // Recent sales (last 5)
        const sortedSales = sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setRecentSales(sortedSales.slice(0, 5))

        // Top products by sales
        const productSales = sales.reduce(
          (acc: Record<string, { name: string; quantity: number; revenue: number }>, sale) => {
            sale.items.forEach((item: { name: string; quantity: number; finalPrice: number }) => {
              if (!acc[item.name]) {
                acc[item.name] = { name: item.name, quantity: 0, revenue: 0 }
              }
              acc[item.name].quantity += item.quantity
              acc[item.name].revenue += item.finalPrice * item.quantity
            })
            return acc
          },
          {} as Record<string, { name: string; quantity: number; revenue: number }>,
        )

       
        const topProductsData = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        setTopProducts(topProductsData)

        // Sales trend (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toISOString().split("T")[0]
        }).reverse()

        const trendData = last7Days.map((date) => {
          const daySales = sales.filter((sale) => sale.date === date)
          return {
            date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
            sales: daySales.reduce((sum, sale) => sum + sale.total, 0),
            orders: daySales.length,
          }
        })

        setSalesTrend(trendData)
        setLoading(false)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs{stats.todaySales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              ...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
             ...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{stats.lowStockItems} items low stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">of {stats.totalEmployees} total employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rs${value}`, "Sales"]} />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rs${value}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
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
              {stockAlerts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No stock alerts</p>
              ) : (
                stockAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{alert.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {alert.currentStock} | Min: {alert.minStock}
                      </p>
                    </div>
                    <Badge
                      variant={
                        alert.status === "out"
                          ? "destructive"
                          : alert.status === "critical"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {alert.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Sales
            </CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent sales</p>
              ) : (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">#{sale.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.customerName} • {sale.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rs{sale.total.toLocaleString()}</p>
                      <Badge variant={sale.paymentStatus === "paid" ? "default" : "secondary"}>
                        {sale.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingCredits}</div>
            <p className="text-xs text-muted-foreground">Customer payments due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.pendingDebits}</div>
            <p className="text-xs text-muted-foreground">Supplier payments due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

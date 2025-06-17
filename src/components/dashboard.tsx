"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, AlertTriangle, Package } from "lucide-react"

export function Dashboard() {
  const salesData = {
    today: 15420,
    yesterday: 12350,
    month: 456780,
    lastMonth: 398650,
  }

  const topBargainedItems = [
    { name: "Cotton Kurta - Blue", originalPrice: 1200, finalPrice: 950, discount: 21 },
    { name: "Silk Dupatta - Red", originalPrice: 800, finalPrice: 650, discount: 19 },
    { name: "Linen Shirt - White", originalPrice: 1500, finalPrice: 1250, discount: 17 },
  ]

  const stockAlerts = [
    { item: "Cotton Fabric - Black", stock: 5, minStock: 20, status: "critical" },
    { item: "Silk Thread - Gold", stock: 12, minStock: 15, status: "low" },
    { item: "Buttons - Pearl", stock: 8, minStock: 25, status: "critical" },
  ]

  const employeeSales = [
    { name: "Ahmed Ali", sales: 25400, target: 30000, performance: 85 },
    { name: "Fatima Khan", sales: 32100, target: 30000, performance: 107 },
    { name: "Hassan Sheikh", sales: 18900, target: 25000, performance: 76 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Sales Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{salesData.today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +
              {Math.round(((salesData.today - salesData.yesterday) / salesData.yesterday) * 100)}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{salesData.month.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +
              {Math.round(((salesData.month - salesData.lastMonth) / salesData.lastMonth) * 100)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹45,230</div>
            <p className="text-xs text-muted-foreground">12 customers pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Bargained Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Top Bargained Items Today
            </CardTitle>
            <CardDescription>Items with highest discount rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topBargainedItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{item.originalPrice} → ₹{item.finalPrice}
                  </p>
                </div>
                <Badge variant="destructive">{item.discount}% off</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stock Alerts
            </CardTitle>
            <CardDescription>Items running low on inventory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stockAlerts.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.item}</p>
                  <Badge variant={item.status === "critical" ? "destructive" : "secondary"}>{item.status}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Stock: {item.stock}</span>
                    <span>Min: {item.minStock}</span>
                  </div>
                  <Progress value={(item.stock / item.minStock) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Employee Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Sales Performance
          </CardTitle>
          <CardDescription>Monthly sales performance vs targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employeeSales.map((employee, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{employee.name}</p>
                  <div className="text-right">
                    <p className="text-sm font-medium">₹{employee.sales.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Target: ₹{employee.target.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={employee.performance} className="h-2" />
                  <p className="text-xs text-muted-foreground">{employee.performance}% of target achieved</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disposal Loss (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹8,450</div>
            <p className="text-xs text-muted-foreground">15 items disposed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Seller</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Cotton Kurta Set</div>
            <p className="text-xs text-muted-foreground">45 units sold this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Worst Seller</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Silk Saree - Heavy</div>
            <p className="text-xs text-muted-foreground">2 units sold this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

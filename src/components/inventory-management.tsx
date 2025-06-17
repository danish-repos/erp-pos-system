"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Search,
  Download,
  Upload,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  code: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  reservedStock: number
  availableStock: number
  status: "available" | "reserved" | "damaged" | "out-of-stock"
  location: string
  lastUpdated: string
  supplier: string
  purchasePrice: number
  salePrice: number
  expiryDate?: string
  batchNumber: string
}

interface StockMovement {
  id: string
  itemId: string
  itemName: string
  type: "in" | "out" | "adjustment" | "damaged" | "returned"
  quantity: number
  reason: string
  staff: string
  date: string
  reference: string
}

export function InventoryManagement() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Cotton Kurta - Blue",
      code: "CK001",
      category: "Kurtas",
      currentStock: 15,
      minStock: 20,
      maxStock: 100,
      reservedStock: 3,
      availableStock: 12,
      status: "available",
      location: "Rack A-1",
      lastUpdated: "2024-01-15",
      supplier: "Textile Mills Ltd",
      purchasePrice: 600,
      salePrice: 1200,
      batchNumber: "B2024001",
    },
    {
      id: "2",
      name: "Silk Dupatta - Red",
      code: "SD002",
      category: "Dupatta",
      currentStock: 5,
      minStock: 15,
      maxStock: 50,
      reservedStock: 1,
      availableStock: 4,
      status: "available",
      location: "Rack B-2",
      lastUpdated: "2024-01-20",
      supplier: "Silk Weavers Co",
      purchasePrice: 400,
      salePrice: 800,
      batchNumber: "B2024002",
    },
    {
      id: "3",
      name: "Linen Shirt - White",
      code: "LS003",
      category: "Shirts",
      currentStock: 0,
      minStock: 10,
      maxStock: 40,
      reservedStock: 0,
      availableStock: 0,
      status: "out-of-stock",
      location: "Rack C-1",
      lastUpdated: "2024-02-01",
      supplier: "Premium Fabrics",
      purchasePrice: 800,
      salePrice: 1500,
      batchNumber: "B2024003",
    },
    {
      id: "4",
      name: "Cotton Pants - Black",
      code: "CP004",
      category: "Pants",
      currentStock: 8,
      minStock: 15,
      maxStock: 60,
      reservedStock: 2,
      availableStock: 6,
      status: "available",
      location: "Rack D-1",
      lastUpdated: "2024-01-25",
      supplier: "Fashion Hub",
      purchasePrice: 500,
      salePrice: 900,
      batchNumber: "B2024004",
    },
  ])

  const [stockMovements, setStockMovements] = useState<StockMovement[]>([
    {
      id: "1",
      itemId: "1",
      itemName: "Cotton Kurta - Blue",
      type: "in",
      quantity: 25,
      reason: "New stock received",
      staff: "Ahmed Ali",
      date: "2024-01-15",
      reference: "PO-2024-001",
    },
    {
      id: "2",
      itemId: "1",
      itemName: "Cotton Kurta - Blue",
      type: "out",
      quantity: 10,
      reason: "Sale",
      staff: "Fatima Khan",
      date: "2024-01-16",
      reference: "SALE-2024-045",
    },
    {
      id: "3",
      itemId: "2",
      itemName: "Silk Dupatta - Red",
      type: "damaged",
      quantity: 2,
      reason: "Fabric tear during handling",
      staff: "Hassan Sheikh",
      date: "2024-01-18",
      reference: "DMG-2024-003",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { status: "Out of Stock", color: "destructive", icon: XCircle }
    if (item.currentStock <= item.minStock) return { status: "Low Stock", color: "secondary", icon: AlertTriangle }
    if (item.currentStock >= item.maxStock) return { status: "Overstock", color: "default", icon: TrendingDown }
    return { status: "Good", color: "default", icon: CheckCircle }
  }

  const getStockPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  const handleStockAdjustment = () => {
    if (!selectedItem || !adjustmentQuantity) return

    const quantity = Number.parseInt(adjustmentQuantity)
    const newStock = Math.max(0, selectedItem.currentStock + quantity)

    // Update inventory
    setInventoryItems(
      inventoryItems.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              currentStock: newStock,
              availableStock: newStock - item.reservedStock,
              status: newStock === 0 ? "out-of-stock" : "available",
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : item,
      ),
    )

    // Add stock movement record
    const newMovement: StockMovement = {
      id: Date.now().toString(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type: quantity > 0 ? "in" : "out",
      quantity: Math.abs(quantity),
      reason: adjustmentReason || "Stock adjustment",
      staff: "Current User",
      date: new Date().toISOString().split("T")[0],
      reference: `ADJ-${Date.now()}`,
    }

    setStockMovements([newMovement, ...stockMovements])

    // Reset form
    setSelectedItem(null)
    setAdjustmentQuantity("")
    setAdjustmentReason("")
    setIsStockAdjustmentOpen(false)
  }

  const lowStockItems = inventoryItems.filter((item) => item.currentStock <= item.minStock)
  const outOfStockItems = inventoryItems.filter((item) => item.currentStock === 0)
  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + item.currentStock * item.salePrice, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={isStockAdjustmentOpen} onOpenChange={setIsStockAdjustmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Stock Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stock Adjustment</DialogTitle>
                <DialogDescription>Adjust stock levels for inventory items</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Item</Label>
                  <Select
                    value={selectedItem?.id || ""}
                    onValueChange={(value) => {
                      const item = inventoryItems.find((i) => i.id === value)
                      setSelectedItem(item || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.code}) - Current: {item.currentStock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedItem && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Current Stock:</strong> {selectedItem.currentStock} units
                    </p>
                    <p className="text-sm">
                      <strong>Available:</strong> {selectedItem.availableStock} units
                    </p>
                    <p className="text-sm">
                      <strong>Reserved:</strong> {selectedItem.reservedStock} units
                    </p>
                  </div>
                )}

                <div>
                  <Label>Adjustment Quantity</Label>
                  <Input
                    type="number"
                    placeholder="Enter +/- quantity (e.g., +10 or -5)"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Use + for adding stock, - for reducing stock</p>
                </div>

                <div>
                  <Label>Reason</Label>
                  <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-stock">New Stock Received</SelectItem>
                      <SelectItem value="damaged">Damaged Items</SelectItem>
                      <SelectItem value="returned">Customer Return</SelectItem>
                      <SelectItem value="theft">Theft/Loss</SelectItem>
                      <SelectItem value="correction">Stock Count Correction</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsStockAdjustmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStockAdjustment} disabled={!selectedItem || !adjustmentQuantity}>
                    Apply Adjustment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items unavailable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalInventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">At current prices</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name or code..."
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
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

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Items
              </CardTitle>
              <CardDescription>Real-time inventory status with stock levels and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Details</TableHead>
                      <TableHead>Stock Levels</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const stockStatus = getStockStatus(item)
                      const stockPercentage = getStockPercentage(item.currentStock, item.maxStock)

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.code} • {item.category}
                              </p>
                              <p className="text-xs text-muted-foreground">Batch: {item.batchNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Current: {item.currentStock}</span>
                                <span>Max: {item.maxStock}</span>
                              </div>
                              <Progress value={stockPercentage} className="h-2" />
                              <div className="text-xs text-muted-foreground">
                                Available: {item.availableStock} | Reserved: {item.reservedStock}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <stockStatus.icon className="h-4 w-4" />
                              <Badge variant={stockStatus.color as any}>{stockStatus.status}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{item.location}</p>
                              <p className="text-muted-foreground">Updated: {item.lastUpdated}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{item.supplier}</p>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>₹{(item.currentStock * item.salePrice).toLocaleString()}</p>
                              <p className="text-muted-foreground">@₹{item.salePrice}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </div>
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

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Stock Movements
              </CardTitle>
              <CardDescription>Track all inventory changes and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{movement.date}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{movement.itemName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              movement.type === "in" ? "default" : movement.type === "out" ? "secondary" : "destructive"
                            }
                          >
                            {movement.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              movement.type === "in"
                                ? "text-green-600"
                                : movement.type === "out"
                                  ? "text-blue-600"
                                  : "text-red-600"
                            }
                          >
                            {movement.type === "in" ? "+" : "-"}
                            {movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell>{movement.reason}</TableCell>
                        <TableCell>{movement.staff}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{movement.reference}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.currentStock} | Min: {item.minStock}
                        </p>
                      </div>
                      <Button size="sm">Reorder</Button>
                    </div>
                  ))}
                  {lowStockItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No low stock alerts</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Out of Stock Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outOfStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Code: {item.code}</p>
                      </div>
                      <Button size="sm" variant="destructive">
                        Urgent Reorder
                      </Button>
                    </div>
                  ))}
                  {outOfStockItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No out of stock items</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

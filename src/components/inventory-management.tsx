"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Edit, Trash2, Search, Package, AlertTriangle, CheckCircle, Archive } from "lucide-react"
import { InventoryService, type InventoryItem, type StockMovement } from "@/lib/firebase-services"
import { useToast } from "@/hooks/use-toast"

export function InventoryManagement() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const { toast } = useToast()

  const [newItem, setNewItem] = useState({
    name: "",
    code: "",
    category: "",
    currentStock: "",
    minStock: "",
    maxStock: "",
    location: "",
    supplier: "",
    purchasePrice: "",
    salePrice: "",
    batchNumber: "",
    expiryDate: "",
  })

  const [newMovement, setNewMovement] = useState({
    itemId: "",
    type: "in" as "in" | "out" | "adjustment" | "damaged" | "returned",
    quantity: "",
    reason: "",
    staff: "",
    reference: "",
  })

  // Load data from Firebase
  useEffect(() => {
    const unsubscribeInventory = InventoryService.subscribeToInventory((items) => {
      setInventoryItems(items)
      setLoading(false)
    })

    const unsubscribeMovements = InventoryService.subscribeToStockMovements((movements) => {
      setStockMovements(movements)
    })

    return () => {
      unsubscribeInventory()
      unsubscribeMovements()
    }
  }, [])

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddItem = async () => {
    try {
      const currentStock = Number(newItem.currentStock)
      const minStock = Number(newItem.minStock)

      let itemStatus: "available" | "reserved" | "damaged" | "out-of-stock"
      if (currentStock === 0) {
        itemStatus = "out-of-stock"
      } else if (currentStock <= minStock) {
        itemStatus = "available" // Still available but low
      } else {
        itemStatus = "available"
      }

      const item: Omit<InventoryItem, "id"> = {
        name: newItem.name,
        code: newItem.code,
        category: newItem.category,
        currentStock: currentStock,
        minStock: minStock,
        maxStock: Number(newItem.maxStock),
        reservedStock: 0,
        availableStock: currentStock,
        status: itemStatus,
        location: newItem.location,
        supplier: newItem.supplier,
        purchasePrice: Number(newItem.purchasePrice),
        salePrice: Number(newItem.salePrice),
        batchNumber: newItem.batchNumber,
        expiryDate: newItem.expiryDate || undefined,
        lastUpdated: new Date().toISOString(),
      }

      await InventoryService.createInventoryItem(item)

      // Reset form
      setNewItem({
        name: "",
        code: "",
        category: "",
        currentStock: "",
        minStock: "",
        maxStock: "",
        location: "",
        supplier: "",
        purchasePrice: "",
        salePrice: "",
        batchNumber: "",
        expiryDate: "",
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Item Added",
        description: "Inventory item has been successfully added",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStockMovement = async () => {
    try {
      const selectedInventoryItem = inventoryItems.find((item) => item.id === newMovement.itemId)
      if (!selectedInventoryItem) return

      const movement: Omit<StockMovement, "id"> = {
        itemId: newMovement.itemId,
        itemName: selectedInventoryItem.name,
        type: newMovement.type,
        quantity: Number(newMovement.quantity),
        reason: newMovement.reason,
        staff: newMovement.staff,
        reference: newMovement.reference,
        date: new Date().toISOString().split("T")[0],
      }

      await InventoryService.createStockMovement(movement)

      // Update inventory item stock
      const quantityChange = newMovement.type === "in" ? Number(newMovement.quantity) : -Number(newMovement.quantity)
      const newCurrentStock = Math.max(0, selectedInventoryItem.currentStock + quantityChange)

      let newStatus: "available" | "reserved" | "damaged" | "out-of-stock"
      if (newCurrentStock === 0) {
        newStatus = "out-of-stock"
      } else if (newMovement.type === "damaged") {
        newStatus = "damaged"
      } else {
        newStatus = "available"
      }

      const updatedItem = {
        currentStock: newCurrentStock,
        availableStock: newCurrentStock - selectedInventoryItem.reservedStock,
        status: newStatus,
        lastUpdated: new Date().toISOString(),
      }

      await InventoryService.updateInventoryItem(newMovement.itemId, updatedItem)

      // Reset form
      setNewMovement({
        itemId: "",
        type: "in",
        quantity: "",
        reason: "",
        staff: "",
        reference: "",
      })
      setIsMovementDialogOpen(false)

      toast({
        title: "Stock Updated",
        description: "Stock movement has been recorded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record stock movement. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await InventoryService.deleteInventoryItem(id)
      toast({
        title: "Item Deleted",
        description: "Inventory item has been successfully deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "default"
      case "reserved":
        return "secondary"
      case "damaged":
        return "destructive"
      case "out-of-stock":
        return "destructive"
      default:
        return "default"
    }
  }

  const getStockLevel = (item: InventoryItem) => {
    if (item.currentStock === 0) return { level: "Out of Stock", color: "text-red-600" }
    if (item.currentStock <= item.minStock) return { level: "Low Stock", color: "text-orange-600" }
    if (item.currentStock >= item.maxStock) return { level: "Overstock", color: "text-blue-600" }
    return { level: "Normal", color: "text-green-600" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
        <div className="flex gap-2">
          <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Stock Movement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Stock Movement</DialogTitle>
                <DialogDescription>Add or remove stock from inventory</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="itemSelect">Select Item</Label>
                  <Select
                    value={newMovement.itemId}
                    onValueChange={(value) => setNewMovement({ ...newMovement, itemId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.code}) - Stock: {item.currentStock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="movementType">Movement Type</Label>
                    <Select
                      value={newMovement.type}
                      onValueChange={(value: any) => setNewMovement({ ...newMovement, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Stock In</SelectItem>
                        <SelectItem value="out">Stock Out</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newMovement.quantity}
                      onChange={(e) => setNewMovement({ ...newMovement, quantity: e.target.value })}
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={newMovement.reason}
                    onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                    placeholder="Reason for stock movement"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staff">Staff Member</Label>
                    <Input
                      id="staff"
                      value={newMovement.staff}
                      onChange={(e) => setNewMovement({ ...newMovement, staff: e.target.value })}
                      placeholder="Staff name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      value={newMovement.reference}
                      onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })}
                      placeholder="Reference number"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStockMovement}>Record Movement</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>Enter item details for inventory tracking</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g., Cotton Fabric"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemCode">Item Code</Label>
                    <Input
                      id="itemCode"
                      value={newItem.code}
                      onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                      placeholder="e.g., CF001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fabric">Fabric</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="finished-goods">Finished Goods</SelectItem>
                        <SelectItem value="raw-materials">Raw Materials</SelectItem>
                        <SelectItem value="packaging">Packaging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newItem.location}
                      onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                      placeholder="e.g., Warehouse A-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={newItem.currentStock}
                      onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStock">Min Stock</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStock">Max Stock</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      value={newItem.maxStock}
                      onChange={(e) => setNewItem({ ...newItem, maxStock: e.target.value })}
                      placeholder="500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={newItem.purchasePrice}
                      onChange={(e) => setNewItem({ ...newItem, purchasePrice: e.target.value })}
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Sale Price (₹)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      value={newItem.salePrice}
                      onChange={(e) => setNewItem({ ...newItem, salePrice: e.target.value })}
                      placeholder="75"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={newItem.supplier}
                      onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={newItem.batchNumber}
                      onChange={(e) => setNewItem({ ...newItem, batchNumber: e.target.value })}
                      placeholder="BATCH-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={newItem.expiryDate}
                      onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem}>Add Item</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, code, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Items
              </CardTitle>
              <CardDescription>Manage your inventory stock levels and details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const stockLevel = getStockLevel(item)
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {item.currentStock} / {item.maxStock}
                              </p>
                              <p className={`text-sm ${stockLevel.color}`}>{stockLevel.level}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>Buy: ₹{item.purchasePrice}</p>
                              <p>Sell: ₹{item.salePrice}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(item.status) as any}>{item.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{new Date(item.lastUpdated).toLocaleDateString()}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
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

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movements</CardTitle>
              <CardDescription>Track all inventory movements and changes</CardDescription>
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
                    {stockMovements
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 50)
                      .map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>{movement.date}</TableCell>
                          <TableCell>{movement.itemName}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                movement.type === "in"
                                  ? "default"
                                  : movement.type === "out"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {movement.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={movement.type === "in" ? "text-green-600" : "text-red-600"}>
                              {movement.type === "in" ? "+" : "-"}
                              {movement.quantity}
                            </span>
                          </TableCell>
                          <TableCell>{movement.reason}</TableCell>
                          <TableCell>{movement.staff}</TableCell>
                          <TableCell>{movement.reference}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Stock Alerts
              </CardTitle>
              <CardDescription>Items that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryItems
                  .filter((item) => item.currentStock <= item.minStock || item.currentStock === 0)
                  .map((item) => {
                    const stockLevel = getStockLevel(item)
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Current: {item.currentStock} | Min: {item.minStock}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{stockLevel.level}</Badge>
                          <Button size="sm">Restock</Button>
                        </div>
                      </div>
                    )
                  })}
                {inventoryItems.filter((item) => item.currentStock <= item.minStock || item.currentStock === 0)
                  .length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">All items are well stocked!</p>
                    <p className="text-muted-foreground">No stock alerts at this time.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {inventoryItems.filter((item) => item.currentStock <= item.minStock).length}
            </div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventoryItems.filter((item) => item.currentStock === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{inventoryItems.reduce((sum, item) => sum + item.currentStock * item.salePrice, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">At sale prices</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

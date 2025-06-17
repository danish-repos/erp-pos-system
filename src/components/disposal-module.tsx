"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { Trash2, Plus, AlertTriangle, FileText, Camera, Download, TrendingDown, Package, Eye } from "lucide-react"

interface DisposalRecord {
  id: string
  itemName: string
  itemCode: string
  category: string
  originalPrice: number
  disposalValue: number
  lossAmount: number
  quantity: number
  disposalDate: string
  reason: string
  condition: "damaged" | "expired" | "defective" | "unsold" | "stolen"
  disposalMethod: "discard" | "donate" | "sell-discount" | "return-supplier" | "recycle"
  approvedBy: string
  notes: string
  photos?: string[]
  batchNumber?: string
  supplierName?: string
}

interface DisposalSummary {
  totalLoss: number
  itemsDisposed: number
  topReason: string
  monthlyTrend: number
}

export function DisposalModule() {
  const [disposalRecords, setDisposalRecords] = useState<DisposalRecord[]>([
    {
      id: "1",
      itemName: "Cotton Kurta - Blue",
      itemCode: "CK001",
      category: "Kurtas",
      originalPrice: 1200,
      disposalValue: 0,
      lossAmount: 1200,
      quantity: 2,
      disposalDate: "2024-01-15",
      reason: "Fabric tear during handling",
      condition: "damaged",
      disposalMethod: "discard",
      approvedBy: "Ahmed Ali",
      notes: "Damaged during customer trial, irreparable tear",
      batchNumber: "B2024001",
      supplierName: "Textile Mills Ltd",
    },
    {
      id: "2",
      itemName: "Silk Dupatta - Red",
      itemCode: "SD002",
      category: "Dupatta",
      originalPrice: 800,
      disposalValue: 200,
      lossAmount: 600,
      quantity: 1,
      disposalDate: "2024-01-18",
      reason: "Color fading issue",
      condition: "defective",
      disposalMethod: "sell-discount",
      approvedBy: "Fatima Khan",
      notes: "Sold at 75% discount due to color bleeding",
      batchNumber: "B2024002",
      supplierName: "Silk Weavers Co",
    },
    {
      id: "3",
      itemName: "Linen Shirt - White",
      itemCode: "LS003",
      category: "Shirts",
      originalPrice: 1500,
      disposalValue: 0,
      lossAmount: 1500,
      quantity: 1,
      disposalDate: "2024-01-20",
      reason: "Theft from store",
      condition: "stolen",
      disposalMethod: "discard",
      approvedBy: "Hassan Sheikh",
      notes: "Item missing from inventory, suspected theft",
      batchNumber: "B2024003",
      supplierName: "Premium Fabrics",
    },
    {
      id: "4",
      itemName: "Cotton Pants - Black",
      itemCode: "CP004",
      category: "Pants",
      originalPrice: 900,
      disposalValue: 450,
      lossAmount: 450,
      quantity: 3,
      disposalDate: "2024-01-22",
      reason: "End of season clearance",
      condition: "unsold",
      disposalMethod: "sell-discount",
      approvedBy: "Ahmed Ali",
      notes: "Slow-moving inventory, cleared at 50% discount",
      batchNumber: "B2024004",
      supplierName: "Fashion Hub",
    },
  ])

  const [isAddDisposalOpen, setIsAddDisposalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<DisposalRecord | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [newDisposal, setNewDisposal] = useState({
    itemName: "",
    itemCode: "",
    category: "",
    originalPrice: "",
    disposalValue: "",
    quantity: "",
    reason: "",
    condition: "",
    disposalMethod: "",
    notes: "",
    batchNumber: "",
    supplierName: "",
  })

  const totalLoss = disposalRecords.reduce((sum, record) => sum + record.lossAmount * record.quantity, 0)
  const totalItemsDisposed = disposalRecords.reduce((sum, record) => sum + record.quantity, 0)
  const totalRecoveredValue = disposalRecords.reduce((sum, record) => sum + record.disposalValue * record.quantity, 0)

  // Group by reason for analysis
  const reasonStats = disposalRecords.reduce(
    (acc, record) => {
      if (!acc[record.reason]) {
        acc[record.reason] = { count: 0, loss: 0 }
      }
      acc[record.reason].count += record.quantity
      acc[record.reason].loss += record.lossAmount * record.quantity
      return acc
    },
    {} as Record<string, { count: number; loss: number }>,
  )

  // Group by condition
  const conditionStats = disposalRecords.reduce(
    (acc, record) => {
      if (!acc[record.condition]) {
        acc[record.condition] = { count: 0, loss: 0 }
      }
      acc[record.condition].count += record.quantity
      acc[record.condition].loss += record.lossAmount * record.quantity
      return acc
    },
    {} as Record<string, { count: number; loss: number }>,
  )

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "damaged":
        return "destructive"
      case "expired":
        return "secondary"
      case "defective":
        return "outline"
      case "unsold":
        return "default"
      case "stolen":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "discard":
        return "destructive"
      case "donate":
        return "default"
      case "sell-discount":
        return "secondary"
      case "return-supplier":
        return "outline"
      case "recycle":
        return "default"
      default:
        return "outline"
    }
  }

  const handleAddDisposal = () => {
    const disposal: DisposalRecord = {
      id: Date.now().toString(),
      itemName: newDisposal.itemName,
      itemCode: newDisposal.itemCode,
      category: newDisposal.category,
      originalPrice: Number(newDisposal.originalPrice),
      disposalValue: Number(newDisposal.disposalValue),
      lossAmount: Number(newDisposal.originalPrice) - Number(newDisposal.disposalValue),
      quantity: Number(newDisposal.quantity),
      disposalDate: new Date().toISOString().split("T")[0],
      reason: newDisposal.reason,
      condition: newDisposal.condition as any,
      disposalMethod: newDisposal.disposalMethod as any,
      approvedBy: "Current User",
      notes: newDisposal.notes,
      batchNumber: newDisposal.batchNumber,
      supplierName: newDisposal.supplierName,
    }

    setDisposalRecords([disposal, ...disposalRecords])
    setNewDisposal({
      itemName: "",
      itemCode: "",
      category: "",
      originalPrice: "",
      disposalValue: "",
      quantity: "",
      reason: "",
      condition: "",
      disposalMethod: "",
      notes: "",
      batchNumber: "",
      supplierName: "",
    })
    setIsAddDisposalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Disposal Management</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Dialog open={isAddDisposalOpen} onOpenChange={setIsAddDisposalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Disposal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Item Disposal</DialogTitle>
                <DialogDescription>Document the disposal of damaged, expired, or unsold items</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={newDisposal.itemName}
                      onChange={(e) => setNewDisposal({ ...newDisposal, itemName: e.target.value })}
                      placeholder="Cotton Kurta - Blue"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemCode">Item Code</Label>
                    <Input
                      id="itemCode"
                      value={newDisposal.itemCode}
                      onChange={(e) => setNewDisposal({ ...newDisposal, itemCode: e.target.value })}
                      placeholder="CK001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newDisposal.category}
                      onValueChange={(value) => setNewDisposal({ ...newDisposal, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kurtas">Kurtas</SelectItem>
                        <SelectItem value="Dupatta">Dupatta</SelectItem>
                        <SelectItem value="Shirts">Shirts</SelectItem>
                        <SelectItem value="Pants">Pants</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newDisposal.quantity}
                      onChange={(e) => setNewDisposal({ ...newDisposal, quantity: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={newDisposal.originalPrice}
                      onChange={(e) => setNewDisposal({ ...newDisposal, originalPrice: e.target.value })}
                      placeholder="1200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={newDisposal.condition}
                      onValueChange={(value) => setNewDisposal({ ...newDisposal, condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="damaged">Damaged</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="defective">Defective</SelectItem>
                        <SelectItem value="unsold">Unsold</SelectItem>
                        <SelectItem value="stolen">Stolen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="disposalMethod">Disposal Method</Label>
                    <Select
                      value={newDisposal.disposalMethod}
                      onValueChange={(value) => setNewDisposal({ ...newDisposal, disposalMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discard">Discard</SelectItem>
                        <SelectItem value="donate">Donate</SelectItem>
                        <SelectItem value="sell-discount">Sell at Discount</SelectItem>
                        <SelectItem value="return-supplier">Return to Supplier</SelectItem>
                        <SelectItem value="recycle">Recycle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="disposalValue">Recovery Value (₹)</Label>
                    <Input
                      id="disposalValue"
                      type="number"
                      value={newDisposal.disposalValue}
                      onChange={(e) => setNewDisposal({ ...newDisposal, disposalValue: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={newDisposal.batchNumber}
                      onChange={(e) => setNewDisposal({ ...newDisposal, batchNumber: e.target.value })}
                      placeholder="B2024001"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Disposal Reason</Label>
                  <Input
                    id="reason"
                    value={newDisposal.reason}
                    onChange={(e) => setNewDisposal({ ...newDisposal, reason: e.target.value })}
                    placeholder="Fabric tear during handling"
                  />
                </div>

                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input
                    id="supplierName"
                    value={newDisposal.supplierName}
                    onChange={(e) => setNewDisposal({ ...newDisposal, supplierName: e.target.value })}
                    placeholder="Textile Mills Ltd"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={newDisposal.notes}
                    onChange={(e) => setNewDisposal({ ...newDisposal, notes: e.target.value })}
                    placeholder="Detailed description of the disposal reason and circumstances"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDisposalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDisposal}>Record Disposal</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalLoss.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Items Disposed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItemsDisposed}</div>
            <p className="text-xs text-muted-foreground">Total units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recovery Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalRecoveredValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Recovered amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Loss Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRecoveredValue > 0 ? ((totalLoss / (totalLoss + totalRecoveredValue)) * 100).toFixed(1) : "100.0"}%
            </div>
            <p className="text-xs text-muted-foreground">Of disposal value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Disposal Records</TabsTrigger>
          <TabsTrigger value="analysis">Loss Analysis</TabsTrigger>
          <TabsTrigger value="prevention">Prevention Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Disposal Records
              </CardTitle>
              <CardDescription>Complete log of all disposed items with reasons and recovery values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Details</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Original Value</TableHead>
                      <TableHead>Recovery Value</TableHead>
                      <TableHead>Loss Amount</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disposalRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.itemName}</p>
                            <p className="text-sm text-muted-foreground">
                              {record.itemCode} • {record.category}
                            </p>
                            <p className="text-xs text-muted-foreground">Batch: {record.batchNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>{record.quantity}</TableCell>
                        <TableCell>₹{(record.originalPrice * record.quantity).toLocaleString()}</TableCell>
                        <TableCell>₹{(record.disposalValue * record.quantity).toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="font-medium text-red-600">
                            ₹{(record.lossAmount * record.quantity).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getConditionColor(record.condition) as any}>{record.condition}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMethodColor(record.disposalMethod) as any}>
                            {record.disposalMethod.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.disposalDate}</TableCell>
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
                              <Camera className="h-4 w-4" />
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

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Loss by Reason
                </CardTitle>
                <CardDescription>Analysis of disposal reasons and their financial impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(reasonStats).map(([reason, stats]) => (
                    <div key={reason} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{reason}</span>
                        <span className="text-red-600">₹{stats.loss.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{stats.count} items</span>
                        <span>{((stats.loss / totalLoss) * 100).toFixed(1)}% of total loss</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(stats.loss / totalLoss) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Loss by Condition
                </CardTitle>
                <CardDescription>Breakdown of disposal conditions and their costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(conditionStats).map(([condition, stats]) => (
                    <div key={condition} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">{condition}</span>
                        <span className="text-red-600">₹{stats.loss.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{stats.count} items</span>
                        <span>{((stats.loss / totalLoss) * 100).toFixed(1)}% of total loss</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(stats.loss / totalLoss) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Disposal Trend</CardTitle>
              <CardDescription>Track disposal patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">This Month</h3>
                  <p className="text-2xl font-bold text-red-600">₹{totalLoss.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{totalItemsDisposed} items disposed</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Last Month</h3>
                  <p className="text-2xl font-bold">₹{(totalLoss * 0.8).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(totalItemsDisposed * 0.8)} items disposed</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Trend</h3>
                  <p className="text-2xl font-bold text-red-600">+25%</p>
                  <p className="text-sm text-muted-foreground">Increase in disposal loss</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  High Risk Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Handling Damage</p>
                    <p className="text-xs text-red-600">
                      40% of disposals due to handling issues - implement better training
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-800">Slow-Moving Inventory</p>
                    <p className="text-xs text-orange-600">
                      25% of disposals from unsold items - review purchasing patterns
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Quality Control</p>
                    <p className="text-xs text-yellow-600">
                      20% from defective items - strengthen supplier quality checks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <FileText className="h-5 w-5" />
                  Prevention Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Staff Training</p>
                    <p className="text-xs text-green-600">
                      Implement proper handling procedures to reduce damage by 50%
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Inventory Rotation</p>
                    <p className="text-xs text-blue-600">
                      FIFO system and regular promotions to reduce unsold inventory
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">Quality Assurance</p>
                    <p className="text-xs text-purple-600">Enhanced supplier audits and incoming quality checks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Reduction Opportunities</CardTitle>
              <CardDescription>Potential savings through improved processes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Better Handling</h3>
                  <p className="text-2xl font-bold text-green-600">₹15,000</p>
                  <p className="text-sm text-muted-foreground">Potential monthly savings</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Faster Clearance</h3>
                  <p className="text-2xl font-bold text-green-600">₹8,000</p>
                  <p className="text-sm text-muted-foreground">From better inventory management</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Quality Improvement</h3>
                  <p className="text-2xl font-bold text-green-600">₹12,000</p>
                  <p className="text-sm text-muted-foreground">Through supplier quality control</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Disposal Record Details</DialogTitle>
            <DialogDescription>Complete information about the disposed item</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Item Name</Label>
                  <p className="font-medium">{selectedRecord.itemName}</p>
                </div>
                <div>
                  <Label>Item Code</Label>
                  <p className="font-medium">{selectedRecord.itemCode}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <p>{selectedRecord.category}</p>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <p>{selectedRecord.quantity}</p>
                </div>
                <div>
                  <Label>Disposal Date</Label>
                  <p>{selectedRecord.disposalDate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Original Value</Label>
                  <p className="font-medium">
                    ₹{(selectedRecord.originalPrice * selectedRecord.quantity).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Recovery Value</Label>
                  <p className="font-medium text-green-600">
                    ₹{(selectedRecord.disposalValue * selectedRecord.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <Label>Loss Amount</Label>
                <p className="font-medium text-red-600">
                  ₹{(selectedRecord.lossAmount * selectedRecord.quantity).toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Condition</Label>
                  <Badge variant={getConditionColor(selectedRecord.condition) as any}>{selectedRecord.condition}</Badge>
                </div>
                <div>
                  <Label>Disposal Method</Label>
                  <Badge variant={getMethodColor(selectedRecord.disposalMethod) as any}>
                    {selectedRecord.disposalMethod.replace("-", " ")}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <p>{selectedRecord.reason}</p>
              </div>
              <div>
                <Label>Notes</Label>
                <p className="text-sm text-muted-foreground">{selectedRecord.notes}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Approved By</Label>
                  <p>{selectedRecord.approvedBy}</p>
                </div>
                <div>
                  <Label>Supplier</Label>
                  <p>{selectedRecord.supplierName}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

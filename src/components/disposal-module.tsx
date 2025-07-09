"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, AlertTriangle, Package, DollarSign } from "lucide-react"
import { DisposalService, type DisposalRecord } from "@/lib/firebase-services"
import { useToast } from "@/hooks/use-toast"

export function DisposalModule() {
  const [disposalRecords, setDisposalRecords] = useState<DisposalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

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

  // Load disposal records from Firebase
  useEffect(() => {
    const unsubscribe = DisposalService.subscribeToDisposalRecords((records) => {
      setDisposalRecords(records || [])
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Filter records based on search term
  const filteredRecords = (disposalRecords || []).filter(
    (record) =>
      record?.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record?.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record?.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate statistics
  const totalLoss = (disposalRecords || []).reduce((sum, record) => sum + (record?.lossAmount || 0), 0)
  const totalRecovered = (disposalRecords || []).reduce((sum, record) => sum + (record?.disposalValue || 0), 0)
  const totalItems = (disposalRecords || []).reduce((sum, record) => sum + (record?.quantity || 0), 0)
  const totalOriginalValue = (disposalRecords || []).reduce(
    (sum, record) => sum + (record?.originalPrice || 0) * (record?.quantity || 0),
    0,
  )

  // Group by condition
  const conditionStats = (disposalRecords || []).reduce(
    (acc, record) => {
      if (!record?.condition) return acc
      if (!acc[record.condition]) {
        acc[record.condition] = { count: 0, loss: 0 }
      }
      acc[record.condition].count += record.quantity || 0
      acc[record.condition].loss += record.lossAmount || 0
      return acc
    },
    {} as Record<string, { count: number; loss: number }>,
  )

  // Group by disposal method
  const methodStats = (disposalRecords || []).reduce(
    (acc, record) => {
      if (!record?.disposalMethod) return acc
      if (!acc[record.disposalMethod]) {
        acc[record.disposalMethod] = { count: 0, recovered: 0 }
      }
      acc[record.disposalMethod].count += record.quantity || 0
      acc[record.disposalMethod].recovered += record.disposalValue || 0
      return acc
    },
    {} as Record<string, { count: number; recovered: number }>,
  )

  const handleAddDisposal = async () => {
    try {
      const originalPrice = Number(newDisposal.originalPrice)
      const disposalValue = Number(newDisposal.disposalValue)
      const quantity = Number(newDisposal.quantity)
      const lossAmount = originalPrice * quantity - disposalValue

      const disposal: Omit<DisposalRecord, "id"> = {
        itemName: newDisposal.itemName,
        itemCode: newDisposal.itemCode,
        category: newDisposal.category,
        originalPrice: originalPrice,
        disposalValue: disposalValue,
        lossAmount: lossAmount,
        quantity: quantity,
        disposalDate: new Date().toISOString().split("T")[0],
        reason: newDisposal.reason,
        condition: newDisposal.condition as string,
        disposalMethod: newDisposal.disposalMethod as string,
        approvedBy: "Current User", // Replace with actual user
        notes: newDisposal.notes,
        batchNumber: newDisposal.batchNumber,
        supplierName: newDisposal.supplierName,
      }

      await DisposalService.createDisposalRecord(disposal)

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
      setIsDialogOpen(false)

      toast({
        title: "Disposal Record Added",
        description: "Disposal record has been successfully created",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add disposal record. Please try again.",
        variant: "destructive",
      })
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading disposal records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Disposal Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Disposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Disposal Record</DialogTitle>
              <DialogDescription>Record items that need to be disposed of</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newDisposal.itemName}
                    onChange={(e) => setNewDisposal({ ...newDisposal, itemName: e.target.value })}
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <Label htmlFor="itemCode">Item Code</Label>
                  <Input
                    id="itemCode"
                    value={newDisposal.itemCode}
                    onChange={(e) => setNewDisposal({ ...newDisposal, itemCode: e.target.value })}
                    placeholder="SKU-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="shirts">Shirts</SelectItem>
                      <SelectItem value="pants">Pants</SelectItem>
                      <SelectItem value="dresses">Dresses</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="footwear">Footwear</SelectItem>
                      <SelectItem value="outerwear">Outerwear</SelectItem>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={newDisposal.originalPrice}
                    onChange={(e) => setNewDisposal({ ...newDisposal, originalPrice: e.target.value })}
                    placeholder="1500"
                  />
                </div>
                <div>
                  <Label htmlFor="disposalValue">Recovery Value (₹)</Label>
                  <Input
                    id="disposalValue"
                    type="number"
                    value={newDisposal.disposalValue}
                    onChange={(e) => setNewDisposal({ ...newDisposal, disposalValue: e.target.value })}
                    placeholder="200"
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
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={newDisposal.batchNumber}
                    onChange={(e) => setNewDisposal({ ...newDisposal, batchNumber: e.target.value })}
                    placeholder="BATCH-001"
                  />
                </div>
                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input
                    id="supplierName"
                    value={newDisposal.supplierName}
                    onChange={(e) => setNewDisposal({ ...newDisposal, supplierName: e.target.value })}
                    placeholder="Supplier name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Disposal</Label>
                <Input
                  id="reason"
                  value={newDisposal.reason}
                  onChange={(e) => setNewDisposal({ ...newDisposal, reason: e.target.value })}
                  placeholder="Reason for disposal"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newDisposal.notes}
                  onChange={(e) => setNewDisposal({ ...newDisposal, notes: e.target.value })}
                  placeholder="Additional notes about the disposal"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDisposal}>Add Disposal Record</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalLoss.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Financial impact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Recovered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalRecovered.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Value recovered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Items Disposed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Total quantity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOriginalValue > 0 ? ((totalRecovered / totalOriginalValue) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Value recovery percentage</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by item name, code, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Disposal Records</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Disposal Records
              </CardTitle>
              <CardDescription>
                Showing {filteredRecords.length} of {disposalRecords.length} disposal records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Original Value</TableHead>
                      <TableHead>Recovery Value</TableHead>
                      <TableHead>Loss</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.itemName}</p>
                            <p className="text-sm text-muted-foreground">{record.itemCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.category}</Badge>
                        </TableCell>
                        <TableCell>{record.quantity}</TableCell>
                        <TableCell>₹{(record.originalPrice * record.quantity).toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">₹{record.disposalValue.toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">₹{record.lossAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={getConditionColor(record.condition) as string}>{record.condition}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMethodColor(record.disposalMethod) as string}>
                            {record.disposalMethod.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.disposalDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Disposal by Condition
                </CardTitle>
                <CardDescription>Breakdown of items by condition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(conditionStats).map(([condition, stats]) => (
                    <div key={condition} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={getConditionColor(condition) as string}>{condition}</Badge>
                        <div>
                          <p className="font-medium">{stats.count} items</p>
                          <p className="text-sm text-muted-foreground">Loss: ₹{stats.loss.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {((stats.count / totalItems) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Recovery by Method
                </CardTitle>
                <CardDescription>Value recovered by disposal method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(methodStats).map(([method, stats]) => (
                    <div key={method} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={getMethodColor(method) as string}>{method.replace("-", " ")}</Badge>
                        <div>
                          <p className="font-medium">{stats.count} items</p>
                          <p className="text-sm text-muted-foreground">
                            Recovered: ₹{stats.recovered.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {((stats.recovered / totalRecovered) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, Package, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DisposalEntry {
  id: string
  productId: string
  productName: string
  productCode: string
  category: string
  quantity: number
  originalPrice: number
  totalValue: number
  disposalMethod: "discard" | "donate" | "sell-discount" | "return-supplier" | "recycle"
  reason: "damaged" | "expired" | "defective" | "obsolete" | "customer-return" | "quality-issue"
  disposalDate: string
  staffMember: string
  notes: string
  recoveredAmount?: number
  supplierInfo?: string
  batchNumber?: string
  createdAt: string
}

interface DisposalStats {
  totalDisposed: number
  totalLoss: number
  recoveredAmount: number
  recoveryRate: number
  monthlyDisposal: number
}

export function DisposalModule() {
  const [disposalEntries, setDisposalEntries] = useState<DisposalEntry[]>([])
  const [stats, setStats] = useState<DisposalStats>({
    totalDisposed: 0,
    totalLoss: 0,
    recoveredAmount: 0,
    recoveryRate: 0,
    monthlyDisposal: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [reasonFilter, setReasonFilter] = useState("all")
  const [isAddDisposalOpen, setIsAddDisposalOpen] = useState(false)
  const { toast } = useToast()

  const [disposalForm, setDisposalForm] = useState({
    productName: "",
    productCode: "",
    category: "",
    quantity: "",
    originalPrice: "",
    disposalMethod: "",
    reason: "",
    staffMember: "",
    notes: "",
    recoveredAmount: "",
    supplierInfo: "",
    batchNumber: "",
  })

  useEffect(() => {
    loadDisposalData()
  }, [])

  const loadDisposalData = async () => {
    try {
      setLoading(true)
      // Mock data - in real app, this would come from Firebase
      const mockDisposals: DisposalEntry[] = [
        {
          id: "1",
          productId: "prod1",
          productName: "Cotton Kurta Set",
          productCode: "CKS001",
          category: "Kurtas",
          quantity: 2,
          originalPrice: 3500,
          totalValue: 7000,
          disposalMethod: "sell-discount",
          reason: "damaged",
          disposalDate: new Date().toISOString().split("T")[0],
          staffMember: "Fatima Khan",
          notes: "Minor stains, sold at 50% discount",
          recoveredAmount: 3500,
          batchNumber: "B001",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          productId: "prod2",
          productName: "Silk Dupatta",
          productCode: "SD002",
          category: "Dupatta",
          quantity: 1,
          originalPrice: 2500,
          totalValue: 2500,
          disposalMethod: "discard",
          reason: "defective",
          disposalDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          staffMember: "Ali Hassan",
          notes: "Fabric tear, cannot be repaired",
          batchNumber: "B002",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          productId: "prod3",
          productName: "Designer Shirt",
          productCode: "DS003",
          category: "Shirts",
          quantity: 3,
          originalPrice: 4500,
          totalValue: 13500,
          disposalMethod: "donate",
          reason: "obsolete",
          disposalDate: new Date(Date.now() - 172800000).toISOString().split("T")[0],
          staffMember: "Zara Ali",
          notes: "Old design, donated to charity",
          batchNumber: "B003",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]

      setDisposalEntries(mockDisposals)

      // Calculate stats
      const totalDisposed = mockDisposals.reduce((sum, entry) => sum + entry.quantity, 0)
      const totalLoss = mockDisposals.reduce((sum, entry) => sum + entry.totalValue, 0)
      const recoveredAmount = mockDisposals.reduce((sum, entry) => sum + (entry.recoveredAmount || 0), 0)
      const recoveryRate = totalLoss > 0 ? (recoveredAmount / totalLoss) * 100 : 0
      const monthlyDisposal = mockDisposals.filter((entry) => {
        const entryDate = new Date(entry.disposalDate)
        const now = new Date()
        return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
      }).length

      setStats({
        totalDisposed,
        totalLoss,
        recoveredAmount,
        recoveryRate,
        monthlyDisposal,
      })
    } catch (error) {
      console.error("Error loading disposal data:", error)
      toast({
        title: "Error",
        description: "Failed to load disposal data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddDisposal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const quantity = Number.parseInt(disposalForm.quantity)
      const originalPrice = Number.parseFloat(disposalForm.originalPrice)
      const totalValue = quantity * originalPrice
      const recoveredAmount = disposalForm.recoveredAmount ? Number.parseFloat(disposalForm.recoveredAmount) : 0

      const newDisposal: DisposalEntry = {
        id: Date.now().toString(),
        productId: `prod_${Date.now()}`,
        productName: disposalForm.productName,
        productCode: disposalForm.productCode,
        category: disposalForm.category,
        quantity,
        originalPrice,
        totalValue,
        disposalMethod: disposalForm.disposalMethod as any,
        reason: disposalForm.reason as any,
        disposalDate: new Date().toISOString().split("T")[0],
        staffMember: disposalForm.staffMember,
        notes: disposalForm.notes,
        recoveredAmount,
        supplierInfo: disposalForm.supplierInfo,
        batchNumber: disposalForm.batchNumber,
        createdAt: new Date().toISOString(),
      }

      setDisposalEntries((prev) => [newDisposal, ...prev])

      toast({
        title: "Success",
        description: "Disposal entry added successfully",
      })

      setIsAddDisposalOpen(false)
      setDisposalForm({
        productName: "",
        productCode: "",
        category: "",
        quantity: "",
        originalPrice: "",
        disposalMethod: "",
        reason: "",
        staffMember: "",
        notes: "",
        recoveredAmount: "",
        supplierInfo: "",
        batchNumber: "",
      })

      loadDisposalData()
    } catch (error) {
      console.error("Error adding disposal:", error)
      toast({
        title: "Error",
        description: "Failed to add disposal entry",
        variant: "destructive",
      })
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "sell-discount":
        return "secondary"
      case "donate":
        return "outline"
      case "return-supplier":
        return "default"
      case "recycle":
        return "outline"
      case "discard":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "damaged":
        return "destructive"
      case "expired":
        return "destructive"
      case "defective":
        return "destructive"
      case "obsolete":
        return "secondary"
      case "customer-return":
        return "outline"
      case "quality-issue":
        return "destructive"
      default:
        return "outline"
    }
  }

  const filteredEntries = disposalEntries.filter((entry) => {
    const matchesSearch =
      entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMethod = methodFilter === "all" || entry.disposalMethod === methodFilter
    const matchesReason = reasonFilter === "all" || entry.reason === reasonFilter
    return matchesSearch && matchesMethod && matchesReason
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Disposal Management</h2>
        <Dialog open={isAddDisposalOpen} onOpenChange={setIsAddDisposalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Disposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Disposal Entry</DialogTitle>
              <DialogDescription>Record disposal of inventory items</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDisposal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={disposalForm.productName}
                    onChange={(e) => setDisposalForm({ ...disposalForm, productName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input
                    id="productCode"
                    value={disposalForm.productCode}
                    onChange={(e) => setDisposalForm({ ...disposalForm, productCode: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={disposalForm.category}
                    onValueChange={(value) => setDisposalForm({ ...disposalForm, category: value })}
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
                    value={disposalForm.quantity}
                    onChange={(e) => setDisposalForm({ ...disposalForm, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price (per unit)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={disposalForm.originalPrice}
                    onChange={(e) => setDisposalForm({ ...disposalForm, originalPrice: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="disposalMethod">Disposal Method</Label>
                  <Select
                    value={disposalForm.disposalMethod}
                    onValueChange={(value) => setDisposalForm({ ...disposalForm, disposalMethod: value })}
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
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Select
                    value={disposalForm.reason}
                    onValueChange={(value) => setDisposalForm({ ...disposalForm, reason: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="defective">Defective</SelectItem>
                      <SelectItem value="obsolete">Obsolete</SelectItem>
                      <SelectItem value="customer-return">Customer Return</SelectItem>
                      <SelectItem value="quality-issue">Quality Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="staffMember">Staff Member</Label>
                  <Input
                    id="staffMember"
                    value={disposalForm.staffMember}
                    onChange={(e) => setDisposalForm({ ...disposalForm, staffMember: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="recoveredAmount">Recovered Amount (if any)</Label>
                  <Input
                    id="recoveredAmount"
                    type="number"
                    value={disposalForm.recoveredAmount}
                    onChange={(e) => setDisposalForm({ ...disposalForm, recoveredAmount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={disposalForm.batchNumber}
                    onChange={(e) => setDisposalForm({ ...disposalForm, batchNumber: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="supplierInfo">Supplier Info (if returning)</Label>
                <Input
                  id="supplierInfo"
                  value={disposalForm.supplierInfo}
                  onChange={(e) => setDisposalForm({ ...disposalForm, supplierInfo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={disposalForm.notes}
                  onChange={(e) => setDisposalForm({ ...disposalForm, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDisposalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Disposal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Disposed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDisposed}</div>
            <p className="text-xs text-muted-foreground">Items disposed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{stats.totalLoss.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Value lost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recovered Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.recoveredAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Amount recovered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recoveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of total loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyDisposal}</div>
            <p className="text-xs text-muted-foreground">Disposal entries</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-disposals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-disposals">All Disposals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recovery">Recovery Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="all-disposals" className="space-y-4">
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
                    placeholder="Search by product name, code, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="discard">Discard</SelectItem>
                    <SelectItem value="donate">Donate</SelectItem>
                    <SelectItem value="sell-discount">Sell at Discount</SelectItem>
                    <SelectItem value="return-supplier">Return to Supplier</SelectItem>
                    <SelectItem value="recycle">Recycle</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={reasonFilter} onValueChange={setReasonFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="defective">Defective</SelectItem>
                    <SelectItem value="obsolete">Obsolete</SelectItem>
                    <SelectItem value="customer-return">Customer Return</SelectItem>
                    <SelectItem value="quality-issue">Quality Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disposal Records</CardTitle>
              <CardDescription>Complete history of disposed inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Original Value</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Recovered</TableHead>
                    <TableHead>Loss</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Staff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.productCode} • {entry.category}
                          </p>
                          {entry.batchNumber && (
                            <p className="text-xs text-muted-foreground">Batch: {entry.batchNumber}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{entry.quantity}</TableCell>
                      <TableCell>₹{entry.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getMethodColor(entry.disposalMethod) as any}>
                          {entry.disposalMethod.replace("-", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getReasonColor(entry.reason) as any}>
                          {entry.reason.replace("-", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-600">₹{(entry.recoveredAmount || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">
                        ₹{(entry.totalValue - (entry.recoveredAmount || 0)).toLocaleString()}
                      </TableCell>
                      <TableCell>{entry.disposalDate}</TableCell>
                      <TableCell>{entry.staffMember}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Disposal by Method</CardTitle>
                <CardDescription>Breakdown of disposal methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    disposalEntries.reduce(
                      (acc, entry) => {
                        acc[entry.disposalMethod] = (acc[entry.disposalMethod] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).map(([method, count]) => (
                    <div key={method} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{method.replace("-", " ")}</span>
                        <span className="font-medium">{count} items</span>
                      </div>
                      <Progress
                        value={disposalEntries.length > 0 ? (count / disposalEntries.length) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disposal by Reason</CardTitle>
                <CardDescription>Common reasons for disposal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    disposalEntries.reduce(
                      (acc, entry) => {
                        acc[entry.reason] = (acc[entry.reason] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).map(([reason, count]) => (
                    <div key={reason} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{reason.replace("-", " ")}</span>
                        <span className="font-medium">{count} items</span>
                      </div>
                      <Progress
                        value={disposalEntries.length > 0 ? (count / disposalEntries.length) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category-wise Loss Analysis</CardTitle>
              <CardDescription>Financial impact by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  disposalEntries.reduce(
                    (acc, entry) => {
                      if (!acc[entry.category]) {
                        acc[entry.category] = {
                          totalValue: 0,
                          recovered: 0,
                          count: 0,
                        }
                      }
                      acc[entry.category].totalValue += entry.totalValue
                      acc[entry.category].recovered += entry.recoveredAmount || 0
                      acc[entry.category].count += entry.quantity
                      return acc
                    },
                    {} as Record<string, any>,
                  ),
                ).map(([category, data]) => (
                  <div key={category} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{category}</h3>
                      <Badge variant="outline">{data.count} items</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Value</p>
                        <p className="font-medium">₹{data.totalValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Recovered</p>
                        <p className="font-medium text-green-600">₹{data.recovered.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Loss</p>
                        <p className="font-medium text-red-600">
                          ₹{(data.totalValue - data.recovered).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Recovery Rate</span>
                        <span>{((data.recovered / data.totalValue) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(data.recovered / data.totalValue) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Recovery Tracking
              </CardTitle>
              <CardDescription>Items with potential for value recovery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disposalEntries
                  .filter((entry) => entry.recoveredAmount && entry.recoveredAmount > 0)
                  .map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{entry.productName}</p>
                          <Badge variant={getMethodColor(entry.disposalMethod) as any}>
                            {entry.disposalMethod.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entry.productCode} • Qty: {entry.quantity} • {entry.disposalDate}
                        </p>
                        {entry.notes && <p className="text-sm text-muted-foreground italic">"{entry.notes}"</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Original: ₹{entry.totalValue.toLocaleString()}</p>
                        <p className="font-medium text-green-600">
                          Recovered: ₹{entry.recoveredAmount?.toLocaleString()}
                        </p>
                        <p className="text-sm text-red-600">
                          Loss: ₹{(entry.totalValue - (entry.recoveredAmount || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                {disposalEntries.filter((entry) => entry.recoveredAmount && entry.recoveredAmount > 0).length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No recovery records found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

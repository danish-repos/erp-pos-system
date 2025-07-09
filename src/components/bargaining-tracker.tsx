"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Plus, Search, TrendingDown, Users, CheckCircle, XCircle, Clock } from "lucide-react"
import { BargainingService, type BargainRecord } from "@/lib/firebase-services"
import { useToast } from "@/hooks/use-toast"

type StaffPerformance = {
  name: string
  totalBargains: number
  approvedBargains: number
  totalDiscount: number
  averageDiscount: number
}

export function BargainingTracker() {
  const [bargainRecords, setBargainRecords] = useState<BargainRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const [newBargain, setNewBargain] = useState({
    productName: "",
    productCode: "",
    originalPrice: "",
    finalPrice: "",
    customerName: "",
    customerPhone: "",
    reason: "",
    category: "",
    invoiceNumber: "",
  })

  // Load bargain records from Firebase
  const loadBargainData = useCallback(() => {
    const unsubscribe = BargainingService.subscribeToBargainRecords((records: BargainRecord[] | null) => {
      setBargainRecords(records || [])
      setLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = loadBargainData()
    return () => unsubscribe()
  }, [loadBargainData])

  // Filter records based on search term and status
  const filteredRecords = (bargainRecords || []).filter((record) => {
    if (!record) return false

    const matchesSearch =
      record.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.staffMember?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || record.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalBargains = (bargainRecords || []).length
  const approvedBargains = (bargainRecords || []).filter((record) => record?.status === "approved").length
  const rejectedBargains = (bargainRecords || []).filter((record) => record?.status === "rejected").length
  const pendingBargains = (bargainRecords || []).filter((record) => record?.status === "pending").length

  const totalDiscountGiven = (bargainRecords || [])
    .filter((record) => record?.status === "approved")
    .reduce((sum, record) => sum + (record?.discountAmount || 0), 0)

  const averageDiscount = approvedBargains > 0 ? totalDiscountGiven / approvedBargains : 0

  // Staff performance analysis
  const staffPerformance: Record<string, StaffPerformance> = (bargainRecords || []).reduce(
    (acc: Record<string, StaffPerformance>, record) => {
      if (!record?.staffMember) return acc

      if (!acc[record.staffMember]) {
        acc[record.staffMember] = {
          name: record.staffMember,
          totalBargains: 0,
          approvedBargains: 0,
          totalDiscount: 0,
          averageDiscount: 0,
        }
      }

      acc[record.staffMember].totalBargains += 1
      if (record.status === "approved") {
        acc[record.staffMember].approvedBargains += 1
        acc[record.staffMember].totalDiscount += record.discountAmount || 0
      }

      acc[record.staffMember].averageDiscount =
        acc[record.staffMember].approvedBargains > 0
          ? acc[record.staffMember].totalDiscount / acc[record.staffMember].approvedBargains
          : 0

      return acc
    },
    {},
  )

  const handleAddBargain = async () => {
    try {
      const originalPrice = Number(newBargain.originalPrice)
      const finalPrice = Number(newBargain.finalPrice)
      const discountAmount = originalPrice - finalPrice
      const discountPercentage = (discountAmount / originalPrice) * 100
      const profitMargin = finalPrice * 0.3 // Assuming 30% profit margin

      const bargain: Omit<BargainRecord, "id"> = {
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString(),
        productName: newBargain.productName,
        productCode: newBargain.productCode,
        originalPrice: originalPrice,
        finalPrice: finalPrice,
        discountAmount: discountAmount,
        discountPercentage: discountPercentage,
        customerName: newBargain.customerName,
        customerPhone: newBargain.customerPhone,
        staffMember: "Current User", // Replace with actual user
        reason: newBargain.reason,
        invoiceNumber: newBargain.invoiceNumber,
        category: newBargain.category,
        profitMargin: profitMargin,
        status: "pending" as const,
      }

      await BargainingService.createBargainRecord(bargain)

      setNewBargain({
        productName: "",
        productCode: "",
        originalPrice: "",
        finalPrice: "",
        customerName: "",
        customerPhone: "",
        reason: "",
        category: "",
        invoiceNumber: "",
      })
      setIsDialogOpen(false)

      toast({
        title: "Bargain Record Added",
        description: "Bargain record has been successfully created",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to add bargain record. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateBargainStatus = async (bargainId: string, newStatus: "approved" | "rejected" | "pending") => {
    try {
      await BargainingService.updateBargainRecord(bargainId, { status: newStatus })
      toast({
        title: "Status Updated",
        description: `Bargain has been ${newStatus}`,
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading bargain records&hellip;</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bargaining Tracker</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Bargain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bargain Record</DialogTitle>
              <DialogDescription>Record a new bargaining transaction</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={newBargain.productName}
                    onChange={(e) => setNewBargain({ ...newBargain, productName: e.target.value })}
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input
                    id="productCode"
                    value={newBargain.productCode}
                    onChange={(e) => setNewBargain({ ...newBargain, productCode: e.target.value })}
                    placeholder="SKU-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={newBargain.originalPrice}
                    onChange={(e) => setNewBargain({ ...newBargain, originalPrice: e.target.value })}
                    placeholder="2500"
                  />
                </div>
                <div>
                  <Label htmlFor="finalPrice">Final Price (₹)</Label>
                  <Input
                    id="finalPrice"
                    type="number"
                    value={newBargain.finalPrice}
                    onChange={(e) => setNewBargain({ ...newBargain, finalPrice: e.target.value })}
                    placeholder="2200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={newBargain.customerName}
                    onChange={(e) => setNewBargain({ ...newBargain, customerName: e.target.value })}
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    value={newBargain.customerPhone}
                    onChange={(e) => setNewBargain({ ...newBargain, customerPhone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newBargain.category}
                    onValueChange={(value) => setNewBargain({ ...newBargain, category: value })}
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
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={newBargain.invoiceNumber}
                    onChange={(e) => setNewBargain({ ...newBargain, invoiceNumber: e.target.value })}
                    placeholder="INV-001"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Bargain</Label>
                <Textarea
                  id="reason"
                  value={newBargain.reason}
                  onChange={(e) => setNewBargain({ ...newBargain, reason: e.target.value })}
                  placeholder="Reason for giving discount"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBargain}>Add Bargain Record</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bargains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBargains}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{approvedBargains} approved</span> &bull;
              <span className="text-red-600"> {rejectedBargains} rejected</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Discount Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{totalDiscountGiven.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Approved bargains only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageDiscount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per approved bargain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBargains > 0 ? ((approvedBargains / totalBargains) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Bargains approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search &amp; Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by product, customer, or staff member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">Bargain Records</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                Bargain Records
              </CardTitle>
              <CardDescription>
                Showing {filteredRecords.length} of {totalBargains} bargain records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Original Price</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.productName}</p>
                            <p className="text-sm text-muted-foreground">{record.productCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.customerName}</p>
                            <p className="text-sm text-muted-foreground">{record.customerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>₹{record.originalPrice.toLocaleString()}</TableCell>
                        <TableCell>₹{record.finalPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-orange-600">₹{record.discountAmount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{record.discountPercentage.toFixed(1)}%</p>
                          </div>
                        </TableCell>
                        <TableCell>{record.staffMember}</TableCell>
                        <TableCell>
                          <div>
                            <p>{record.date}</p>
                            <p className="text-sm text-muted-foreground">{record.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(record.status) as "destructive" | "default" | "secondary" | "outline" | null | undefined} className="flex items-center gap-1">
                            {getStatusIcon(record.status)}
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.status === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBargainStatus(record.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBargainStatus(record.id, "rejected")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Performance
              </CardTitle>
              <CardDescription>Bargaining performance by staff member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Total Bargains</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Approval Rate</TableHead>
                      <TableHead>Total Discount</TableHead>
                      <TableHead>Average Discount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(staffPerformance).map((staff) => {
                      const s = staff as StaffPerformance
                      return (
                        <TableRow key={s.name}>
                          <TableCell>
                            <p className="font-medium">{s.name}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{s.totalBargains}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{s.approvedBargains}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{
                                    width: `${s.totalBargains > 0 ? (s.approvedBargains / s.totalBargains) * 100 : 0}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm">
                                {s.totalBargains > 0
                                  ? ((s.approvedBargains / s.totalBargains) * 100).toFixed(1)
                                  : 0}
                                %
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-orange-600">₹{s.totalDiscount.toLocaleString()}</TableCell>
                          <TableCell>₹{s.averageDiscount.toLocaleString()}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

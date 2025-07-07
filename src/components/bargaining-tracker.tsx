"use client"

import { Progress } from "@/components/ui/progress"

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
import { Plus, Search, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BargainEntry {
  id: string
  productId: string
  productName: string
  customerName: string
  customerPhone: string
  originalPrice: number
  requestedPrice: number
  finalPrice: number
  discountAmount: number
  discountPercentage: number
  status: "pending" | "approved" | "rejected" | "completed"
  staffMember: string
  date: string
  time: string
  notes: string
  approvedBy?: string
  approvalDate?: string
  createdAt: string
  updatedAt?: string
}

interface BargainStats {
  totalBargains: number
  averageDiscount: number
  totalDiscountGiven: number
  approvalRate: number
  pendingApprovals: number
}

export function BargainingTracker() {
  const [bargainEntries, setBargainEntries] = useState<BargainEntry[]>([])
  const [stats, setStats] = useState<BargainStats>({
    totalBargains: 0,
    averageDiscount: 0,
    totalDiscountGiven: 0,
    approvalRate: 0,
    pendingApprovals: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")
  const [isAddBargainOpen, setIsAddBargainOpen] = useState(false)
  const { toast } = useToast()

  const [bargainForm, setBargainForm] = useState({
    productName: "",
    customerName: "",
    customerPhone: "",
    originalPrice: "",
    requestedPrice: "",
    staffMember: "",
    notes: "",
  })

  useEffect(() => {
    loadBargainData()
  }, [])

  const loadBargainData = async () => {
    try {
      setLoading(true)
      // Mock data - in real app, this would come from Firebase
      const mockBargains: BargainEntry[] = [
        {
          id: "1",
          productId: "prod1",
          productName: "Cotton Kurta Set",
          customerName: "Ahmed Ali",
          customerPhone: "+92-300-1234567",
          originalPrice: 3500,
          requestedPrice: 2800,
          finalPrice: 3000,
          discountAmount: 500,
          discountPercentage: 14.3,
          status: "completed",
          staffMember: "Fatima Khan",
          date: new Date().toISOString().split("T")[0],
          time: "10:30 AM",
          notes: "Regular customer, good negotiation",
          approvedBy: "Manager",
          approvalDate: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          productId: "prod2",
          productName: "Silk Dupatta",
          customerName: "Sara Ahmed",
          customerPhone: "+92-301-9876543",
          originalPrice: 2500,
          requestedPrice: 1800,
          finalPrice: 2500,
          discountAmount: 0,
          discountPercentage: 0,
          status: "rejected",
          staffMember: "Ali Hassan",
          date: new Date().toISOString().split("T")[0],
          time: "11:15 AM",
          notes: "Discount too high, rejected",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          productId: "prod3",
          productName: "Designer Shirt",
          customerName: "Hassan Khan",
          customerPhone: "+92-302-5555555",
          originalPrice: 4500,
          requestedPrice: 3500,
          finalPrice: 0,
          discountAmount: 0,
          discountPercentage: 22.2,
          status: "pending",
          staffMember: "Zara Ali",
          date: new Date().toISOString().split("T")[0],
          time: "12:00 PM",
          notes: "Waiting for manager approval",
          createdAt: new Date().toISOString(),
        },
      ]

      setBargainEntries(mockBargains)

      // Calculate stats
      const totalBargains = mockBargains.length
      const completedBargains = mockBargains.filter((b) => b.status === "completed")
      const totalDiscountGiven = completedBargains.reduce((sum, b) => sum + b.discountAmount, 0)
      const averageDiscount =
        completedBargains.length > 0
          ? completedBargains.reduce((sum, b) => sum + b.discountPercentage, 0) / completedBargains.length
          : 0
      const approvedBargains = mockBargains.filter((b) => b.status === "approved" || b.status === "completed").length
      const approvalRate = totalBargains > 0 ? (approvedBargains / totalBargains) * 100 : 0
      const pendingApprovals = mockBargains.filter((b) => b.status === "pending").length

      setStats({
        totalBargains,
        averageDiscount,
        totalDiscountGiven,
        approvalRate,
        pendingApprovals,
      })
    } catch (error) {
      console.error("Error loading bargain data:", error)
      toast({
        title: "Error",
        description: "Failed to load bargaining data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddBargain = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const originalPrice = Number.parseFloat(bargainForm.originalPrice)
      const requestedPrice = Number.parseFloat(bargainForm.requestedPrice)
      const discountAmount = originalPrice - requestedPrice
      const discountPercentage = (discountAmount / originalPrice) * 100

      const newBargain: BargainEntry = {
        id: Date.now().toString(),
        productId: `prod_${Date.now()}`,
        productName: bargainForm.productName,
        customerName: bargainForm.customerName,
        customerPhone: bargainForm.customerPhone,
        originalPrice,
        requestedPrice,
        finalPrice: 0,
        discountAmount,
        discountPercentage,
        status: discountPercentage > 20 ? "pending" : "approved",
        staffMember: bargainForm.staffMember,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        notes: bargainForm.notes,
        createdAt: new Date().toISOString(),
      }

      setBargainEntries((prev) => [newBargain, ...prev])

      toast({
        title: "Success",
        description: `Bargain entry added ${newBargain.status === "pending" ? "and sent for approval" : "successfully"}`,
      })

      setIsAddBargainOpen(false)
      setBargainForm({
        productName: "",
        customerName: "",
        customerPhone: "",
        originalPrice: "",
        requestedPrice: "",
        staffMember: "",
        notes: "",
      })

      loadBargainData()
    } catch (error) {
      console.error("Error adding bargain:", error)
      toast({
        title: "Error",
        description: "Failed to add bargain entry",
        variant: "destructive",
      })
    }
  }

  const handleApproval = async (bargainId: string, approved: boolean) => {
    try {
      setBargainEntries((prev) =>
        prev.map((bargain) => {
          if (bargain.id === bargainId) {
            return {
              ...bargain,
              status: approved ? "approved" : "rejected",
              approvedBy: "Manager",
              approvalDate: new Date().toISOString().split("T")[0],
              finalPrice: approved ? bargain.requestedPrice : bargain.originalPrice,
              updatedAt: new Date().toISOString(),
            }
          }
          return bargain
        }),
      )

      toast({
        title: "Success",
        description: `Bargain ${approved ? "approved" : "rejected"} successfully`,
      })

      loadBargainData()
    } catch (error) {
      console.error("Error updating bargain:", error)
      toast({
        title: "Error",
        description: "Failed to update bargain status",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "approved":
        return "secondary"
      case "pending":
        return "outline"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const filteredEntries = bargainEntries.filter((entry) => {
    const matchesSearch =
      entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.customerPhone.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bargaining Tracker</h2>
        <Dialog open={isAddBargainOpen} onOpenChange={setIsAddBargainOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Bargain
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Bargain Entry</DialogTitle>
              <DialogDescription>Record a new price negotiation</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddBargain} className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={bargainForm.productName}
                  onChange={(e) => setBargainForm({ ...bargainForm, productName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={bargainForm.customerName}
                    onChange={(e) => setBargainForm({ ...bargainForm, customerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={bargainForm.customerPhone}
                    onChange={(e) => setBargainForm({ ...bargainForm, customerPhone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={bargainForm.originalPrice}
                    onChange={(e) => setBargainForm({ ...bargainForm, originalPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="requestedPrice">Requested Price</Label>
                  <Input
                    id="requestedPrice"
                    type="number"
                    value={bargainForm.requestedPrice}
                    onChange={(e) => setBargainForm({ ...bargainForm, requestedPrice: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="staffMember">Staff Member</Label>
                <Input
                  id="staffMember"
                  value={bargainForm.staffMember}
                  onChange={(e) => setBargainForm({ ...bargainForm, staffMember: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={bargainForm.notes}
                  onChange={(e) => setBargainForm({ ...bargainForm, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddBargainOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Bargain</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bargains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBargains}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDiscount.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Discount Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{stats.totalDiscountGiven.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Revenue impact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Bargains approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-bargains" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-bargains">All Bargains</TabsTrigger>
          <TabsTrigger value="pending-approval">Pending Approval</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all-bargains" className="space-y-4">
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
                    placeholder="Search by product, customer, or phone..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bargaining History</CardTitle>
              <CardDescription>Complete record of price negotiations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Original Price</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Final Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.date} • {entry.time}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.customerName}</p>
                          <p className="text-sm text-muted-foreground">{entry.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>₹{entry.originalPrice.toLocaleString()}</TableCell>
                      <TableCell>₹{entry.requestedPrice.toLocaleString()}</TableCell>
                      <TableCell>{entry.finalPrice > 0 ? `₹${entry.finalPrice.toLocaleString()}` : "-"}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-red-600">{entry.discountPercentage.toFixed(1)}%</p>
                          <p className="text-sm text-muted-foreground">₹{entry.discountAmount.toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(entry.status) as any}>{entry.status.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{entry.staffMember}</TableCell>
                      <TableCell>
                        {entry.status === "pending" && (
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => handleApproval(entry.id, true)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleApproval(entry.id, false)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Approvals
              </CardTitle>
              <CardDescription>Bargains requiring manager approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bargainEntries
                  .filter((entry) => entry.status === "pending")
                  .map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{entry.productName}</p>
                          <Badge variant="outline">{entry.discountPercentage.toFixed(1)}% discount</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Customer: {entry.customerName} • Staff: {entry.staffMember}
                        </p>
                        <p className="text-sm">
                          ₹{entry.originalPrice.toLocaleString()} → ₹{entry.requestedPrice.toLocaleString()}
                        </p>
                        {entry.notes && <p className="text-sm text-muted-foreground italic">"{entry.notes}"</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproval(entry.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="destructive" onClick={() => handleApproval(entry.id, false)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                {bargainEntries.filter((entry) => entry.status === "pending").length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
                <CardDescription>Bargaining performance by staff member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    bargainEntries.reduce(
                      (acc, entry) => {
                        if (!acc[entry.staffMember]) {
                          acc[entry.staffMember] = {
                            total: 0,
                            approved: 0,
                            totalDiscount: 0,
                          }
                        }
                        acc[entry.staffMember].total += 1
                        if (entry.status === "approved" || entry.status === "completed") {
                          acc[entry.staffMember].approved += 1
                          acc[entry.staffMember].totalDiscount += entry.discountAmount
                        }
                        return acc
                      },
                      {} as Record<string, any>,
                    ),
                  ).map(([staff, data]) => (
                    <div key={staff} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{staff}</span>
                        <span className="text-sm text-muted-foreground">
                          {data.approved}/{data.total} approved
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Progress value={(data.approved / data.total) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Total discount given: ₹{data.totalDiscount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discount Distribution</CardTitle>
                <CardDescription>Breakdown of discount ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { range: "0-10%", count: bargainEntries.filter((e) => e.discountPercentage <= 10).length },
                    {
                      range: "10-20%",
                      count: bargainEntries.filter((e) => e.discountPercentage > 10 && e.discountPercentage <= 20)
                        .length,
                    },
                    {
                      range: "20-30%",
                      count: bargainEntries.filter((e) => e.discountPercentage > 20 && e.discountPercentage <= 30)
                        .length,
                    },
                    { range: "30%+", count: bargainEntries.filter((e) => e.discountPercentage > 30).length },
                  ].map((item) => (
                    <div key={item.range} className="space-y-2">
                      <div className="flex justify-between">
                        <span>{item.range}</span>
                        <span className="font-medium">{item.count} bargains</span>
                      </div>
                      <Progress
                        value={bargainEntries.length > 0 ? (item.count / bargainEntries.length) * 100 : 0}
                        className="h-2"
                      />
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

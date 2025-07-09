"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, CreditCard, DollarSign, FileText, Plus, Search, TrendingDown, TrendingUp } from "lucide-react"
import { LedgerService, type CreditEntry, type DebitEntry, type PaymentRecord } from "@/lib/firebase-services"
import { useToast } from "@/hooks/use-toast"

export function CreditDebitLedger() {
  const [creditEntries, setCreditEntries] = useState<CreditEntry[]>([])
  const [debitEntries, setDebitEntries] = useState<DebitEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  // Form states
  const [newCreditEntry, setNewCreditEntry] = useState({
    customerName: "",
    customerPhone: "",
    amount: "",
    dueDate: "",
    saleDate: "",
    invoiceNumber: "",
    notes: "",
  })

  const [newDebitEntry, setNewDebitEntry] = useState({
    supplierName: "",
    supplierPhone: "",
    amount: "",
    dueDate: "",
    purchaseDate: "",
    invoiceNumber: "",
    description: "",
    category: "",
  })

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "",
    reference: "",
    notes: "",
  })

  const [selectedEntry, setSelectedEntry] = useState<CreditEntry | DebitEntry | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  

  // Set up real-time listeners
  useEffect(() => {
    const unsubscribeCredit = LedgerService.subscribeToCreditEntries((entries: CreditEntry[] | null) => {
      setCreditEntries(entries || [])
    })

    const unsubscribeDebit = LedgerService.subscribeToDebitEntries((entries: DebitEntry[] | null) => {
      setDebitEntries(entries || [])
    })

    return () => {
      unsubscribeCredit()
      unsubscribeDebit()
    }
  }, [])

  // Wrap loadData in useCallback to avoid recreating it on every render
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [creditData, debitData] = await Promise.all([
        LedgerService.getAllCreditEntries(),
        LedgerService.getAllDebitEntries(),
      ])
      setCreditEntries(creditData || [])
      setDebitEntries(debitData || [])
    } catch {
      // error is intentionally omitted to resolve lint error
      console.error("Error loading ledger data:")
      toast({
        title: "Error",
        description: "Failed to load ledger data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [loadData])
  
  const handleCreateCreditEntry = async () => {
    try {
      if (!newCreditEntry.customerName || !newCreditEntry.amount) {
        toast({
          title: "Error",
          description: "Please fill in required fields",
          variant: "destructive",
        })
        return
      }

      const amount = Number.parseFloat(newCreditEntry.amount)
      const entry: Omit<CreditEntry, "id"> = {
        customerName: newCreditEntry.customerName,
        customerPhone: newCreditEntry.customerPhone,
        amount,
        dueDate: newCreditEntry.dueDate,
        saleDate: newCreditEntry.saleDate,
        invoiceNumber: newCreditEntry.invoiceNumber,
        status: "pending" as const,
        paidAmount: 0,
        remainingAmount: amount,
        paymentHistory: [],
        notes: newCreditEntry.notes,
      }

      await LedgerService.createCreditEntry(entry)

      // Reset form
      setNewCreditEntry({
        customerName: "",
        customerPhone: "",
        amount: "",
        dueDate: "",
        saleDate: "",
        invoiceNumber: "",
        notes: "",
      })

      toast({
        title: "Success",
        description: "Credit entry created successfully",
      })
    } catch {
      // error is intentionally omitted to resolve lint error
      console.error("Error creating credit entry:")
      toast({
        title: "Error",
        description: "Failed to create credit entry",
        variant: "destructive",
      })
    }
  }

  const handleCreateDebitEntry = async () => {
    try {
      if (!newDebitEntry.supplierName || !newDebitEntry.amount) {
        toast({
          title: "Error",
          description: "Please fill in required fields",
          variant: "destructive",
        })
        return
      }

      const amount = Number.parseFloat(newDebitEntry.amount)
      const entry: Omit<DebitEntry, "id"> = {
        supplierName: newDebitEntry.supplierName,
        supplierPhone: newDebitEntry.supplierPhone,
        amount,
        dueDate: newDebitEntry.dueDate,
        purchaseDate: newDebitEntry.purchaseDate,
        invoiceNumber: newDebitEntry.invoiceNumber,
        status: "pending" as const,
        paidAmount: 0,
        remainingAmount: amount,
        paymentHistory: [],
        description: newDebitEntry.description,
        category: newDebitEntry.category,
      }

      await LedgerService.createDebitEntry(entry)

      // Reset form
      setNewDebitEntry({
        supplierName: "",
        supplierPhone: "",
        amount: "",
        dueDate: "",
        purchaseDate: "",
        invoiceNumber: "",
        description: "",
        category: "",
      })

      toast({
        title: "Success",
        description: "Debit entry created successfully",
      })
    } catch {
      // error is intentionally omitted to resolve lint error
      console.error("Error creating debit entry:")
      toast({
        title: "Error",
        description: "Failed to create debit entry",
        variant: "destructive",
      })
    }
  }

  const handleAddPayment = async () => {
    try {
      if (!selectedEntry || !paymentForm.amount) {
        toast({
          title: "Error",
          description: "Please fill in required fields",
          variant: "destructive",
        })
        return
      }

      const paymentAmount = Number.parseFloat(paymentForm.amount)
      const newPaidAmount = selectedEntry.paidAmount + paymentAmount
      const newRemainingAmount = selectedEntry.amount - newPaidAmount

      if (newPaidAmount > selectedEntry.amount) {
        toast({
          title: "Error",
          description: "Payment amount cannot exceed remaining balance",
          variant: "destructive",
        })
        return
      }

      const paymentRecord: PaymentRecord = {
        id: `pay_${Date.now()}`,
        amount: paymentAmount,
        date: new Date().toISOString().split("T")[0],
        method: paymentForm.method,
        reference: paymentForm.reference,
        notes: paymentForm.notes,
      }

      const updatedEntry = {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount === 0 ? ("paid" as const) : ("partial" as const),
        paymentHistory: [...(selectedEntry.paymentHistory || []), paymentRecord],
      }

      if ("customerName" in selectedEntry) {
        await LedgerService.updateCreditEntry(selectedEntry.id, updatedEntry)
      } else {
        await LedgerService.updateDebitEntry(selectedEntry.id, updatedEntry)
      }

      setPaymentDialogOpen(false)
      setPaymentForm({ amount: "", method: "", reference: "", notes: "" })
      setSelectedEntry(null)

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })
    } catch {
      // error is intentionally omitted to resolve lint error
      console.error("Error adding payment:")
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      })
    }
  }

  // Safe filtering with null checks
  const filteredCreditEntries = (creditEntries || []).filter((entry: CreditEntry) => {
    const matchesSearch =
      entry.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredDebitEntries = (debitEntries || []).filter((entry: DebitEntry) => {
    const matchesSearch =
      entry.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate statistics with null checks
  const creditStats = {
    total: (creditEntries || []).reduce((sum: number, entry: CreditEntry) => sum + (entry.amount || 0), 0),
    pending: (creditEntries || []).reduce((sum: number, entry: CreditEntry) => sum + (entry.remainingAmount || 0), 0),
    paid: (creditEntries || []).reduce((sum: number, entry: CreditEntry) => sum + (entry.paidAmount || 0), 0),
    count: (creditEntries || []).length,
  }

  const debitStats = {
    total: (debitEntries || []).reduce((sum: number, entry: DebitEntry) => sum + (entry.amount || 0), 0),
    pending: (debitEntries || []).reduce((sum: number, entry: DebitEntry) => sum + (entry.remainingAmount || 0), 0),
    paid: (debitEntries || []).reduce((sum: number, entry: DebitEntry) => sum + (entry.paidAmount || 0), 0),
    count: (debitEntries || []).length,
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "destructive" as const,
      partial: "secondary" as const,
      paid: "default" as const,
      overdue: "destructive" as const,
    }
    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading ledger data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{creditStats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{creditStats.count} entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Credit</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{creditStats.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debit</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{debitStats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{debitStats.count} entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Debit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{debitStats.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="credit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="credit">Credit Entries</TabsTrigger>
          <TabsTrigger value="debit">Debit Entries</TabsTrigger>
        </TabsList>

        {/* Credit Entries Tab */}
        <TabsContent value="credit" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Credit Entries</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Credit Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Credit Entry</DialogTitle>
                  <DialogDescription>Create a new credit entry for customer payment tracking.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customerName" className="text-right">
                      Customer *
                    </Label>
                    <Input
                      id="customerName"
                      value={newCreditEntry.customerName}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, customerName: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customerPhone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="customerPhone"
                      value={newCreditEntry.customerPhone}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, customerPhone: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newCreditEntry.amount}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, amount: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dueDate" className="text-right">
                      Due Date
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newCreditEntry.dueDate}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, dueDate: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="saleDate" className="text-right">
                      Sale Date
                    </Label>
                    <Input
                      id="saleDate"
                      type="date"
                      value={newCreditEntry.saleDate}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, saleDate: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="invoiceNumber" className="text-right">
                      Invoice #
                    </Label>
                    <Input
                      id="invoiceNumber"
                      value={newCreditEntry.invoiceNumber}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, invoiceNumber: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={newCreditEntry.notes}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, notes: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCreateCreditEntry}>Create Entry</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredCreditEntries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No credit entries found</p>
                  <p className="text-sm text-muted-foreground">Create your first credit entry to get started</p>
                </CardContent>
              </Card>
            ) : (
              filteredCreditEntries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{entry.customerName}</CardTitle>
                        <CardDescription>
                          {entry.customerPhone && `Phone: ${entry.customerPhone}`}
                          {entry.invoiceNumber && ` • Invoice: ${entry.invoiceNumber}`}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(entry.status)}
                        <p className="text-sm text-muted-foreground mt-1">Due: {entry.dueDate || "Not set"}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Total Amount</p>
                        <p className="text-lg">₹{entry.amount?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Paid Amount</p>
                        <p className="text-lg text-green-600">₹{entry.paidAmount?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Remaining</p>
                        <p className="text-lg text-red-600">₹{entry.remainingAmount?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Progress</p>
                        <p className="text-lg">
                          {entry.amount ? Math.round((entry.paidAmount / entry.amount) * 100) : 0}%
                        </p>
                      </div>
                    </div>

                    {entry.paymentHistory && entry.paymentHistory.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Payment History</p>
                        <div className="space-y-2">
                          {entry.paymentHistory.slice(-3).map((payment) => (
                            <div
                              key={payment.id}
                              className="flex justify-between items-center text-sm bg-muted p-2 rounded"
                            >
                              <span>
                                ₹{payment.amount?.toLocaleString() || 0} - {payment.method}
                              </span>
                              <span>{payment.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.remainingAmount > 0 && (
                      <Button
                        onClick={() => {
                          setSelectedEntry(entry)
                          setPaymentDialogOpen(true)
                        }}
                        size="sm"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Add Payment
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Debit Entries Tab */}
        <TabsContent value="debit" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Debit Entries</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Debit Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Debit Entry</DialogTitle>
                  <DialogDescription>Create a new debit entry for supplier payment tracking.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="supplierName" className="text-right">
                      Supplier *
                    </Label>
                    <Input
                      id="supplierName"
                      value={newDebitEntry.supplierName}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, supplierName: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="supplierPhone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="supplierPhone"
                      value={newDebitEntry.supplierPhone}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, supplierPhone: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="debitAmount" className="text-right">
                      Amount *
                    </Label>
                    <Input
                      id="debitAmount"
                      type="number"
                      value={newDebitEntry.amount}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, amount: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="debitDueDate" className="text-right">
                      Due Date
                    </Label>
                    <Input
                      id="debitDueDate"
                      type="date"
                      value={newDebitEntry.dueDate}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, dueDate: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="purchaseDate" className="text-right">
                      Purchase Date
                    </Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={newDebitEntry.purchaseDate}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, purchaseDate: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="debitInvoiceNumber" className="text-right">
                      Invoice #
                    </Label>
                    <Input
                      id="debitInvoiceNumber"
                      value={newDebitEntry.invoiceNumber}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, invoiceNumber: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      value={newDebitEntry.category}
                      onValueChange={(value) => setNewDebitEntry({ ...newDebitEntry, category: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raw-materials">Raw Materials</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newDebitEntry.description}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, description: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCreateDebitEntry}>Create Entry</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredDebitEntries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No debit entries found</p>
                  <p className="text-sm text-muted-foreground">Create your first debit entry to get started</p>
                </CardContent>
              </Card>
            ) : (
              filteredDebitEntries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{entry.supplierName}</CardTitle>
                        <CardDescription>
                          {entry.supplierPhone && `Phone: ${entry.supplierPhone}`}
                          {entry.invoiceNumber && ` • Invoice: ${entry.invoiceNumber}`}
                          {entry.category && ` • ${entry.category}`}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(entry.status)}
                        <p className="text-sm text-muted-foreground mt-1">Due: {entry.dueDate || "Not set"}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Total Amount</p>
                        <p className="text-lg">₹{entry.amount?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Paid Amount</p>
                        <p className="text-lg text-green-600">₹{entry.paidAmount?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Remaining</p>
                        <p className="text-lg text-red-600">₹{entry.remainingAmount?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Progress</p>
                        <p className="text-lg">
                          {entry.amount ? Math.round((entry.paidAmount / entry.amount) * 100) : 0}%
                        </p>
                      </div>
                    </div>

                    {entry.description && (
                      <div className="mb-4">
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                      </div>
                    )}

                    {entry.paymentHistory && entry.paymentHistory.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Payment History</p>
                        <div className="space-y-2">
                          {entry.paymentHistory.slice(-3).map((payment) => (
                            <div
                              key={payment.id}
                              className="flex justify-between items-center text-sm bg-muted p-2 rounded"
                            >
                              <span>
                                ₹{payment.amount?.toLocaleString() || 0} - {payment.method}
                              </span>
                              <span>{payment.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.remainingAmount > 0 && (
                      <Button
                        onClick={() => {
                          setSelectedEntry(entry)
                          setPaymentDialogOpen(true)
                        }}
                        size="sm"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Add Payment
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>
              Record a payment for{" "}
              {selectedEntry &&
                ("customerName" in selectedEntry ? selectedEntry.customerName : selectedEntry.supplierName)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentAmount" className="text-right">
                Amount *
              </Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="col-span-3"
                max={selectedEntry?.remainingAmount || 0}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">
                Method *
              </Label>
              <Select
                value={paymentForm.method}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, method: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile-payment">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                Reference
              </Label>
              <Input
                id="reference"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                className="col-span-3"
                placeholder="Transaction ID, Cheque #, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentNotes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="paymentNotes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="col-span-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Remaining Balance:</strong> ₹{selectedEntry?.remainingAmount?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPayment}>Record Payment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
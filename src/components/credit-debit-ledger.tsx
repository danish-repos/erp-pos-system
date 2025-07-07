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
import { Plus, Edit, Search, AlertCircle, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { LedgerService, type CreditEntry, type DebitEntry, type PaymentRecord } from "@/lib/firebase-services"
import { useToast } from "@/hooks/use-toast"

export function CreditDebitLedger() {
  const [creditEntries, setCreditEntries] = useState<CreditEntry[]>([])
  const [debitEntries, setDebitEntries] = useState<DebitEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false)
  const [isDebitDialogOpen, setIsDebitDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<CreditEntry | DebitEntry | null>(null)
  const [entryType, setEntryType] = useState<"credit" | "debit">("credit")
  const { toast } = useToast()

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

  const [newPayment, setNewPayment] = useState({
    amount: "",
    method: "",
    reference: "",
    notes: "",
  })

  // Load data from Firebase
  useEffect(() => {
    const unsubscribeCredits = LedgerService.subscribeToCreditEntries((entries) => {
      setCreditEntries(entries)
      setLoading(false)
    })

    const unsubscribeDebits = LedgerService.subscribeToDebitEntries((entries) => {
      setDebitEntries(entries)
    })

    return () => {
      unsubscribeCredits()
      unsubscribeDebits()
    }
  }, [])

  const filteredCreditEntries = creditEntries.filter(
    (entry) =>
      entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredDebitEntries = debitEntries.filter(
    (entry) =>
      entry.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddCreditEntry = async () => {
    try {
      const amount = Number(newCreditEntry.amount)
      const entry: Omit<CreditEntry, "id"> = {
        customerName: newCreditEntry.customerName,
        customerPhone: newCreditEntry.customerPhone,
        amount: amount,
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

      setNewCreditEntry({
        customerName: "",
        customerPhone: "",
        amount: "",
        dueDate: "",
        saleDate: "",
        invoiceNumber: "",
        notes: "",
      })
      setIsCreditDialogOpen(false)

      toast({
        title: "Credit Entry Added",
        description: "Credit entry has been successfully added",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add credit entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddDebitEntry = async () => {
    try {
      const amount = Number(newDebitEntry.amount)
      const entry: Omit<DebitEntry, "id"> = {
        supplierName: newDebitEntry.supplierName,
        supplierPhone: newDebitEntry.supplierPhone,
        amount: amount,
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
      setIsDebitDialogOpen(false)

      toast({
        title: "Debit Entry Added",
        description: "Debit entry has been successfully added",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add debit entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddPayment = async () => {
    if (!selectedEntry) return

    try {
      const paymentAmount = Number(newPayment.amount)
      const payment: PaymentRecord = {
        id: Date.now().toString(),
        amount: paymentAmount,
        date: new Date().toISOString().split("T")[0],
        method: newPayment.method,
        reference: newPayment.reference,
        notes: newPayment.notes,
      }

      const newPaidAmount = selectedEntry.paidAmount + paymentAmount
      const newRemainingAmount = selectedEntry.amount - newPaidAmount

      let updatedStatus: "pending" | "partial" | "paid" | "overdue"
      if (newRemainingAmount <= 0) {
        updatedStatus = "paid"
      } else if (newPaidAmount > 0) {
        updatedStatus = "partial"
      } else {
        updatedStatus = "pending"
      }

      const updatedEntry = {
        ...selectedEntry,
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, newRemainingAmount),
        status: updatedStatus,
        paymentHistory: [...selectedEntry.paymentHistory, payment],
      }

      if (entryType === "credit") {
        await LedgerService.updateCreditEntry(selectedEntry.id, updatedEntry)
      } else {
        await LedgerService.updateDebitEntry(selectedEntry.id, updatedEntry)
      }

      setNewPayment({
        amount: "",
        method: "",
        reference: "",
        notes: "",
      })
      setIsPaymentDialogOpen(false)
      setSelectedEntry(null)

      toast({
        title: "Payment Recorded",
        description: "Payment has been successfully recorded",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openPaymentDialog = (entry: CreditEntry | DebitEntry, type: "credit" | "debit") => {
    setSelectedEntry(entry)
    setEntryType(type)
    setIsPaymentDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "partial":
        return "secondary"
      case "pending":
        return "destructive"
      case "overdue":
        return "destructive"
      default:
        return "default"
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading ledger...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Credit & Debit Ledger</h2>
        <div className="flex gap-2">
          <Dialog open={isDebitDialogOpen} onOpenChange={setIsDebitDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <TrendingDown className="h-4 w-4 mr-2" />
                Add Debit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Debit Entry</DialogTitle>
                <DialogDescription>Record a new supplier payment due</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierName">Supplier Name</Label>
                    <Input
                      id="supplierName"
                      value={newDebitEntry.supplierName}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, supplierName: e.target.value })}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplierPhone">Phone</Label>
                    <Input
                      id="supplierPhone"
                      value={newDebitEntry.supplierPhone}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, supplierPhone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="debitAmount">Amount (₹)</Label>
                    <Input
                      id="debitAmount"
                      type="number"
                      value={newDebitEntry.amount}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, amount: e.target.value })}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newDebitEntry.category}
                      onValueChange={(value) => setNewDebitEntry({ ...newDebitEntry, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inventory">Inventory Purchase</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={newDebitEntry.purchaseDate}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, purchaseDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="debitDueDate">Due Date</Label>
                    <Input
                      id="debitDueDate"
                      type="date"
                      value={newDebitEntry.dueDate}
                      onChange={(e) => setNewDebitEntry({ ...newDebitEntry, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="debitInvoiceNumber">Invoice Number</Label>
                  <Input
                    id="debitInvoiceNumber"
                    value={newDebitEntry.invoiceNumber}
                    onChange={(e) => setNewDebitEntry({ ...newDebitEntry, invoiceNumber: e.target.value })}
                    placeholder="INV-001"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newDebitEntry.description}
                    onChange={(e) => setNewDebitEntry({ ...newDebitEntry, description: e.target.value })}
                    placeholder="Purchase description"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDebitDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDebitEntry}>Add Debit Entry</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Credit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Credit Entry</DialogTitle>
                <DialogDescription>Record a new customer payment due</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={newCreditEntry.customerName}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, customerName: e.target.value })}
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      value={newCreditEntry.customerPhone}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, customerPhone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="creditAmount">Amount (₹)</Label>
                    <Input
                      id="creditAmount"
                      type="number"
                      value={newCreditEntry.amount}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, amount: e.target.value })}
                      placeholder="2500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="creditInvoiceNumber">Invoice Number</Label>
                    <Input
                      id="creditInvoiceNumber"
                      value={newCreditEntry.invoiceNumber}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, invoiceNumber: e.target.value })}
                      placeholder="INV-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="saleDate">Sale Date</Label>
                    <Input
                      id="saleDate"
                      type="date"
                      value={newCreditEntry.saleDate}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, saleDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="creditDueDate">Due Date</Label>
                    <Input
                      id="creditDueDate"
                      type="date"
                      value={newCreditEntry.dueDate}
                      onChange={(e) => setNewCreditEntry({ ...newCreditEntry, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={newCreditEntry.notes}
                    onChange={(e) => setNewCreditEntry({ ...newCreditEntry, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCreditEntry}>Add Credit Entry</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {selectedEntry && (
                <>
                  Recording payment for{" "}
                  {"customerName" in selectedEntry ? selectedEntry.customerName : selectedEntry.supplierName} -
                  Remaining: ₹{selectedEntry.remainingAmount.toLocaleString()}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  placeholder="1000"
                  max={selectedEntry?.remainingAmount}
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={newPayment.method}
                  onValueChange={(value) => setNewPayment({ ...newPayment, method: value })}
                >
                  <SelectTrigger>
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
            </div>

            <div>
              <Label htmlFor="paymentReference">Reference Number</Label>
              <Input
                id="paymentReference"
                value={newPayment.reference}
                onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                placeholder="Transaction reference"
              />
            </div>

            <div>
              <Label htmlFor="paymentNotes">Notes</Label>
              <Input
                id="paymentNotes"
                value={newPayment.notes}
                onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                placeholder="Payment notes"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPayment}>Record Payment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by customer/supplier name or invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Tabs for Credit and Debit */}
      <Tabs defaultValue="credits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="credits">Credit Entries (Receivables)</TabsTrigger>
          <TabsTrigger value="debits">Debit Entries (Payables)</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Credit Entries (Money to Receive)
              </CardTitle>
              <CardDescription>Track customer payments and receivables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCreditEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entry.customerName}</p>
                            <p className="text-sm text-muted-foreground">{entry.customerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.invoiceNumber}</Badge>
                        </TableCell>
                        <TableCell>₹{entry.amount.toLocaleString()}</TableCell>
                        <TableCell>₹{entry.paidAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={entry.remainingAmount > 0 ? "text-orange-600" : "text-green-600"}>
                            ₹{entry.remainingAmount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className={isOverdue(entry.dueDate) && entry.status !== "paid" ? "text-red-600" : ""}>
                            {entry.dueDate}
                            {isOverdue(entry.dueDate) && entry.status !== "paid" && (
                              <AlertCircle className="inline h-4 w-4 ml-1" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(entry.status) as any}>
                            {isOverdue(entry.dueDate) && entry.status !== "paid" ? "overdue" : entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {entry.status !== "paid" && (
                              <Button size="sm" variant="outline" onClick={() => openPaymentDialog(entry, "credit")}>
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
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

        <TabsContent value="debits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Debit Entries (Money to Pay)
              </CardTitle>
              <CardDescription>Track supplier payments and payables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDebitEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entry.supplierName}</p>
                            <p className="text-sm text-muted-foreground">{entry.supplierPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.invoiceNumber}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{entry.category}</Badge>
                        </TableCell>
                        <TableCell>₹{entry.amount.toLocaleString()}</TableCell>
                        <TableCell>₹{entry.paidAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={entry.remainingAmount > 0 ? "text-red-600" : "text-green-600"}>
                            ₹{entry.remainingAmount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className={isOverdue(entry.dueDate) && entry.status !== "paid" ? "text-red-600" : ""}>
                            {entry.dueDate}
                            {isOverdue(entry.dueDate) && entry.status !== "paid" && (
                              <AlertCircle className="inline h-4 w-4 ml-1" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(entry.status) as any}>
                            {isOverdue(entry.dueDate) && entry.status !== "paid" ? "overdue" : entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {entry.status !== "paid" && (
                              <Button size="sm" variant="outline" onClick={() => openPaymentDialog(entry, "debit")}>
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
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

        <TabsContent value="summary">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{creditEntries.reduce((sum, entry) => sum + entry.remainingAmount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Money to receive</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Payables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹{debitEntries.reduce((sum, entry) => sum + entry.remainingAmount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Money to pay</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overdue Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {creditEntries.filter((entry) => isOverdue(entry.dueDate) && entry.status !== "paid").length}
                </div>
                <p className="text-xs text-muted-foreground">Overdue receivables</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overdue Debits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {debitEntries.filter((entry) => isOverdue(entry.dueDate) && entry.status !== "paid").length}
                </div>
                <p className="text-xs text-muted-foreground">Overdue payables</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest payment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...creditEntries, ...debitEntries]
                  .filter((entry) => entry.paymentHistory.length > 0)
                  .flatMap((entry) =>
                    entry.paymentHistory.map((payment) => ({
                      ...payment,
                      entryType: "customerName" in entry ? "credit" : "debit",
                      partyName: "customerName" in entry ? entry.customerName : entry.supplierName,
                    })),
                  )
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {payment.entryType === "credit" ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{payment.partyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.method} • {payment.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{payment.reference}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

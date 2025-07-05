"use client"

import { useState } from "react"
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
import { Users, Building, Phone, MessageSquare, AlertCircle, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

interface CreditEntry {
  id: string
  customerName: string
  customerPhone: string
  amount: number
  dueDate: string
  saleDate: string
  invoiceNumber: string
  status: "pending" | "partial" | "paid" | "overdue"
  paidAmount: number
  remainingAmount: number
  paymentHistory: PaymentRecord[]
  notes: string
}

interface DebitEntry {
  id: string
  supplierName: string
  supplierPhone: string
  amount: number
  dueDate: string
  purchaseDate: string
  invoiceNumber: string
  status: "pending" | "partial" | "paid" | "overdue"
  paidAmount: number
  remainingAmount: number
  paymentHistory: PaymentRecord[]
  description: string
  category: string
}

interface PaymentRecord {
  id: string
  amount: number
  date: string
  method: string
  reference: string
  notes: string
}

export function CreditDebitLedger() {
  const [creditEntries, setCreditEntries] = useState<CreditEntry[]>([
    {
      id: "1",
      customerName: "Ali Hassan",
      customerPhone: "+92-300-1234567",
      amount: 15000,
      dueDate: "2024-02-15",
      saleDate: "2024-01-15",
      invoiceNumber: "INV-2024-001",
      status: "pending",
      paidAmount: 0,
      remainingAmount: 15000,
      paymentHistory: [],
      notes: "Wedding dress order - 3 pieces",
    },
    {
      id: "2",
      customerName: "Fatima Khan",
      customerPhone: "+92-301-9876543",
      amount: 8500,
      dueDate: "2024-02-10",
      saleDate: "2024-01-20",
      invoiceNumber: "INV-2024-002",
      status: "partial",
      paidAmount: 3000,
      remainingAmount: 5500,
      paymentHistory: [
        {
          id: "1",
          amount: 3000,
          date: "2024-01-25",
          method: "Cash",
          reference: "CASH-001",
          notes: "Partial payment",
        },
      ],
      notes: "Regular customer - good payment history",
    },
    {
      id: "3",
      customerName: "Ahmed Sheikh",
      customerPhone: "+92-302-5555555",
      amount: 12000,
      dueDate: "2024-01-30",
      saleDate: "2024-01-10",
      invoiceNumber: "INV-2024-003",
      status: "overdue",
      paidAmount: 0,
      remainingAmount: 12000,
      paymentHistory: [],
      notes: "Multiple reminders sent",
    },
  ])

  const [debitEntries, setDebitEntries] = useState<DebitEntry[]>([
    {
      id: "1",
      supplierName: "Textile Mills Ltd",
      supplierPhone: "+92-42-1111111",
      amount: 45000,
      dueDate: "2024-02-20",
      purchaseDate: "2024-01-20",
      invoiceNumber: "PUR-2024-001",
      status: "pending",
      paidAmount: 0,
      remainingAmount: 45000,
      paymentHistory: [],
      description: "Cotton fabric - 100 meters",
      category: "Raw Material",
    },
    {
      id: "2",
      supplierName: "Silk Weavers Co",
      supplierPhone: "+92-42-2222222",
      amount: 25000,
      dueDate: "2024-02-15",
      purchaseDate: "2024-01-18",
      invoiceNumber: "PUR-2024-002",
      status: "partial",
      paidAmount: 10000,
      remainingAmount: 15000,
      paymentHistory: [
        {
          id: "1",
          amount: 10000,
          date: "2024-01-28",
          method: "Bank Transfer",
          reference: "TXN-123456",
          notes: "Advance payment",
        },
      ],
      description: "Premium silk fabric - 50 meters",
      category: "Raw Material",
    },
  ])

  const [isAddCreditOpen, setIsAddCreditOpen] = useState(false)
  const [isAddDebitOpen, setIsAddDebitOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<CreditEntry | DebitEntry | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")

  const totalCredit = creditEntries.reduce((sum, entry) => sum + entry.remainingAmount, 0)
  const totalDebit = debitEntries.reduce((sum, entry) => sum + entry.remainingAmount, 0)
  const overdueCredit = creditEntries.filter((entry) => entry.status === "overdue")
  const overdueDebit = debitEntries.filter((entry) => entry.status === "overdue")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "partial":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const handlePayment = () => {
    if (!selectedEntry || !paymentAmount) return

    const amount = Number.parseFloat(paymentAmount)
    const newPayment: PaymentRecord = {
      id: Date.now().toString(),
      amount,
      date: new Date().toISOString().split("T")[0],
      method: paymentMethod,
      reference: paymentReference,
      notes: paymentNotes,
    }

    if ("customerName" in selectedEntry) {
      // Credit entry
      setCreditEntries(
        creditEntries.map((entry) =>
          entry.id === selectedEntry.id
            ? {
                ...entry,
                paidAmount: entry.paidAmount + amount,
                remainingAmount: entry.remainingAmount - amount,
                status:
                  entry.remainingAmount - amount <= 0
                    ? "paid"
                    : entry.remainingAmount - amount < entry.amount
                      ? "partial"
                      : entry.status,
                paymentHistory: [newPayment, ...entry.paymentHistory],
              }
            : entry,
        ),
      )
    } else {
      // Debit entry
      setDebitEntries(
        debitEntries.map((entry) =>
          entry.id === selectedEntry.id
            ? {
                ...entry,
                paidAmount: entry.paidAmount + amount,
                remainingAmount: entry.remainingAmount - amount,
                status:
                  entry.remainingAmount - amount <= 0
                    ? "paid"
                    : entry.remainingAmount - amount < entry.amount
                      ? "partial"
                      : entry.status,
                paymentHistory: [newPayment, ...entry.paymentHistory],
              }
            : entry,
        ),
      )
    }

    // Reset form
    setSelectedEntry(null)
    setPaymentAmount("")
    setPaymentMethod("")
    setPaymentReference("")
    setPaymentNotes("")
    setIsPaymentDialogOpen(false)
  }

  const sendReminder = (entry: CreditEntry) => {
    // In a real app, this would send WhatsApp/SMS
    alert(`Reminder sent to ${entry.customerName} (${entry.customerPhone})`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Credit & Debit Ledger</h2>
        <div className="flex gap-2">
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>Record a payment received or made</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Entry</Label>
                  <Select
                    value={selectedEntry?.id || ""}
                    onValueChange={(value) => {
                      const creditEntry = creditEntries.find((e) => e.id === value)
                      const debitEntry = debitEntries.find((e) => e.id === value)
                      setSelectedEntry(creditEntry || debitEntry || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an entry" />
                    </SelectTrigger>
                    <SelectContent>
                      <optgroup label="Credit (Receivables)">
                        {creditEntries
                          .filter((e) => e.remainingAmount > 0)
                          .map((entry) => (
                            <SelectItem key={entry.id} value={entry.id}>
                              {entry.customerName} - Rs{entry.remainingAmount.toLocaleString()}
                            </SelectItem>
                          ))}
                      </optgroup>
                      <optgroup label="Debit (Payables)">
                        {debitEntries
                          .filter((e) => e.remainingAmount > 0)
                          .map((entry) => (
                            <SelectItem key={entry.id} value={entry.id}>
                              {entry.supplierName} - Rs{entry.remainingAmount.toLocaleString()}
                            </SelectItem>
                          ))}
                      </optgroup>
                    </SelectContent>
                  </Select>
                </div>

                {selectedEntry && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>
                        {"customerName" in selectedEntry ? selectedEntry.customerName : selectedEntry.supplierName}
                      </strong>
                    </p>
                    <p className="text-sm">Outstanding: Rs{selectedEntry.remainingAmount.toLocaleString()}</p>
                  </div>
                )}

                <div>
                  <Label>Payment Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="mobile-payment">Mobile Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Reference Number</Label>
                  <Input
                    placeholder="Transaction reference"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Input
                    placeholder="Additional notes"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePayment} disabled={!selectedEntry || !paymentAmount || !paymentMethod}>
                    Record Payment
                  </Button>
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
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Receivables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs{totalCredit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{creditEntries.length} customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Payables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Rs{totalDebit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{debitEntries.length} suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalCredit - totalDebit >= 0 ? "text-green-600" : "text-red-600"}`}>
              Rs{Math.abs(totalCredit - totalDebit).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCredit - totalDebit >= 0 ? "Net Receivable" : "Net Payable"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overdueCredit.length + overdueDebit.length}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="credit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="credit">Credit (Receivables)</TabsTrigger>
          <TabsTrigger value="debit">Debit (Payables)</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Items</TabsTrigger>
        </TabsList>

        <TabsContent value="credit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Receivables
              </CardTitle>
              <CardDescription>Money owed by customers for credit sales</CardDescription>
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
                    {creditEntries.map((entry) => {
                      const daysOverdue = getDaysOverdue(entry.dueDate)

                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{entry.customerName}</p>
                              <p className="text-sm text-muted-foreground">{entry.customerPhone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{entry.invoiceNumber}</p>
                              <p className="text-xs text-muted-foreground">Sale: {entry.saleDate}</p>
                            </div>
                          </TableCell>
                          <TableCell>Rs{entry.amount.toLocaleString()}</TableCell>
                          <TableCell>Rs{entry.paidAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="font-medium">Rs{entry.remainingAmount.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{entry.dueDate}</p>
                              {daysOverdue > 0 && <p className="text-xs text-red-600">{daysOverdue} days overdue</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(entry.status) as any}>{entry.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedEntry(entry)
                                  setIsPaymentDialogOpen(true)
                                }}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => sendReminder(entry)}>
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Phone className="h-4 w-4" />
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

        <TabsContent value="debit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Supplier Payables
              </CardTitle>
              <CardDescription>Money owed to suppliers for purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debitEntries.map((entry) => {
                      const daysOverdue = getDaysOverdue(entry.dueDate)

                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{entry.supplierName}</p>
                              <p className="text-sm text-muted-foreground">{entry.supplierPhone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{entry.invoiceNumber}</p>
                              <p className="text-xs text-muted-foreground">Purchase: {entry.purchaseDate}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{entry.description}</p>
                              <Badge variant="outline" className="text-xs">
                                {entry.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>Rs{entry.amount.toLocaleString()}</TableCell>
                          <TableCell>Rs{entry.paidAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="font-medium">Rs{entry.remainingAmount.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{entry.dueDate}</p>
                              {daysOverdue > 0 && <p className="text-xs text-red-600">{daysOverdue} days overdue</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(entry.status) as any}>{entry.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedEntry(entry)
                                  setIsPaymentDialogOpen(true)
                                }}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Phone className="h-4 w-4" />
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

        <TabsContent value="overdue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Overdue Receivables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueCredit.map((entry) => {
                    const daysOverdue = getDaysOverdue(entry.dueDate)
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{entry.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            Rs{entry.remainingAmount.toLocaleString()} • {daysOverdue} days overdue
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => sendReminder(entry)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                  {overdueCredit.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No overdue receivables</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Overdue Payables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueDebit.map((entry) => {
                    const daysOverdue = getDaysOverdue(entry.dueDate)
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{entry.supplierName}</p>
                          <p className="text-sm text-muted-foreground">
                            Rs{entry.remainingAmount.toLocaleString()} • {daysOverdue} days overdue
                          </p>
                        </div>
                        <Button size="sm" variant="destructive">
                          Pay Now
                        </Button>
                      </div>
                    )
                  })}
                  {overdueDebit.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No overdue payables</p>
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

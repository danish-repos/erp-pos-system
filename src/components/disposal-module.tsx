"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Search,
  AlertTriangle,
  Package,
  DollarSign,
} from "lucide-react";
import { DisposalService, type DisposalRecord } from "@/lib/firebase-services";
import { useToast } from "@/hooks/use-toast";

type ConditionType = "damaged" | "expired" | "defective" | "unsold" | "stolen";
type DisposalMethodType =
  | "discard"
  | "donate"
  | "sell-discount"
  | "return-supplier"
  | "recycle";

const CONDITION_OPTIONS: { value: ConditionType; label: string }[] = [
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "defective", label: "Defective" },
  { value: "unsold", label: "Unsold" },
  { value: "stolen", label: "Stolen" },
];

const METHOD_OPTIONS: { value: DisposalMethodType; label: string }[] = [
  { value: "discard", label: "Discard" },
  { value: "donate", label: "Donate" },
  { value: "sell-discount", label: "Sell at Discount" },
  { value: "return-supplier", label: "Return to Supplier" },
  { value: "recycle", label: "Recycle" },
];

const CATEGORY_OPTIONS = [
  { value: "shirts", label: "Shirts" },
  { value: "pants", label: "Pants" },
  { value: "dresses", label: "Dresses" },
  { value: "accessories", label: "Accessories" },
  { value: "footwear", label: "Footwear" },
  { value: "outerwear", label: "Outerwear" },
];

function toConditionType(value: string): ConditionType {
  if (
    value === "damaged" ||
    value === "expired" ||
    value === "defective" ||
    value === "unsold" ||
    value === "stolen"
  ) {
    return value;
  }
  return "damaged";
}

function toDisposalMethodType(value: string): DisposalMethodType {
  if (
    value === "discard" ||
    value === "donate" ||
    value === "sell-discount" ||
    value === "return-supplier" ||
    value === "recycle"
  ) {
    return value;
  }
  return "discard";
}

function getConditionColor(
  condition: string
): "destructive" | "default" | "secondary" | "outline" {
  switch (condition) {
    case "damaged":
    case "stolen":
      return "destructive";
    case "expired":
      return "secondary";
    case "defective":
      return "outline";
    case "unsold":
      return "default";
    default:
      return "outline";
  }
}

function getMethodColor(
  method: string
): "destructive" | "default" | "secondary" | "outline" {
  switch (method) {
    case "discard":
      return "destructive";
    case "donate":
    case "recycle":
      return "default";
    case "sell-discount":
      return "secondary";
    case "return-supplier":
      return "outline";
    default:
      return "outline";
  }
}

export function DisposalModule() {
  const [disposalRecords, setDisposalRecords] = useState<DisposalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
  });

  useEffect(() => {
    const unsubscribe = DisposalService.subscribeToDisposalRecords((records) => {
      setDisposalRecords(records || []);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const filteredRecords = disposalRecords.filter((record) => {
    const term = searchTerm.toLowerCase();
    return (
      (record.itemName && record.itemName.toLowerCase().includes(term)) ||
      (record.itemCode && record.itemCode.toLowerCase().includes(term)) ||
      (record.reason && record.reason.toLowerCase().includes(term))
    );
  });

  const totalLoss = disposalRecords.reduce(
    (sum, record) => sum + (typeof record.lossAmount === "number" ? record.lossAmount : 0),
    0
  );
  const totalRecovered = disposalRecords.reduce(
    (sum, record) => sum + (typeof record.disposalValue === "number" ? record.disposalValue : 0),
    0
  );
  const totalItems = disposalRecords.reduce(
    (sum, record) => sum + (typeof record.quantity === "number" ? record.quantity : 0),
    0
  );
  const totalOriginalValue = disposalRecords.reduce(
    (sum, record) =>
      sum +
      (typeof record.originalPrice === "number" && typeof record.quantity === "number"
        ? record.originalPrice * record.quantity
        : 0),
    0
  );

  const conditionStats: Record<
    string,
    { count: number; loss: number }
  > = disposalRecords.reduce((acc, record) => {
    if (!record.condition) return acc;
    if (!acc[record.condition]) {
      acc[record.condition] = { count: 0, loss: 0 };
    }
    acc[record.condition].count += typeof record.quantity === "number" ? record.quantity : 0;
    acc[record.condition].loss += typeof record.lossAmount === "number" ? record.lossAmount : 0;
    return acc;
  }, {} as Record<string, { count: number; loss: number }>);

  const methodStats: Record<
    string,
    { count: number; recovered: number }
  > = disposalRecords.reduce((acc, record) => {
    if (!record.disposalMethod) return acc;
    if (!acc[record.disposalMethod]) {
      acc[record.disposalMethod] = { count: 0, recovered: 0 };
    }
    acc[record.disposalMethod].count += typeof record.quantity === "number" ? record.quantity : 0;
    acc[record.disposalMethod].recovered +=
      typeof record.disposalValue === "number" ? record.disposalValue : 0;
    return acc;
  }, {} as Record<string, { count: number; recovered: number }>);

  const handleAddDisposal = async () => {
    try {
      const originalPrice = Number(newDisposal.originalPrice);
      const disposalValue = Number(newDisposal.disposalValue);
      const quantity = Number(newDisposal.quantity);
      const lossAmount = originalPrice * quantity - disposalValue;

      const disposal: Omit<DisposalRecord, "id"> = {
        itemName: newDisposal.itemName,
        itemCode: newDisposal.itemCode,
        category: newDisposal.category,
        originalPrice,
        disposalValue,
        lossAmount,
        quantity,
        disposalDate: new Date().toISOString().split("T")[0],
        reason: newDisposal.reason,
        condition: toConditionType(newDisposal.condition),
        disposalMethod: toDisposalMethodType(newDisposal.disposalMethod),
        approvedBy: "Current User", // Replace with actual user
        notes: newDisposal.notes,
        batchNumber: newDisposal.batchNumber,
        supplierName: newDisposal.supplierName,
      };

      await DisposalService.createDisposalRecord(disposal);

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
      });
      setIsDialogOpen(false);

      toast({
        title: "Disposal Record Added",
        description: "Disposal record has been successfully created",
      });
    } catch (err) {
      console.error("Error adding disposal record:", err);
      toast({
        title: "Error",
        description: "Failed to add disposal record. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading disposal records...</p>
        </div>
      </div>
    );
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
              <DialogDescription>
                Record items that need to be disposed of
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newDisposal.itemName}
                    onChange={(e) =>
                      setNewDisposal({ ...newDisposal, itemName: e.target.value })
                    }
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <Label htmlFor="itemCode">Item Code</Label>
                  <Input
                    id="itemCode"
                    value={newDisposal.itemCode}
                    onChange={(e) =>
                      setNewDisposal({ ...newDisposal, itemCode: e.target.value })
                    }
                    placeholder="SKU-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newDisposal.category}
                    onValueChange={(value) =>
                      setNewDisposal({ ...newDisposal, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newDisposal.quantity}
                    onChange={(e) =>
                      setNewDisposal({ ...newDisposal, quantity: e.target.value })
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Original Price (Rs)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={newDisposal.originalPrice}
                    onChange={(e) =>
                      setNewDisposal({
                        ...newDisposal,
                        originalPrice: e.target.value,
                      })
                    }
                    placeholder="1500"
                  />
                </div>
                <div>
                  <Label htmlFor="disposalValue">Recovery Value (Rs)</Label>
                  <Input
                    id="disposalValue"
                    type="number"
                    value={newDisposal.disposalValue}
                    onChange={(e) =>
                      setNewDisposal({
                        ...newDisposal,
                        disposalValue: e.target.value,
                      })
                    }
                    placeholder="200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={newDisposal.condition}
                    onValueChange={(value) =>
                      setNewDisposal({ ...newDisposal, condition: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="disposalMethod">Disposal Method</Label>
                  <Select
                    value={newDisposal.disposalMethod}
                    onValueChange={(value) =>
                      setNewDisposal({ ...newDisposal, disposalMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {METHOD_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
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
                    onChange={(e) =>
                      setNewDisposal({
                        ...newDisposal,
                        batchNumber: e.target.value,
                      })
                    }
                    placeholder="BATCH-001"
                  />
                </div>
                <div>
                  <Label htmlFor="supplierName">Supplier Name</Label>
                  <Input
                    id="supplierName"
                    value={newDisposal.supplierName}
                    onChange={(e) =>
                      setNewDisposal({
                        ...newDisposal,
                        supplierName: e.target.value,
                      })
                    }
                    placeholder="Supplier name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Disposal</Label>
                <Input
                  id="reason"
                  value={newDisposal.reason}
                  onChange={(e) =>
                    setNewDisposal({ ...newDisposal, reason: e.target.value })
                  }
                  placeholder="Reason for disposal"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newDisposal.notes}
                  onChange={(e) =>
                    setNewDisposal({ ...newDisposal, notes: e.target.value })
                  }
                  placeholder="Additional notes about the disposal"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddDisposal} type="button">
                  Add Disposal Record
                </Button>
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
            <div className="text-2xl font-bold text-red-600">
              Rs{totalLoss.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Financial impact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Recovered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rs{totalRecovered.toLocaleString()}
            </div>
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
              {totalOriginalValue > 0
                ? ((totalRecovered / totalOriginalValue) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Value recovery percentage
            </p>
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
                            <p className="text-sm text-muted-foreground">
                              {record.itemCode}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.category}</Badge>
                        </TableCell>
                        <TableCell>{record.quantity}</TableCell>
                        <TableCell>
                          Rs
                          {typeof record.originalPrice === "number" &&
                          typeof record.quantity === "number"
                            ? (record.originalPrice * record.quantity).toLocaleString()
                            : "0"}
                        </TableCell>
                        <TableCell className="text-green-600">
                          Rs
                          {typeof record.disposalValue === "number"
                            ? record.disposalValue.toLocaleString()
                            : "0"}
                        </TableCell>
                        <TableCell className="text-red-600">
                          Rs
                          {typeof record.lossAmount === "number"
                            ? record.lossAmount.toLocaleString()
                            : "0"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getConditionColor(record.condition)}
                          >
                            {record.condition}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getMethodColor(record.disposalMethod)}
                          >
                            {typeof record.disposalMethod === "string"
                              ? record.disposalMethod.replace("-", " ")
                              : ""}
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
                <CardDescription>
                  Breakdown of items by condition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(conditionStats).map(([condition, stats]) => (
                    <div
                      key={condition}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={getConditionColor(condition)}>
                          {condition}
                        </Badge>
                        <div>
                          <p className="font-medium">{stats.count} items</p>
                          <p className="text-sm text-muted-foreground">
                            Loss: Rs{stats.loss.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {totalItems > 0
                            ? ((stats.count / totalItems) * 100).toFixed(1)
                            : "0.0"}
                          %
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
                <CardDescription>
                  Value recovered by disposal method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(methodStats).map(([method, stats]) => (
                    <div
                      key={method}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={getMethodColor(method)}>
                          {method.replace("-", " ")}
                        </Badge>
                        <div>
                          <p className="font-medium">{stats.count} items</p>
                          <p className="text-sm text-muted-foreground">
                            Recovered: Rs{stats.recovered.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {totalRecovered > 0
                            ? ((stats.recovered / totalRecovered) * 100).toFixed(1)
                            : "0.0"}
                          %
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
  );
}

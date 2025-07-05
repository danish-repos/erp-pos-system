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
import { Plus, Edit, Trash2, Search, Package, Upload, History, TrendingUp, TrendingDown } from "lucide-react"

interface Product {
  id: string
  name: string
  code: string
  fabricType: string
  size: string
  color: string
  purchaseCost: number
  minSalePrice: number
  maxSalePrice: number
  currentPrice: number
  stock: number
  supplier: string
  batchInfo: string
  status: "active" | "inactive" | "discontinued"
  createdDate: string
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Cotton Kurta",
      code: "CK001",
      fabricType: "Cotton",
      size: "L",
      color: "Blue",
      purchaseCost: 600,
      minSalePrice: 900,
      maxSalePrice: 1500,
      currentPrice: 1200,
      stock: 15,
      supplier: "Textile Mills Ltd",
      batchInfo: "Batch-2024-001",
      status: "active",
      createdDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Silk Dupatta",
      code: "SD002",
      fabricType: "Silk",
      size: "Standard",
      color: "Red",
      purchaseCost: 400,
      minSalePrice: 650,
      maxSalePrice: 1000,
      currentPrice: 800,
      stock: 8,
      supplier: "Silk Weavers Co",
      batchInfo: "Batch-2024-002",
      status: "active",
      createdDate: "2024-01-20",
    },
    {
      id: "3",
      name: "Linen Shirt",
      code: "LS003",
      fabricType: "Linen",
      size: "M",
      color: "White",
      purchaseCost: 800,
      minSalePrice: 1200,
      maxSalePrice: 2000,
      currentPrice: 1500,
      stock: 12,
      supplier: "Premium Fabrics",
      batchInfo: "Batch-2024-003",
      status: "active",
      createdDate: "2024-02-01",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState({
    name: "",
    code: "",
    fabricType: "",
    size: "",
    color: "",
    purchaseCost: "",
    minSalePrice: "",
    maxSalePrice: "",
    currentPrice: "",
    stock: "",
    supplier: "",
    batchInfo: "",
  })

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.fabricType.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduct = () => {
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      code: newProduct.code,
      fabricType: newProduct.fabricType,
      size: newProduct.size,
      color: newProduct.color,
      purchaseCost: Number(newProduct.purchaseCost),
      minSalePrice: Number(newProduct.minSalePrice),
      maxSalePrice: Number(newProduct.maxSalePrice),
      currentPrice: Number(newProduct.currentPrice),
      stock: Number(newProduct.stock),
      supplier: newProduct.supplier,
      batchInfo: newProduct.batchInfo,
      status: "active",
      createdDate: new Date().toISOString().split("T")[0],
    }

    setProducts([...products, product])
    setNewProduct({
      name: "",
      code: "",
      fabricType: "",
      size: "",
      color: "",
      purchaseCost: "",
      minSalePrice: "",
      maxSalePrice: "",
      currentPrice: "",
      stock: "",
      supplier: "",
      batchInfo: "",
    })
    setIsAddDialogOpen(false)
  }

  const getMarginPercentage = (product: Product) => {
    return Math.round(((product.currentPrice - product.purchaseCost) / product.purchaseCost) * 100)
  }

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return { status: "critical", color: "destructive" }
    if (stock <= 10) return { status: "low", color: "secondary" }
    return { status: "good", color: "default" }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Product & Price Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Enter product details including pricing and inventory information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g., Cotton Kurta"
                  />
                </div>
                <div>
                  <Label htmlFor="code">Product Code</Label>
                  <Input
                    id="code"
                    value={newProduct.code}
                    onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                    placeholder="e.g., CK001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fabricType">Fabric Type</Label>
                  <Select
                    value={newProduct.fabricType}
                    onValueChange={(value) => setNewProduct({ ...newProduct, fabricType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fabric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cotton">Cotton</SelectItem>
                      <SelectItem value="silk">Silk</SelectItem>
                      <SelectItem value="linen">Linen</SelectItem>
                      <SelectItem value="polyester">Polyester</SelectItem>
                      <SelectItem value="wool">Wool</SelectItem>
                      <SelectItem value="chiffon">Chiffon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Select
                    value={newProduct.size}
                    onValueChange={(value) => setNewProduct({ ...newProduct, size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={newProduct.color}
                    onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                    placeholder="e.g., Blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchaseCost">Purchase Cost (Rs)</Label>
                  <Input
                    id="purchaseCost"
                    type="number"
                    value={newProduct.purchaseCost}
                    onChange={(e) => setNewProduct({ ...newProduct, purchaseCost: e.target.value })}
                    placeholder="600"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minSalePrice">Min Sale Price (Rs)</Label>
                  <Input
                    id="minSalePrice"
                    type="number"
                    value={newProduct.minSalePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, minSalePrice: e.target.value })}
                    placeholder="900"
                  />
                </div>
                <div>
                  <Label htmlFor="maxSalePrice">Max Sale Price (Rs)</Label>
                  <Input
                    id="maxSalePrice"
                    type="number"
                    value={newProduct.maxSalePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, maxSalePrice: e.target.value })}
                    placeholder="1500"
                  />
                </div>
                <div>
                  <Label htmlFor="currentPrice">Current Price (Rs)</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    value={newProduct.currentPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, currentPrice: e.target.value })}
                    placeholder="1200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={newProduct.supplier}
                    onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                    placeholder="Textile Mills Ltd"
                  />
                </div>
                <div>
                  <Label htmlFor="batchInfo">Batch Info</Label>
                  <Input
                    id="batchInfo"
                    value={newProduct.batchInfo}
                    onChange={(e) => setNewProduct({ ...newProduct, batchInfo: e.target.value })}
                    placeholder="Batch-2024-001"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct}>Add Product</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, code, or fabric type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Products
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products Inventory
          </CardTitle>
          <CardDescription>Manage your product catalog with pricing and stock information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Fabric/Size/Color</TableHead>
                  <TableHead>Purchase Cost</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  const margin = getMarginPercentage(product)

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">Added: {product.createdDate}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{product.fabricType}</p>
                          <p className="text-muted-foreground">
                            {product.size} • {product.color}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>Rs{product.purchaseCost.toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">Rs{product.currentPrice.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            Range: Rs{product.minSalePrice} - Rs{product.maxSalePrice}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {margin > 50 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                          )}
                          <span className={margin > 50 ? "text-green-600" : "text-orange-600"}>{margin}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.color as any}>{product.stock} units</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{product.supplier}</p>
                          <p className="text-muted-foreground">{product.batchInfo}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <History className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{products.filter((p) => p.stock <= 10).length}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(products.reduce((sum, p) => sum + getMarginPercentage(p), 0) / products.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Profit margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs{products.reduce((sum, p) => sum + p.currentPrice * p.stock, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">At current prices</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

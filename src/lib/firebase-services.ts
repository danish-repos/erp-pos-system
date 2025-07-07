import { ref, push, set, get, update, remove, onValue, off } from "firebase/database"
import { database } from "./firebase"

// Type definitions
export interface Product {
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
  minStock: number // Add this line
  supplier: string
  batchInfo: string
  status: "active" | "inactive" | "discontinued"
  createdDate: string
  createdAt?: string
  updatedAt?: string
}

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  joinDate: string
  salary: number
  commission: number
  status: "active" | "inactive" | "on-leave"
  avatar?: string
  address: string
  emergencyContact: string
  bankAccount: string
  cnic: string
  monthlySales: number
  monthlyTarget: number
  attendanceRate: number
  performanceScore: number
  totalSales: number
  totalCommission: number
  createdAt?: string
  updatedAt?: string
}

export interface SaleRecord {
  id: string
  invoiceNumber: string
  date: string
  time: string
  customerName: string
  customerPhone: string
  customerType: "walk-in" | "regular" | "vip"
  items: SaleItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: "cash" | "card" | "mobile" | "credit"
  paymentStatus: "paid" | "partial" | "pending"
  deliveryStatus: "pickup" | "delivered" | "pending" | "cancelled"
  deliveryAddress?: string
  deliveryDate?: string
  staffMember: string
  notes: string
  returnStatus: "none" | "partial" | "full"
  createdAt?: string
  updatedAt?: string
}

export interface SaleItem {
  id: string
  name: string
  code: string
  quantity: number
  originalPrice: number
  finalPrice: number
  discount: number
}

export interface InventoryItem {
  id: string
  name: string
  code: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  reservedStock: number
  availableStock: number
  status: "available" | "reserved" | "damaged" | "out-of-stock"
  location: string
  lastUpdated: string
  supplier: string
  purchasePrice: number
  salePrice: number
  expiryDate?: string
  batchNumber: string
  createdAt?: string
  updatedAt?: string
}

export interface StockMovement {
  id: string
  itemId: string
  itemName: string
  type: "in" | "out" | "adjustment" | "damaged" | "returned"
  quantity: number
  reason: string
  staff: string
  date: string
  reference: string
  createdAt?: string
  updatedAt?: string
}

export interface CreditEntry {
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
  createdAt?: string
  updatedAt?: string
}

export interface DebitEntry {
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
  createdAt?: string
  updatedAt?: string
}

export interface PaymentRecord {
  id: string
  amount: number
  date: string
  method: string
  reference: string
  notes: string
}

export interface BargainRecord {
  id: string
  date: string
  time: string
  productName: string
  productCode: string
  originalPrice: number
  finalPrice: number
  discountAmount: number
  discountPercentage: number
  customerName?: string
  customerPhone?: string
  staffMember: string
  reason: string
  invoiceNumber: string
  category: string
  profitMargin: number
  status: "approved" | "rejected" | "pending"
  createdAt?: string
  updatedAt?: string
}

export interface DisposalRecord {
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
  createdAt?: string
  updatedAt?: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  hoursWorked: number
  status: "present" | "absent" | "late" | "half-day"
  notes: string
  createdAt?: string
  updatedAt?: string
}

export interface SalaryRecord {
  id: string
  employeeId: string
  employeeName: string
  month: string
  basicSalary: number
  commission: number
  bonus: number
  deductions: number
  totalSalary: number
  status: "paid" | "pending" | "processing"
  paidDate?: string
  createdAt?: string
  updatedAt?: string
}

// Generic Firebase CRUD operations
export class FirebaseService {
  // Create
  static async create(path: string, data: any): Promise<string | null> {
    try {
      const newRef = push(ref(database, path))
      await set(newRef, { ...data, id: newRef.key, createdAt: new Date().toISOString() })
      return newRef.key
    } catch (error) {
      console.error(`Error creating ${path}:`, error)
      throw error
    }
  }

  // Read all with proper typing
  static async getAll<T>(path: string): Promise<T[]> {
    try {
      const snapshot = await get(ref(database, path))
      if (snapshot.exists()) {
        const data = snapshot.val()
        return Object.values(data) as T[]
      }
      return []
    } catch (error) {
      console.error(`Error getting ${path}:`, error)
      throw error
    }
  }

  // Read by ID
  static async getById<T>(path: string, id: string): Promise<T | null> {
    try {
      const snapshot = await get(ref(database, `${path}/${id}`))
      return snapshot.exists() ? (snapshot.val() as T) : null
    } catch (error) {
      console.error(`Error getting ${path}/${id}:`, error)
      throw error
    }
  }

  // Update
  static async update(path: string, id: string, data: any): Promise<void> {
    try {
      await update(ref(database, `${path}/${id}`), { ...data, updatedAt: new Date().toISOString() })
    } catch (error) {
      console.error(`Error updating ${path}/${id}:`, error)
      throw error
    }
  }

  // Delete
  static async delete(path: string, id: string): Promise<void> {
    try {
      await remove(ref(database, `${path}/${id}`))
    } catch (error) {
      console.error(`Error deleting ${path}/${id}:`, error)
      throw error
    }
  }

  // Real-time listener with proper typing
  static subscribe<T>(path: string, callback: (data: T[]) => void): () => void {
    const dbRef = ref(database, path)
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        callback(Object.values(data) as T[])
      } else {
        callback([])
      }
    })
    return () => off(dbRef)
  }
}

// Product Services
export class ProductService extends FirebaseService {
  static async createProduct(product: Omit<Product, "id">): Promise<string | null> {
    return this.create("products", product)
  }

  static async getAllProducts(): Promise<Product[]> {
    return this.getAll<Product>("products")
  }

  static async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    return this.update("products", id, product)
  }

  static async deleteProduct(id: string): Promise<void> {
    return this.delete("products", id)
  }

  static subscribeToProducts(callback: (products: Product[]) => void): () => void {
    return this.subscribe<Product>("products", callback)
  }
}

// Employee Services
export class EmployeeService extends FirebaseService {
  static async createEmployee(employee: Omit<Employee, "id">): Promise<string | null> {
    return this.create("employees", employee)
  }

  static async getAllEmployees(): Promise<Employee[]> {
    return this.getAll<Employee>("employees")
  }

  static async updateEmployee(id: string, employee: Partial<Employee>): Promise<void> {
    return this.update("employees", id, employee)
  }

  static async deleteEmployee(id: string): Promise<void> {
    return this.delete("employees", id)
  }

  static async createAttendanceRecord(record: Omit<AttendanceRecord, "id">): Promise<string | null> {
    return this.create("attendance", record)
  }

  static async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    return this.getAll<AttendanceRecord>("attendance")
  }

  static async createSalaryRecord(record: Omit<SalaryRecord, "id">): Promise<string | null> {
    return this.create("salaryRecords", record)
  }

  static async getAllSalaryRecords(): Promise<SalaryRecord[]> {
    return this.getAll<SalaryRecord>("salaryRecords")
  }

  static subscribeToEmployees(callback: (employees: Employee[]) => void): () => void {
    return this.subscribe<Employee>("employees", callback)
  }
}

// Sales Services
export class SalesService extends FirebaseService {
  static async createSale(sale: Omit<SaleRecord, "id">): Promise<string | null> {
    return this.create("sales", sale)
  }

  static async getAllSales(): Promise<SaleRecord[]> {
    return this.getAll<SaleRecord>("sales")
  }

  static async updateSale(id: string, sale: Partial<SaleRecord>): Promise<void> {
    return this.update("sales", id, sale)
  }

  static async deleteSale(id: string): Promise<void> {
    return this.delete("sales", id)
  }

  static subscribeToSales(callback: (sales: SaleRecord[]) => void): () => void {
    return this.subscribe<SaleRecord>("sales", callback)
  }
}

// Inventory Services
export class InventoryService extends FirebaseService {
  static async createInventoryItem(item: Omit<InventoryItem, "id">): Promise<string | null> {
    return this.create("inventory", item)
  }

  static async getAllInventoryItems(): Promise<InventoryItem[]> {
    return this.getAll<InventoryItem>("inventory")
  }

  static async updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<void> {
    return this.update("inventory", id, item)
  }

  static async deleteInventoryItem(id: string): Promise<void> {
    return this.delete("inventory", id)
  }

  static async createStockMovement(movement: Omit<StockMovement, "id">): Promise<string | null> {
    return this.create("stockMovements", movement)
  }

  static async getAllStockMovements(): Promise<StockMovement[]> {
    return this.getAll<StockMovement>("stockMovements")
  }

  static subscribeToInventory(callback: (items: InventoryItem[]) => void): () => void {
    return this.subscribe<InventoryItem>("inventory", callback)
  }

  static subscribeToStockMovements(callback: (movements: StockMovement[]) => void): () => void {
    return this.subscribe<StockMovement>("stockMovements", callback)
  }
}

// Credit/Debit Services
export class LedgerService extends FirebaseService {
  static async createCreditEntry(entry: Omit<CreditEntry, "id">): Promise<string | null> {
    return this.create("creditEntries", entry)
  }

  static async getAllCreditEntries(): Promise<CreditEntry[]> {
    return this.getAll<CreditEntry>("creditEntries")
  }

  static async updateCreditEntry(id: string, entry: Partial<CreditEntry>): Promise<void> {
    return this.update("creditEntries", id, entry)
  }

  static async createDebitEntry(entry: Omit<DebitEntry, "id">): Promise<string | null> {
    return this.create("debitEntries", entry)
  }

  static async getAllDebitEntries(): Promise<DebitEntry[]> {
    return this.getAll<DebitEntry>("debitEntries")
  }

  static async updateDebitEntry(id: string, entry: Partial<DebitEntry>): Promise<void> {
    return this.update("debitEntries", id, entry)
  }

  static subscribeToCreditEntries(callback: (entries: CreditEntry[]) => void): () => void {
    return this.subscribe<CreditEntry>("creditEntries", callback)
  }

  static subscribeToDebitEntries(callback: (entries: DebitEntry[]) => void): () => void {
    return this.subscribe<DebitEntry>("debitEntries", callback)
  }
}

// Bargaining Services
export class BargainingService extends FirebaseService {
  static async createBargainRecord(record: Omit<BargainRecord, "id">): Promise<string | null> {
    return this.create("bargainRecords", record)
  }

  static async getAllBargainRecords(): Promise<BargainRecord[]> {
    return this.getAll<BargainRecord>("bargainRecords")
  }

  static async updateBargainRecord(id: string, record: Partial<BargainRecord>): Promise<void> {
    return this.update("bargainRecords", id, record)
  }

  static subscribeToBargainRecords(callback: (records: BargainRecord[]) => void): () => void {
    return this.subscribe<BargainRecord>("bargainRecords", callback)
  }
}

// Disposal Services
export class DisposalService extends FirebaseService {
  static async createDisposalRecord(record: Omit<DisposalRecord, "id">): Promise<string | null> {
    return this.create("disposalRecords", record)
  }

  static async getAllDisposalRecords(): Promise<DisposalRecord[]> {
    return this.getAll<DisposalRecord>("disposalRecords")
  }

  static async updateDisposalRecord(id: string, record: Partial<DisposalRecord>): Promise<void> {
    return this.update("disposalRecords", id, record)
  }

  static subscribeToDisposalRecords(callback: (records: DisposalRecord[]) => void): () => void {
    return this.subscribe<DisposalRecord>("disposalRecords", callback)
  }
}

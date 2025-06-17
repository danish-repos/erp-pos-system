"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Plus, Edit, Trash2, Phone, Mail, DollarSign, Target, Clock, Award } from "lucide-react"

interface Employee {
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
}

interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  hoursWorked: number
  status: "present" | "absent" | "late" | "half-day"
  notes: string
}

interface SalaryRecord {
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
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "Ahmed Ali",
      email: "ahmed.ali@powerproject.com",
      phone: "+92-300-1234567",
      position: "Sales Manager",
      department: "Sales",
      joinDate: "2023-01-15",
      salary: 45000,
      commission: 2.5,
      status: "active",
      address: "123 Main Street, Lahore",
      emergencyContact: "+92-301-7654321",
      bankAccount: "1234567890",
      cnic: "12345-6789012-3",
      monthlySales: 125000,
      monthlyTarget: 150000,
      attendanceRate: 95,
      performanceScore: 88,
      totalSales: 1250000,
      totalCommission: 31250,
    },
    {
      id: "2",
      name: "Fatima Khan",
      email: "fatima.khan@powerproject.com",
      phone: "+92-301-9876543",
      position: "Sales Associate",
      department: "Sales",
      joinDate: "2023-03-20",
      salary: 35000,
      commission: 2.0,
      status: "active",
      address: "456 Garden Town, Lahore",
      emergencyContact: "+92-302-1234567",
      bankAccount: "0987654321",
      cnic: "54321-0987654-3",
      monthlySales: 98000,
      monthlyTarget: 100000,
      attendanceRate: 92,
      performanceScore: 85,
      totalSales: 980000,
      totalCommission: 19600,
    },
    {
      id: "3",
      name: "Hassan Sheikh",
      email: "hassan.sheikh@powerproject.com",
      phone: "+92-302-5555555",
      position: "Store Assistant",
      department: "Operations",
      joinDate: "2023-06-10",
      salary: 28000,
      commission: 1.5,
      status: "active",
      address: "789 Model Town, Lahore",
      emergencyContact: "+92-303-9876543",
      bankAccount: "1122334455",
      cnic: "11111-2222233-4",
      monthlySales: 65000,
      monthlyTarget: 80000,
      attendanceRate: 88,
      performanceScore: 78,
      totalSales: 650000,
      totalCommission: 9750,
    },
    {
      id: "4",
      name: "Sara Ahmed",
      email: "sara.ahmed@powerproject.com",
      phone: "+92-304-1111111",
      position: "Cashier",
      department: "Operations",
      joinDate: "2023-08-01",
      salary: 25000,
      commission: 1.0,
      status: "on-leave",
      address: "321 DHA Phase 5, Lahore",
      emergencyContact: "+92-305-5555555",
      bankAccount: "5566778899",
      cnic: "55555-6666677-8",
      monthlySales: 45000,
      monthlyTarget: 60000,
      attendanceRate: 85,
      performanceScore: 72,
      totalSales: 450000,
      totalCommission: 4500,
    },
  ])

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: "1",
      employeeId: "1",
      employeeName: "Ahmed Ali",
      date: "2024-01-15",
      checkIn: "09:00",
      checkOut: "18:00",
      hoursWorked: 9,
      status: "present",
      notes: "",
    },
    {
      id: "2",
      employeeId: "2",
      employeeName: "Fatima Khan",
      date: "2024-01-15",
      checkIn: "09:15",
      checkOut: "18:00",
      hoursWorked: 8.75,
      status: "late",
      notes: "Traffic delay",
    },
    {
      id: "3",
      employeeId: "3",
      employeeName: "Hassan Sheikh",
      date: "2024-01-15",
      checkIn: "09:00",
      checkOut: "13:00",
      hoursWorked: 4,
      status: "half-day",
      notes: "Medical appointment",
    },
  ])

  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([
    {
      id: "1",
      employeeId: "1",
      employeeName: "Ahmed Ali",
      month: "January 2024",
      basicSalary: 45000,
      commission: 3125,
      bonus: 5000,
      deductions: 2000,
      totalSalary: 51125,
      status: "paid",
      paidDate: "2024-01-31",
    },
    {
      id: "2",
      employeeId: "2",
      employeeName: "Fatima Khan",
      month: "January 2024",
      basicSalary: 35000,
      commission: 1960,
      bonus: 2000,
      deductions: 1500,
      totalSalary: 37460,
      status: "paid",
      paidDate: "2024-01-31",
    },
    {
      id: "3",
      employeeId: "3",
      employeeName: "Hassan Sheikh",
      month: "January 2024",
      basicSalary: 28000,
      commission: 975,
      bonus: 1000,
      deductions: 1000,
      totalSalary: 28975,
      status: "pending",
    },
  ])

  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false)
  const [isSalaryOpen, setIsSalaryOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    salary: "",
    commission: "",
    address: "",
    emergencyContact: "",
    bankAccount: "",
    cnic: "",
  })

  const totalEmployees = employees.length
  const activeEmployees = employees.filter((emp) => emp.status === "active").length
  const totalMonthlySalary = employees.reduce((sum, emp) => sum + emp.salary, 0)
  const totalMonthlyCommission = employees.reduce((sum, emp) => sum + (emp.monthlySales * emp.commission) / 100, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "on-leave":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case "present":
        return "default"
      case "late":
        return "secondary"
      case "half-day":
        return "outline"
      case "absent":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleAddEmployee = () => {
    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      position: newEmployee.position,
      department: newEmployee.department,
      joinDate: new Date().toISOString().split("T")[0],
      salary: Number(newEmployee.salary),
      commission: Number(newEmployee.commission),
      status: "active",
      address: newEmployee.address,
      emergencyContact: newEmployee.emergencyContact,
      bankAccount: newEmployee.bankAccount,
      cnic: newEmployee.cnic,
      monthlySales: 0,
      monthlyTarget: 50000,
      attendanceRate: 100,
      performanceScore: 75,
      totalSales: 0,
      totalCommission: 0,
    }

    setEmployees([...employees, employee])
    setNewEmployee({
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      salary: "",
      commission: "",
      address: "",
      emergencyContact: "",
      bankAccount: "",
      cnic: "",
    })
    setIsAddEmployeeOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Employee Management</h2>
        <div className="flex gap-2">
          <Dialog open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
                <DialogDescription>Record employee attendance for today</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Employee</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees
                        .filter((emp) => emp.status === "active")
                        .map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} - {employee.position}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Check In Time</Label>
                    <Input type="time" />
                  </div>
                  <div>
                    <Label>Check Out Time</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="half-day">Half Day</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input placeholder="Additional notes" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAttendanceOpen(false)}>
                    Cancel
                  </Button>
                  <Button>Mark Attendance</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>Enter employee details and employment information</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      placeholder="Ahmed Ali"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      placeholder="ahmed@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      placeholder="+92-300-1234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnic">CNIC</Label>
                    <Input
                      id="cnic"
                      value={newEmployee.cnic}
                      onChange={(e) => setNewEmployee({ ...newEmployee, cnic: e.target.value })}
                      placeholder="12345-6789012-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={newEmployee.position}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                        <SelectItem value="Sales Associate">Sales Associate</SelectItem>
                        <SelectItem value="Store Assistant">Store Assistant</SelectItem>
                        <SelectItem value="Cashier">Cashier</SelectItem>
                        <SelectItem value="Inventory Manager">Inventory Manager</SelectItem>
                        <SelectItem value="Tailor">Tailor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={newEmployee.department}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="Production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary">Monthly Salary (₹)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                      placeholder="35000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission">Commission Rate (%)</Label>
                    <Input
                      id="commission"
                      type="number"
                      step="0.1"
                      value={newEmployee.commission}
                      onChange={(e) => setNewEmployee({ ...newEmployee, commission: e.target.value })}
                      placeholder="2.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newEmployee.address}
                    onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                    placeholder="123 Main Street, Lahore"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={newEmployee.emergencyContact}
                      onChange={(e) => setNewEmployee({ ...newEmployee, emergencyContact: e.target.value })}
                      placeholder="+92-301-7654321"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccount">Bank Account</Label>
                    <Input
                      id="bankAccount"
                      value={newEmployee.bankAccount}
                      onChange={(e) => setNewEmployee({ ...newEmployee, bankAccount: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEmployee}>Add Employee</Button>
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
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">{activeEmployees} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Salary Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalMonthlySalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Base salaries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalMonthlyCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Performance based</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(employees.reduce((sum, emp) => sum + emp.performanceScore, 0) / employees.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Team average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Directory
              </CardTitle>
              <CardDescription>Manage employee information and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={employee.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {employee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-sm text-muted-foreground">Joined: {employee.joinDate}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {employee.phone}
                            </p>
                            <p className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {employee.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">₹{employee.salary.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{employee.commission}% commission</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Score:</span>
                              <span className={getPerformanceColor(employee.performanceScore)}>
                                {employee.performanceScore}%
                              </span>
                            </div>
                            <Progress value={employee.performanceScore} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              Sales: ₹{employee.monthlySales.toLocaleString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(employee.status) as any}>{employee.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
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

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Attendance Records
              </CardTitle>
              <CardDescription>Track employee attendance and working hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours Worked</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <p className="font-medium">{record.employeeName}</p>
                        </TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.checkIn}</TableCell>
                        <TableCell>{record.checkOut}</TableCell>
                        <TableCell>{record.hoursWorked} hrs</TableCell>
                        <TableCell>
                          <Badge variant={getAttendanceColor(record.status) as any}>{record.status}</Badge>
                        </TableCell>
                        <TableCell>{record.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salary Records
              </CardTitle>
              <CardDescription>Manage employee salaries and commission payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <p className="font-medium">{record.employeeName}</p>
                        </TableCell>
                        <TableCell>{record.month}</TableCell>
                        <TableCell>₹{record.basicSalary.toLocaleString()}</TableCell>
                        <TableCell>₹{record.commission.toLocaleString()}</TableCell>
                        <TableCell>₹{record.bonus.toLocaleString()}</TableCell>
                        <TableCell>₹{record.deductions.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="font-medium">₹{record.totalSalary.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.status === "paid"
                                ? "default"
                                : record.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <DollarSign className="h-4 w-4" />
                            </Button>
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

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={employee.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{employee.name}</p>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Sales</p>
                      <p className="text-lg font-bold">₹{employee.monthlySales.toLocaleString()}</p>
                      <Progress value={(employee.monthlySales / employee.monthlyTarget) * 100} className="h-2 mt-1" />
                      <p className="text-xs text-muted-foreground">
                        Target: ₹{employee.monthlyTarget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Performance Score</p>
                      <p className={`text-lg font-bold ${getPerformanceColor(employee.performanceScore)}`}>
                        {employee.performanceScore}%
                      </p>
                      <Progress value={employee.performanceScore} className="h-2 mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance Rate</p>
                      <p className="text-lg font-bold">{employee.attendanceRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Commission</p>
                      <p className="text-lg font-bold">₹{employee.totalCommission.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Award className="h-4 w-4 mr-1" />
                      Reward
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-1" />
                      Set Target
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

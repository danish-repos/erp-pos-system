"use client"

import { useState, useEffect } from "react"
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
import { EmployeeService, type Employee, type AttendanceRecord, type SalaryRecord } from "@/lib/firebase-services"
import { useToast } from "@/hooks/use-toast"

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false)
  const { toast } = useToast()

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

  const [attendanceForm, setAttendanceForm] = useState({
    employeeId: "",
    checkIn: "",
    checkOut: "",
    status: "",
    notes: "",
  })

  // Load data from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesData, attendanceData, salaryData] = await Promise.all([
          EmployeeService.getAllEmployees(),
          EmployeeService.getAllAttendanceRecords(),
          EmployeeService.getAllSalaryRecords(),
        ])
        setEmployees(employeesData)
        setAttendanceRecords(attendanceData)
        setSalaryRecords(salaryData)
        setLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load employee data. Please refresh the page.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

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

  const handleAddEmployee = async () => {
    try {
      const employee: Omit<Employee, "id"> = {
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

      await EmployeeService.createEmployee(employee)

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

      toast({
        title: "Employee Added",
        description: "Employee has been successfully added to the system",
      })

      // Reload employees
      const updatedEmployees = await EmployeeService.getAllEmployees()
      setEmployees(updatedEmployees)
    } catch {
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAttendance = async () => {
    try {
      const employee = employees.find((emp) => emp.id === attendanceForm.employeeId)
      if (!employee) return

      const checkInTime = new Date(`2024-01-01 ${attendanceForm.checkIn}`)
      const checkOutTime = new Date(`2024-01-01 ${attendanceForm.checkOut}`)
      const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)

      const attendanceRecord: Omit<AttendanceRecord, "id"> = {
        employeeId: attendanceForm.employeeId,
        employeeName: employee.name,
        date: new Date().toISOString().split("T")[0],
        checkIn: attendanceForm.checkIn,
        checkOut: attendanceForm.checkOut,
        hoursWorked: Math.max(0, hoursWorked),
        status: attendanceForm.status as "present" | "absent" | "late" | "half-day",
        notes: attendanceForm.notes,
      }

      await EmployeeService.createAttendanceRecord(attendanceRecord)

      setAttendanceForm({
        employeeId: "",
        checkIn: "",
        checkOut: "",
        status: "",
        notes: "",
      })
      setIsAttendanceOpen(false)

      toast({
        title: "Attendance Marked",
        description: "Attendance has been successfully recorded",
      })

      // Reload attendance records
      const updatedAttendance = await EmployeeService.getAllAttendanceRecords()
      setAttendanceRecords(updatedAttendance)
    } catch {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    try {
      await EmployeeService.deleteEmployee(id)
      toast({
        title: "Employee Deleted",
        description: "Employee has been successfully removed from the system",
      })

      // Reload employees
      const updatedEmployees = await EmployeeService.getAllEmployees()
      setEmployees(updatedEmployees)
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    )
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
                  <Select
                    value={attendanceForm.employeeId}
                    onValueChange={(value) => setAttendanceForm({ ...attendanceForm, employeeId: value })}
                  >
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
                    <Input
                      type="time"
                      value={attendanceForm.checkIn}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, checkIn: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Check Out Time</Label>
                    <Input
                      type="time"
                      value={attendanceForm.checkOut}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, checkOut: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={attendanceForm.status}
                    onValueChange={(value) => setAttendanceForm({ ...attendanceForm, status: value })}
                  >
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
                  <Input
                    placeholder="Additional notes"
                    value={attendanceForm.notes}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAttendanceOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleMarkAttendance}>Mark Attendance</Button>
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
                    <Label htmlFor="salary">Monthly Salary (Rs)</Label>
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
            <div className="text-2xl font-bold">Rs{totalMonthlySalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Base salaries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs{totalMonthlyCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Performance based</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.length > 0
                ? Math.round(employees.reduce((sum, emp) => sum + emp.performanceScore, 0) / employees.length)
                : 0}
              %
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
                            <p className="font-medium">Rs{employee.salary.toLocaleString()}</p>
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
                              Sales: Rs{employee.monthlySales.toLocaleString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(employee.status) as "destructive" | "default" | "secondary" | "outline" | null | undefined}>{employee.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteEmployee(employee.id)}>
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
                        <TableCell>{record.hoursWorked.toFixed(1)} hrs</TableCell>
                        <TableCell>
                          <Badge variant={getAttendanceColor(record.status) as "destructive" | "default" | "secondary" | "outline" | null | undefined}>{record.status}</Badge>
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
                        <TableCell>Rs{record.basicSalary.toLocaleString()}</TableCell>
                        <TableCell>Rs{record.commission.toLocaleString()}</TableCell>
                        <TableCell>Rs{record.bonus.toLocaleString()}</TableCell>
                        <TableCell>Rs{record.deductions.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="font-medium">Rs{record.totalSalary.toLocaleString()}</span>
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
                      <p className="text-lg font-bold">Rs{employee.monthlySales.toLocaleString()}</p>
                      <Progress value={(employee.monthlySales / employee.monthlyTarget) * 100} className="h-2 mt-1" />
                      <p className="text-xs text-muted-foreground">
                        Target: Rs{employee.monthlyTarget.toLocaleString()}
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
                      <p className="text-lg font-bold">Rs{employee.totalCommission.toLocaleString()}</p>
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
// (No code needed here.)

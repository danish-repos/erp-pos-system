"use client"

import { useState } from "react"
import Link from "next/link"
import { Dashboard } from "@/components/dashboard"
import { POSModule } from "@/components/pos-module"
import { ProductManagement } from "@/components/product-management"
import { InventoryManagement } from "@/components/inventory-management"
import { CreditDebitLedger } from "@/components/credit-debit-ledger"
import { BargainingTracker } from "@/components/bargaining-tracker"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { EmployeeManagement } from "@/components/employee-management"
import { ReportsModule } from "@/components/reports-module"
import { DisposalModule } from "@/components/disposal-module"
import { SalesLedger } from "@/components/sales-ledger"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ERPSystem() {
  const [activeModule, setActiveModule] = useState("dashboard")
  const { user, logout } = useAuth()

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />
      case "pos":
        return <POSModule />
      case "products":
        return <ProductManagement />
      case "inventory":
        return <InventoryManagement />
      case "bargaining":
        return <BargainingTracker />
      case "credit-debit":
        return <CreditDebitLedger />
      case "employees":
        return <EmployeeManagement />
      case "reports":
        return <ReportsModule />
      case "disposal":
        return <DisposalModule />
      case "sales-ledger":
        return <SalesLedger />
      default:
        return <Dashboard />
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar activeModule={activeModule} setActiveModule={setActiveModule} />
        <main className="flex-1 overflow-hidden">
          <div className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
            <div className="flex items-center">
              <SidebarTrigger />
              <h1 className="ml-4 text-lg font-semibold">Power Project ERP + POS System</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                      <User className="h-4 w-4" />
                      {user.displayName || user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 lg:p-6">{renderModule()}</div>
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

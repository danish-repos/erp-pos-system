"use client"

import { useState } from "react"
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

export default function ERPSystem() {
  const [activeModule, setActiveModule] = useState("dashboard")

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

  return (
    <SidebarProvider>
      <AppSidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="flex-1 overflow-hidden">
        <div className="flex h-14 items-center border-b px-4 lg:px-6">
          <SidebarTrigger />
          <h1 className="ml-4 text-lg font-semibold">Power Project ERP + POS System</h1>
        </div>
        <div className="flex-1 overflow-auto p-4 lg:p-6">{renderModule()}</div>
      </main>
    </SidebarProvider>
  )
}

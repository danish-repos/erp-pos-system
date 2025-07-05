"use client"

import { BarChart3, ShoppingCart, Package, Users, CreditCard, FileText, Settings, Trash2, TrendingDown, Warehouse } from "lucide-react"

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter }
 from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    id: "dashboard",
  },
  {
    title: "POS System",
    icon: ShoppingCart,
    id: "pos",
  },
  {
    title: "Products & Pricing",
    icon: Package,
    id: "products",
  },
  {
    title: "Inventory Management",
    icon: Warehouse,
    id: "inventory",
  },
  {
    title: "Bargaining Tracker",
    icon: TrendingDown,
    id: "bargaining",
  },
  {
    title: "Credit & Debit Ledger",
    icon: CreditCard,
    id: "credit-debit",
  },
  {
    title: "Employee Management",
    icon: Users,
    id: "employees",
  },
  {
    title: "Sales Ledger",
    icon: FileText,
    id: "sales-ledger",
  },
  {
    title: "Disposal Module",
    icon: Trash2,
    id: "disposal",
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    id: "reports",
  },
]

interface AppSidebarProps {
  activeModule: string
  setActiveModule: (module: string) => void
}

export function AppSidebar({ activeModule, setActiveModule }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Power Project</span>
            <span className="text-xs text-muted-foreground">Clothing ERP</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => setActiveModule(item.id)} isActive={activeModule === item.id}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

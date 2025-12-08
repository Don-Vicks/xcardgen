"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { CreateEventDialog } from "@/components/create-event-dialog"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border/40 bg-muted/10 h-screen fixed inset-y-0 flex-col">
        <SidebarNav />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border/40 flex items-center justify-between px-4 md:px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Click</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarNav setOpen={setOpen} />
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <CreateEventDialog />
        </header>
        <div className="p-4 md:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

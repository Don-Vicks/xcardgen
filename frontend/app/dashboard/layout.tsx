"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { AuthGuard } from "@/components/auth-guard"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { useWorkspace } from "@/stores/workspace-store"; // Add import

import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isEditor = pathname?.includes('/editor') || pathname?.includes('/design')
  const { isSwitching } = useWorkspace()

  return (
    <AuthGuard>
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

              {/* <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1> */}
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              {/* <CreateEventDialog /> */}
            </div>
          </header>
          <div className={`flex-1 overflow-auto ${isEditor ? 'p-0 h-[calc(100vh-4rem)] overflow-hidden' : 'p-4 md:p-8'}`}>
            {children}
          </div>
        </main>
      </div>
      {isSwitching && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="font-medium text-lg">Switching Workspace...</p>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}

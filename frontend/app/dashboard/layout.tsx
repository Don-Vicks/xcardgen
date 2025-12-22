"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { AuthGuard } from "@/components/auth-guard"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { WorkspaceSwitcherModal, useWorkspaceSwitcherShortcut } from "@/components/dashboard/workspace-switcher-modal"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { useWorkspace } from "@/stores/workspace-store"; // Add import

import { DialogProvider } from "@solana-commerce/react"
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

  // Workspace switcher modal with Cmd+K shortcut
  const { open: workspaceSwitcherOpen, setOpen: setWorkspaceSwitcherOpen } = useWorkspaceSwitcherShortcut()

  return (
    <AuthGuard>
      <DialogProvider>
        <div className="flex min-h-screen bg-background">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex w-64 border-r border-border/40 bg-muted/10 h-screen fixed inset-y-0 flex-col">
            <SidebarNav />
          </aside>

          {/* Main Content */}
          <main className="flex-1 md:pl-64 flex flex-col min-h-screen w-full overflow-x-hidden">
            {!isEditor && (
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
                      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                      <SidebarNav setOpen={setOpen} />
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="flex items-center gap-4">
                  {/* Keyboard shortcut hint */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex gap-2 text-muted-foreground"
                    onClick={() => setWorkspaceSwitcherOpen(true)}
                  >
                    <span>Switch Workspace</span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      ⌘K
                    </kbd>
                  </Button>
                  <ModeToggle />
                  <CreateEventDialog />
                </div>
              </header>
            )}
            <div className={`flex-1 overflow-auto ${isEditor ? 'p-0 overflow-hidden' : 'p-4 md:p-8'}`}>
              {children}
            </div>
          </main>
        </div>

        {/* Workspace Switcher Modal */}
        <WorkspaceSwitcherModal
          open={workspaceSwitcherOpen}
          onOpenChange={setWorkspaceSwitcherOpen}
        />

        {isSwitching && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-medium text-lg">Switching Workspace...</p>
            </div>
          </div>
        )}
      </DialogProvider>
    </AuthGuard>
  )
}


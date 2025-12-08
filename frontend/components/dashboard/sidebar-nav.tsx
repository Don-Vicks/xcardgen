"use client"

import { BarChart3, Home, Layers, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/stores/auth-store"

export function SidebarNav({ className, setOpen }: { className?: string, setOpen?: (open: boolean) => void }) {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/events",
      label: "My Events",
      icon: Layers,
      active: pathname?.startsWith("/dashboard/events"),
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3,
      active: pathname === "/dashboard/analytics",
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <div className={`flex flex-col justify-between h-full ${className}`}>
      <div className="flex h-16 items-center px-6 border-b border-border/40">
        <Link className="flex items-center gap-2 font-bold text-xl tracking-tight" href="/" onClick={() => setOpen?.(false)}>
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            xCardGen
          </span>
        </Link>
      </div>

      <div className="flex flex-col justify-between flex-1 p-4">
        <div className="mb-4 flex items-center justify-between px-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspaces</span>
          <CreateWorkspaceDialog />
        </div>
        <nav className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen?.(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${route.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-card border border-border/50">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

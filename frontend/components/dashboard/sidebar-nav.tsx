"use client"

import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { routes } from "@/lib/constants/menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/auth-store"
import { useWorkspace } from "@/stores/workspace-store"
import { Check, ChevronsUpDown, Globe, Layers, LogOut, Plus, Settings, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function SidebarNav({ className, setOpen }: { className?: string, setOpen?: (open: boolean) => void }) {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Combine owned and member workspaces
  const allWorkspaces = [
    ...(user?.workspaceOwnerships || []).map(w => ({ ...w, role: 'OWNER' })),
    ...(user?.workspaceMemberships?.map(m => ({ ...m.workspace, role: 'MEMBER' })) || [])
  ]

  // Set default workspace if none selected
  useEffect(() => {
    if (!currentWorkspace && allWorkspaces.length > 0) {
      setCurrentWorkspace(allWorkspaces[0])
    }
  }, [currentWorkspace, allWorkspaces, setCurrentWorkspace])

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
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</span>
            {/* <CreateWorkspaceDialog /> */}
          </div>

          <div className="mb-4 px-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {currentWorkspace ? (
                    <div className="flex items-center gap-2 truncate">
                      <div className="h-5 w-5 rounded-sm bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {currentWorkspace.logo ? (
                          <Image src={currentWorkspace.logo} alt={`${currentWorkspace.name} logo`} className="h-5 w-5 rounded-sm" width={20} height={20} />
                        ) : (
                          currentWorkspace.name.charAt(0)
                        )}
                      </div>
                      <span className="truncate">{currentWorkspace.name}</span>
                    </div>
                  ) : (
                    "Select Workspace"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search workspace..." />
                  <CommandEmpty>No workspace found.</CommandEmpty>
                  <CommandGroup>
                    {allWorkspaces.map((workspace) => (
                      <CommandItem
                        key={workspace.id}
                        value={workspace.name}
                        onSelect={() => {
                          setCurrentWorkspace(workspace)
                          setOpen?.(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentWorkspace?.id === workspace.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {workspace.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={() => {
                      setShowCreateDialog(true)
                      setOpen?.(false)
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Workspace
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <nav className="space-y-2">
            {routes.map((route) => {
              const active = route.href === "/dashboard"
                ? pathname === route.href
                : pathname?.startsWith(route.href)

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen?.(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              )
            })}

            {currentWorkspace?.slug && (
              <>
                <div className="my-2 border-t border-border/40" />
                <Link
                  href={`/${currentWorkspace.slug}`}
                  target="_blank"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  View Public Page
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-card border border-border/50 cursor-pointer hover:bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings?tab=security" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Security
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ModeToggle />
                <span className="ml-2">Dark mode</span>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
      <CreateWorkspaceDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div >
  )
}

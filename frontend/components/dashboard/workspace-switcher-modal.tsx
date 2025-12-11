"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/stores/auth-store"
import { useWorkspace } from "@/stores/workspace-store"
import { Check, Layers, Plus, Search, Users } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

interface WorkspaceSwitcherModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkspaceSwitcherModal({ open, onOpenChange }: WorkspaceSwitcherModalProps) {
  const { user } = useAuth()
  const { currentWorkspace, setCurrentWorkspace, setIsSwitching } = useWorkspace()
  const router = useRouter()
  const [search, setSearch] = useState("")

  // Combine and deduplicate workspaces
  const allWorkspacesRaw = [
    ...(user?.workspaceOwnerships || []).map(w => ({ ...w, role: 'OWNER' as const })),
    ...(user?.workspaceMemberships?.map(m => ({ ...m.workspace, role: 'MEMBER' as const })) || [])
  ]

  const workspaceMap = new Map<string, typeof allWorkspacesRaw[0]>()
  allWorkspacesRaw.forEach(ws => {
    if (!workspaceMap.has(ws.id) || ws.role === 'OWNER') {
      workspaceMap.set(ws.id, ws)
    }
  })
  const allWorkspaces = Array.from(workspaceMap.values())

  // Filter by search
  const filteredWorkspaces = allWorkspaces.filter(ws =>
    ws.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (workspace: typeof allWorkspaces[0]) => {
    setIsSwitching(true)
    onOpenChange(false)
    setSearch("")
    setTimeout(() => {
      setCurrentWorkspace(workspace)
      setTimeout(() => setIsSwitching(false), 500)
    }, 100)
  }

  const handleCreateNew = () => {
    onOpenChange(false)
    setSearch("")
    router.push("/dashboard/workspaces")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Switch Workspace
          </DialogTitle>
          <DialogDescription>
            Select a workspace to switch to, or create a new one.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workspaces..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        {/* Workspace List */}
        <div className="max-h-[300px] overflow-y-auto px-2 py-2">
          {filteredWorkspaces.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No workspaces found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredWorkspaces.map((workspace) => {
                const isSelected = currentWorkspace?.id === workspace.id
                return (
                  <button
                    key={workspace.id}
                    onClick={() => handleSelect(workspace)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted/50 ${isSelected ? "bg-primary/10 border border-primary/20" : ""
                      }`}
                  >
                    {/* Logo */}
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {workspace.logo ? (
                        <Image
                          src={workspace.logo}
                          alt={workspace.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-primary font-bold text-lg">
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{workspace.name}</span>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {workspace.role}
                        </Badge>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                      {(workspace as any).description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                          {(workspace as any).description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {(workspace as any)._count?.members || 1} members
                        </span>
                        {(workspace as any).slug && (
                          <span className="opacity-60">/{(workspace as any).slug}</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4" />
            Create New Workspace
          </Button>
        </div>

        {/* Keyboard Hint */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground text-center bg-muted/30">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono">⌘</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono">K</kbd> to toggle this dialog
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook to use the keyboard shortcut
export function useWorkspaceSwitcherShortcut() {
  const [open, setOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setOpen(prev => !prev)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return { open, setOpen }
}

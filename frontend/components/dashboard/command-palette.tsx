"use client"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useWorkspace } from "@/stores/workspace-store"
import {
  BarChart3,
  Home,
  Layers,
  LayoutTemplate,
  Moon,
  Plus,
  Settings,
  Sun,
  Users
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const { currentWorkspace } = useWorkspace()
  const { setTheme, theme } = useTheme()

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])

  // Navigation commands
  const navigationCommands = [
    {
      label: "Dashboard",
      icon: Home,
      shortcut: "⌘D",
      action: () => router.push("/dashboard"),
    },
    {
      label: "xCards",
      icon: Layers,
      shortcut: "⌘E",
      action: () => router.push("/dashboard/events"),
    },
    {
      label: "Templates",
      icon: LayoutTemplate,
      shortcut: "⌘T",
      action: () => router.push("/dashboard/templates"),
    },
    {
      label: "Analytics",
      icon: BarChart3,
      shortcut: "⌘A",
      action: () => router.push("/dashboard/analytics"),
    },
    {
      label: "Settings",
      icon: Settings,
      shortcut: "⌘S",
      action: () => router.push("/dashboard/settings"),
    },
  ]

  // Quick actions
  const quickActions = [
    {
      label: "Create New xCard",
      icon: Plus,
      action: () => {
        // Trigger create event dialog
        const trigger = document.querySelector('[data-dialog-trigger="create-event"]') as HTMLElement
        trigger?.click()
      },
    },
    {
      label: "Create New Template",
      icon: Plus,
      action: () => router.push("/dashboard/templates"),
    },
    {
      label: "Team Members",
      icon: Users,
      action: () => router.push("/dashboard/settings?tab=workspace"),
    },
  ]

  // Theme commands
  const themeCommands = [
    {
      label: "Light Mode",
      icon: Sun,
      action: () => setTheme("light"),
    },
    {
      label: "Dark Mode",
      icon: Moon,
      action: () => setTheme("dark"),
    },
  ]

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navigationCommands.map((cmd) => (
            <CommandItem
              key={cmd.label}
              onSelect={() => runCommand(cmd.action)}
              className="cursor-pointer"
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              <span>{cmd.label}</span>
              {cmd.shortcut && (
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {cmd.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {quickActions.map((cmd) => (
            <CommandItem
              key={cmd.label}
              onSelect={() => runCommand(cmd.action)}
              className="cursor-pointer"
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              <span>{cmd.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          {themeCommands.map((cmd) => (
            <CommandItem
              key={cmd.label}
              onSelect={() => runCommand(cmd.action)}
              className="cursor-pointer"
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              <span>{cmd.label}</span>
              {theme === cmd.label.split(" ")[0].toLowerCase() && (
                <span className="ml-auto text-xs text-primary">Active</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>

      {/* Footer */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between bg-muted/30">
        <span>
          Press <kbd className="px-1 py-0.5 rounded bg-muted border text-xs font-mono">/</kbd> to search
        </span>
        <span>
          <kbd className="px-1 py-0.5 rounded bg-muted border text-xs font-mono">↵</kbd> to select
        </span>
      </div>
    </CommandDialog>
  )
}

// Hook to use the keyboard shortcut
export function useCommandPaletteShortcut() {
  const [open, setOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd+/ or Ctrl+/ to open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === "/") {
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

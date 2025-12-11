"use client"

import { CreateWorkspaceForm } from "@/components/forms/create-workspace-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus } from "lucide-react"
import { useState } from "react"

interface CreateWorkspaceDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateWorkspaceDialog({ open: controlledOpen, onOpenChange: setControlledOpen }: CreateWorkspaceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen : setInternalOpen

  const handleSuccess = () => {
    setOpen?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-muted hover:bg-muted/80 ml-auto border-dashed border-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] h-[95vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your events and collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 p-8 pt-2">
          <CreateWorkspaceForm onSuccess={handleSuccess} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}


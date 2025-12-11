"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Template, templatesRequest } from "@/lib/api/requests/templates.request"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/stores/workspace-store"
import { Check, Loader2, Plus } from "lucide-react"
import { useEffect, useState } from "react"

interface TemplatePickerProps {
  onSelect: (templateId: string, isCustom?: boolean) => void
}

export function TemplatePicker({ onSelect }: TemplatePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [userTemplates, setUserTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const { currentWorkspace } = useWorkspace()

  useEffect(() => {
    const fetchTemplates = async () => {
      // If no workspace, maybe fetch personal? For now wait for workspace.
      if (!currentWorkspace?.id) {
        setLoading(false)
        return
      }
      try {
        const res = await templatesRequest.getAll(currentWorkspace.id)
        setUserTemplates(res.data)
      } catch (error) {
        console.error("Failed to load templates", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [currentWorkspace])

  const handleSelect = () => {
    if (!selectedId) return
    const isCustom = userTemplates.some(t => t.id === selectedId)
    onSelect(selectedId, isCustom)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Choose a Template</h2>
        <p className="text-muted-foreground mt-2">
          Start from scratch or use one of your saved designs.
        </p>
      </div>

      <ScrollArea className="h-[600px] w-full max-w-5xl rounded-md border p-6 bg-muted/20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Blank Template Option */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:scale-105 hover:border-primary",
              selectedId === "blank" && "border-2 border-primary ring-2 ring-primary/20",
              "flex flex-col"
            )}
            onClick={() => setSelectedId("blank")}
          >
            <CardHeader>
              <CardTitle>Start from Scratch</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex aspect-video items-center justify-center bg-background border-t border-b">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </CardContent>
            <CardFooter className="pt-4">
              <p className="text-sm text-muted-foreground">Blank canvas for total control</p>
            </CardFooter>
          </Card>

          {/* User Templates */}
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userTemplates.map((template) => (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer transition-all hover:scale-105 hover:border-primary overflow-hidden",
                selectedId === template.id && "border-2 border-primary ring-2 ring-primary/20"
              )}
              onClick={() => setSelectedId(template.id)}
            >
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={template.backgroundImage}
                  alt={template.name}
                  className="h-full w-full object-cover transition-transform hover:scale-110"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg truncate">{template.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}

          {!loading && userTemplates.length === 0 && (
            // Optional: Call to action if no templates
            <div className="col-span-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg opacity-50">
              <p>No saved templates found in this workspace.</p>
              <p className="text-xs">Go to "Templates" in the dashboard to create one.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-8 flex gap-4">
        <Button size="lg" disabled={!selectedId} onClick={handleSelect}>
          {selectedId ? "Continue with Selection" : "Select a Template"}
          <Check className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

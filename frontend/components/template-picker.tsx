"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Template, templatesRequest } from "@/lib/api/requests/templates.request"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/stores/workspace-store"
import { Check, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"

interface TemplatePickerProps {
  onSelect: (templateId: string, isCustom?: boolean) => void
  onCancel?: () => void
}

export function TemplatePicker({ onSelect, onCancel }: TemplatePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { currentWorkspace } = useWorkspace()

  // Pagination & Search State
  const [templates, setTemplates] = useState<Template[]>([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 500)
  const [meta, setMeta] = useState<any>(null)

  // Reset page on search change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    const fetchTemplates = async () => {
      // If no workspace, wait for it
      if (!currentWorkspace?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const res = await templatesRequest.getAll(currentWorkspace.id, {
          page,
          limit: 8, // Fit nicely in grid
          search: debouncedSearch,
          sortBy: "updatedAt",
          sortOrder: "desc"
        })
        setTemplates(res.data.data)
        setMeta(res.data.meta)
      } catch (error) {
        console.error("Failed to load templates", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [currentWorkspace, page, debouncedSearch])

  const handleSelect = () => {
    if (!selectedId) return
    const isCustom = templates.some(t => t.id === selectedId)
    onSelect(selectedId, isCustom)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 bg-background relative">
      {onCancel && (
        <Button variant="ghost" className="absolute top-8 left-8" onClick={onCancel}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>
      )}
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Choose a Template</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Start from scratch or pick a template from your library.
        </p>
      </div>

      <div className="w-full max-w-5xl space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs text-muted-foreground text-center sm:text-right">
            {meta?.total ? `${meta.total} templates found` : ""}
          </span>
        </div>

        {/* Grid Area */}
        <div className="h-[600px] w-full rounded-xl border p-6 shadow-sm overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-8">
              {/* Blank Template Option - Always show on Page 1 if no search or if matching "blank"? No, always show on Page 1 for easy access */}
              {/* Blank Template Option */}
              {page === 1 && !debouncedSearch && (
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border-dashed border-2 group relative",
                    selectedId === "blank" && "border-primary ring-2 ring-primary/20 border-solid",
                    "flex flex-col min-h-[220px]"
                  )}
                  onClick={() => setSelectedId("blank")}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-center">Start Blank</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex aspect-video items-center justify-center bg-muted/20 m-4 rounded-lg relative">
                    <Plus className="h-10 w-10 text-muted-foreground/50 transition-transform group-hover:scale-110" />
                    {/* Instant Action Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); onSelect("blank", true); }}>Create Blank</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Loading Skeletons */}
              {loading && templates.length === 0 && Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-muted shadow-sm h-[250px] animate-pulse" />
              ))}

              {/* User Templates */}
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md overflow-hidden group min-h-[220px] relative",
                    selectedId === template.id && "border-primary ring-2 ring-primary/20",
                    "flex flex-col"
                  )}
                  onClick={() => setSelectedId(template.id)}
                >
                  <div className="aspect-video w-full overflow-hidden bg-muted relative">
                    {template.backgroundImage ? (
                      <img
                        src={template.backgroundImage}
                        alt={template.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/50">
                        <span className="text-muted-foreground text-xs">No Preview</span>
                      </div>
                    )}

                    {/* Instant Action Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onSelect(template.id, true); }}>Select</Button>
                    </div>
                  </div>
                  <CardHeader className="p-4 pt-4">
                    <CardTitle className="text-base truncate font-medium">{template.name}</CardTitle>
                    <p className="text-xs text-muted-foreground truncate">
                      Updated {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                </Card>
              ))}

              {/* Empty State */}
              {!loading && templates.length === 0 && debouncedSearch && (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  <p>No templates found for "{debouncedSearch}"</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Pagination Footer */}
          {meta && meta.lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">Page {page} of {meta.lastPage}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))}
                disabled={page === meta.lastPage || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Button size="lg" disabled={!selectedId} onClick={handleSelect} className="px-8 shadow-lg hover:shadow-xl transition-all">
          {selectedId ? "Continue with Selection" : "Select a Template"}
          <Check className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

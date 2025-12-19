"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWorkspacePermissions } from "@/hooks/use-workspace-permissions"
import { Template, templatesRequest } from "@/lib/api/requests/templates.request"
import { useWorkspace } from "@/stores/workspace-store"
import { ChevronLeft, ChevronRight, Loader2, Plus, Search, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { TemplatesSkeleton } from "./_components/templates-skeleton"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [meta, setMeta] = useState({ page: 1, lastPage: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const { currentWorkspace } = useWorkspace()
  const { isAdmin } = useWorkspacePermissions()
  const router = useRouter()

  const [isCreating, setIsCreating] = useState(false)

  // Params
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortBy, setSortBy] = useState("updatedAt")
  const [page, setPage] = useState(1)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page on search change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await templatesRequest.getAll(currentWorkspace?.id, {
        page,
        limit: 9,
        search: debouncedSearch,
        sortBy,
      })
      setTemplates(res.data.data)
      setMeta(res.data.meta)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch templates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [currentWorkspace, page, debouncedSearch, sortBy])

  const handleCreate = async () => {
    if (!currentWorkspace?.id) return
    setIsCreating(true)
    try {
      const res = await templatesRequest.create({
        name: "Untitled Template",
        // Valid placeholder image to satisfy database constraint
        backgroundImage: "https://placehold.co/1200x630/e2e8f0/64748b?text=Upload+Background",
        workspaceId: currentWorkspace.id,
      })
      toast.success("Draft template created")
      router.push(`/dashboard/templates/${res.data.id}/editor`)
    } catch (error) {
      console.error(error)
      toast.error("Failed to create template")
    } finally {
      setIsCreating(false)
    }
  }

  const confirmDelete = (template: Template, e: React.MouseEvent) => {
    e.preventDefault()
    setTemplateToDelete({ id: template.id, name: template.name })
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!templateToDelete) return
    setIsDeleting(true)
    try {
      await templatesRequest.delete(templateToDelete.id)
      toast.success("Template deleted")
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
      fetchTemplates()
    } catch (error) {
      toast.error("Failed to delete")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading && templates.length === 0) return <TemplatesSkeleton />

  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
          <p className="text-muted-foreground">Manage your reusable xCard designs.</p>
        </div>

        <Button onClick={() => {
          if (!isAdmin) {
            toast.error("Permission denied", { description: "Only workspace admins can create templates." });
            return;
          }
          handleCreate();
        }} disabled={isCreating}>
          {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          New Template
        </Button>

      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-lg border">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Newest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Create New Card - Always First on Page 1 when not searching */}
        {page === 1 && !search && (
          <Card
            className="flex flex-col items-center justify-center p-8 border-dashed border-2 hover:border-primary/50 hover:bg-muted/10 transition-all cursor-pointer h-full min-h-[250px] group"
            onClick={() => {
              if (!isAdmin) {
                toast.error("Permission denied", { description: "Only workspace admins can create templates." });
                return;
              }
              handleCreate();
            }}
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Create New Template</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 max-w-[200px]">Start designing a new xCard template</p>
          </Card>
        )}

        {templates.map((template) => (
          <Link href={`/dashboard/templates/${template.id}/editor`} key={template.id}>
            <Card className="overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group relative">
              <div className="aspect-video relative bg-muted flex items-center justify-center">
                {template.backgroundImage ? (
                  <Image
                    src={template.backgroundImage}
                    alt={template.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-background/50" />
                    No Preview
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => confirmDelete(template, e)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">{template.name}</h3>
                  <span className="text-xs text-muted-foreground">{new Date(template.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* Empty State for Search */}
        {templates.length === 0 && search && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No templates found</h3>
            <p className="mt-1">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {meta.page} of {meta.lastPage}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))} disabled={page === meta.lastPage}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{templateToDelete?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

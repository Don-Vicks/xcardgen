"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Template, templatesRequest } from "@/lib/api/requests/templates.request"
import { useWorkspace } from "@/stores/workspace-store"
import { Loader2, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const { currentWorkspace } = useWorkspace()
  const router = useRouter()

  const [isCreating, setIsCreating] = useState(false)

  const fetchTemplates = async () => {
    try {
      const res = await templatesRequest.getAll(currentWorkspace?.id)
      setTemplates(res.data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch templates")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [currentWorkspace])

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    if (!confirm("Are you sure?")) return
    try {
      await templatesRequest.delete(id)
      toast.success("Template deleted")
      fetchTemplates()
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
          <p className="text-muted-foreground">Manage your reusable xCard designs.</p>
        </div>
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          New Template
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {templates.map((template) => (
          <Link href={`/dashboard/templates/${template.id}/editor`} key={template.id}>
            <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group relative">
              <div className="aspect-video relative bg-muted">
                <Image
                  src={template.backgroundImage}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => handleDelete(template.id, e)}>
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
        {templates.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No templates found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { TemplateEditor } from "@/components/editor/template-editor"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Template, templatesRequest } from "@/lib/api/requests/templates.request"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useWorkspace } from "@/stores/workspace-store"; // Add import

export default function TemplateEditorPage() {
  const { id } = useParams()
  const { currentWorkspace } = useWorkspace() // Hook
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await templatesRequest.getOne(id as string, currentWorkspace?.id)
        setTemplate(res.data)
      } catch (error) {
        toast.error("Failed to load template")
      } finally {
        setLoading(false)
      }
    }
    if (currentWorkspace) fetch()
  }, [id, currentWorkspace?.id])

  if (loading || !template) return <LoadingScreen />

  return (
    <TemplateEditor
      initialData={template}
      onSave={async (data) => {
        await templatesRequest.update(id as string, data)
      }}
    />
  )
}

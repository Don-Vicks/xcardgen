"use client"

import { TemplateEditor } from "@/components/editor/template-editor"
import { TemplatePicker } from "@/components/template-picker"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { eventsRequest } from "@/lib/api/requests/events.request"
import { Template, templatesRequest } from "@/lib/api/requests/templates.request"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"

import { useRouter } from "next/navigation"

export default function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<any>(null)

  // Fetch Event to check if it already has a design
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventsRequest.getAll({ search: slug }) // Use findOne/findPublic if available exposed. findPublic is by slug.
        // eventsRequest.getById uses ID. We need by Slug.
        // Or specific Endpoint? eventsRequest.getById(params.slug) calls /events/:id. Controller checks slug OR id.
        const eventRes = await eventsRequest.getById(slug)
        setEvent(eventRes.data)

        if (eventRes.data.templateId) {
          const tmplRes = await templatesRequest.getOne(eventRes.data.templateId)
          setTemplate(tmplRes.data)
        }
      } catch (error) {
        console.error("Failed to load event", error)
        toast.error("Failed to load event context")
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [slug])

  const handleTemplateSelect = async (templateId: string, isCustom?: boolean) => {
    if (!event) return

    setLoading(true)
    try {
      if (templateId === "blank") {
        // Create a blank template? Or just a detached one?
        // If "No Clone" policy: We create a NEW template for this event (Blank is always new).
        // Wait, user said "no clone". But blank implies new.

        // Create new template
        const newTemplateRes = await templatesRequest.create({
          name: `${event.name} Design`,
          backgroundImage: "",
          workspaceId: event.workspaceId
        })

        // Link to Event
        await eventsRequest.update(event.id, { templateId: newTemplateRes.data.id })

        setTemplate(newTemplateRes.data)
        toast.success("Blank design created")
        return
      }

      // Existing Template Selection
      // Strategy: Link Event to Template ID.
      await eventsRequest.update(event.id, { templateId })

      // Fetch the template data to load into editor
      const templateRes = await templatesRequest.getOne(templateId)
      setTemplate(templateRes.data)
      toast.success("Template linked to event. You can now customize it.")

    } catch (error) {
      console.error(error)
      toast.error("Failed to select template")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: Partial<Template>) => {
    if (!template?.id) return
    try {
      // Ensure link is active
      await eventsRequest.update(event.id, { templateId: template.id })

      // Update template data
      await templatesRequest.update(template.id, data)
      toast.success(`Design saved & linked to ${event.name}`)
    } catch (err) {
      console.error(err)
      toast.error("Failed to save")
    }
  }

  if (loading) return <LoadingScreen />

  if (!template) {
    return (
      <TemplatePicker
        onSelect={handleTemplateSelect}
        onCancel={() => router.push(`/dashboard/events/${slug}`)}
      />
    )
  }

  return (
    <TemplateEditor
      initialData={template}
      onSave={handleSave}
      backLink={`/dashboard/events/${slug}`}
      backLabel="Back to Event"
      saveButtonLabel="Save Design"
    />
  )
}

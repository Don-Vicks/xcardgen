"use client"

import { CanvasEditor } from "@/components/editor/canvas-editor"
import { TemplatePicker } from "@/components/template-picker"
import { useState } from "react"
import { toast } from "sonner"

export default function EditorPage({ params }: { params: { slug: string } }) {
  // TODO: Fetch real event state to check if template exists
  const [hasTemplate, setHasTemplate] = useState(false)

  const handleTemplateSelect = async (templateId: string) => {
    // TODO: Call API to link template to event
    console.log("Selected template:", templateId)
    toast.success("Template applied!")
    setHasTemplate(true)
  }

  if (!hasTemplate) {
    return <TemplatePicker onSelect={handleTemplateSelect} />
  }

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <h1 className="font-semibold">Template Editor</h1>
        <div className="flex items-center gap-2">
          <button className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground">Save</button>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <CanvasEditor />
      </div>
    </div>
  )
}

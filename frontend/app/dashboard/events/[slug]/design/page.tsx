import { CanvasEditor } from "@/components/editor/canvas-editor"

export default function EditorPage({ params }: { params: { slug: string } }) {
  // We can fetch initial template data here using params.slug later
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

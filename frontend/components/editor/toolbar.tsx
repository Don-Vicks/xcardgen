"use client"

import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/stores/editor-store"
import { Circle, ImageIcon, MousePointer2, Square, Type, Undo2 } from "lucide-react"
import { BackgroundPanel } from "./background-panel"

export function Toolbar() {
  const { addElement } = useEditorStore()

  return (
    <div className="flex h-full w-16 flex-col items-center gap-4 border-r bg-background py-4">
      <div className="grid gap-2">
        <Button
          variant="ghost"
          size="icon"
          title="Select"
          onClick={() => {
            // Logic for select mode if needed (usually default)
          }}
        >
          <MousePointer2 className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Add Text"
          onClick={() => addElement('text')}
        >
          <Type className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Add Rectangle"
          onClick={() => addElement('rect')}
        >
          <Square className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Add Circle"
          onClick={() => addElement('circle')}
        >
          <Circle className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Add Image"
          onClick={() => addElement('image')}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <BackgroundPanel />
      </div>
      <div className="mt-auto">
        <Button variant="ghost" size="icon" title="Undo">
          <Undo2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

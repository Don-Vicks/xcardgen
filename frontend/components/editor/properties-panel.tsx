"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useEditorStore } from "@/stores/editor-store"
import { Trash2 } from "lucide-react"

export function PropertiesPanel() {
  const { selectedId, elements, updateElement, removeElement, backgroundImage, setBackgroundImage } = useEditorStore()

  const selectedElement = elements.find(el => el.id === selectedId)

  if (!selectedElement) {

    return (
      <div className="w-72 border-l bg-background p-4">
        <h3 className="mb-4 font-semibold">Canvas</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Background Image URL</Label>
            <Input
              value={backgroundImage || ''}
              onChange={(e) => setBackgroundImage(e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">URL for the template background.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    if (selectedId) removeElement(selectedId)
  }

  return (
    <div className="w-72 border-l bg-background p-4">
      <h3 className="mb-4 font-semibold">Properties</h3>

      <div className="space-y-4">
        {/* Common Properties */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>X</Label>
            <Input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label>Y</Label>
            <Input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Text Specific */}
        {selectedElement.type === 'text' && (
          <div className="space-y-2">
            <Label>Text Content</Label>
            <Input
              value={selectedElement.text || ''}
              onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Font Size</Label>
                <Input
                  type="number"
                  value={selectedElement.fontSize || 20}
                  onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={selectedElement.fill || '#000000'}
                  className="h-10 w-full p-1 cursor-pointer"
                  onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Shape Specific */}
        {(selectedElement.type === 'rect' || selectedElement.type === 'circle') && (
          <div className="space-y-2">
            <Label>Fill Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={selectedElement.fill || '#cccccc'}
                className="h-10 w-12 p-1 cursor-pointer"
                onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
              />
              <span className="text-xs text-muted-foreground">{selectedElement.fill}</span>
            </div>

            <Label>Opacity</Label>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={selectedElement.opacity || 1}
              onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) })}
            />
          </div>
        )}

        {/* Image Specific */}
        {selectedElement.type === 'image' && (
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              value={selectedElement.src || ''}
              onChange={(e) => updateElement(selectedElement.id, { src: e.target.value })}
              placeholder="https://..."
            />
          </div>
        )}

        <Separator />

        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          Delete Element
        </Button>
      </div>
    </div>
  )
}

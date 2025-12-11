"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { GOOGLE_FONTS } from "@/lib/constants/fonts"
import { AlignCenter, AlignLeft, AlignRight, Bold } from "lucide-react"
import { CanvasElement } from "./page"

interface ElementPropertiesProps {
  element: CanvasElement | null
  onChange: (updates: Partial<CanvasElement>) => void
  onDelete: () => void
}

export function ElementProperties({ element, onChange, onDelete }: ElementPropertiesProps) {
  if (!element) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Select an element to edit properties
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs uppercase text-muted-foreground font-bold">Details</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">ID</Label>
            <Input disabled value={element.id.slice(0, 8)} className="h-7 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Type</Label>
            <Input disabled value={element.type} className="h-7 text-xs" />
          </div>
        </div>
      </div>

      {/* Form Configuration for Dynamic Elements */}
      {element.isDynamic && (
        <>
          <Separator />
          <div className="space-y-4">
            <Label className="text-xs uppercase text-blue-600 font-bold">Form Configuration</Label>
            <div className="space-y-2">
              <Label>Field Name (Required)</Label>
              <Input
                value={element.fieldName || ""}
                onChange={(e) => onChange({ fieldName: e.target.value })}
                placeholder={element.type === 'text' ? "e.g. Full Name" : "e.g. Profile Picture"}
              />
              <p className="text-[10px] text-muted-foreground">Label for the user input form</p>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={element.fieldDescription || ""}
                onChange={(e) => onChange({ fieldDescription: e.target.value })}
                placeholder="e.g. Enter your name as on ticket"
              />
            </div>
          </div>
        </>
      )}


      <Separator />

      {/* Text Specific */}
      {element.type === "text" && (
        <div className="space-y-4">
          <Label className="text-xs uppercase text-muted-foreground font-bold">Typography</Label>
          <div className="space-y-2">
            <Label>Content</Label>
            <Input
              value={element.content || ""}
              onChange={(e) => onChange({ content: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={element.style?.fontFamily || "Roboto"}
              onValueChange={(val) => onChange({ style: { ...element.style, fontFamily: val } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent className="h-64">
                {GOOGLE_FONTS.map(font => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Font Size</Label>
              <Input
                type="number"
                value={element.style?.fontSize || 16}
                onChange={(e) => onChange({ style: { ...element.style, fontSize: parseInt(e.target.value) } })}
              />
            </div>
            <div className="space-y-1">
              <Label>Color</Label>
              <Input
                type="color"
                value={element.style?.color || "#000000"}
                onChange={(e) => onChange({ style: { ...element.style, color: e.target.value } })}
                className="h-9 p-1"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Alignment</Label>
            <ToggleGroup type="single" value={element.style?.textAlign || "left"} onValueChange={(v) => v && onChange({ style: { ...element.style, textAlign: v } })}>
              <ToggleGroupItem value="left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-1">
            <Label>Decoration</Label>
            <ToggleGroup type="multiple" className="justify-start">
              <ToggleGroupItem value="bold"
                data-state={element.style?.fontWeight === "bold" ? "on" : "off"}
                onClick={() => onChange({ style: { ...element.style, fontWeight: element.style?.fontWeight === "bold" ? "normal" : "bold" } })}
              >
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      )}

      {/* Shape/Image Specific styles */}
      {(element.type === "shape" || element.type === "image") && (
        <>
          <Separator />
          <div className="space-y-4">
            <Label className="text-xs uppercase text-muted-foreground font-bold">Style</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Border Radius</Label>
                <Input
                  type="text"
                  value={element.style?.borderRadius || 0}
                  onChange={(e) => onChange({ style: { ...element.style, borderRadius: e.target.value } })}
                  placeholder="0 or 50%"
                />
              </div>
              <div className="space-y-1">
                <Label>BG Color</Label>
                <Input
                  type="color"
                  value={element.style?.backgroundColor || "transparent"}
                  onChange={(e) => onChange({ style: { ...element.style, backgroundColor: e.target.value } })}
                  className="h-9 p-1"
                />
              </div>
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Generic Layout */}
      <div className="space-y-4">
        <Label className="text-xs uppercase text-muted-foreground font-bold">Layout</Label>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>X Position</Label>
            <Input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onChange({ x: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label>Y Position</Label>
            <Input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onChange({ y: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>Width</Label>
            <Input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => onChange({ width: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label>Height</Label>
            <Input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => onChange({ height: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <Separator />

      <Button variant="destructive" className="w-full" onClick={onDelete}>
        Delete Element
      </Button>
    </div>
  )
}

"use client"

import { CanvasElement } from "@/components/editor/template-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { GOOGLE_FONTS } from "@/lib/constants/fonts"
import { AlignCenter, ArrowDownToLine } from "lucide-react"

interface ElementPropertiesProps {
  element: CanvasElement | null
  onChange: (updates: Partial<CanvasElement>) => void
  onDelete: () => void
  onLayerChange?: (action: 'front' | 'back' | 'forward' | 'backward') => void
  canvasSize?: { width: number; height: number }
}

export function ElementProperties({ element, onChange, onDelete, onLayerChange, canvasSize }: ElementPropertiesProps) {
  if (!element) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Select an element to edit properties
      </div>
    )
  }

  const handleAlign = (type: 'center-x' | 'center-y') => {
    if (!canvasSize || !element) return
    if (type === 'center-x') {
      onChange({ x: (canvasSize.width - element.width) / 2 })
    }
    if (type === 'center-y') {
      onChange({ y: (canvasSize.height - element.height) / 2 })
    }
  }

  return (
    <div className="space-y-6">
      {/* Text Specific Properties */}
      {element.type === 'text' && (
        <div className="space-y-4">
          <Label className="text-xs uppercase text-muted-foreground font-bold">Typography</Label>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Content</Label>
              <Input
                value={element.content || ''}
                onChange={(e) => onChange({ content: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Font Size</Label>
                <Input
                  type="number"
                  value={parseInt(element.style?.fontSize?.toString() || '16')}
                  onChange={(e) => onChange({
                    style: { ...element.style, fontSize: `${e.target.value}px` }
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-8 h-8 p-0 border-0"
                    value={element.style?.color?.toString() || '#000000'}
                    onChange={(e) => onChange({
                      style: { ...element.style, color: e.target.value }
                    })}
                  />
                  <Input
                    value={element.style?.color?.toString() || '#000000'}
                    onChange={(e) => onChange({
                      style: { ...element.style, color: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Font Family</Label>
              <select
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={element.style?.fontFamily?.toString() || 'Inter'}
                onChange={(e) => onChange({
                  style: { ...element.style, fontFamily: e.target.value }
                })}
              >
                {GOOGLE_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={element.style?.textAlign === 'left' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onChange({ style: { ...element.style, textAlign: 'left' } })}
              >
                Left
              </Button>
              <Button
                variant={element.style?.textAlign === 'center' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onChange({ style: { ...element.style, textAlign: 'center' } })}
              >
                Center
              </Button>
              <Button
                variant={element.style?.textAlign === 'right' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onChange({ style: { ...element.style, textAlign: 'right' } })}
              >
                Right
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant={element.style?.fontWeight === 'bold' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onChange({ style: { ...element.style, fontWeight: element.style?.fontWeight === 'bold' ? 'normal' : 'bold' } })}
              >
                B
              </Button>
              <Button
                variant={element.style?.fontStyle === 'italic' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onChange({ style: { ...element.style, fontStyle: element.style?.fontStyle === 'italic' ? 'normal' : 'italic' } })}
              >
                I
              </Button>
              <Button
                variant={element.style?.textDecoration === 'underline' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onChange({ style: { ...element.style, textDecoration: element.style?.textDecoration === 'underline' ? 'none' : 'underline' } })}
              >
                U
              </Button>
            </div>
          </div>
          <Separator />
        </div>
      )}

      {/* Image Specific Properties */}
      {element.type === 'image' && (
        <div className="space-y-4">
          <Label className="text-xs uppercase text-muted-foreground font-bold">Image Settings</Label>

          <div className="space-y-2">
            {(!element.isDynamic) && (
              <>
                <Label>Source URL</Label>
                <Input
                  value={element.src || ''}
                  onChange={(e) => onChange({ src: e.target.value })}
                  placeholder="https://..."
                />
                <div className="text-xs text-muted-foreground my-1">
                  Or upload a new image
                </div>
                <UploadButton onSuccess={(url) => onChange({ src: url })} />
              </>
            )}
            {element.isDynamic && (
              <div className="p-3 border border-dashed rounded bg-muted/20 text-xs text-muted-foreground text-center">
                Image source is determined by the dynamic field value (e.g. user avatar).
              </div>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Border Radius</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={parseInt(element.style?.borderRadius?.toString() || '0')}
                  onChange={(e) => onChange({
                    style: { ...element.style, borderRadius: `${e.target.value}px` }
                  })}
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Border Width</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={parseInt(element.style?.borderWidth?.toString() || '0')}
                  onChange={(e) => onChange({
                    style: { ...element.style, borderWidth: `${e.target.value}px`, borderStyle: 'solid' }
                  })}
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Border Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="w-8 h-8 p-0 border-0"
                  value={element.style?.borderColor?.toString() || '#000000'}
                  onChange={(e) => onChange({
                    style: { ...element.style, borderColor: e.target.value }
                  })}
                />
                <Input
                  value={element.style?.borderColor?.toString() || '#000000'}
                  onChange={(e) => onChange({
                    style: { ...element.style, borderColor: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
          <Separator />
        </div>
      )}

      {/* Generic Layout */}
      <div className="space-y-4">
        <Label className="text-xs uppercase text-muted-foreground font-bold">Layout</Label>

        {canvasSize && (
          <div className="flex gap-2 mb-2">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => handleAlign('center-x')} title="Center Horizontally">
              <AlignCenter className="mr-2 h-3 w-3" /> Center X
            </Button>
            <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => handleAlign('center-y')} title="Center Vertically">
              <ArrowDownToLine className="mr-2 h-3 w-3 rotate-90" /> Center Y
            </Button>
          </div>
        )}

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

        <div className="space-y-1">
          <Label>Opacity</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={Math.round((parseFloat(element.style?.opacity?.toString() || '1')) * 100)}
              onChange={(e) => onChange({
                style: { ...element.style, opacity: (parseInt(e.target.value) / 100).toString() }
              })}
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>

      </div>

      <Separator />

      {/* Data Binding / Dynamic Content */}
      {(element.type === 'text' || element.type === 'image') && (
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Data Binding</Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="is-dynamic"
                  checked={element.isDynamic || false}
                  onCheckedChange={(checked: boolean) => onChange({ isDynamic: checked })}
                />
                <Label htmlFor="is-dynamic" className="text-xs">Dynamic</Label>
              </div>
            </div>

            {element.isDynamic && (
              <div className="space-y-3 p-3 border rounded-md bg-muted/20">
                <div className="space-y-1">
                  <Label className="text-xs">Field Name (Variable ID)</Label>
                  <Input
                    value={element.fieldName || ''}
                    placeholder="e.g., user_name"
                    onChange={(e) => onChange({ fieldName: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Used to map form data. Must be unique.</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Field Label / Description</Label>
                  <Input
                    value={element.fieldDescription || ''}
                    placeholder="e.g., Full Name"
                    onChange={(e) => onChange({ fieldDescription: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Shown in the registration form.</p>
                </div>

                <div className="pt-1">
                  <p className="text-[10px] text-muted-foreground font-mono">ID: {element.id}</p>
                </div>
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      <Button variant="destructive" className="w-full" onClick={onDelete}>
        Delete Element
      </Button>
    </div>
  )
}

// Helper specific to this component for now
import { templatesRequest } from "@/lib/api/requests/templates.request"
import { Loader2, Upload } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

function UploadButton({ onSuccess }: { onSuccess: (url: string) => void }) {
  const params = useParams()
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    toast.loading("Uploading image...")
    try {
      const res = await templatesRequest.uploadAsset(params.id as string, file)
      onSuccess(res.data.url)
      toast.success("Image uploaded")
    } catch (e) {
      console.error(e)
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      toast.dismiss()
    }
  }

  return (
    <div className="relative">
      <Input
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        onChange={handleUpload}
        disabled={uploading}
      />
      <Button variant="secondary" className="w-full" disabled={uploading}>
        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        Upload Image
      </Button>
    </div>
  )
}

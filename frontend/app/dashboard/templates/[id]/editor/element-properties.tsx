"use client"

import { CanvasElement } from "@/components/editor/template-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { GOOGLE_FONTS } from "@/lib/constants/fonts"
import { AlignCenter, ArrowDownToLine, Loader2, Upload } from "lucide-react"

// Helper specific to this component for now
import { templatesRequest } from "@/lib/api/requests/templates.request"
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

interface ElementPropertiesProps {
  element: CanvasElement | null
  onChange: (updates: Partial<CanvasElement>) => void
  onDelete: () => void
  onLayerChange?: (action: 'front' | 'back' | 'forward' | 'backward') => void
  canvasSize?: { width: number; height: number }
}

const COMMON_FIELDS = [
  { label: "Full Name", value: "user_name", description: "Enter your full name" },
  { label: "Email", value: "user_email", description: "name@company.com" },
  { label: "Job Title", value: "user_role", description: "Product Designer" },
  { label: "Company", value: "user_company", description: "Acme Inc." },
  { label: "Ticket Code", value: "ticket_code", description: "TICKET-123" },
  { label: "User Avatar", value: "user_avatar", description: "Upload your photo" },
]

export function ElementProperties({ element, onChange, onDelete, onLayerChange, canvasSize }: ElementPropertiesProps) {
  if (!element) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-full gap-2 opacity-50">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <ArrowDownToLine className="w-5 h-5" />
        </div>
        <p>Select an element to edit properties</p>
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
    <div className="space-y-6 pb-20">
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
                <div className="relative">
                  <Input
                    type="number"
                    value={parseInt(element.style?.fontSize?.toString() || '16')}
                    onChange={(e) => onChange({
                      style: { ...element.style, fontSize: `${e.target.value}px` }
                    })}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">px</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <div className="relative w-9 h-9 shrink-0 overflow-hidden rounded-md border shadow-sm">
                    <Input
                      type="color"
                      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                      value={element.style?.color?.toString() || '#000000'}
                      onChange={(e) => onChange({
                        style: { ...element.style, color: e.target.value }
                      })}
                    />
                  </div>
                  <Input
                    value={element.style?.color?.toString() || '#000000'}
                    onChange={(e) => onChange({
                      style: { ...element.style, color: e.target.value }
                    })}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Font Family</Label>
              <Select
                value={element.style?.fontFamily?.toString() || 'Roboto'}
                onValueChange={(val) => onChange({ style: { ...element.style, fontFamily: val } })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {GOOGLE_FONTS.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 p-1 bg-muted/20 rounded-lg border">
              <Button
                variant={element.style?.textAlign === 'left' ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 h-7"
                onClick={() => onChange({ style: { ...element.style, textAlign: 'left' } })}
              >
                Left
              </Button>
              <Button
                variant={element.style?.textAlign === 'center' ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 h-7"
                onClick={() => onChange({ style: { ...element.style, textAlign: 'center' } })}
              >
                Center
              </Button>
              <Button
                variant={element.style?.textAlign === 'right' ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 h-7"
                onClick={() => onChange({ style: { ...element.style, textAlign: 'right' } })}
              >
                Right
              </Button>
            </div>

            <div className="flex gap-2 p-1 bg-muted/20 rounded-lg border">
              <Button
                variant={element.style?.fontWeight === 'bold' ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 h-7 font-bold"
                onClick={() => onChange({ style: { ...element.style, fontWeight: element.style?.fontWeight === 'bold' ? 'normal' : 'bold' } })}
              >
                B
              </Button>
              <Button
                variant={element.style?.fontStyle === 'italic' ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 h-7 italic"
                onClick={() => onChange({ style: { ...element.style, fontStyle: element.style?.fontStyle === 'italic' ? 'normal' : 'italic' } })}
              >
                I
              </Button>
              <Button
                variant={element.style?.textDecoration === 'underline' ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 h-7 underline"
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
            {!element.isDynamic && (
              <>
                <Label>Source URL</Label>
                <div className="space-y-2">
                  <Input
                    value={element.src || ''}
                    onChange={(e) => onChange({ src: e.target.value })}
                    placeholder="https://..."
                  />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or upload</span>
                    </div>
                  </div>
                  <UploadButton onSuccess={(url) => onChange({ src: url })} />
                </div>
              </>
            )}
            {element.isDynamic && (
              <div className="p-3 border border-dashed rounded bg-blue-50/50 text-xs text-blue-700 text-center">
                This image will be replaced by the user's input (e.g. Avatar).
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

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Border Width</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={parseInt(element.style?.borderWidth?.toString() || '0')}
                    onChange={(e) => onChange({
                      style: { ...element.style, borderWidth: `${e.target.value}px`, borderStyle: 'solid' }
                    })}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">px</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Border Color</Label>
                <div className="flex gap-2">
                  <div className="relative w-9 h-9 shrink-0 overflow-hidden rounded-md border shadow-sm">
                    <Input
                      type="color"
                      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                      value={element.style?.borderColor?.toString() || '#000000'}
                      onChange={(e) => onChange({
                        style: { ...element.style, borderColor: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Separator />
        </div>
      )}
      {/* Shape Specific Properties */}
      {element.type === 'shape' && (
        <div className="space-y-4">
          <Label className="text-xs uppercase text-muted-foreground font-bold">Shape Settings</Label>
          <div className="space-y-1">
            <Label>Fill Color</Label>
            <div className="flex gap-2">
              <div className="relative w-9 h-9 shrink-0 overflow-hidden rounded-md border shadow-sm">
                <Input
                  type="color"
                  className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                  value={element.style?.backgroundColor?.toString() || '#000000'}
                  onChange={(e) => onChange({
                    style: { ...element.style, backgroundColor: e.target.value }
                  })}
                />
              </div>
              <Input
                value={element.style?.backgroundColor?.toString() || '#000000'}
                onChange={(e) => onChange({
                  style: { ...element.style, backgroundColor: e.target.value }
                })}
                className="font-mono flex-1"
              />
            </div>
          </div>
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
          <Separator />
        </div>
      )}

      {/* Generic Layout */}
      <div className="space-y-4">
        <Label className="text-xs uppercase text-muted-foreground font-bold">Layout & Position</Label>

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
            <Label className="text-xs text-muted-foreground">X</Label>
            <Input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onChange({ x: parseInt(e.target.value) })}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Y</Label>
            <Input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onChange({ y: parseInt(e.target.value) })}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Width</Label>
            <Input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => onChange({ width: parseInt(e.target.value) })}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Height</Label>
            <Input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => onChange({ height: parseInt(e.target.value) })}
              className="h-8"
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
                <Label htmlFor="is-dynamic" className="text-xs font-medium">Dynamic</Label>
              </div>
            </div>

            {element.isDynamic && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30 border-border">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground">Preset Fields</Label>
                  <Select
                    onValueChange={(val) => {
                      const field = COMMON_FIELDS.find(f => f.value === val)
                      if (field) {
                        onChange({
                          fieldName: field.value,
                          fieldDescription: field.description,
                          fieldLabel: field.label
                        })
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 bg-background">
                      <SelectValue placeholder="Quick select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_FIELDS.map(f => (
                        <SelectItem key={f.value} value={f.value}>
                          <div className="flex flex-col items-start text-left">
                            <span className="font-medium">{f.label}</span>
                            <span className="text-[10px] text-muted-foreground">{f.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-muted px-2 text-muted-foreground font-medium">Or Custom</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Field Label (Public)</Label>
                    <Input
                      value={element.fieldLabel || ''}
                      placeholder="e.g., Full Name"
                      onChange={(e) => onChange({ fieldLabel: e.target.value })}
                      className="bg-background h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Placeholder / Description</Label>
                    <Input
                      value={element.fieldDescription || ''}
                      placeholder="e.g., Enter your full name"
                      onChange={(e) => onChange({ fieldDescription: e.target.value })}
                      className="bg-background h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Variable Name (Internal)</Label>
                    <Input
                      value={element.fieldName || ''}
                      placeholder="e.g., user_name"
                      onChange={(e) => onChange({ fieldName: e.target.value })}
                      className="bg-background h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Layer Management */}
      <div className="space-y-4">
        <Label className="text-xs uppercase text-muted-foreground font-bold">Layering</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onLayerChange?.('forward')}>Bring Forward</Button>
          <Button variant="outline" size="sm" onClick={() => onLayerChange?.('backward')}>Send Backward</Button>
          <Button variant="outline" size="sm" onClick={() => onLayerChange?.('front')}>Bring to Front</Button>
          <Button variant="outline" size="sm" onClick={() => onLayerChange?.('back')}>Send to Back</Button>
        </div>
      </div>

      <Button variant="destructive" className="w-full mt-8" onClick={onDelete}>
        Delete Element
      </Button>
    </div>
  )
}



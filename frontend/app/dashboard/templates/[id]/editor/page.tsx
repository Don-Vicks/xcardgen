"use client"

import { FontLoader } from "@/components/font-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Template, templatesRequest } from "@/lib/api/requests/templates.request"
import { ArrowLeft, Braces, Circle, Image as ImageIcon, Minus, Save, Square, Type, UserRound } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { Rnd } from "react-rnd"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { ElementProperties } from "./element-properties"

export type CanvasElement = {
  id: string
  type: "text" | "image" | "qrcode" | "shape"
  x: number
  y: number
  width: number
  height: number
  content?: string
  src?: string
  style?: React.CSSProperties
  isDynamic?: boolean
  fieldName?: string
  fieldDescription?: string
}

export default function TemplateEditorPage() {
  const { id } = useParams()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [scale, setScale] = useState(1)

  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await templatesRequest.getOne(id as string)
        setTemplate(res.data)
        if (res.data.canvasData) {
          setElements(res.data.canvasData as CanvasElement[])
        }
      } catch (error) {
        toast.error("Failed to load template")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  useEffect(() => {
    if (!template?.properties?.width || !containerRef.current) return

    const fitCanvas = () => {
      const parent = containerRef.current
      if (!parent) return

      const padding = 64
      const availWidth = parent.clientWidth - padding
      const availHeight = parent.clientHeight - padding

      const contentWidth = template.properties?.width || 600
      const contentHeight = template.properties?.height || 400

      const scaleX = availWidth / contentWidth
      const scaleY = availHeight / contentHeight

      const newScale = Math.min(scaleX, scaleY, 1)
      setScale(newScale)
    }

    fitCanvas()
    window.addEventListener('resize', fitCanvas)
    return () => window.removeEventListener('resize', fitCanvas)
  }, [template?.properties])

  const usedFonts = useMemo(() => {
    return elements
      .map(el => el.style?.fontFamily)
      .filter((f): f is string => !!f)
  }, [elements])


  const handleAddElement = (preset: "text" | "variable" | "image" | "avatar" | "box" | "circle" | "line") => {
    let type: CanvasElement['type'] = "text"
    let width = 200
    let height = 50
    let content = undefined
    let style: React.CSSProperties = {}
    let isDynamic = false

    switch (preset) {
      case "text":
        type = "text"
        width = 200
        content = "Static Text"
        style = { fontSize: 24, color: "#000000", fontWeight: "normal", textAlign: "left", fontFamily: "Roboto" }
        break
      case "variable":
        type = "text"
        width = 300
        content = "{{ name }}"
        style = { fontSize: 32, color: "#000000", fontWeight: "bold", textAlign: "left", fontFamily: "Roboto" }
        isDynamic = true
        break
      case "image":
        type = "image"
        width = 150
        height = 150
        style = { borderRadius: 0 }
        break
      case "avatar":
        type = "image"
        width = 200
        height = 200
        style = { borderRadius: "50%", objectFit: "cover" }
        isDynamic = true
        break
      case "box":
        type = "shape"
        width = 100
        height = 100
        style = { backgroundColor: "#000000", borderRadius: 0 }
        break
      case "circle":
        type = "shape"
        width = 100
        height = 100
        style = { backgroundColor: "#000000", borderRadius: "50%" }
        break
      case "line":
        type = "shape"
        width = 200
        height = 4
        style = { backgroundColor: "#000000", borderRadius: 0 }
        break
    }

    const newEl: CanvasElement = {
      id: uuidv4(),
      type: type,
      x: 50,
      y: 50,
      width,
      height,
      content,
      style,
      isDynamic
    }
    setElements([...elements, newEl])
    setSelectedId(newEl.id)
  }

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const handleSave = async () => {
    if (!template) return
    setSaving(true)
    try {
      await templatesRequest.update(id as string, {
        name: template.name,
        backgroundImage: template.backgroundImage,
        canvasData: elements,
        properties: template.properties,
      })
      toast.success("Template saved!")
    } catch (error) {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteElement = () => {
    if (selectedId) {
      setElements(prev => prev.filter(el => el.id !== selectedId))
      setSelectedId(null)
    }
  }

  const selectedElement = elements.find(el => el.id === selectedId) || null

  if (loading || !template) return <LoadingScreen />

  // Resize Handle Component
  const ResizeHandle = () => (
    <div className="w-2.5 h-2.5 bg-white border border-blue-500 rounded-full shadow-sm" />
  )

  return (
    <div className="h-screen flex flex-col bg-muted/10 overflow-hidden">
      <FontLoader fonts={usedFonts} />

      {/* Header */}
      <header className="h-14 border-b bg-background flex items-center justify-between px-4 z-10 basis-14 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <Input
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="h-7 w-64 border-transparent hover:border-input focus:border-input shadow-none font-semibold text-sm px-2 focus-visible:ring-1 transition-all"
              placeholder="Untitled Template"
            />
            <span className="text-xs text-muted-foreground">Template Editor</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-16 border-r bg-background flex flex-col items-center py-4 gap-4 z-10 shrink-0 overflow-y-auto">
          {/* Background Upload Trigger */}
          <div className="relative group flex flex-col items-center gap-1 mb-4" title="Upload Design">
            <Button variant="outline" size="icon" className="h-12 w-12 text-foreground border-dashed border-2 hover:border-solid hover:border-primary hover:bg-primary/10 transition-all rounded-xl">
              <ImageIcon className="h-6 w-6" />
            </Button>
            <span className="text-[10px] text-center w-full leading-tight text-muted-foreground group-hover:text-primary font-medium mt-1">Upload<br />Design</span>
            <Input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const toastId = toast.loading("Uploading...")
                try {
                  const { uploadToCloudinary } = await import("@/lib/cloudinary")
                  const url = await uploadToCloudinary(file)

                  const img = new window.Image()
                  img.src = url
                  img.onload = () => {
                    setTemplate(prev => prev ? {
                      ...prev,
                      backgroundImage: url,
                      properties: {
                        ...prev.properties,
                        width: img.naturalWidth,
                        height: img.naturalHeight
                      }
                    } : null)
                    toast.success("Background & Size updated", { id: toastId })
                  }
                } catch (err) {
                  toast.error("Upload failed", { id: toastId })
                }
              }}
            />
          </div>

          <div className="w-8 h-[1px] bg-border my-2" />

          {/* Core User Inputs */}
          <Button variant="ghost" size="icon" className="h-12 w-12 mb-2 text-primary hover:bg-primary/10" onClick={() => handleAddElement("avatar")} title="Add User Avatar">
            <UserRound className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="h-12 w-12 mb-2 text-primary hover:bg-primary/10" onClick={() => handleAddElement("variable")} title="Add User Name">
            <Braces className="h-6 w-6" />
          </Button>

          <div className="w-8 h-[1px] bg-border my-2" />

          {/* Helpers */}
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => handleAddElement("text")} title="Add Static Text">
            <Type className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => handleAddElement("image")} title="Add Static Image">
            <ImageIcon className="h-5 w-5" />
          </Button>

          <div className="w-8 h-[1px] bg-border my-2" />

          {/* Static Elements */}
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => handleAddElement("box")} title="Add Box">
            <Square className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => handleAddElement("circle")} title="Add Circle">
            <Circle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => handleAddElement("line")} title="Add Line">
            <Minus className="h-5 w-5" />
          </Button>

        </aside>

        {/* Canvas Area */}
        <main className="flex-1 bg-muted/20 relative overflow-hidden flex items-center justify-center p-8" ref={containerRef}>
          <div
            className="relative shadow-2xl bg-white select-none transition-transform duration-200 ease-out origin-center box-border border-4 border-transparent"
            style={{
              width: `${template.properties?.width || 600}px`,
              height: `${template.properties?.height || 400}px`,
              backgroundImage: `url(${template.backgroundImage})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              transform: `scale(${scale})`
            }}
            ref={canvasRef}
            onClick={() => setSelectedId(null)}
          >
            {elements.map(el => (
              <Rnd
                key={el.id}
                size={{ width: el.width, height: el.height }}
                position={{ x: el.x, y: el.y }}
                scale={scale} // Important for Rnd to work correctly when scaled
                onDragStop={(e, d) => {
                  handleUpdateElement(el.id, { x: d.x, y: d.y })
                  setSelectedId(el.id)
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  handleUpdateElement(el.id, {
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    ...position,
                  })
                  setSelectedId(el.id)
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  setSelectedId(el.id)
                }}
                resizeHandleComponent={{
                  topLeft: selectedId === el.id ? <ResizeHandle /> : null,
                  topRight: selectedId === el.id ? <ResizeHandle /> : null,
                  bottomLeft: selectedId === el.id ? <ResizeHandle /> : null,
                  bottomRight: selectedId === el.id ? <ResizeHandle /> : null,
                }}
                bounds="parent"
                className={`group ${selectedId === el.id ? "z-50" : "z-10"}`}
              >
                <div
                  className={`w-full h-full flex items-center justify-center overflow-hidden transition-all duration-200
                    ${selectedId === el.id ? "ring-2 ring-primary ring-offset-2" : "hover:ring-1 hover:ring-primary/50"}
                    ${el.isDynamic ? "border-2 border-dashed border-blue-500/50 bg-blue-50/20" : ""}
                  `}
                  style={el.style}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(el.id);
                  }}
                >
                  {/* Dynamic Label Badge */}
                  {el.isDynamic && (
                    <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-t-md font-bold tracking-wider shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      USER INPUT
                    </div>
                  )}

                  {el.type === "text" && (
                    <span className="w-full break-words select-none pointer-events-none" style={{ lineHeight: 1.2 }}>
                      {el.content}
                    </span>
                  )}
                  {el.type === "image" && (
                    <div className="w-full h-full flex items-center justify-center" style={{ borderRadius: el.style?.borderRadius }}>
                      {el.isDynamic && !el.src ? (
                        <div className="flex flex-col items-center text-blue-600/50">
                          <UserRound className="w-1/2 h-1/2" />
                          {selectedId === el.id && <span className="text-[10px] font-bold mt-1">AVATAR</span>}
                        </div>
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                      )}
                    </div>
                  )}
                  {el.type === "shape" && (
                    <div className="w-full h-full" style={{ backgroundColor: el.style?.backgroundColor, borderRadius: el.style?.borderRadius }} />
                  )}
                </div>
              </Rnd>
            ))}
          </div>
        </main>

        {/* Right Properties Panel */}
        <aside className="w-72 border-l bg-background overflow-y-auto p-4 shrink-0 transition-all">
          <ElementProperties
            element={selectedElement}
            onChange={(updates) => handleUpdateElement(selectedId!, updates)}
            onDelete={handleDeleteElement}
          />
        </aside>
      </div>
    </div>
  )
}

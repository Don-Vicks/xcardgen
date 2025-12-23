"use client"

import { ElementProperties } from "@/app/dashboard/templates/[id]/editor/element-properties"
import { CanvasRenderer } from "@/components/canvas-renderer"
import { FontLoader } from "@/components/font-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useHistory } from "@/hooks/use-history"
import { useSnapping } from "@/hooks/use-snapping"
import { Template } from "@/lib/api/requests/templates.request"
import { GOOGLE_FONTS } from "@/lib/constants/fonts"
import { toPng } from "html-to-image"
import { ArrowLeft, Braces, Check, Circle, Download, Eye, Image as ImageIcon, Loader2, Minus, Monitor, Pencil, QrCode, Redo, Save, Square, Type, Undo, UserRound, ZoomIn, ZoomOut } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import QRCode from "react-qr-code"
import { Rnd } from "react-rnd"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

// Re-export or import types if shared
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
  fieldLabel?: string
}

interface TemplateEditorProps {
  initialData: Template
  onSave: (data: Partial<Template>) => Promise<void>
  onBack?: () => void
  backLink?: string
  saveButtonLabel?: string
  backLabel?: string
}

export function TemplateEditor({ initialData, onSave, onBack, backLink = "/dashboard/templates", saveButtonLabel = "Save", backLabel }: TemplateEditorProps) {
  const [template, setTemplate] = useState<Template>(initialData)

  // Undo/Redo History State
  const {
    state: elements,
    set: setElements,
    replace: replaceElements,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  } = useHistory<CanvasElement[]>((initialData.canvasData as CanvasElement[]) || [])

  const { guides, getSnapLines, setGuides, clearGuides } = useSnapping({
    canvasWidth: template?.properties?.width || 600,
    canvasHeight: template?.properties?.height || 400,
  })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [scale, setScale] = useState(1)
  const [isPreview, setIsPreview] = useState(false) // Preview Mode State
  const hiddenCanvasRef = useRef<HTMLDivElement>(null)

  // Sample values for testing
  const sampleValues = useMemo(() => ({
    name: "John Doe",
    email: "john@example.com",
    role: "Software Engineer",
    company: "Acme Corp",
    ticket_code: "XC-88219",
    user_name: "John Doe",
    user_email: "john@example.com",
    user_role: "Software Engineer",
    user_company: "Acme Corp",
    user_avatar: `https://avatar.vercel.sh/${template.name}`
  }), [template.name])

  const handleDownloadSample = async () => {
    if (!hiddenCanvasRef.current) return
    const toastId = toast.loading("Generating sample...")
    try {
      // 1. Force fonts to be ready
      await document.fonts.ready

      // 2. Convert hidden renderer to PNG
      const dataUrl = await toPng(hiddenCanvasRef.current, { cacheBust: true, pixelRatio: 2 })

      const link = document.createElement('a')
      link.download = `${template.name}-sample.png`
      link.href = dataUrl
      link.click()
      toast.success("Sample downloaded", { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error("Failed to generate sample", { id: toastId })
    }
  }

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<number>(Date.now())
  const hasUnsavedChanges = useRef(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fit canvas logic
  const fitCanvas = useCallback(() => {
    if (!containerRef.current || !template?.properties?.width) return
    const parent = containerRef.current
    const padding = 64
    const availWidth = parent.clientWidth - padding
    const availHeight = parent.clientHeight - padding
    const contentWidth = template.properties?.width || 600
    const contentHeight = template.properties?.height || 400
    const scaleX = availWidth / contentWidth
    const scaleY = availHeight / contentHeight
    const newScale = Math.min(scaleX, scaleY, 1) // Allow up to 100% or fit
    setScale(newScale)
  }, [template?.properties])

  useEffect(() => {
    if (template?.properties?.width) {
      fitCanvas()
    }
    window.addEventListener('resize', fitCanvas)
    return () => window.removeEventListener('resize', fitCanvas)
  }, [template?.properties, fitCanvas])

  const usedFonts = useMemo(() => {
    const fromElements = elements
      .map(el => el.style?.fontFamily)
      .filter((f): f is string => !!f)
    // Merge with all available fonts to ensure previews work in the dropdown
    return [...fromElements, ...GOOGLE_FONTS]
  }, [elements])

  // Z-Index Handling
  const handleZIndex = (action: 'front' | 'back' | 'forward' | 'backward') => {
    if (!selectedId) return

    setElements(prev => {
      const index = prev.findIndex(el => el.id === selectedId)
      if (index === -1) return prev

      const newElements = [...prev]
      const [el] = newElements.splice(index, 1)

      if (action === 'front') {
        newElements.push(el)
      } else if (action === 'back') {
        newElements.unshift(el)
      }

      return newElements
    })
  }

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && !isPreview) {
          setElements(prev => prev.filter(el => el.id !== selectedId))
          setSelectedId(null)
        }
      }

      if (e.key === 'Escape') {
        setSelectedId(null)
      }

      // Undo/Redo Shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          if (!isPreview) redo()
        } else {
          if (!isPreview) undo()
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault()
        if (!isPreview) redo()
      }

      const MOVE_STEP = e.shiftKey ? 10 : 1
      if (selectedId && !isPreview) {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          handleUpdateElement(selectedId, { y: elements.find(el => el.id === selectedId)!.y - MOVE_STEP })
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          handleUpdateElement(selectedId, { y: elements.find(el => el.id === selectedId)!.y + MOVE_STEP })
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          handleUpdateElement(selectedId, { x: elements.find(el => el.id === selectedId)!.x - MOVE_STEP })
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          handleUpdateElement(selectedId, { x: elements.find(el => el.id === selectedId)!.x + MOVE_STEP })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, elements, isPreview])


  // Auto-save Logic
  useEffect(() => {
    hasUnsavedChanges.current = true
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(async () => {
      if (hasUnsavedChanges.current && template) {
        setSaving(true)
        try {
          await onSave({
            name: template.name,
            backgroundImage: template.backgroundImage,
            canvasData: elements,
            properties: template.properties,
          })
          setLastSaved(Date.now())
          hasUnsavedChanges.current = false
        } catch (err) {
          console.error("Auto-save failed", err)
        } finally {
          setTimeout(() => setSaving(false), 800)
        }
      }
    }, 3000)
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [elements, template?.name, template?.backgroundImage, template?.properties])


  const handleAddElement = (preset: "text" | "variable" | "image" | "avatar" | "box" | "circle" | "line" | "qrcode") => {
    if (isPreview) {
      toast.info("Switch to Edit mode to add elements")
      return
    }

    let type: CanvasElement['type'] = "text"
    let width = 200
    let height = 50
    let content = undefined
    let style: React.CSSProperties = {}
    let isDynamic = false
    let fieldName: string | undefined = undefined
    let fieldDescription: string | undefined = undefined

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
        fieldName = "user_name"
        fieldDescription = "Full Name"
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
        fieldName = "user_avatar"
        fieldDescription = "User Avatar"
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
      case "qrcode":
        type = "qrcode"
        width = 150
        height = 150
        content = "https://xcardgen.com"
        style = { color: "#000000", backgroundColor: "#ffffff" }
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
      isDynamic,
      fieldName,
      fieldDescription
    }
    setElements([...elements, newEl])
    setSelectedId(newEl.id)
  }

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    if (isPreview) return
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const handleManualSave = async () => {
    if (!template) return
    const invalid = elements.filter(el => el.isDynamic && !el.fieldDescription?.trim())
    if (invalid.length > 0) {
      toast.error("Missing Description for Dynamic Elements", {
        description: "All user input fields must have a description."
      })
      return
    }

    setSaving(true)
    try {
      await onSave({
        name: template.name,
        backgroundImage: template.backgroundImage,
        canvasData: elements,
        properties: template.properties,
      })
      toast.success("Design saved!")
      hasUnsavedChanges.current = false
    } catch (error) {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteElement = () => {
    if (selectedId && !isPreview) {
      setElements(prev => prev.filter(el => el.id !== selectedId))
      setSelectedId(null)
    }
  }

  // Preview Logic: Substitute variables with dummy content
  const getPreviewContent = (el: CanvasElement) => {
    if (!el.isDynamic) return el.content

    // Simple heuristic dummy data generator
    if (el.content?.includes("name")) return "John Doe"
    if (el.content?.includes("role") || el.content?.includes("title")) return "Software Engineer"
    if (el.content?.includes("company")) return "Acme Corp"
    if (el.content?.includes("email")) return "john@example.com"

    return el.content // Fallback if no specific dummy data found
  }

  const selectedElement = elements.find(el => el.id === selectedId) || null

  const ResizeHandle = () => (
    <div className="w-2.5 h-2.5 bg-white border border-blue-500 rounded-full shadow-sm" />
  )

  return (
    <div className="h-full w-full flex flex-col bg-neutral-100/50 overflow-hidden font-sans relative">
      <FontLoader fonts={usedFonts} />

      {/* Hidden Renderer for clean export */}
      <div style={{ position: 'absolute', top: -9999, left: -9999, visibility: 'hidden' }}>
        <div ref={hiddenCanvasRef}>
          <CanvasRenderer
            elements={elements}
            width={template.properties?.width || 600}
            height={template.properties?.height || 400}
            backgroundImage={template.backgroundImage}
            values={sampleValues}
            scale={1}
          />
        </div>
      </div>

      {/* Header */}
      <header className="h-14 border-b bg-background flex items-center justify-between px-4 z-10 basis-14 shrink-0 shadow-sm gap-2">
        <div className="flex items-center gap-2 sm:gap-4 shrink min-w-0">
          {onBack ? (
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href={backLink}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}

          <div className="flex flex-col min-w-0 flex-1">
            <Input
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="h-7 w-32 sm:w-64 border-transparent hover:border-input focus:border-input shadow-none font-semibold text-sm px-2 focus-visible:ring-1 transition-all truncate"
              placeholder="Untitled Design"
              disabled={isPreview}
            />
            <div className="hidden sm:flex items-center gap-2 mt-0.5 px-2 h-4">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Editor</span>
              <span className="text-muted-foreground/20 text-[10px]">|</span>
              {saving ? (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border border-blue-100 animate-in fade-in zoom-in-95 duration-200">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground/50 text-[10px] transition-all animate-in fade-in duration-300">
                  <Check className="w-2.5 h-2.5" />
                  Saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">

          {/* Download Sample Button - Only in Preview */}
          {isPreview && (
            <Button variant="outline" size="sm" className="h-8 gap-2 mr-2" onClick={handleDownloadSample}>
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download Sample</span>
            </Button>
          )}

          {/* Preview Toggle */}
          <Button
            variant={isPreview ? "default" : "outline"}
            size="sm"
            className={`h-8 gap-2 mr-2 ${isPreview ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
            onClick={() => {
              setIsPreview(!isPreview)
              if (!isPreview) setSelectedId(null) // Deselect on entering preview
            }}
            title={isPreview ? "Back to Edit" : "Preview with Data"}
          >
            {isPreview ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isPreview ? "Edit" : "Preview"}</span>
          </Button>

          {/* Undo/Redo Controls - Hide in Preview & Hide on Mobile */}
          {!isPreview && (
            <div className="hidden md:flex items-center gap-0.5 mr-2 border-r pr-3 border-border/50">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button onClick={handleManualSave} disabled={saving || isPreview} size="sm" className="h-8">
            <Save className="mr-2 h-3.5 w-3.5" />
            <span className="hidden sm:inline">{saving ? "Saving..." : saveButtonLabel}</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className={`w-16 border-r bg-background flex flex-col items-center py-4 gap-4 z-10 shrink-0 overflow-y-auto shadow-sm transition-all duration-300 ${isPreview ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          {/* Background Upload Trigger */}
          <div className="relative group flex flex-col items-center gap-1 mb-4" title="Upload Design">
            <Button variant="outline" size="icon" className="h-12 w-12 text-foreground border-dashed border-2 hover:border-solid hover:border-primary hover:bg-primary/10 transition-all rounded-xl shadow-sm">
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
                      properties: { ...prev.properties, width: img.naturalWidth, height: img.naturalHeight }
                    } : prev)
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
          <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-primary/10" onClick={() => handleAddElement("avatar")} title="Add User Avatar">
            <UserRound className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-primary/10" onClick={() => handleAddElement("variable")} title="Add User Name">
            <Braces className="h-6 w-6" />
          </Button>

          <Separator className="w-8 my-2" />

          {/* Helpers */}
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => handleAddElement("text")} title="Add Static Text">
            <Type className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => handleAddElement("image")} title="Add Static Image">
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" onClick={() => handleAddElement("qrcode")} title="Add QR Code">
            <QrCode className="h-5 w-5" />
          </Button>

          <Separator className="w-8 my-2" />

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
        <main className="flex-1 bg-muted/20 relative overflow-hidden flex items-center justify-center p-8 active:cursor-grab" ref={containerRef}>
          {/* Floating Zoom Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-card text-card-foreground p-1.5 rounded-full shadow-lg border border-border animate-in slide-in-from-bottom-4 duration-300">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setScale(s => Math.max(0.1, s - 0.1))} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center select-none text-muted-foreground">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setScale(s => Math.min(3, s + 0.1))} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={fitCanvas} title="Fit to Screen">
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview Badge */}
          {isPreview && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full shadow-lg text-sm font-medium z-50 tracking-wide flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
              <Eye className="w-4 h-4" /> Preview Mode
            </div>
          )}

          <div
            className="relative shadow-2xl bg-white select-none transition-transform duration-200 ease-out origin-center box-border border-4 border-transparent"
            style={{
              width: `${template.properties?.width || 600}px`,
              height: `${template.properties?.height || 400}px`,
              position: 'absolute',
              top: '50%',
              left: '50%',
              backgroundImage: `url(${template.backgroundImage})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              transform: `translate(-50%, -50%) scale(${scale})`,
              transformOrigin: 'center center',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            }}
            ref={canvasRef}
            onClick={() => !isPreview && setSelectedId(null)}
          >
            {/* Alignment Guides - only in edit mode */}
            {!isPreview && guides.map((guide, i) => (
              <div
                key={i}
                className={`absolute bg-pink-500 z-[9999] pointer-events-none ${guide.type === 'vertical' ? 'w-[1px] h-full top-0' : 'h-[1px] w-full left-0'}`}
                style={guide.type === 'vertical' ? { left: guide.position } : { top: guide.position }}
              />
            ))}

            {elements.map(el => {
              if (isPreview) {
                // Static Render for Preview Mode
                return (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute',
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      ...el.style,
                      cursor: 'default'
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      {el.type === "text" && (
                        <span className="w-full break-words" style={{ lineHeight: 1.2 }}>
                          {getPreviewContent(el)}
                        </span>
                      )}
                      {el.type === "image" && (
                        <div
                          className="w-full h-full flex items-center justify-center overflow-hidden"
                          style={{ borderRadius: el.style?.borderRadius }}
                        >
                          {el.src ? (
                            <img src={el.src} alt="Element" className="w-full h-full object-cover" />
                          ) : el.isDynamic ? (
                            // Mock Avatar for Preview
                            <img src={`https://avatar.vercel.sh/${template.name}`} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            // Empty placeholder hidden in preview or show default
                            <div className="bg-muted/10 w-full h-full" />
                          )}
                        </div>
                      )}
                      {el.type === "shape" && (
                        <div className="w-full h-full" style={{ backgroundColor: el.style?.backgroundColor, borderRadius: el.style?.borderRadius }} />
                      )}
                      {el.type === "qrcode" && (
                        <div className="w-full h-full p-2 flex items-center justify-center" style={{ backgroundColor: el.style?.backgroundColor }}>
                          <QRCode
                            value={el.content || "https://example.com"}
                            size={256}
                            style={{ height: "100%", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                            fgColor={el.style?.color}
                            bgColor={el.style?.backgroundColor}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              // Interactive Rnd for Edit Mode
              return (
                <Rnd
                  key={el.id}
                  size={{ width: el.width, height: el.height }}
                  position={{ x: el.x, y: el.y }}
                  scale={scale}
                  onDrag={(e, d) => {
                    const { x, y, guides } = getSnapLines(d.x, d.y, el.width, el.height)
                    setGuides(guides)
                    // Use replace -> updates state without history entry
                    replaceElements(prev => prev.map(item => item.id === el.id ? { ...item, x, y } : item))
                  }}
                  onDragStop={(e, d) => {
                    const { x, y } = getSnapLines(d.x, d.y, el.width, el.height)
                    clearGuides()
                    // Use standard update -> commits to history
                    handleUpdateElement(el.id, { x, y })
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
                    topLeft: selectedId === el.id ? <ResizeHandle /> : undefined,
                    topRight: selectedId === el.id ? <ResizeHandle /> : undefined,
                    bottomLeft: selectedId === el.id ? <ResizeHandle /> : undefined,
                    bottomRight: selectedId === el.id ? <ResizeHandle /> : undefined,
                  }}
                  bounds="parent"
                  className="group"
                >
                  <div
                    className={`w-full h-full flex items-center justify-center overflow-hidden transition-all duration-200 cursor-move
                    ${selectedId === el.id ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent" : "hover:ring-1 hover:ring-blue-500/50"}
                    ${el.isDynamic && !parseInt(el.style?.borderWidth as string || "0") ? "border-2 border-dashed border-blue-500/50" : ""}
                    ${el.isDynamic && !el.style?.backgroundColor ? "bg-blue-50/20" : ""}
                  `}
                    style={el.style}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(el.id);
                    }}
                  >
                    {/* Move Handle Indicator */}
                    {selectedId === el.id && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white p-1 rounded-full shadow-md z-50 pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}


                    {/* Dynamic Label Badge */}
                    {el.isDynamic && (
                      <div className="absolute -bottom-6 left-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-b-md font-bold tracking-wider shadow-sm transition-opacity">
                        USER INPUT
                      </div>
                    )}

                    {el.type === "text" && (
                      <span className="w-full break-words select-none pointer-events-none" style={{ lineHeight: 1.2 }}>
                        {el.content}
                      </span>
                    )}
                    {el.type === "image" && (
                      <div
                        className={`w-full h-full flex items-center justify-center overflow-hidden ${!el.src ? "bg-muted/50 border border-border backdrop-blur-sm" : ""}`}
                        style={{ borderRadius: el.style?.borderRadius }}
                      >
                        {el.src ? (
                          <img src={el.src} alt="Element" className="w-full h-full object-cover" />
                        ) : el.isDynamic ? (
                          <div className="flex flex-col items-center text-primary">
                            <UserRound className="w-1/2 h-1/2 opacity-70" />
                            <span className="text-[10px] font-bold mt-1 bg-background/80 px-1 rounded shadow-sm text-foreground">AVATAR</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-muted-foreground">
                            <ImageIcon className="h-8 w-8 opacity-50" />
                            <span className="text-[10px] font-medium mt-1 bg-background/50 px-1 rounded text-foreground">IMAGE</span>
                          </div>
                        )}
                      </div>
                    )}
                    {el.type === "shape" && (
                      <div className="w-full h-full" style={{ backgroundColor: el.style?.backgroundColor, borderRadius: el.style?.borderRadius }} />
                    )}
                    {el.type === "qrcode" && (
                      <div className="w-full h-full p-2 flex items-center justify-center" style={{ backgroundColor: el.style?.backgroundColor }}>
                        <QRCode
                          value={el.content || "https://example.com"}
                          size={256}
                          style={{ height: "100%", maxWidth: "100%", width: "100%" }}
                          viewBox={`0 0 256 256`}
                          fgColor={el.style?.color}
                          bgColor={el.style?.backgroundColor}
                        />
                      </div>
                    )}
                  </div>
                </Rnd>
              )
            })}
          </div>
        </main>

        {/* Right Properties Panel */}
        <aside className={`w-72 border-l bg-background overflow-y-auto p-4 shrink-0 transition-all shadow-sm z-20 ${isPreview ? 'opacity-50 pointer-events-none' : ''}`}>
          <ElementProperties
            element={selectedElement}
            onChange={(updates) => handleUpdateElement(selectedId!, updates)}
            onDelete={handleDeleteElement}
            onLayerChange={handleZIndex}
            canvasSize={template.properties ? { width: template.properties.width || 0, height: template.properties.height || 0 } : undefined}
          />
        </aside>
      </div>
    </div>
  )
}

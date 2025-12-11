"use client"

import { FontLoader } from "@/components/font-loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageCropper } from "@/components/ui/image-cropper"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { eventsRequest } from "@/lib/api/requests/events.request"
import { Template } from "@/lib/api/requests/templates.request"
import { useGeneratedCardStore } from "@/store/generated-card.store"
import confetti from "canvas-confetti"
import { format } from "date-fns"
import { CalendarIcon, Download, Facebook, Image as ImageIcon, Linkedin, Loader2, Mail, MessageCircle, Share2, Sparkles, Twitter, Upload, User } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CanvasRenderer } from "../canvas-renderer"

interface EventRegistrationViewProps {
  event: any // Replace with proper Event type
  template: Template | null
}

export function EventRegistrationView({ event, template }: EventRegistrationViewProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)

  const { addCard, getCard, removeCard } = useGeneratedCardStore()

  const dynamicFields = (template?.canvasData?.filter((el: any) => el.isDynamic || el.type === 'variable') || [])
    .sort((a: any, b: any) => {
      // Prioritize Text elements, push Images to the end
      if (a.type === 'text' && b.type !== 'text') return -1
      if (a.type !== 'text' && b.type === 'text') return 1
      return 0
    })
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    setValues(prev => ({
      ...prev,
      name: name,
    }))
  }, [name])

  // Initialize from store if exists
  useEffect(() => {
    const storedData = getCard(event.id)
    if (storedData) {
      if (storedData.url) setGeneratedUrl(storedData.url)
      if (storedData.name) setName(storedData.name)
      if (storedData.email) setEmail(storedData.email)
      if (storedData.values) setValues(storedData.values)
    }
  }, [event.id, getCard])

  // Store file objects for upload
  const [files, setFiles] = useState<Record<string, File>>({})

  // Cropper State
  const [cropperOpen, setCropperOpen] = useState(false)
  const [fileToCrop, setFileToCrop] = useState<{ key: string, src: string } | null>(null)

  useEffect(() => {
    // Track Visit
    const trackVisit = async () => {
      try {
        await eventsRequest.recordVisit(event.id)
      } catch (e) {
        console.error("Failed to track visit", e)
      }
    }
    trackVisit()
  }, [event.id])

  // Add debounced persistence for form values (optional, but good for UX)
  // For now, let's persist on successful generation to keep it simple as store is "GeneratedCard" store.
  // Although user asked for "persistence... so live preview will be up to date". 
  // If they reload BEFORE generating, they might expect data to be there? 
  // The current store is "generated-card.store", implying it stores AFTER generation. 
  // But to support "live preview persistence", we should probably update checks.
  // Let's stick to saving on generation first, as that confirms "intent". 
  // OR: We can update store on every change if we want true draft persistence. 
  // Let's do it on Generate success for now, as that's safe. If user wants draft, we need a separate store or logic.
  // Re-reading request: "persistence... make it contain some data so that the live preview will be up to date". This usually implies AFTER they generate and come back, they see their card.

  const handleFileSelect = (key: string, file: File) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setFileToCrop({ key, src: reader.result?.toString() || "" })
      setCropperOpen(true)
    })
    reader.readAsDataURL(file)
  }

  const handleCropComplete = (croppedFile: File, croppedUrl: string) => {
    if (!fileToCrop) return
    setValues(prev => ({ ...prev, [fileToCrop.key]: croppedUrl }))
    setFiles(prev => ({ ...prev, [fileToCrop.key]: croppedFile }))
    setFileToCrop(null)
    setCropperOpen(false) // just to be sure
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) {
      toast.error("Please enter your name and email")
      return
    }

    // Validate dynamic fields
    const missingFields = []
    for (const field of dynamicFields) {
      if (field.fieldName === 'name' || field.content === '{{ name }}') continue

      const key = field.fieldName || (field.content ? field.content.replace(/[{}]/g, '').trim() : `field_${field.id}`)
      if (!values[key]) {
        missingFields.push(field.fieldDescription || key)
      }
    }

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      // 1. Upload any pending files
      const finalValues = { ...values }

      const fileUploadPromises = Object.entries(files).map(async ([key, file]) => {
        try {
          const res = await eventsRequest.uploadAsset(event.id, file)
          if (res.data.url) {
            finalValues[key] = res.data.url
          }
        } catch (err) {
          console.error(`Failed to upload ${key}`, err)
          throw new Error(`Failed to upload ${key}`)
        }
      })

      if (fileUploadPromises.length > 0) {
        toast.info("Uploading assets...")
        await Promise.all(fileUploadPromises)
      }

      // 2. Register
      const res = await eventsRequest.register(event.id, { name, email, data: finalValues })
      setGeneratedUrl(res.data.url)

      // Save full state to store
      addCard(event.id, {
        url: res.data.url,
        name,
        email,
        values: finalValues
      })

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      toast.success("xCard Generated!")
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || "Failed to generate"
      toast.error(`Error: ${msg}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedUrl) return
    try {
      const response = await fetch(generatedUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `xcard-${event.slug}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Track Download
      eventsRequest.recordDownload(event.id).catch(console.error)
    } catch (e) {
      console.error(e)
      toast.error("Download failed. Try opening the image in a new tab.")
      window.open(generatedUrl, '_blank')
    }
  }

  const handleShare = async () => {
    if (!generatedUrl) return

    // Track Share
    eventsRequest.recordShare(event.id).catch(console.error)

    const shareData = {
      title: event.name,
      text: `I just registered for ${event.name}! Get your xCard here:`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (e) {
        console.error("Share canceled", e)
      }
    } else {
      // Fallback
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
      } catch (e) {
        toast.error("Failed to copy link")
      }
    }
  }

  const shareLinks = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just registered for ${event.name}! Get your xCard here:`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`I just registered for ${event.name}! Get your xCard here: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`
  }

  const openShare = (url: string) => window.open(url, '_blank', 'width=600,height=400')

  const handleGenerateNew = () => {
    removeCard(event.id)
    setGeneratedUrl(null)
    setName("")
    setEmail("")
    setValues({})
  }

  const usedFonts = template?.canvasData
    ? (template.canvasData as any[]).map(el => el.style?.fontFamily).filter(Boolean)
    : []

  if (!template) {
    return (
      <div className="flex h-screen items-center justify-center p-8 text-center bg-background">
        <Card className="max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Registration Not Ready</CardTitle>
            <CardDescription>The organizer hasn't designed an xCard for this event yet.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (event.status !== 'PUBLISHED') {
    return (
      <div className="flex h-screen items-center justify-center p-8 text-center bg-background font-sans">
        <Card className="max-w-md shadow-2xl border-none ring-1 ring-black/5">
          <CardHeader className="space-y-4 pb-8">
            <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-2">
              <CalendarIcon className="w-8 h-8 opacity-50" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Registration Unavailable</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              This event is currently not accepting registrations. Please contact the organizer for more information.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const workspace = event.workspace

  // Stats
  const attendeeCount = (event._count?.attendees || 0) + (event.stats?.generations || 0)
  const displayCount = event._count?.attendees ?? event.stats?.generations ?? 0

  return (
    <div className="min-h-[100dvh] lg:h-screen flex flex-col lg:flex-row bg-background font-sans text-foreground lg:overflow-hidden">
      <FontLoader fonts={usedFonts} />

      {/* Left: Content */}
      <div className="flex-1 w-full lg:overflow-hidden flex flex-col">
        <div className="h-full w-full lg:overflow-y-auto custom-scrollbar">
          <div className="flex flex-col p-6 lg:p-12 pb-10 lg:pb-12">
            <div className="max-w-xl mx-auto w-full space-y-8">

              {/* Organizer Badge */}
              <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border shadow-sm w-fit animate-in fade-in slide-in-from-top-4 duration-700">
                {workspace?.logo ? (
                  <img src={workspace.logo} alt={workspace.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {workspace?.name?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-muted-foreground">
                  Hosted by <span className="text-foreground font-semibold">{workspace?.name || "Organizer"}</span>
                </span>
              </div>

              {/* Header */}
              <div className="space-y-2">
                {/* <div className="flex items-center gap-2 mb-4">
                  {event.workspace?.logo && (
                    <img src={event.workspace.logo} className="h-8 w-auto" alt="Logo" />
                  )}
                </div> */}
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-heading text-foreground">
                  {event.name}
                </h1>
                {event.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full border shadow-sm">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span>{format(new Date(event.date), "MMMM d, yyyy")}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                  <p>{event.description}</p>
                </div>
              )}

              {/* Stats / Social Proof */}
              <div className="flex items-center gap-4 py-4 border-y border-border/50">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <img
                      key={i}
                      src={`https://avatar.vercel.sh/${event.id}-${i}?size=60`}
                      className="w-8 h-8 rounded-full border-2 border-background bg-muted object-cover"
                      alt="Attendee"
                    />
                  ))}
                  {displayCount > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                      +{displayCount - 3}
                    </div>
                  )}
                </div>
                <div className="text-sm text-foreground">
                  <span className="font-bold">{displayCount} people</span> are attending
                </div>
              </div>

              {/* Mobile Preview */}
              <div className="lg:hidden w-full flex justify-center py-4">
                <div className="relative shadow-lg rounded-xl overflow-hidden ring-1 ring-black/5 w-full max-w-[350px]">
                  <CanvasRenderer
                    elements={template.canvasData as any}
                    width={template.properties?.width || 600}
                    height={template.properties?.height || 400}
                    backgroundImage={template.backgroundImage}
                    values={values}
                    scale={Math.min(1, 350 / (template.properties?.width || 600))}
                  />
                </div>
              </div>

              {/* Form Card */}
              <Card className="border-0 shadow-2xl shadow-primary/5 ring-1 ring-border/50 bg-card overflow-hidden relative isolate">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
                <CardContent className="p-6 lg:p-8">
                  {!generatedUrl ? (
                    <form onSubmit={handleGenerate} className="space-y-6">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="font-medium">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="name"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              required
                              className="h-12 pl-10 bg-input/50 focus:bg-background transition-all text-base"
                              placeholder="e.g. Jane Doe"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="font-medium">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              required
                              className="h-12 pl-10 bg-input/50 focus:bg-background transition-all text-base"
                              placeholder="jane@example.com"
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground pt-1">
                            * These details are for event registration and won't appear on the card unless added below.
                          </p>
                        </div>

                        {dynamicFields.map((field: any) => {
                          if (field.fieldName === 'name' || field.content === '{{ name }}') return null;
                          const key = field.fieldName || (field.content ? field.content.replace(/[{}]/g, '').trim() : `field_${field.id}`)
                          return (
                            <div key={field.id} className="space-y-2">
                              <Label htmlFor={key} className="text-muted-foreground font-medium capitalize flex items-center gap-2">
                                {key}
                                {field.type === 'image' && <span className="text-xs font-normal text-muted-foreground/70">(Image)</span>}
                              </Label>

                              {field.type === 'image' ? (
                                <div className="group relative">
                                  <Input
                                    id={key}
                                    type="file"
                                    accept="image/*"
                                    disabled={loading}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        handleFileSelect(key, file)
                                        e.target.value = ''
                                      }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  />
                                  <div className={`
                                   border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center flex flex-col items-center justify-center gap-2
                                   ${values[key] ? 'border-primary/50 bg-primary/5' : 'border-border bg-input/20 hover:bg-accent hover:border-accent-foreground/50'}
                                `}>
                                    {values[key] ? (
                                      <div className="relative w-full aspect-video sm:aspect-[2/1] rounded-lg overflow-hidden shadow-sm">
                                        <img src={values[key]} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <div className="bg-white/90 backdrop-blur text-slate-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                                            <Upload className="w-4 h-4" /> Change / Crop
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="w-12 h-12 rounded-full bg-card shadow-sm border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                                          <ImageIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-foreground">Click to upload {key}</p>
                                          <p className="text-xs text-muted-foreground">JPG or PNG (rec. square)</p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <Input
                                  id={key}
                                  placeholder={field.fieldDescription || `Enter ${key}`}
                                  value={values[key] || ''}
                                  onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                                  className="h-12 bg-input/50 border-input focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all text-base"
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>

                      <Button type="submit" size="lg" className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.01] bg-gradient-to-r from-primary to-violet-600 border-0 text-primary-foreground" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            Generate Ticket
                            <Sparkles className="ml-2 h-5 w-5 animate-pulse" />
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_1s_ease-in-out_infinite]">
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">You're on the list!</h3>
                        <p className="text-muted-foreground">Your unique xCard is ready below.</p>
                      </div>

                      <div className="grid gap-3">
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="lg" className="flex-1 h-12 border-border hover:bg-accent hover:text-accent-foreground" onClick={handleDownload}>
                            <Download className="mr-2 h-5 w-5" />
                            Download
                          </Button>
                          <Button size="lg" className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200" onClick={handleShare}>
                            <Share2 className="mr-2 h-5 w-5" />
                            Share
                          </Button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <Button variant="outline" className="h-12 border-border hover:bg-accent hover:text-accent-foreground" onClick={() => openShare(shareLinks.x)}>
                            <Twitter className="w-5 h-5" />
                          </Button>
                          <Button variant="outline" className="h-12 border-border hover:bg-accent hover:text-accent-foreground" onClick={() => openShare(shareLinks.linkedin)}>
                            <Linkedin className="w-5 h-5" />
                          </Button>
                          <Button variant="outline" className="h-12 border-border hover:bg-accent hover:text-accent-foreground" onClick={() => openShare(shareLinks.facebook)}>
                            <Facebook className="w-5 h-5" />
                          </Button>
                          <Button variant="outline" className="h-12 border-border hover:bg-accent hover:text-accent-foreground" onClick={() => openShare(shareLinks.whatsapp)}>
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                        </div>

                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={handleGenerateNew}>
                          Generate new xCard
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 text-center text-xs text-muted-foreground">
              Powered by <span className="font-semibold text-foreground">xCardGen</span>
            </div>
          </div>
          {/* Scroll Hint Overlay (Desktop) */}
          <div className="hidden lg:flex absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none items-end justify-center pb-6">
            <div className="animate-bounce text-muted-foreground flex flex-col items-center gap-1">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="w-px h-8 bg-border" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="flex-1 bg-muted/30 relative hidden lg:flex items-center justify-center p-8 overflow-hidden">
        <div className="absolute inset-0 pattern-grid-lg opacity-[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent h-32 bottom-0" />

        <div className="sticky top-12 max-h-[calc(100vh-6rem)] w-full flex flex-col items-center justify-center h-full">
          <div className="mb-8 text-center space-y-1">
            <Badge variant="secondary" className="bg-card shadow-sm text-muted-foreground font-medium px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
              Live Preview
            </Badge>
          </div>

          <div className="relative shadow-2xl rounded-xl overflow-hidden ring-1 ring-black/5 transition-all duration-500 ease-out transform hover:scale-[1.02] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)]">
            <CanvasRenderer
              elements={template.canvasData as any}
              width={template.properties?.width || 600}
              height={template.properties?.height || 400}
              backgroundImage={template.backgroundImage}
              values={values}
              scale={Math.min(1, 650 / (template.properties?.width || 600))}
            />
          </div>
        </div>
      </div>
      <ImageCropper
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={fileToCrop?.src || null}
        onCropComplete={handleCropComplete}
        aspect={1}
      />
    </div>
  )
}

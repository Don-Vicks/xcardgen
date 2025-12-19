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
import { getButtonStyle, getCardStyle, getThemeStyles } from "@/lib/theme-utils"
import { useGeneratedCardStore } from "@/stores/generated-card.store"
import confetti from "canvas-confetti"
import { format } from "date-fns"
import { CalendarIcon, Download, Facebook, Image as ImageIcon, Linkedin, Loader2, Mail, MessageCircle, Share2, Sparkles, Twitter, Upload, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CanvasRenderer } from "../canvas-renderer"
import { AnimatedBackground } from "./animated-background"

interface EventRegistrationViewProps {
  event: any // Replace with proper Event type
  template: Template | null
  isEmbed?: boolean
}

function CountdownTimer({ targetDate, themeStyles }: { targetDate: Date, themeStyles: any }) {
  const [timeLeft, setTimeLeft] = useState<any>({})
  const [isMounted, setIsMounted] = useState(false)

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date()
    let timeLeft = {}

    if (difference > 0) {
      timeLeft = {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60),
      }
    }
    return timeLeft
  }

  useEffect(() => {
    setIsMounted(true)
    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, []) // Empty dependency array to run once on mount

  // Format with leading zeros
  const formatTime = (time: number) => (time < 10 ? `0${time}` : time)

  // Don't render until mounted on client to avoid hydration mismatch
  if (!isMounted || Object.keys(timeLeft).length === 0) {
    return null
  }

  return (
    <div className="flex gap-2">
      {Object.keys(timeLeft).map((interval, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-lg sm:text-xl font-bold shadow-sm backdrop-blur-sm border"
            style={{
              backgroundColor: themeStyles.cardBg,
              borderColor: themeStyles.borderColor,
              color: themeStyles.textColor
            }}
          >
            {/* @ts-ignore */}
            {formatTime(timeLeft[interval])}
          </div>
          <span className="text-[10px] uppercase font-medium mt-1 opacity-70" style={{ color: themeStyles.mutedColor }}>
            {interval}
          </span>
        </div>
      ))}
    </div>
  )
}


export function EventRegistrationView({ event, template, isEmbed = false }: EventRegistrationViewProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [generationId, setGenerationId] = useState<string | null>(null)

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
      setGenerationId(res.data.generationId)

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
      eventsRequest.recordDownload(event.id, generationId || undefined).catch(console.error)
    } catch (e) {
      console.error(e)
      toast.error("Download failed. Try opening the image in a new tab.")
      window.open(generatedUrl, '_blank')
    }
  }

  const handleShare = async () => {
    if (!generatedUrl) return

    // Track Share
    eventsRequest.recordShare(event.id, 'share_api', generationId || undefined).catch(console.error)

    try {
      // Try to share the image file if possible
      if (navigator.share && navigator.canShare && generatedUrl) {
        try {
          const response = await fetch(generatedUrl)
          const blob = await response.blob()
          const file = new File([blob], 'xcard.png', { type: 'image/png' })

          const shareData = {
            files: [file],
            title: event.name,
            text: `I just registered for ${event.name}! Check out my xCard!`,
          }

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData)
            return
          }
        } catch (e) {
          console.warn("File sharing failed, falling back to link", e)
        }
      }

      // Fallback to link sharing
      const shareData = {
        title: event.name,
        text: `I just registered for ${event.name}! Get your xCard here:`,
        url: window.location.href,
      }

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        throw new Error("Share API not available")
      }
    } catch (e) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
      } catch (err) {
        console.error("Copy failed", err)
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

  const workspace = event.workspace

  // Stats
  const attendeeCount = (event._count?.attendees || 0) + (event.stats?.generations || 0)
  const displayCount = event._count?.attendees ?? event.stats?.generations ?? 0

  // Check if event is in the past
  const eventDate = new Date(event.date)
  const cutoffDate = event.endDate ? new Date(event.endDate) : new Date(event.date)
  // Allow registration until the end of the day
  cutoffDate.setHours(23, 59, 59, 999)

  const isPastEvent = cutoffDate < new Date()

  // Get theme styles from appearance settings
  // Default to minimal theme if not set
  const themeStyles = getThemeStyles(event.appearance)
  const buttonStyle = getButtonStyle(event.appearance)
  const cardStyle = getCardStyle(event.appearance)

  return (
    <div
      className="min-h-dvh lg:h-screen flex flex-col lg:flex-row font-sans lg:overflow-hidden relative"
      style={{
        background: themeStyles.background,
        color: themeStyles.textColor,
        '--placeholder-color': themeStyles.mutedColor,
      } as React.CSSProperties}
    >
      <AnimatedBackground theme={event.appearance?.theme} primaryColor={event.appearance?.primaryColor} />
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: themeStyles.overlay }}
      />
      <FontLoader fonts={usedFonts} />

      {/* Left: Content */}
      <div className="flex-1 w-full lg:overflow-hidden flex flex-col relative z-10">
        <div className="h-full w-full lg:overflow-y-auto custom-scrollbar">
          <div className="flex flex-col p-4 sm:p-6 lg:p-12 pb-10 lg:pb-12">
            <div className="max-w-xl mx-auto w-full space-y-8">

              {/* Organizer Badge - Hide on embed */}
              {!isEmbed && (
                <div
                  className="flex items-center gap-3 px-4 py-2 rounded-full border shadow-sm w-fit animate-in fade-in slide-in-from-top-4 duration-700 backdrop-blur-sm"
                  style={{
                    backgroundColor: themeStyles.cardBg,
                    borderColor: themeStyles.borderColor
                  }}
                >
                  {workspace?.logo ? (
                    <img src={workspace.logo} alt={workspace.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: `${themeStyles.textColor}20`, color: themeStyles.textColor }}
                    >
                      {workspace?.name?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  {workspace?.slug ? (
                    <span className="text-sm font-medium" style={{ color: themeStyles.mutedColor }}>
                      Hosted by{" "}
                      <Link
                        href={`/${workspace.slug}`}
                        className="font-semibold hover:underline underline-offset-4 decoration-2"
                        style={{ color: themeStyles.textColor, textDecorationColor: themeStyles.primaryColor }}
                      >
                        {workspace?.name || "Organizer"}
                      </Link>
                    </span>
                  ) : (
                    <span className="text-sm font-medium" style={{ color: themeStyles.mutedColor }}>
                      Hosted by{" "}
                      <span className="font-semibold" style={{ color: themeStyles.textColor }}>
                        {workspace?.name || "Organizer"}
                      </span>
                    </span>
                  )}
                </div>
              )}

              {/* Header */}
              <div className="space-y-4">
                {event.coverImage && (
                  <div className="relative w-full aspect-video sm:aspect-[2.5/1] rounded-2xl overflow-hidden shadow-sm border border-border/50">
                    <img
                      src={event.coverImage}
                      alt={event.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
                <h1
                  className="text-4xl lg:text-5xl font-extrabold tracking-tight font-heading"
                  style={{ color: themeStyles.textColor }}
                >
                  {event.name}
                </h1>
                {event.description && (
                  <p className="text-lg leading-relaxed" style={{ color: themeStyles.mutedColor }}>
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm pt-2" style={{ color: themeStyles.mutedColor }}>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-sm"
                    style={{
                      backgroundColor: themeStyles.cardBg,
                      borderColor: themeStyles.borderColor
                    }}
                  >
                    <CalendarIcon className="w-4 h-4" style={{ color: themeStyles.primaryColor }} />
                    <span style={{ color: themeStyles.textColor }}>
                      {format(new Date(event.date), "MMMM d, yyyy")}
                      {event.endDate && ` - ${format(new Date(event.endDate), "MMMM d, yyyy")}`}
                    </span>
                  </div>
                </div>
              </div>



              {/* Stats / Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-y border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="ring-2 ring-background rounded-full">
                        <img
                          src={`https://avatar.vercel.sh/${event.id}-${i}?size=60`}
                          className="w-10 h-10 rounded-full bg-muted object-cover"
                          alt="Attendee"
                        />
                      </div>
                    ))}
                    {displayCount > 3 && (
                      <div className="w-10 h-10 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        +{displayCount - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-sm flex flex-col" style={{ color: themeStyles.textColor }}>
                    <span className="font-bold text-base leading-none">{displayCount}</span>
                    <span className="opacity-70 text-xs uppercase tracking-wide">Attendees</span>
                  </div>
                </div>

                {/* Countdown Timer */}
                <CountdownTimer targetDate={new Date(event.date)} themeStyles={themeStyles} />
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
                    scale={Math.min(1, 300 / (template.properties?.width || 600))}
                  />
                </div>
              </div>

              {/* Form Card or Status Message */}
              <Card
                className="overflow-hidden relative isolate transition-all duration-300"
                style={cardStyle}
              >
                <CardContent className="p-6 lg:p-8">
                  {event.status !== 'PUBLISHED' ? (
                    <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in-95 duration-500">
                      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: `${themeStyles.textColor}10` }}>
                        <CalendarIcon className="w-8 h-8 opacity-50" style={{ color: themeStyles.textColor }} />
                      </div>
                      <h3 className="text-xl font-bold" style={{ color: themeStyles.textColor }}>Registration Unavailable</h3>
                      <p className="text-sm opacity-80 max-w-xs mx-auto" style={{ color: themeStyles.mutedColor }}>
                        This event is currently not accepting registrations. Please check back later or contact the organizer.
                      </p>
                    </div>
                  ) : isPastEvent ? (
                    <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in-95 duration-500">
                      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: `${themeStyles.textColor}10` }}>
                        <CalendarIcon className="w-8 h-8 opacity-50" style={{ color: themeStyles.textColor }} />
                      </div>
                      <h3 className="text-xl font-bold" style={{ color: themeStyles.textColor }}>Event Ended</h3>
                      <p className="text-sm opacity-80 max-w-xs mx-auto" style={{ color: themeStyles.mutedColor }}>
                        This event ended on {format(cutoffDate, "MMMM d, yyyy")}. Registration is now closed.
                      </p>
                    </div>
                  ) : !generatedUrl ? (
                    <form onSubmit={handleGenerate} className="space-y-6">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="font-medium" style={{ color: themeStyles.textColor }}>Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5" style={{ color: themeStyles.mutedColor }} />
                            <Input
                              id="name"
                              value={name}
                              onChange={e => setName(e.target.value)}
                              required
                              className="h-12 pl-10 focus:ring-2 transition-all text-base placeholder:text-(--placeholder-color)"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderColor: themeStyles.borderColor,
                                color: themeStyles.textColor
                              }}
                              placeholder="e.g. Jane Doe"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="font-medium" style={{ color: themeStyles.textColor }}>Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5" style={{ color: themeStyles.mutedColor }} />
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              required
                              className="h-12 pl-10 focus:ring-2 transition-all text-base placeholder:text-(--placeholder-color)"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderColor: themeStyles.borderColor,
                                color: themeStyles.textColor
                              }}
                              placeholder="jane@example.com"
                            />
                          </div>
                          <p className="text-[10px] pt-1" style={{ color: themeStyles.mutedColor }}>
                            * These details are for event registration and won't appear on the card unless added below.
                          </p>
                        </div>

                        {dynamicFields.map((field: any) => {
                          if (field.fieldName === 'name' || field.content === '{{ name }}') return null;
                          const key = field.fieldName || (field.content ? field.content.replace(/[{}]/g, '').trim() : `field_${field.id}`)
                          // Fallback to capitalizing the key if no label is provided
                          const displayLabel = field.fieldLabel || key.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

                          return (
                            <div key={field.id} className="space-y-2">
                              <Label htmlFor={key} className="font-medium flex items-center gap-2" style={{ color: themeStyles.textColor }}>
                                {displayLabel}
                                {field.type === 'image' && <span className="text-xs font-normal opacity-70">(Image)</span>}
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
                                  <div
                                    className={`border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center flex flex-col items-center justify-center gap-2`}
                                    style={{
                                      borderColor: values[key] ? themeStyles.primaryColor : themeStyles.borderColor,
                                      backgroundColor: values[key] ? `${themeStyles.primaryColor}10` : 'rgba(255,255,255,0.05)'
                                    }}
                                  >
                                    {values[key] ? (
                                      <div className="relative w-full aspect-video sm:aspect-2/1 rounded-lg overflow-hidden shadow-sm">
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
                                  className="h-12 transition-all text-base placeholder:text-(--placeholder-color)"
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: themeStyles.borderColor,
                                    color: themeStyles.textColor
                                  }}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        style={buttonStyle}
                        className="w-full h-12 text-lg font-semibold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate My xCard
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-green-100/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_1s_ease-in-out_infinite]"
                          style={{ backgroundColor: `${themeStyles.primaryColor}15`, color: themeStyles.primaryColor }}>
                          <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold" style={{ color: themeStyles.textColor }}>You're on the list!</h3>
                        <p style={{ color: themeStyles.mutedColor }}>Your unique xCard is ready below.</p>
                      </div>

                      <div className="grid gap-3">
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="lg" className="flex-1 h-12 border-border hover:bg-accent hover:text-accent-foreground" onClick={handleDownload}
                            style={{ borderColor: themeStyles.borderColor, color: themeStyles.textColor }}>
                            <Download className="mr-2 h-5 w-5" />
                            Download
                          </Button>
                          <Button size="lg" className="flex-1 h-12 text-white shadow-md shadow-indigo-200" onClick={handleShare}
                            style={{ backgroundColor: themeStyles.primaryColor, color: '#fff' }}>
                            <Share2 className="mr-2 h-5 w-5" />
                            Share
                          </Button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <Button variant="outline" className="h-12 border-border hover:bg-accent hover:text-accent-foreground" onClick={() => openShare(shareLinks.x)}
                            style={{ borderColor: themeStyles.borderColor, color: themeStyles.textColor }}>
                            <Twitter className="w-5 h-5" />
                          </Button>
                          <Button variant="outline" className="h-12 border-border hover:bg-accent hover:text-accent-foreground" onClick={() => openShare(shareLinks.linkedin)}
                            style={{ borderColor: themeStyles.borderColor, color: themeStyles.textColor }}>
                            <Linkedin className="w-5 h-5" />
                          </Button>
                          <Button variant="outline" className="h-12 border-border hover:bg-accent hover:text-accent-foreground" onClick={() => openShare(shareLinks.facebook)}
                            style={{ borderColor: themeStyles.borderColor, color: themeStyles.textColor }}>
                            <Facebook className="w-5 h-5" />
                          </Button>
                          <Button variant="outline" className="h-12 border-border hover:bg-accent hover:text-accent-foreground" onClick={() => openShare(shareLinks.whatsapp)}
                            style={{ borderColor: themeStyles.borderColor, color: themeStyles.textColor }}>
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                        </div>

                        <Button variant="ghost" className="hover:text-foreground" onClick={handleGenerateNew} style={{ color: themeStyles.mutedColor }}>
                          Generate new xCard
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {event.showBranding !== false && (
              <div className="mt-12 text-center text-xs" style={{ color: themeStyles.mutedColor }}>
                Powered by <a href="https://xcardgen.com" target="_blank" className="font-semibold hover:underline" style={{ color: themeStyles.textColor }}>xCardGen</a>
              </div>
            )}
          </div>
          {/* Scroll Hint Overlay (Desktop) */}
          <div className="hidden lg:flex absolute bottom-0 left-0 right-0 h-24 pointer-events-none items-end justify-center pb-6">
            <div className="animate-bounce flex flex-col items-center gap-1" style={{ color: themeStyles.mutedColor }}>
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="w-px h-8 bg-current" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Preview - Hide on embed */}
      {!isEmbed && (
        <div
          className="flex-1 relative hidden lg:flex items-center justify-center p-8 overflow-hidden"
          style={{ backgroundColor: 'rgba(125, 125, 125, 0.05)' }}
        >
          <div className="absolute inset-0 pattern-grid-lg opacity-[0.03]" />

          <div className="sticky top-12 max-h-[calc(100vh-6rem)] w-full flex flex-col items-center justify-center h-full">
            <div className="mb-8 text-center space-y-1">
              <Badge
                variant="secondary"
                className="shadow-sm font-medium px-3 py-1 backdrop-blur-md"
                style={{
                  backgroundColor: themeStyles.cardBg,
                  color: themeStyles.mutedColor,
                  border: `1px solid ${themeStyles.borderColor}`
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full mr-2 animate-pulse" style={{ backgroundColor: themeStyles.primaryColor }} />
                Live Preview
              </Badge>
            </div>

            <div
              className="relative shadow-2xl rounded-xl overflow-hidden ring-1 ring-black/5 transition-all duration-500 ease-out transform hover:scale-[1.02]"
              style={{
                boxShadow: themeStyles.shadow,
                borderColor: themeStyles.borderColor,
                '--tw-ring-color': themeStyles.borderColor,
              } as React.CSSProperties}
            >
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
      )}
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

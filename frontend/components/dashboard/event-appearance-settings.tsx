"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { eventsRequest } from "@/lib/api/requests/events.request"
import { ThemeId, getButtonStyle, getCardStyle, getThemeStyles } from "@/lib/theme-utils"
import { cn } from "@/lib/utils"
import { Check, Loader2, Palette } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { AnimatedBackground } from "../public/animated-background"


// Theme options for UI
const THEME_OPTIONS: { id: ThemeId; name: string; description: string; previewClass: string }[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and vast white space",
    previewClass: "bg-white border-gray-200",
  },
  {
    id: "futuristic",
    name: "Futuristic",
    description: "Dark neon grid patterns",
    previewClass: "bg-gray-950 border-cyan-500",
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Animated glowing background",
    previewClass: "bg-black border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Warm, rich and refined",
    previewClass: "bg-orange-50/50 border-orange-200",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Neo-brutalist high contrast",
    previewClass: "bg-white border-4 border-black",
  },
  {
    id: "glassmorphism",
    name: "Glass",
    description: "Heavy frosted glass effect",
    previewClass: "bg-gradient-to-br from-blue-400/50 to-purple-500/50 backdrop-blur",
  },
]

// Preset colors
const PRESET_COLORS = [
  "#000000", // Black
  "#DC2626", // Red
  "#EA580C", // Orange
  "#CA8A04", // Yellow
  "#16A34A", // Green
  "#0891B2", // Cyan
  "#2563EB", // Blue
  "#7C3AED", // Purple
  "#DB2777", // Pink
  "#7CFC00", // Neon Green
]

// Preset backgrounds
const PRESET_BACKGROUNDS = [
  "#ffffff", // White
  "#000000", // Black
  "#f8fafc", // Slate 50
  "#020617", // Slate 950
  "#fff1f2", // Rose 50
  "#f0fdf4", // Green 50
  "#fdfbf7", // Warm White
  "#18181b", // Zinc 950
]

interface EventAppearanceSettingsProps {
  event: {
    id: string
    appearance?: {
      theme?: string
      primaryColor?: string
      backgroundColor?: string
      removeBranding?: boolean
    }
  }
  onUpdate?: (appearance: any) => void
}

import { useAuth } from "@/stores/auth-store"
// ... (imports)

// ...

export function EventAppearanceSettings({ event, onUpdate }: EventAppearanceSettingsProps) {
  const { user } = useAuth()
  const planCtx = user?.subscription?.plan
  const canRemoveBranding = planCtx?.features?.canRemoveBranding || false
  const canCustomizeTheme = planCtx?.features?.canCustomizeTheme || false
  const [selectedTheme, setSelectedTheme] = useState(event.appearance?.theme || "minimal")

  function PremiumOverlay({ label = "Pro Feature" }: { label?: string }) {
    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg border border-dashed border-primary/20">
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{label}</h4>
            <p className="text-xs text-muted-foreground w-[200px]">
              Unlock custom themes & colors with Pro.
            </p>
          </div>
          <Button size="sm" className="mt-2" asChild>
            <a href="/dashboard/billing">Upgrade Plan</a>
          </Button>
        </div>
      </div>
    )
  }
  // ...
  const [primaryColor, setPrimaryColor] = useState(event.appearance?.primaryColor || "#000000")
  const [backgroundColor, setBackgroundColor] = useState(event.appearance?.backgroundColor || "")
  const [removeBranding, setRemoveBranding] = useState(event.appearance?.removeBranding || false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const appearance = {
        theme: selectedTheme,
        primaryColor,
        backgroundColor: backgroundColor || undefined,
        removeBranding: canRemoveBranding ? removeBranding : false, // Only save if user has permission
      }

      await eventsRequest.update(event.id, { appearance })

      toast.success("Appearance settings saved!")
      onUpdate?.(appearance)
    } catch (error) {
      console.error(error)
      toast.error("Failed to save appearance settings")
    } finally {
      setSaving(false)
    }
  }

  const previewAppearance = { theme: selectedTheme as ThemeId, primaryColor, backgroundColor }
  const previewStyles = getThemeStyles(previewAppearance)
  const cardStyle = getCardStyle(previewAppearance)
  const buttonStyle = getButtonStyle(previewAppearance)

  return (
    <div className="space-y-8">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Page Theme
          </CardTitle>
          <CardDescription>
            Choose a theme for your public event page
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {!canCustomizeTheme && <PremiumOverlay label="Custom Themes Locked" />}
          <div className={!canCustomizeTheme ? "blur-sm opacity-50 pointer-events-none" : ""}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    "relative rounded-xl p-1 transition-all hover:scale-105 text-left",
                    selectedTheme === theme.id
                      ? "ring-2 ring-primary ring-offset-2"
                      : "ring-1 ring-border hover:ring-primary/50"
                  )}
                >
                  {/* Theme Preview */}
                  <div
                    className={cn(
                      "aspect-4/3 rounded-lg flex items-center justify-center",
                      theme.previewClass
                    )}
                  >
                    <div className="w-8 h-10 rounded bg-current opacity-20" />
                  </div>

                  {/* Theme Name */}
                  <div className="p-2 text-center">
                    <p className="font-medium text-sm">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </div>

                  {/* Selected Indicator */}
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Accent Color</CardTitle>
          <CardDescription>
            Choose a primary color for buttons and highlights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {!canCustomizeTheme && <PremiumOverlay label="Custom Colors Locked" />}
          <div className={!canCustomizeTheme ? "blur-sm opacity-50 pointer-events-none" : ""}>
            {/* Preset Colors */}
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setPrimaryColor(color)}
                  className={cn(
                    "h-10 w-10 rounded-full transition-all hover:scale-110",
                    primaryColor === color
                      ? "ring-2 ring-offset-2 ring-primary scale-110"
                      : "ring-1 ring-border"
                  )}
                  style={{ backgroundColor: color }}
                >
                  {primaryColor === color && (
                    <Check className={cn(
                      "h-5 w-5 mx-auto",
                      ["#000000", "#2563EB", "#7C3AED"].includes(color)
                        ? "text-white"
                        : "text-black"
                    )} />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-4">
              <Label htmlFor="custom-color" className="text-sm text-muted-foreground">
                Custom:
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="custom-color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-14 rounded cursor-pointer border-0"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-28 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding / Watermark */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Manage xCardGen branding on your event page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/40">
            <div className="space-y-1">
              <Label htmlFor="branding-toggle" className="text-base">Hide xCardGen Branding</Label>
              <p className="text-sm text-muted-foreground">
                {canRemoveBranding
                  ? "Remove the 'Powered by xCardGen' badge from your event page."
                  : "Upgrade to Pro to remove the 'Powered by xCardGen' badge."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!canRemoveBranding && (
                <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">Pro Feature</span>
              )}
              <Switch
                id="branding-toggle"
                checked={removeBranding}
                onCheckedChange={setRemoveBranding}
                disabled={!canRemoveBranding}
                className={!canRemoveBranding ? "opacity-50" : ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Color Selection (Existing) */}
      <Card>
        <CardHeader>
          <CardTitle>Background Color</CardTitle>
          <CardDescription>
            Override the default theme background (Optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {!canCustomizeTheme && <PremiumOverlay label="Backgrounds Locked" />}
          <div className={!canCustomizeTheme ? "blur-sm opacity-50 pointer-events-none" : ""}>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setBackgroundColor("")}
                className={cn(
                  "h-10 px-3 rounded-lg border text-sm font-medium transition-all hover:bg-accent",
                  !backgroundColor
                    ? "ring-2 ring-offset-2 ring-primary"
                    : ""
                )}
              >
                Default
              </button>
              {PRESET_BACKGROUNDS.map((color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={cn(
                    "h-10 w-10 rounded-full transition-all hover:scale-110 border",
                    backgroundColor === color
                      ? "ring-2 ring-offset-2 ring-primary scale-110"
                      : "ring-1 ring-border"
                  )}
                  style={{ backgroundColor: color }}
                >
                  {backgroundColor === color && (
                    <Check className={cn(
                      "h-4 w-4 mx-auto",
                      isLightColor(color) ? "text-black" : "text-white"
                    )} />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Label htmlFor="custom-bg" className="text-sm text-muted-foreground">
                Custom:
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="custom-bg"
                  value={backgroundColor || "#ffffff"}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-10 w-14 rounded cursor-pointer border-0"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-28 font-mono text-sm"
                  placeholder="Default"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            How your event page will look
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-xl overflow-hidden border relative isolate font-sans"
            style={{
              background: previewStyles.background,
              color: previewStyles.textColor,
              height: "600px",
              display: "flex",
              flexDirection: "column",
              '--placeholder-color': previewStyles.mutedColor,
            } as React.CSSProperties}
          >
            <AnimatedBackground theme={selectedTheme} primaryColor={primaryColor} />

            {/* Content Container - Mimicking EventRegistrationView Left Side */}
            <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar p-6 md:p-8 flex flex-col items-center">
              <div className="w-full max-w-md space-y-8">

                {/* Header Section */}
                <div className="space-y-4 text-center sm:text-left">
                  {/* Title */}
                  <h1
                    className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading"
                    style={{ color: previewStyles.textColor }}
                  >
                    {(event as any).name || "Event Name"}
                  </h1>

                  {/* Description */}
                  <p className="text-base md:text-lg leading-relaxed line-clamp-3" style={{ color: previewStyles.mutedColor }}>
                    {(event as any).description || "Event description will appear here. Join us for an amazing experience!"}
                  </p>

                  {/* Date Badge */}
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-sm pt-2" style={{ color: previewStyles.mutedColor }}>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-sm"
                      style={{
                        backgroundColor: previewStyles.cardBg,
                        borderColor: previewStyles.borderColor
                      }}
                    >
                      <span style={{ color: previewStyles.textColor }}>
                        {(event as any).date ? new Date((event as any).date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "December 25, 2025"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Proof & Countdown Stub */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-y border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px]" style={{ borderColor: previewStyles.cardBg }}>
                          👤
                        </div>
                      ))}
                    </div>
                    <div className="text-xs" style={{ color: previewStyles.textColor }}>
                      <span className="font-bold">128+</span> Attendees
                    </div>
                  </div>
                  {/* Mock Countdown */}
                  <div className="flex gap-1" style={{ color: previewStyles.textColor }}>
                    {['05', '23', '11'].map((t, i) => (
                      <div key={i} className="px-2 py-1 rounded border text-xs font-bold" style={{ backgroundColor: previewStyles.cardBg, borderColor: previewStyles.borderColor }}>{t}</div>
                    ))}
                  </div>
                </div>

                {/* Form Card */}
                <Card
                  className="overflow-hidden relative isolate transition-all w-full"
                  style={cardStyle}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label style={{ color: previewStyles.textColor }}>Full Name</Label>
                      <Input
                        placeholder="e.g. Jane Doe"
                        className="h-10 border-0"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: previewStyles.textColor,
                          outline: `1px solid ${previewStyles.borderColor}`
                        }}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label style={{ color: previewStyles.textColor }}>Email Address</Label>
                      <Input
                        placeholder="jane@example.com"
                        className="h-10 border-0"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: previewStyles.textColor,
                          outline: `1px solid ${previewStyles.borderColor}`
                        }}
                        readOnly
                      />
                    </div>

                    <Button
                      style={buttonStyle}
                      className="w-full h-10 font-semibold mt-4"
                    >
                      Generate xCard
                    </Button>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Appearance
        </Button>
      </div>
    </div >
  )
}
// Basic helper for contrast in settings component
function isLightColor(hex: string): boolean {
  try {
    const c = hex.replace('#', '')
    const r = parseInt(c.substring(0, 2), 16)
    const g = parseInt(c.substring(2, 4), 16)
    const b = parseInt(c.substring(4, 6), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return true
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 155
  } catch (e) { return true }
}

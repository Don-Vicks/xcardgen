"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { workspacesRequest } from "@/lib/api/requests/workspaces.request"
import { ThemeId, getButtonStyle, getThemeStyles } from "@/lib/theme-utils"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/auth-store"
import { Check, Loader2, Palette } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { AnimatedBackground } from "../public/animated-background"

// Shared CONSTANTS (Could be extracted)
const THEME_OPTIONS: { id: ThemeId; name: string; description: string; previewClass: string }[] = [
  { id: "minimal", name: "Minimal", description: "Clean and vast white space", previewClass: "bg-white border-gray-200" },
  { id: "futuristic", name: "Futuristic", description: "Dark neon grid patterns", previewClass: "bg-gray-950 border-cyan-500" },
  { id: "aurora", name: "Aurora", description: "Animated glowing background", previewClass: "bg-black border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" },
  { id: "elegant", name: "Elegant", description: "Warm, rich and refined", previewClass: "bg-orange-50/50 border-orange-200" },
  { id: "bold", name: "Bold", description: "Neo-brutalist high contrast", previewClass: "bg-white border-4 border-black" },
  { id: "glassmorphism", name: "Glass", description: "Heavy frosted glass effect", previewClass: "bg-gradient-to-br from-blue-400/50 to-purple-500/50 backdrop-blur" },
]

const PRESET_COLORS = ["#000000", "#DC2626", "#EA580C", "#CA8A04", "#16A34A", "#0891B2", "#2563EB", "#7C3AED", "#DB2777", "#7CFC00"]
const PRESET_BACKGROUNDS = ["#ffffff", "#000000", "#f8fafc", "#020617", "#fff1f2", "#f0fdf4", "#fdfbf7", "#18181b"]

interface WorkspaceAppearanceSettingsProps {
  workspace: any
  onUpdate?: (appearance: any) => void
}

export function WorkspaceAppearanceSettings({ workspace, onUpdate }: WorkspaceAppearanceSettingsProps) {
  const { user } = useAuth()
  const planCtx = user?.subscription?.plan

  // Feature Flag: Check if user can customize Workspace Branding
  // Looking at monetization_plan.md, 'workspaceBranding' feature is key.
  // Pro: 'Custom Colors & Cover', Business: 'Full Customization'.
  // We'll treat any non-starter plan (or specific flag) as valid.
  // Seed says: Pro/Business have 'workspaceBranding' string.
  // Also 'canCustomizeTheme' boolean in features.
  const canCustomize = planCtx?.features?.canCustomizeTheme || false

  const appearance = workspace.appearance || {}
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(appearance.theme || "minimal")
  const [primaryColor, setPrimaryColor] = useState(appearance.primaryColor || "#000000")
  const [backgroundColor, setBackgroundColor] = useState(appearance.backgroundColor || "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const newAppearance = {
        theme: selectedTheme,
        primaryColor,
        backgroundColor: backgroundColor || undefined,
      }

      // We send this as part of workspace update
      // Assuming workspacesRequest.update supports partial updates including appearance
      await workspacesRequest.update(workspace.id, { appearance: newAppearance } as any)

      toast.success("Workspace appearance saved!")
      onUpdate?.(newAppearance)
    } catch (error) {
      console.error(error)
      toast.error("Failed to save appearance")
    } finally {
      setSaving(false)
    }
  }

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

  // Previews
  const previewAppearance = { theme: selectedTheme, primaryColor, backgroundColor }
  const previewStyles = getThemeStyles(previewAppearance)
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
          <CardDescription>Choose a theme for your public workspace page.</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {!canCustomize && <PremiumOverlay label="Custom Themes Locked" />}
          <div className={!canCustomize ? "blur-sm opacity-50 pointer-events-none" : ""}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={cn(
                    "relative rounded-xl p-1 transition-all hover:scale-105 text-left",
                    selectedTheme === theme.id ? "ring-2 ring-primary ring-offset-2" : "ring-1 ring-border hover:ring-primary/50"
                  )}
                >
                  <div className={cn("aspect-[4/3] rounded-lg flex items-center justify-center", theme.previewClass)}>
                    <div className="w-8 h-10 rounded bg-current opacity-20" />
                  </div>
                  <div className="p-2 text-center">
                    <p className="font-medium text-sm">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </div>
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

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Accent Color</CardTitle>
          <CardDescription>Choose a primary color for buttons and highlights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {!canCustomize && <PremiumOverlay label="Custom Colors Locked" />}
          <div className={!canCustomize ? "blur-sm opacity-50 pointer-events-none" : ""}>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setPrimaryColor(color)}
                  className={cn("h-10 w-10 rounded-full transition-all hover:scale-110", primaryColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : "ring-1 ring-border")}
                  style={{ backgroundColor: color }}
                >
                  {primaryColor === color && <Check className="h-5 w-5 mx-auto text-white mix-blend-difference" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="ws-custom-color" className="text-sm text-muted-foreground">Custom:</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="ws-custom-color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-14 rounded cursor-pointer border-0"
                />
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-28 font-mono text-sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background */}
      <Card>
        <CardHeader>
          <CardTitle>Background Color</CardTitle>
          <CardDescription>Override default background (Optional).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {!canCustomize && <PremiumOverlay label="Backgrounds Locked" />}
          <div className={!canCustomize ? "blur-sm opacity-50 pointer-events-none" : ""}>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setBackgroundColor("")} className={cn("h-10 px-3 rounded-lg border text-sm font-medium transition-all hover:bg-accent", !backgroundColor && "ring-2 ring-offset-2 ring-primary")}>Default</button>
              {PRESET_BACKGROUNDS.map((color) => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={cn("h-10 w-10 rounded-full transition-all hover:scale-110 border", backgroundColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : "ring-1 ring-border")}
                  style={{ backgroundColor: color }}
                >
                  {backgroundColor === color && <Check className="h-4 w-4 mx-auto text-black mix-blend-difference" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="ws-bg-color" className="text-sm text-muted-foreground">Custom:</Label>
              <div className="flex items-center gap-2">
                <input type="color" id="ws-bg-color" value={backgroundColor || "#ffffff"} onChange={(e) => setBackgroundColor(e.target.value)} className="h-10 w-14 rounded cursor-pointer border-0" />
                <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-28 font-mono text-sm" placeholder="Default" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Preview of your public workspace page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl overflow-hidden border relative isolate font-sans" style={{ background: previewStyles.background, color: previewStyles.textColor, height: "400px", display: "flex", flexDirection: "column" }}>
            <AnimatedBackground theme={selectedTheme} primaryColor={primaryColor} />
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
              {/* Mock Hero Content */}
              <div className="size-20 bg-muted/20 rounded-2xl flex items-center justify-center border shadow-lg backdrop-blur-sm">
                {workspace.logo ? <img src={workspace.logo} className="w-full h-full object-cover rounded-xl" /> : <Palette className="h-8 w-8 opacity-50" />}
              </div>
              <h1 className="text-3xl font-bold" style={{ color: previewStyles.textColor }}>{workspace.name || "Workspace Name"}</h1>
              <div className="flex gap-2">
                <Button style={buttonStyle}>Visit Website</Button>
                <Button variant="outline" className="bg-transparent border-current" style={{ color: previewStyles.textColor }}>Follow</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}

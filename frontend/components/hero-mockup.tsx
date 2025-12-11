"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Braces,
  Image as ImageIcon,
  LayoutTemplate,
  Monitor,
  MousePointer2,
  Plus,
  QrCode,
  Redo2,
  Save,
  Settings2,
  Square,
  Type,
  Undo2,
  UserRound,
  ZoomIn,
  ZoomOut
} from "lucide-react"
import { useEffect, useState } from "react"

export function HeroMockup() {
  const [activeColor, setActiveColor] = useState("bg-gradient-to-br from-lime-400 to-emerald-600")
  const [name, setName] = useState("Alex Builder")
  const [role, setRole] = useState("Smart Contract Dev")
  const [mounted, setMounted] = useState(false)
  const [scale, setScale] = useState(100)

  useEffect(() => {
    setMounted(true)
  }, [])

  const gradients = [
    "bg-gradient-to-br from-lime-400 to-emerald-600",
    "bg-gradient-to-br from-orange-400 to-red-600",
    "bg-gradient-to-br from-indigo-500 to-purple-600",
    "bg-gradient-to-br from-cyan-400 to-blue-600",
  ]

  const randomize = () => {
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)]
    setActiveColor(randomGradient)

    const names = ["Alex Builder", "Sarah DAO", "Mike NFT", "Jess Growth"]
    const roles = ["Smart Contract Dev", "Community Lead", "Protocol Eng", "Growth Hacker"]

    setName(names[Math.floor(Math.random() * names.length)])
    setRole(roles[Math.floor(Math.random() * roles.length)])
  }

  if (!mounted) return null

  return (
    <div className="w-full max-w-6xl mx-auto rounded-xl border border-border/40 bg-background shadow-2xl overflow-hidden flex flex-col h-[600px] md:h-[700px] animate-in fade-in zoom-in-95 duration-700">

      {/* 1. Header (Top Bar) */}
      <header className="h-14 border-b border-border/40 bg-muted/20 flex items-center justify-between px-4 z-10 basis-14 shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutTemplate className="w-4 h-4" />
            <span className="font-medium text-foreground">Launch Party Ticket</span>
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal ml-2">v2.0</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-background border border-border/50 rounded-md p-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7"><Undo2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Redo2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
          </div>
          <Button variant="default" size="sm" className="h-8 text-xs gap-2 ml-2">
            <Save className="w-3.5 h-3.5" /> Save Design
          </Button>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Toolbar (Tools) */}
        <aside className="w-16 border-r border-border/40 bg-muted/10 flex flex-col items-center py-4 gap-3 z-10 shrink-0">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-primary bg-primary/10" title="Selection">
            <MousePointer2 className="h-5 w-5" />
          </Button>
          <Separator className="w-8 my-1" />

          <div className="flex flex-col gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted" title="Add Text">
              <Type className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted" title="Add Image">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted" title="Add Shape">
              <Square className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted" title="Add QR Code">
              <QrCode className="h-5 w-5" />
            </Button>
          </div>

          <Separator className="w-8 my-1" />
          <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-primary/10" title="Dynamic Variable">
            <Braces className="h-5 w-5" />
          </Button>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] relative overflow-hidden flex items-center justify-center p-8">

          {/* Zoom Float */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md border border-border/50 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg z-20">
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setScale(s => Math.max(50, s - 10))}><ZoomOut className="w-3 h-3" /></Button>
            <span className="text-xs font-mono w-8 text-center">{scale}%</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setScale(s => Math.min(150, s + 10))}><ZoomIn className="w-3 h-3" /></Button>
          </div>

          {/* The Card */}
          <div
            className={`relative w-[500px] h-[300px] rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out ${activeColor} flex flex-col p-8 overflow-hidden group hover:scale-[1.02] cursor-default border border-white/10`}
            style={{ transform: `scale(${scale / 100})` }}
          >
            {/* Overlay Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-20 -translate-y-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl transform -translate-x-10 translate-y-10 pointer-events-none" />

            {/* Card Content - Simulating Layers */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                {/* Logo Area */}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <LayoutTemplate className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white tracking-wide text-sm opacity-90">DesignConf</span>
                </div>
                {/* Badge */}
                <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-md font-mono">
                  #0042
                </Badge>
              </div>

              <div className="flex items-end gap-5">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-gray-100 to-gray-300 border-4 border-white/20 shadow-xl overflow-hidden relative group-hover:ring-4 ring-white/30 transition-all">
                    {/* Avatar Placeholder */}
                    <UserRound className="w-full h-full p-4 text-gray-400" />
                  </div>
                  {/* Dynamic Indicator */}
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100 border border-white/20">
                    VAR
                  </div>
                </div>

                <div className="mb-1">
                  <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-md">{name}</h2>
                  <p className="text-white/80 font-medium tracking-wide uppercase text-xs backdrop-blur-sm bg-black/5 inline-block px-2 py-0.5 rounded">{role}</p>
                </div>

                <div className="ml-auto opacity-80 mix-blend-screen">
                  <QrCode className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* Selection Box Simulation */}
            <div className="absolute inset-0 border-2 border-blue-500/0 hover:border-blue-500/30 transition-all rounded-xl pointer-events-none" />
          </div>

        </main>

        {/* Right Sidebar (Properties) */}
        <aside className="w-72 border-l border-border/40 bg-background flex flex-col z-10 shrink-0">
          <div className="p-4 border-b border-border/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Properties</h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Background Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {gradients.map((g, i) => (
                    <button
                      key={i}
                      className={`h-8 w-8 rounded-full ${g} ring-2 ring-offset-2 ring-offset-background transition-all hover:scale-110 ${activeColor === g ? 'ring-primary' : 'ring-transparent'}`}
                      onClick={() => setActiveColor(g)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs justify-between" onClick={randomize}>
                  <span>Smart Randomizer</span>
                  <Monitor className="w-3 h-3 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center justify-between">
              Layers <Plus className="w-3 h-3 cursor-pointer hover:text-primary" />
            </h3>

            <div className="space-y-2">
              {/* Layer Items */}
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted border border-transparent hover:border-border/50 group cursor-pointer transition-all">
                <Type className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Name Variable</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100">
                  <Settings2 className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted border border-transparent hover:border-border/50 group cursor-pointer transition-all">
                <Type className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium">Role Text</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100">
                  <Settings2 className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted border border-transparent hover:border-border/50 group cursor-pointer transition-all">
                <UserRound className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium">Avatar Area</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100">
                  <Settings2 className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted border border-transparent hover:border-border/50 group cursor-pointer transition-all">
                <QrCode className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium">QR Code</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100">
                  <Settings2 className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}

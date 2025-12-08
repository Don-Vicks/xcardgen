"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, RefreshCcw, Type } from "lucide-react"
import { useEffect, useState } from "react"

export function HeroMockup() {
  const [activeColor, setActiveColor] = useState("bg-gradient-to-br from-lime-400 to-emerald-600")
  const [name, setName] = useState("Alex Builder")
  const [role, setRole] = useState("Smart Contract Dev")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const gradients = [
    "bg-gradient-to-br from-lime-400 to-emerald-600",
    "bg-gradient-to-br from-orange-400 to-red-600",
    "bg-gradient-to-br from-white to-neutral-400",
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
    <div className="w-full max-w-6xl rounded-xl border border-border/50 bg-card/50 shadow-2xl backdrop-blur-md p-2 overflow-hidden">
      <div className="rounded-lg bg-background/50 border border-border/50 flex flex-col md:flex-row overflow-hidden min-h-[400px]">
        {/* Sidebar Controls */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/50 p-4 space-y-6 bg-muted/20">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Card Style</label>
              <div className="grid grid-cols-4 gap-2">
                {gradients.map((gradient, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveColor(gradient)}
                    className={`h-8 w-8 rounded-full ${gradient} ring-2 ring-offset-2 ring-offset-background transition-all hover:scale-110 ${activeColor === gradient ? 'ring-primary' : 'ring-transparent'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Layers</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded bg-background/50 border border-border/50 text-sm">
                  <Type className="h-4 w-4 text-primary" /> <span>Name Layer</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-background/50 border border-border/50 text-sm">
                  <Type className="h-4 w-4 text-muted-foreground" /> <span>Role Layer</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-background/50 border border-border/50 text-sm">
                  <ImageIcon className="h-4 w-4 text-secondary" /> <span>Avatar</span>
                </div>
              </div>
            </div>

            <Button onClick={randomize} variant="outline" className="w-full gap-2 mt-4">
              <RefreshCcw className="h-4 w-4" /> Randomize
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-8 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]">
          <div className={`relative w-full max-w-md aspect-[1.58/1] rounded-xl shadow-2xl transition-all duration-500 ease-in-out ${activeColor} flex flex-col justify-end p-6 overflow-hidden group`}>

            {/* Abstract patterns */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-5 translate-y-5" />

            <div className="relative z-10 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg flex items-center justify-center text-white font-bold text-2xl">
                {name.charAt(0)}
              </div>
              <div className="text-white">
                <h3 className="font-bold text-2xl mb-1 tracking-tight drop-shadow-md">{name}</h3>
                <p className="text-white/80 font-medium tracking-wide text-sm uppercase">{role}</p>
              </div>
            </div>

            <div className="absolute top-6 right-6">
              <Badge variant="outline" className="bg-white/20 text-white border-white/40 backdrop-blur-md">Attendee #042</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

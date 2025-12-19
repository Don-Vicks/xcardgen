"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Paintbrush } from "lucide-react"
import { useEffect, useState } from "react"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

const PRESET_COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF",
  "#C0C0C0", "#808080", "#800000", "#808000", "#008000", "#800080", "#008080", "#000080",
  "#f43f5e", "#ec4899", "#d946ef", "#a855f7", "#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9",
  "#06b6d4", "#14b8a6", "#10b981", "#22c55e", "#84cc16", "#eab308", "#f59e0b", "#f97316"
]

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [color, setColor] = useState(value || "#000000")

  useEffect(() => {
    setColor(value || "#000000")
  }, [value])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange(newColor)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal px-2 h-9"
        >
          <div className="w-4 h-4 rounded-full mr-2 border border-muted-foreground/20" style={{ backgroundColor: color }} />
          <span className="truncate flex-1">{color}</span>
          <Paintbrush className="h-4 w-4 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="grid" className="flex-1">Grid</TabsTrigger>
            <TabsTrigger value="custom" className="flex-1">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4">
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  className={cn(
                    "w-5 h-5 rounded-full border border-muted-foreground/20 hover:scale-110 transition-transform",
                    color.toUpperCase() === c.toUpperCase() ? "ring-2 ring-primary ring-offset-2" : ""
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => handleColorChange(c)}
                  title={c}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-full h-px bg-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hex Code</Label>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded border border-muted-foreground/20 shrink-0" style={{ backgroundColor: color }} />
                <Input
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-8 font-mono text-xs uppercase"
                  maxLength={7}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="flex flex-col gap-4 items-center">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-32 h-32 p-0 border-0 rounded cursor-pointer"
              />
              <div className="flex w-full gap-2 items-center">
                <Label className="w-8">Hex</Label>
                <Input
                  value={color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 font-mono uppercase"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

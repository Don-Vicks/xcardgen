"use client"

import { cn } from "@/lib/utils"
// Use the same type definition or import it
import { CanvasElement } from "@/components/editor/template-editor"
import { UserRound } from "lucide-react"
import { useMemo } from "react"
import QRCode from "react-qr-code"; // Assuming this is installed

interface CanvasRendererProps {
  elements: CanvasElement[]
  width: number
  height: number
  backgroundImage?: string
  values: Record<string, any>
  scale?: number
  className?: string
}

export function CanvasRenderer({
  elements,
  width,
  height,
  backgroundImage,
  values,
  scale = 1,
  className
}: CanvasRendererProps) {

  // Substitution Logic
  const substitutedElements = useMemo(() => {
    return elements.map(el => {
      if (!el.isDynamic) return el

      const newEl = { ...el }

      // Handle Text Substitution
      if (el.type === 'text' && el.content) {
        // Simple regex replace for {{ key }}
        newEl.content = el.content.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
          return values[key] || `{{${key}}}`
        })
      }

      // Handle Image Substitution (Avatar)
      if (el.type === 'image' && el.isDynamic && el.fieldName) {
        if (values[el.fieldName]) {
          newEl.src = values[el.fieldName]
        }
      }

      // Handle QR Code Substitution
      // If QR Content has {{ key }}, replace it.
      if (el.type === 'qrcode' && el.content) {
        newEl.content = el.content.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
          return values[key] || ""
        })
        // If replacement results in empty string, fallback to original or empty?
        // react-qr-code fails on empty value? It handles it.
      }

      return newEl
    })
  }, [elements, values])

  return (
    <div
      className={cn("relative overflow-hidden bg-white shadow-lg print:shadow-none", className)}
      style={{
        width: width * scale,
        height: height * scale,
        // We use a wrapper for scaling, but if we want exact pixel match for width/height:
      }}
    >
      {/* Scaled Container to match coordinate system */}
      <div
        style={{
          width: width,
          height: height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
        {substitutedElements.map((el) => {
          // Base Styles
          const style: React.CSSProperties = {
            position: 'absolute',
            top: el.y,
            left: el.x,
            width: el.width,
            height: el.height,
            ...el.style,
            // Remove interactive borders/backgrounds used in editor
            borderWidth: el.style?.borderWidth ? el.style.borderWidth : undefined,
            borderStyle: el.style?.borderStyle,
            borderColor: el.style?.borderColor,
          }

          return (
            <div key={el.id} style={style} className="flex items-center justify-center overflow-hidden">
              {el.type === "text" && (
                <span className="w-full wrap-break-word whitespace-pre-wrap" style={{ lineHeight: 1.2 }}>
                  {el.content}
                </span>
              )}

              {el.type === "image" && (
                <div className="w-full h-full flex items-center justify-center overflow-hidden"
                  style={{ borderRadius: el.style?.borderRadius }}>
                  {el.src ? (
                    <img src={el.src} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  ) : (
                    // Placeholder for empty dynamic image
                    <div className="w-full h-full bg-black/10 flex items-center justify-center">
                      <UserRound className="w-1/2 h-1/2 opacity-20" />
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
                    value={el.content || ""}
                    size={256}
                    style={{ height: "100%", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                    fgColor={el.style?.color}
                    bgColor={el.style?.backgroundColor}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

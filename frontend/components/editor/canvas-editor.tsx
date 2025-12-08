"use client"
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { Layer, Rect, Stage, Text } from 'react-konva'

// Dynamic import for Konva to avoid SSR issues
const Canvas = dynamic(() => Promise.resolve(({ width, height, children }: any) => (
  <Stage width={width} height={height} className="bg-gray-100 shadow-md">
    {children}
  </Stage>
)), { ssr: false }) as any

export function CanvasEditor() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      })
    }
  }, [])

  return (
    <div className="flex h-full w-full">
      {/* Sidebar Tools */}
      <div className="w-64 border-r bg-background p-4">
        <h3 className="mb-4 font-semibold">Tools</h3>
        <div className="grid gap-2">
          <button className="rounded border p-2 text-left hover:bg-accent">Add Text</button>
          <button className="rounded border p-2 text-left hover:bg-accent">Add Rect</button>
          <button className="rounded border p-2 text-left hover:bg-accent">Add Image</button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-auto bg-muted/20 p-8" ref={containerRef}>
        <div className="flex items-center justify-center">
          <Stage width={800} height={500} style={{ background: 'white', border: '1px solid #ccc' }}>
            <Layer>
              <Rect width={800} height={500} fill="white" />
              <Text text="Hello World" fontSize={24} x={50} y={50} draggable />
              <Rect width={100} height={100} fill="red" x={200} y={200} draggable />
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-72 border-l bg-background p-4">
        <h3 className="mb-4 font-semibold">Properties</h3>
        <div className="text-sm text-muted-foreground">Select an item to edit</div>
      </div>
    </div>
  )
}

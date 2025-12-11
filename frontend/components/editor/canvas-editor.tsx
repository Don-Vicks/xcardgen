"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { templatesRequest } from '@/lib/api/requests/templates.request'
import { EditorElement, useEditorStore } from '@/stores/editor-store'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Circle, Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from 'react-konva'
import useImage from 'use-image'
import { PropertiesPanel } from './properties-panel'
import { Toolbar } from './toolbar'

// Dynamic import for Konva to avoid SSR issues
const Canvas = dynamic(() => Promise.resolve(({ width, height, children, onClick, onMouseDown }: any) => (
  <Stage width={width} height={height} className="bg-white shadow-lg mx-auto" onClick={onClick} onMouseDown={onMouseDown}>
    {children}
  </Stage>
)), { ssr: false }) as any

// Background Image Component
const BackgroundImage = ({ src, width, height }: { src: string | null, width: number, height: number }) => {
  const [img] = useImage(src || '')
  if (!src || !img) return null
  return <KonvaImage image={img} width={width} height={height} listening={false} />
}

// URL Image Component
const URLImage = ({ element, isSelected, onSelect, onChange }: {
  element: EditorElement,
  isSelected: boolean,
  onSelect: () => void,
  onChange: (newAttrs: any) => void
}) => {
  const [img] = useImage(element.src || 'https://via.placeholder.com/150')
  const shapeRef = useRef<any>(null)
  const trRef = useRef<any>(null)

  useEffect(() => {
    if (isSelected) {
      trRef.current?.nodes([shapeRef.current])
      trRef.current?.getLayer().batchDraw()
    }
  }, [isSelected])

  return (
    <>
      <KonvaImage
        image={img}
        ref={shapeRef}
        {...element}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          })
        }}
        onTransformEnd={() => {
          const node = shapeRef.current
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()
          node.scaleX(1)
          node.scaleY(1)
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          })
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

// Editable Shape Component (Text, Rect, Circle)
const EditableShape = ({ element, isSelected, onSelect, onChange }: {
  element: EditorElement,
  isSelected: boolean,
  onSelect: () => void,
  onChange: (newAttrs: any) => void
}) => {
  const shapeRef = useRef<any>(null)
  const trRef = useRef<any>(null)

  useEffect(() => {
    if (isSelected) {
      trRef.current?.nodes([shapeRef.current])
      trRef.current?.getLayer().batchDraw()
    }
  }, [isSelected])

  const commonProps = {
    ...element,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: any) => {
      onChange({
        x: e.target.x(),
        y: e.target.y(),
      })
    },
    onTransformEnd: () => {
      const node = shapeRef.current
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()

      // Reset scale to 1 and adjust width/height instead (better for resizing)
      node.scaleX(1)
      node.scaleY(1)

      onChange({
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
        // For text, we might want to scale fontSize instead?
        // fontSize: element.type === 'text' ? element.fontSize * scaleX : undefined
      })
    },
  }

  return (
    <>
      {element.type === 'rect' && <Rect ref={shapeRef} {...commonProps} />}
      {element.type === 'circle' && <Circle ref={shapeRef} {...commonProps} radius={Math.max(element.width!, element.height!) / 2} />}
      {element.type === 'text' && <Text ref={shapeRef} {...commonProps} />}

      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </>
  )
}

export function CanvasEditor() {
  const { elements, selectedId, selectElement, updateElement, deselectAll, backgroundImage } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSaving, setIsSaving] = useState(false)



  const handleSave = async () => {
    try {
      setIsSaving(true)
      const templateData = {
        name: 'Untitled Template', // Ideally this comes from an input in the header
        backgroundImage: backgroundImage || '',
        canvasData: { elements }, // Store the elements as canvas data
        workspaceId: undefined, // You might want to pass this if available
      }

      // If we declare an ID in the URL, we might want to update instead
      // For now, let's assume create for simplicity or check if we have a template ID context

      await templatesRequest.create(templateData)
      toast.success('Template saved successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const checkDeselect = (e: any) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      deselectAll()
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex h-14 items-center justify-between border-b px-6 bg-background">
        <h1 className="font-semibold">Template Editor</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Toolbar />

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto bg-muted/20 p-8 flex items-center justify-center" ref={containerRef}>
          <Canvas
            width={800}
            height={600}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
          >
            <Layer>
              <Rect width={800} height={600} fill="white" shadowBlur={10} shadowColor="rgba(0,0,0,0.1)" />
              <BackgroundImage src={backgroundImage} width={800} height={600} />
              {elements.map((el) => {
                if (el.type === 'image') {
                  return (
                    <URLImage
                      key={el.id}
                      element={el}
                      isSelected={el.id === selectedId}
                      onSelect={() => selectElement(el.id)}
                      onChange={(newAttrs) => updateElement(el.id, newAttrs)}
                    />
                  )
                }
                return (
                  <EditableShape
                    key={el.id}
                    element={el}
                    isSelected={el.id === selectedId}
                    onSelect={() => selectElement(el.id)}
                    onChange={(newAttrs) => updateElement(el.id, newAttrs)}
                  />
                )
              })}
            </Layer>
          </Canvas>
        </div>

        <PropertiesPanel />
      </div>
    </div>
  )
}

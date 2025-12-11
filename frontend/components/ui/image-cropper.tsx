"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import getCroppedImg from "@/lib/utils/crop-image"
import { Loader2, RotateCw } from "lucide-react"
import { useState } from "react"
import Cropper, { Area } from "react-easy-crop"

interface ImageCropperProps {
  imageSrc: string | null
  isOpen: boolean
  onClose: () => void
  onCropComplete: (file: File, url: string) => void
  aspect?: number
}

export function ImageCropper({ imageSrc, isOpen, onClose, onCropComplete, aspect = 1 }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [loading, setLoading] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const handleCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setLoading(true)
    try {
      const { file, url } = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      if (file) {
        onCropComplete(file, url)
      }
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
          <DialogDescription>
            Drag to position and pinch/scroll to zoom.
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-[400px] bg-black/5 rounded-lg overflow-hidden">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </div>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium w-12">Zoom</span>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(vals: number[]) => setZoom(vals[0])}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium w-12">Rotate</span>
            <Slider
              value={[rotation]}
              min={0}
              max={360}
              step={90}
              onValueChange={(vals: number[]) => setRotation(vals[0])}
              className="flex-1"
            />
            <Button size="icon" variant="ghost" onClick={() => setRotation((r) => r + 90)}>
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

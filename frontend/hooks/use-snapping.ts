import { useCallback, useState } from 'react'

interface SnapGuide {
  type: 'vertical' | 'horizontal'
  position: number
}

interface UseSnappingProps {
  canvasWidth: number
  canvasHeight: number
  snapThreshold?: number
}

export function useSnapping({
  canvasWidth,
  canvasHeight,
  snapThreshold = 10,
}: UseSnappingProps) {
  const [guides, setGuides] = useState<SnapGuide[]>([])

  const getSnapLines = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const newGuides: SnapGuide[] = []
      let newX = x
      let newY = y

      // Center points
      const centerX = x + width / 2
      const centerY = y + height / 2

      const canvasCenterX = canvasWidth / 2
      const canvasCenterY = canvasHeight / 2

      // Snap to Vertical Center
      if (Math.abs(centerX - canvasCenterX) < snapThreshold) {
        newX = canvasCenterX - width / 2
        newGuides.push({ type: 'vertical', position: canvasCenterX })
      }

      // Snap to Horizontal Center
      if (Math.abs(centerY - canvasCenterY) < snapThreshold) {
        newY = canvasCenterY - height / 2
        newGuides.push({ type: 'horizontal', position: canvasCenterY })
      }

      // Snap to Left Edge
      if (Math.abs(x) < snapThreshold) {
        newX = 0
        newGuides.push({ type: 'vertical', position: 0 })
      }

      // Snap to Top Edge
      if (Math.abs(y) < snapThreshold) {
        newY = 0
        newGuides.push({ type: 'horizontal', position: 0 })
      }

      // Snap to Right Edge
      if (Math.abs(x + width - canvasWidth) < snapThreshold) {
        newX = canvasWidth - width
        newGuides.push({ type: 'vertical', position: canvasWidth })
      }

      // Snap to Bottom Edge
      if (Math.abs(y + height - canvasHeight) < snapThreshold) {
        newY = canvasHeight - height
        newGuides.push({ type: 'horizontal', position: canvasHeight })
      }

      return { x: newX, y: newY, guides: newGuides }
    },
    [canvasWidth, canvasHeight, snapThreshold]
  )

  const clearGuides = useCallback(() => {
    setGuides([])
  }, [])

  return {
    guides,
    setGuides,
    getSnapLines,
    clearGuides,
  }
}

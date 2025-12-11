import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'

export type ElementType = 'text' | 'rect' | 'circle' | 'image' | 'star'

export interface EditorElement {
  id: string
  type: ElementType
  x: number
  y: number
  width?: number
  height?: number
  fill?: string
  stroke?: string
  text?: string
  fontSize?: number
  fontFamily?: string
  rotation?: number
  src?: string
  opacity?: number
  cornerRadius?: number
}

interface EditorState {
  elements: EditorElement[]
  selectedId: string | null
  canvasSize: { width: number; height: number }
  backgroundImage: string | null

  // Actions
  addElement: (type: ElementType, defaults?: Partial<EditorElement>) => void
  updateElement: (id: string, attrs: Partial<EditorElement>) => void
  removeElement: (id: string) => void
  selectElement: (id: string | null) => void
  setCanvasSize: (size: { width: number; height: number }) => void
  setBackgroundImage: (url: string | null) => void
  deselectAll: () => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  elements: [],
  selectedId: null,
  canvasSize: { width: 800, height: 600 },
  backgroundImage: null,

  addElement: (type, defaults = {}) => {
    const id = uuidv4()
    const newElement: EditorElement = {
      id,
      type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: type === 'text' ? '#000000' : '#cccccc',
      opacity: 1,
      rotation: 0,
      ...defaults,
    }

    if (type === 'text') {
      newElement.text = 'New Text'
      newElement.fontSize = 20
      newElement.fill = '#000000'
      newElement.width = undefined // Auto width
      newElement.height = undefined
    }

    if (type === 'rect') {
      newElement.cornerRadius = 0
    }

    set((state) => ({
      elements: [...state.elements, newElement],
      selectedId: id, // Auto-select new element
    }))
  },

  updateElement: (id, attrs) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...attrs } : el
      ),
    }))
  },

  removeElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }))
  },

  selectElement: (id) => {
    set({ selectedId: id })
  },

  deselectAll: () => {
    set({ selectedId: null })
  },

  setCanvasSize: (size) => {
    set({ canvasSize: size })
  },

  setBackgroundImage: (url) => {
    set({ backgroundImage: url })
  },
}))

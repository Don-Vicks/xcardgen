import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface CardData {
  url?: string
  values?: Record<string, string>
  name?: string
  email?: string
}

interface GeneratedCardState {
  // Map eventId to card data
  cards: Record<string, CardData>
  addCard: (eventId: string, data: CardData) => void
  removeCard: (eventId: string) => void
  getCard: (eventId: string) => CardData | undefined
}

export const useGeneratedCardStore = create<GeneratedCardState>()(
  persist(
    (set, get) => ({
      cards: {},
      addCard: (eventId, data) =>
        set((state) => ({
          cards: {
            ...state.cards,
            [eventId]: { ...state.cards[eventId], ...data },
          },
        })),
      removeCard: (eventId) =>
        set((state) => {
          const newCards = { ...state.cards }
          delete newCards[eventId]
          return { cards: newCards }
        }),
      getCard: (eventId) => get().cards[eventId],
    }),
    {
      name: 'generated-cards-storage-v2', // Bump version/name to avoid conflicts
      storage: createJSONStorage(() => localStorage),
    }
  )
)

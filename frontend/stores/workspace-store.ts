import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Workspace {
  id: string
  name: string
  description: string
  slug?: string
  logo?: string
  coverImage?: string
  socialLinks?: any
}

interface WorkspaceState {
  currentWorkspace: Workspace | null
  setCurrentWorkspace: (workspace: Workspace | null) => void
  isSwitching: boolean
  setIsSwitching: (isSwitching: boolean) => void
}

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentWorkspace: null,
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
      isSwitching: false,
      setIsSwitching: (isSwitching) => set({ isSwitching }),
    }),
    {
      name: 'workspace-storage',
    }
  )
)

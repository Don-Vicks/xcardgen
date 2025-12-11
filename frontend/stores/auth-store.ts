import { apiRequest } from '@/lib/api/requests/auth.request'
import { workspacesRequest } from '@/lib/api/requests/workspaces.request'
import { CreateWorkspaceDto, LoginDto, RegisterDto } from '@/types/auth'
import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  googleId?: string
  createdAt: string
  workspaceMemberships?: Array<{
    workspace: {
      id: string
      name: string
      description: string
      slug?: string
      logo?: string
    }
  }>
  workspaceOwnerships?: Array<{
    id: string
    name: string
    description: string
    slug?: string
    logo?: string
  }>
}

interface AuthState {
  user: User | null
  loading: boolean

  // Actions
  login: (data: LoginDto) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => void
  checkAuth: () => Promise<void>
  setUser: (user: User | null) => void
  createWorkspace: (data: CreateWorkspaceDto) => Promise<void>
}

const authRequestInstance = new apiRequest()
const workspacesRequestInstance = workspacesRequest

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  checkAuth: async () => {
    set({ loading: true })
    try {
      console.log('Store: checkAuth starting...')
      const response = await authRequestInstance.getProfile()
      console.log('Store: checkAuth response', response)
      set({ user: response.data, loading: false })
    } catch (error) {
      console.error('Store: checkAuth Failed:', error)
      set({ user: null, loading: false })
    }
  },

  setUser: (user) => {
    console.log('Store: setUser called', user)
    set({ user })
  },

  login: async (data: LoginDto) => {
    try {
      set({ loading: true })
      const response = await authRequestInstance.login(data)

      if (response.data.user) {
        set({ user: response.data.user, loading: false })
      } else {
        // Fallback if user object isn't in login response, fetch profile
        const profileValues = await authRequestInstance.getProfile()
        set({ user: profileValues.data, loading: false })
      }
    } catch (error) {
      set({ loading: false })
      console.error('Login failed', error)
      throw error
    }
  },

  register: async (data: RegisterDto) => {
    try {
      set({ loading: true })
      const response = await authRequestInstance.register(data)
      set({ user: response.data.user, loading: false })
    } catch (error) {
      set({ loading: false })
      console.error('Registration failed', error)
      throw error
    }
  },

  createWorkspace: async (data: CreateWorkspaceDto) => {
    try {
      set({ loading: true })

      // Pass data directly as it now matches the full schema from the form
      const response = await workspacesRequestInstance.createWorkspace(data)
      const newWorkspace = response.data

      // Update local user state with new workspace
      const currentUser = get().user
      if (currentUser) {
        set({
          user: {
            ...currentUser,
            workspaceOwnerships: [
              ...(currentUser.workspaceOwnerships || []),
              newWorkspace,
            ],
          },
          loading: false,
        })
      } else {
        set({ loading: false })
      }
    } catch (error) {
      set({ loading: false })
      console.error('Create workspace failed', error)
      throw error
    }
  },

  logout: async () => {
    try {
      await authRequestInstance.logout()
    } catch (e) {
      console.error(e)
    }
    set({ user: null })
    // We let the caller handle redirection if needed, or we could strict redirect here but better to separate concerns
  },

  loginWithGoogle: () => {
    window.location.href = `${
      process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
    }/auth/google`
  },
}))

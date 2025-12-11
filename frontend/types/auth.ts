import { LoginInput, RegisterInput } from '@/lib/validations/auth.schema'
import { CreateWorkspace } from '@/lib/validations/workspace.schema'

export type LoginDto = LoginInput
export type RegisterDto = RegisterInput
export type CreateWorkspaceDto = CreateWorkspace

// Re-export specific auth response types if needed
export interface AuthResponse {
  accessToken: string
  user: {
    id: string
    email: string
    name?: string
  }
}

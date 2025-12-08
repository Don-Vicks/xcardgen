import { z } from 'zod'

// Zod schema for registration
export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(3),
})

// TypeScript type inferred from schema
export type RegisterDto = z.infer<typeof registerSchema>

// Zod schema for login
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

export type LoginDto = z.infer<typeof loginSchema>

// Zod schema for creating workspace
export const createWorkspaceSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters'),
  logo: z.string().optional(),
})

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>

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

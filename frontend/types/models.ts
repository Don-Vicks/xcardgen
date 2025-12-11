export interface User {
  id: string
  name: string
  email: string
  googleId?: string | null
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  userId: string
  token: string
  ipAddress: string
  userAgent?: string | null
  lastActivity: string
  isActive: boolean
  createdAt: string
  revokedAt?: string | null
}

export interface LoginLog {
  id: string
  userId: string
  ipAddress: string
  deviceId?: string | null
  createdAt: string
}

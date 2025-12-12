import { CreateWorkspaceDto, LoginDto, RegisterDto } from '@/types/auth'
import { api } from '../api'

export class apiRequest {
  async createWorkspace(data: CreateWorkspaceDto) {
    return api.post('/auth/workspace', data)
  }

  async register(registerDto: RegisterDto) {
    return api.post('/auth/register', registerDto)
  }

  async login(loginDto: LoginDto) {
    return api.post('/auth/login', loginDto)
  }

  async getProfile() {
    return api.get('/auth/profile')
  }

  async logout() {
    return api.post('/auth/logout')
  }

  async logoutAll() {
    return api.delete('/auth/sessions')
  }

  async getSessions() {
    return api.get('/auth/sessions')
  }

  async revokeSession(id: string) {
    return api.delete(`/auth/sessions/${id}`)
  }

  async getLoginLogs() {
    return api.get('/auth/sessions/logs')
  }

  async updateProfile(data: { name?: string; email?: string }) {
    return api.patch('/users/me', data)
  }

  async forgotPassword() {}
}

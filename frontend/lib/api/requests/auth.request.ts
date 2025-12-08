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

  async forgotPassword() {}
}

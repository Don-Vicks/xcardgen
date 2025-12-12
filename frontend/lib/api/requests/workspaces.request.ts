import {
  CreateWorkspace,
  UpdateWorkspace,
} from '../../validations/workspace.schema'
import { api } from '../api'

export interface Workspace {
  id: string
  name: string
  description: string
  slug: string
  logo?: string
  coverImage?: string
  socialLinks?: any
  createdAt: string
  updatedAt: string
  ownerId: string
}

export class WorkspacesRequest {
  async createWorkspace(data: CreateWorkspace) {
    return api.post<Workspace>('/workspaces', data)
  }

  async getAll() {
    return api.get<Workspace[]>('/workspaces')
  }

  async getOne(idOrSlug: string) {
    return api.get<Workspace>(`/workspaces/${idOrSlug}`)
  }

  async getPublic(slug: string) {
    return api.get<Workspace & { events: any[] }>(`/workspaces/public/${slug}`)
  }

  async update(id: string, data: UpdateWorkspace) {
    return api.patch<Workspace>(`/workspaces/${id}`, data)
  }

  async delete(id: string) {
    return api.delete(`/workspaces/${id}`)
  }
  async checkSlug(slug: string) {
    return api.get(`/workspaces/check-slug/${slug}`)
  }

  async uploadLogo(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ url: string }>('/workspaces/upload-logo', formData)
  }

  async uploadCover(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ url: string }>('/workspaces/upload-cover', formData)
  }

  // ===== MEMBER MANAGEMENT =====

  async getMembers(workspaceId: string) {
    return api.get<{
      owner: { id: string; name: string; email: string }
      members: Array<{
        id: string
        userId: string
        role: string
        acceptedAt: string | null
        inviteEmail: string | null
        user: { id: string; name: string; email: string } | null
      }>
    }>(`/workspaces/${workspaceId}/members`)
  }

  async inviteMember(
    workspaceId: string,
    email: string,
    role?: 'ADMIN' | 'MEMBER'
  ) {
    return api.post(`/workspaces/${workspaceId}/members/invite`, {
      email,
      role,
    })
  }

  async removeMember(workspaceId: string, memberId: string) {
    return api.delete(`/workspaces/${workspaceId}/members/${memberId}`)
  }

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: 'ADMIN' | 'MEMBER'
  ) {
    return api.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role })
  }

  // ===== INVITE ENDPOINTS =====

  async getInviteInfo(token: string) {
    return api.get<{
      workspaceId: string
      workspace: {
        id: string
        name: string
        logo?: string
        description?: string
      }
      role: string
      inviteEmail: string | null
    }>(`/workspaces/invite/${token}`)
  }

  async acceptInvite(token: string) {
    return api.post(`/workspaces/invite/${token}/accept`)
  }

  async declineInvite(token: string) {
    return api.post(`/workspaces/invite/${token}/decline`)
  }
}

export const workspacesRequest = new WorkspacesRequest()

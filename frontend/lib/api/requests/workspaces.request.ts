import {
  CreateWorkspace,
  UpdateWorkspace,
} from '../../validations/workspace.schema'
import { api } from '../api'

export interface Workspace {
  id: string
  name: string
  slug: string
  logo?: string
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

  async update(id: string, data: UpdateWorkspace) {
    return api.patch<Workspace>(`/workspaces/${id}`, data)
  }

  async delete(id: string) {
    return api.delete(`/workspaces/${id}`)
  }
  async checkSlug(slug: string) {
    return api.get(`/workspaces/check-slug/${slug}`)
  }
}

export const workspacesRequest = new WorkspacesRequest()

import { api } from '../api'

export interface Template {
  id: string
  name: string
  description?: string
  backgroundImage: string
  canvasData?: any
  status: 'DRAFT' | 'PUBLISHED'
  properties?: {
    width?: number
    height?: number
  }
  workspaceId?: string
  createdAt: string
  updatedAt: string
}

export const templatesRequest = {
  getAll: (workspaceId?: string, params?: any) => {
    return api.get<{ data: Template[]; meta: any }>('/templates', {
      params: { workspaceId, ...params },
    })
  },
  getOne: (id: string, workspaceId?: string) => {
    return api.get<Template>(`/templates/${id}`, { params: { workspaceId } })
  },
  create: (data: {
    name: string
    backgroundImage: string
    workspaceId?: string
    description?: string
  }) => {
    return api.post<Template>('/templates', data)
  },
  update: (id: string, data: Partial<Template>) => {
    return api.patch<Template>(`/templates/${id}`, data)
  },
  delete: (id: string) => {
    return api.delete(`/templates/${id}`)
  },
  uploadAsset: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ url: string }>(`/templates/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

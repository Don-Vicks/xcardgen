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
  createdAt: string
  updatedAt: string
}

export const templatesRequest = {
  getAll: (workspaceId?: string) => {
    return api.get<Template[]>('/templates', {
      params: { workspaceId },
    })
  },
  getOne: (id: string) => {
    return api.get<Template>(`/templates/${id}`)
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
}

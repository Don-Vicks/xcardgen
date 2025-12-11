import { api } from '../api'

export interface CreateEventDto {
  name: string
  slug: string
  date: string
  endDate?: string
  description: string
  coverImage?: string
  workspaceId: string
}

export interface Event {
  id: string
  name: string
  slug: string
  date: string
  createdAt: string
  updatedAt: string
  userId: string
  templateId?: string
  isActive: boolean
  description?: string
  coverImage?: string
  template?: any
  workspace?: {
    id: string
    name: string
    logo?: string
  }
  stats?: {
    totalVisits: number
    totalGenerations: number
    totalDownloads: number
    totalShares: number
  }
  _count?: {
    cards: number
  }
}

export class EventsRequest {
  async create(data: CreateEventDto) {
    return api.post<Event>('/events', data)
  }

  async update(id: string, data: any) {
    return api.patch<Event>(`/events/${id}`, data)
  }

  async getAll(
    params: {
      workspaceId?: string
      page?: number
      limit?: number
      search?: string
      sort?: string
    } = {}
  ) {
    const query = new URLSearchParams()
    if (params.workspaceId) query.append('workspaceId', params.workspaceId)
    if (params.page) query.append('page', params.page.toString())
    if (params.limit) query.append('limit', params.limit.toString())
    if (params.search) query.append('search', params.search)
    if (params.sort) query.append('sort', params.sort)
    return api.get<{
      data: Event[]
      meta: { total: number; page: number; limit: number; totalPages: number }
    }>(`/events?${query.toString()}`)
  }

  async delete(id: string) {
    return api.delete(`/events/${id}`)
  }

  async getAnalytics(id: string, from?: Date, to?: Date) {
    const query = new URLSearchParams()
    if (from) query.append('startDate', from.toISOString())
    if (to) query.append('endDate', to.toISOString())
    return api.get(`/events/${id}/analytics?${query.toString()}`)
  }

  async exportAnalytics(id: string) {
    return api.get(`/events/${id}/export/analytics`, { responseType: 'blob' })
  }

  async exportAttendees(id: string) {
    return api.get<Blob>(`/events/${id}/export/attendees`, {
      responseType: 'blob',
    })
  }

  async getById(id: string) {
    return api.get<Event>(`/events/${id}`)
  }
  exportPdf(id: string) {
    return api.get(`/events/${id}/export/pdf`, {
      responseType: 'blob',
    })
  }

  exportPng(id: string) {
    return api.get(`/events/${id}/export/png`, {
      responseType: 'blob',
    })
  }

  async register(
    id: string,
    data: { name: string; email: string; data: Record<string, any> }
  ) {
    return api.post<{ url: string }>(`/events/${id}/register`, data)
  }

  async recordVisit(id: string) {
    return api.post<{ success: boolean }>(`/events/${id}/visit`, {})
  }

  async recordDownload(id: string) {
    return api.post<{ success: boolean }>(`/events/${id}/download`, {})
  }

  async recordShare(id: string) {
    return api.post<{ success: boolean }>(`/events/${id}/share`, {})
  }

  async uploadAsset(id: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ url: string }>(`/events/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
}

export const eventsRequest = new EventsRequest()

import { api } from '../api'

export interface CreateEventDto {
  name: string
  slug: string
  date: string
  description?: string
  coverImage?: string
}

export interface Event {
  id: string
  name: string
  slug: string
  date: string
  createdAt: string
  updatedAt: string
  userId: string
  _count?: {
    cards: number
  }
}

export class EventsRequest {
  async create(data: CreateEventDto) {
    return api.post<Event>('/events', data)
  }

  async getAll() {
    return api.get<Event[]>('/events')
  }

  async getOne(id: string) {
    return api.get<Event>(`/events/${id}`)
  }
}

export const eventsRequest = new EventsRequest()

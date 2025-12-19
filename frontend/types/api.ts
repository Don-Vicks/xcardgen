// Type APi
export type ApiResponse<T> = {
  status: 'success' | 'error'
  message?: string
  data: T
}

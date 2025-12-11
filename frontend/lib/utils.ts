import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface AxiosErrorLike extends Error {
  response?: {
    data?: {
      message?: string | string[]
    }
  }
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) {
    // Check for Axios error structure or specific property
    const axiosError = error as AxiosErrorLike
    if (axiosError.response?.data?.message) {
      const msg = axiosError.response.data.message
      // NestJS often returns array of strings for validation errors
      if (Array.isArray(msg)) return msg.join(', ')
      return msg
    }
    return error.message
  }
  return 'An unexpected error occurred'
}

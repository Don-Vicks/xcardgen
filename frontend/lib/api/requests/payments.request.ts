import { api } from '../api'

export interface PaymentMethod {
  id: string
  type: 'card' | 'crypto'
  last4?: string
  brand?: string
  expiresAt?: string
}

export interface Transaction {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  date: string
  description: string
  invoiceUrl?: string
  txHash?: string
}

export interface UsageRecord {
  id: string
  createdAt: string
  imageUrl: string
  event: {
    name: string
    slug: string
  }
  attendee?: {
    name: string
    email: string
  }
}

export interface SubscriptionStatus {
  subscription: {
    id: string
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
    endDate: string
    subscriptionPlan: {
      name: string
      amount: number
      interval: string
      maxGenerations: number
    }
  } | null
  usage: {
    generationsUsed: number
    generationsLimit: number
    extraCredits: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export const paymentsRequest = {
  getPlans: async () => {
    return api.get('/payments/plans')
  },

  getSubscription: async () => {
    return api.get<SubscriptionStatus>('/payments/subscription')
  },

  getHistory: async (page = 1, limit = 10) => {
    return api.get<PaginatedResponse<Transaction>>(
      `/payments/history?page=${page}&limit=${limit}`
    )
  },

  getUsage: async (page = 1, limit = 10) => {
    return api.get<PaginatedResponse<UsageRecord>>(
      `/payments/usage?page=${page}&limit=${limit}`
    )
  },

  initCryptoPayment: async (
    planId: string,
    currency: 'SOL' | 'ETH' | 'USDC'
  ) => {
    return api.post('/payments/crypto/init', { planId, currency })
  },

  confirmCryptoPayment: async (
    paymentId: string,
    txHash: string,
    walletAddress: string
  ) => {
    return api.post('/payments/crypto/confirm', {
      paymentId,
      txHash,
      walletAddress,
    })
  },

  buyCredits: async (amount: number, currency: 'SOL' | 'USDC') => {
    return api.post('/payments/credits/init', { amount, currency })
  },

  confirmCreditPurchase: async (paymentId: string, txHash: string) => {
    return api.post('/payments/credits/confirm', { paymentId, txHash })
  },
}

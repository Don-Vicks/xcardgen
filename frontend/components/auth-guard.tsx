"use client"

import { apiRequest } from "@/lib/api/requests/auth.request"
import { useAuth } from "@/stores/auth-store"
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LoadingScreen } from "./ui/loading-screen"

interface AuthGuardProps {
  children: React.ReactNode
}

const authRequest = new apiRequest()

const AUTH_REFETCH_INTERVAL = 15 * 60 * 1000

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, setUser } = useAuth()
  const router = useRouter()

  // Create QueryClient once per component mount
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: AUTH_REFETCH_INTERVAL,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuardContent user={user} loading={loading} setUser={setUser} router={router}>
        {children}
      </AuthGuardContent>
    </QueryClientProvider>
  )
}

// Inner component that uses useQuery (must be inside QueryClientProvider)
function AuthGuardContent({
  user,
  loading,
  setUser,
  router,
  children
}: {
  user: any
  loading: boolean
  setUser: (user: any) => void
  router: any
  children: React.ReactNode
}) {
  // Periodic auth check using TanStack Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const response = await authRequest.getProfile()
      return response.data
    },
    refetchInterval: AUTH_REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
    retry: 1,
    staleTime: AUTH_REFETCH_INTERVAL,
    enabled: !!user,
  })

  // Update Zustand store if profile data changes
  useEffect(() => {
    if (data && user) {
      if (JSON.stringify(data) !== JSON.stringify(user)) {
        setUser(data)
      }
    }
  }, [data, user, setUser])

  // Handle auth errors (session expired)
  useEffect(() => {
    if (isError && !loading) {
      console.log("Auth check failed, redirecting to login")
      router.push("/login")
    }
  }, [isError, loading, router])

  // Initial auth check and redirects
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        const hasWorkspace =
          (user.workspaceMemberships && user.workspaceMemberships.length > 0) ||
          (user.workspaceOwnerships && user.workspaceOwnerships.length > 0)

        if (!hasWorkspace) {
          router.push("/onboarding")
        }
      }
    }
  }, [user, loading, router])

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingScreen text="Verifying access..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}


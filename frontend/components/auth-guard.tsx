"use client"

import { useAuth } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingScreen } from "./ui/loading-screen"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        // User is logged in, check for workspace
        const hasWorkspace =
          (user.workspaceMemberships && user.workspaceMemberships.length > 0) ||
          (user.workspaceOwnerships && user.workspaceOwnerships.length > 0)

        console.log("User", user, "Workspace", hasWorkspace)
        if (!hasWorkspace) {
          router.push("/onboarding")
        }
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingScreen text="Verifying access..." />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}

"use client"

import { AuthGuard } from "@/components/auth-guard"
import { CreateWorkspaceForm } from "@/components/forms/create-workspace-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"


export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const hasWorkspace =
        (user.workspaceMemberships && user.workspaceMemberships.length > 0) ||
        (user.workspaceOwnerships && user.workspaceOwnerships.length > 0)

      if (hasWorkspace) {
        router.push("/dashboard")
      }
    }
  }, [user, router])

  const handleSuccess = () => {
    router.push("/dashboard")
  }

  return (
    <AuthGuard>
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Workspace</CardTitle>
            <CardDescription>
              Let&apos;s get your workspace set up. You can allow others to join later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWorkspaceForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}


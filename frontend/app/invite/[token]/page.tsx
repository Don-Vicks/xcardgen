"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { workspacesRequest } from "@/lib/api/requests/workspaces.request"
import { useAuth } from "@/stores/auth-store"
import { Check, Loader2, Users, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function InviteAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const { user, loading: authLoading } = useAuth()

  const [inviteInfo, setInviteInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await workspacesRequest.getInviteInfo(token)
        setInviteInfo(res.data)
      } catch (err: any) {
        setError(err?.response?.data?.message || "Invalid or expired invite")
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchInvite()
  }, [token])

  const handleAccept = async () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?returnUrl=/invite/${token}`)
      return
    }

    setAccepting(true)
    try {
      await workspacesRequest.acceptInvite(token)
      toast.success("You've joined the workspace!")
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to accept invite")
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = async () => {
    setDeclining(true)
    try {
      await workspacesRequest.declineInvite(token)
      toast.success("Invite declined")
      router.push("/")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to decline invite")
    } finally {
      setDeclining(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Invite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {/* Workspace Logo */}
          <div className="mx-auto mb-4 h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            {inviteInfo?.workspace?.logo ? (
              <Image
                src={inviteInfo.workspace.logo}
                alt={inviteInfo.workspace.name}
                width={48}
                height={48}
                className="rounded-lg"
              />
            ) : (
              <Users className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle>You've been invited!</CardTitle>
          <CardDescription>
            Join <span className="font-semibold text-foreground">{inviteInfo?.workspace?.name}</span> as a{" "}
            <span className="font-medium">{inviteInfo?.role}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          {inviteInfo?.workspace?.description && (
            <p className="text-sm text-center text-muted-foreground mb-4">
              {inviteInfo.workspace.description}
            </p>
          )}

          {!user && (
            <div className="bg-muted rounded-lg p-4 text-center text-sm">
              <p className="text-muted-foreground mb-2">
                You need to sign in to accept this invite.
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/login?returnUrl=/invite/${token}`}>Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/register?returnUrl=/invite/${token}`}>Create Account</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDecline}
            disabled={declining}
          >
            {declining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
            Decline
          </Button>
          <Button
            className="flex-1"
            onClick={handleAccept}
            disabled={accepting || !user}
          >
            {accepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Accept
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

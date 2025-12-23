"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api/requests/auth.request"
import { LoginLog, Session } from "@/types/models"
import { format } from "date-fns"
import { Laptop, LogOut, Phone, Shield, Smartphone } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const authRequest = new apiRequest()

export function SecurityView() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [logs, setLogs] = useState<LoginLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, logsRes] = await Promise.all([
          authRequest.getSessions(),
          authRequest.getLoginLogs()
        ])
        setSessions(sessionsRes.data)
        setLogs(logsRes.data)
      } catch (error) {
        console.error("Failed to fetch settings data", error)
        toast.error("Failed to load session history")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogoutAll = async () => {
    try {
      await authRequest.logoutAll()
      toast.success("Logged out from all other devices")
      // Refresh list
      const res = await authRequest.getSessions()
      setSessions(res.data)
    } catch (error) {
      toast.error("Failed to logout devices")
    }
  }

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.toLowerCase().includes("mobile")) return <Smartphone className="h-4 w-4" />
    if (userAgent.toLowerCase().includes("android") || userAgent.toLowerCase().includes("iphone")) return <Phone className="h-4 w-4" />
    return <Laptop className="h-4 w-4" />
  }

  if (loading) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Loading security details...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage devices where you are currently logged in.
              </CardDescription>
            </div>
            <Button variant="destructive" size="sm" onClick={handleLogoutAll} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out all devices
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {sessions.map((session) => (
              <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 border rounded-lg sm:border-0 sm:p-0">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="rounded-full bg-muted p-2 shrink-0">
                    {getDeviceIcon(session.userAgent || "")}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate pr-2">
                      {session.userAgent?.substring(0, 40) || "Unknown Device"}
                      {new Date().getTime() - new Date(session.lastActivity).getTime() < 10 * 60 * 1000 ? (
                        <span className="ml-2 text-xs text-green-500 font-normal">(Active)</span>
                      ) : (
                        <span className="ml-2 text-xs text-red-500 font-normal">(Inactive)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.ipAddress} • Last active {format(new Date(session.lastActivity), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto mt-2 sm:mt-0"
                  onClick={async () => {
                    try {
                      await authRequest.revokeSession(session.id)
                      toast.success("Session revoked")
                      const res = await authRequest.getSessions()
                      setSessions(res.data)
                    } catch (e) {
                      toast.error("Failed to revoke session")
                    }
                  }}
                >
                  Revoke
                </Button>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-sm text-muted-foreground">No active sessions found.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Recent login attempts to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-muted p-2">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Login from {log.ipAddress}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-sm text-muted-foreground">No login history available.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

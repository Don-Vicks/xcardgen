"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiRequest } from "@/lib/api/requests/auth.request"
import { useAuth } from "@/stores/auth-store"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const authRequest = new apiRequest()

export function ProfileView() {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user?.name || "")

  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await authRequest.updateProfile({ name })
      // Update local store
      setUser({ ...user!, name: res.data.name })
      toast.success("Profile updated")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your public profile information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user?.email || ""}
            disabled
            className="bg-muted"
          />
          <p className="text-[0.8rem] text-muted-foreground">
            Email cannot be changed directly. Contact support.
          </p>
        </div>
        <div className="pt-2">
          <Button onClick={handleSave} disabled={loading || name === user?.name}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

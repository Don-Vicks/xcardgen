"use client"

import { WorkspaceAppearanceSettings } from "@/components/dashboard/workspace-appearance-settings"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { workspacesRequest } from "@/lib/api/requests/workspaces.request"
import { useAuth } from "@/stores/auth-store"
import { useWorkspace } from "@/stores/workspace-store"
import { Copy, Crown, Globe, Image as ImageIcon, Loader2, MoreHorizontal, Plus, Trash2, Upload, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function WorkspaceSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace()
  const [loading, setLoading] = useState(false)
  const [membersData, setMembersData] = useState<{
    owner: { id: string; name: string; email: string } | null
    members: any[]
  }>({ owner: null, members: [] })
  const [loadingMembers, setLoadingMembers] = useState(true)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [logo, setLogo] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [socialLinks, setSocialLinks] = useState({
    website: "",
    twitter: "",
    linkedin: "",
    instagram: ""
  })
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  // Invite dialog
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER")
  const [inviting, setInviting] = useState(false)

  // Remove member dialog
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null)
  const [removing, setRemoving] = useState(false)
  // Permissions
  const [isWorkspaceAdmin, setIsWorkspaceAdmin] = useState(false)

  // Feature Flags
  const canCustomizeAssets = user?.subscription?.plan?.features?.canCustomizeAssets

  function PremiumOverlay({ label = "Upgrade to Pro" }: { label?: string }) {
    return (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg border border-dashed border-primary/20">
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{label}</h4>
            <p className="text-xs text-muted-foreground w-[200px]">
              Unlock workspace branding with our Pro plan.
            </p>
          </div>
          <Button size="sm" className="mt-2" asChild>
            <a href="/dashboard/billing">Upgrade Plan</a>
          </Button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (membersData.owner && user) {
      const isOwner = membersData.owner.id === user.id
      const currentUserMember = membersData.members.find((m) => m.user?.id === user.id)
      const isAdminRole = currentUserMember?.role === 'ADMIN'
      setIsWorkspaceAdmin(isOwner || isAdminRole)
    }
  }, [membersData, user])

  // Fetch fresh workspace data
  useEffect(() => {
    const refreshWorkspace = async () => {
      if (!currentWorkspace?.id) return
      try {
        const res = await workspacesRequest.getOne(currentWorkspace.id)
        const ws: any = res.data // Cast to any to handle new fields if types lag
        setName(ws.name || "")
        setDescription(ws.description || "")
        setLogo(ws.logo || "")
        setCoverImage(ws.coverImage || "")
        setSocialLinks({
          website: ws.socialLinks?.website || "",
          twitter: ws.socialLinks?.twitter || "",
          linkedin: ws.socialLinks?.linkedin || "",
          instagram: ws.socialLinks?.instagram || ""
        })
        fetchMembers()
      } catch (err) {
        console.error("Failed to refresh workspace", err)
      }
    }
    refreshWorkspace()
  }, [currentWorkspace?.id])

  const fetchMembers = async () => {
    if (!currentWorkspace) return
    try {
      setLoadingMembers(true)
      const res = await workspacesRequest.getMembers(currentWorkspace.id)
      setMembersData(res.data)
    } catch (error) {
      console.error("Failed to fetch members", error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleSaveGeneral = async () => {
    if (!currentWorkspace) return
    setLoading(true)
    try {
      const res = await workspacesRequest.update(currentWorkspace.id, {
        name,
        description,
        logo,
        coverImage,
        socialLinks
      })
      setCurrentWorkspace({ ...currentWorkspace, ...res.data })
      toast.success("Workspace settings updated!")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update workspace")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const res = await workspacesRequest.uploadLogo(file)
      setLogo(res.data.url)
      toast.success("Logo uploaded")
    } catch (error) {
      toast.error("Failed to upload logo")
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const res = await workspacesRequest.uploadCover(file)
      setCoverImage(res.data.url)
      toast.success("Cover image uploaded")
    } catch (error) {
      toast.error("Failed to upload cover")
    } finally {
      setUploadingCover(false)
    }
  }

  const handleInvite = async () => {
    if (!currentWorkspace || !inviteEmail) return
    setInviting(true)
    try {
      await workspacesRequest.inviteMember(currentWorkspace.id, inviteEmail, inviteRole)
      toast.success("Invite sent!")
      setInviteOpen(false)
      setInviteEmail("")
      fetchMembers()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send invite")
    } finally {
      setInviting(false)
    }
  }

  const confirmRemoveMember = (member: any) => {
    setMemberToRemove({
      id: member.id,
      name: member.user?.name || member.inviteEmail || "this member"
    })
    setRemoveDialogOpen(true)
  }

  const handleRemoveMember = async () => {
    if (!currentWorkspace || !memberToRemove || !user) return // Ensure user is defined
    setRemoving(true)
    try {
      // Updated API call signature based on the instruction
      await workspacesRequest.removeMember(currentWorkspace.id, memberToRemove.id)

      // Check if the removed member is the current user
      const currentUserMember = membersData.members.find(m => m.user?.id === user.id);

      if (currentUserMember && currentUserMember.id === memberToRemove.id) {
        toast.success("You have left the workspace.")
        useWorkspace.getState().setCurrentWorkspace(null) // Directly update store
        router.push("/onboarding")
        return // Stop further execution if self-removed
      }

      toast.success("Member removed")
      setRemoveDialogOpen(false)
      setMemberToRemove(null) // Keep this for state cleanup
      fetchMembers()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove member")
    } finally {
      setRemoving(false)
    }
  }

  const handleChangeRole = async (memberId: string, role: "ADMIN" | "MEMBER") => {
    if (!currentWorkspace) return
    try {
      await workspacesRequest.updateMemberRole(currentWorkspace.id, memberId, role)
      toast.success("Role updated")
      fetchMembers()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update role")
    }
  }

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    toast.success("Invite link copied!")
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">No workspace selected</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Public Page</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* GENERAL DETAILS */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Details</CardTitle>
              <CardDescription>Update your workspace information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isWorkspaceAdmin} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your workspace..."
                  disabled={!isWorkspaceAdmin}
                />
              </div>
              {isWorkspaceAdmin && (
                <Button onClick={handleSaveGeneral} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>

          {/* BRANDING */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Branding
              </CardTitle>
              <CardDescription>Customize your workspace appearance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Workspace Logo</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border">
                      <AvatarFallback className="text-xl">
                        {name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                      {logo && <img src={logo} alt="Logo" className="object-cover w-full h-full" />}
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="relative overflow-hidden" disabled={!isWorkspaceAdmin || uploadingLogo}>
                          {uploadingLogo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                          Upload Logo
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} disabled={!isWorkspaceAdmin || uploadingLogo} />
                        </Button>
                        {logo && isWorkspaceAdmin && <Button variant="ghost" size="sm" onClick={() => setLogo("")}>Remove</Button>}
                      </div>
                      <p className="text-xs text-muted-foreground">Recommended: 256x256px max.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Cover Image</Label>
                  <div className="relative group rounded-md overflow-hidden border aspect-video bg-muted/30">
                    {coverImage ? (
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm">No cover image</div>
                    )}
                    {isWorkspaceAdmin && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="relative cursor-pointer">
                          {uploadingCover ? <Loader2 className="animate-spin h-4 w-4" /> : "Change Cover"}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SOCIAL LINKS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Links
              </CardTitle>
              <CardDescription>Links displayed on your public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input placeholder="https://example.com" value={socialLinks.website} onChange={e => setSocialLinks({ ...socialLinks, website: e.target.value })} disabled={!isWorkspaceAdmin} />
                </div>
                <div className="space-y-2">
                  <Label>Twitter / X</Label>
                  <Input placeholder="@username" value={socialLinks.twitter} onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })} disabled={!isWorkspaceAdmin} />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input placeholder="LinkedIn URL" value={socialLinks.linkedin} onChange={e => setSocialLinks({ ...socialLinks, linkedin: e.target.value })} disabled={!isWorkspaceAdmin} />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input placeholder="@username" value={socialLinks.instagram} onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })} disabled={!isWorkspaceAdmin} />
                </div>
              </div>
              {isWorkspaceAdmin && (
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSaveGeneral} disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Socials</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <WorkspaceAppearanceSettings
            workspace={currentWorkspace}
            onUpdate={(newAppearance) => setCurrentWorkspace({ ...currentWorkspace, appearance: newAppearance } as any)}
          />
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <CardDescription>Manage who has access to this workspace.</CardDescription>
              </div>
              {isWorkspaceAdmin && (
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    {(() => {
                      const plan = user?.subscription?.plan;
                      const maxMembers = plan?.maxMembers || 1;
                      const currentMembers = membersData.members.length; // Includes owner + members
                      const isLimitReached = maxMembers !== -1 && currentMembers >= maxMembers;

                      // Explicit check for "Solo" plans (Starter) where maxMembers is 1 (Owner only)
                      const isSoloPlan = maxMembers === 1;

                      if (isSoloPlan) {
                        return (
                          <Button size="sm" className="gap-2" asChild variant="outline">
                            <a href="/dashboard/billing">
                              <Crown className="h-4 w-4 text-primary" />
                              Upgrade to Add Members
                            </a>
                          </Button>
                        )
                      }

                      return (
                        <Button size="sm" className="gap-2" disabled={isLimitReached} title={isLimitReached ? "Team member limit reached" : ""}>
                          <Plus className="h-4 w-4" />
                          Invite Member
                          {isLimitReached && (
                            <span className="ml-1 text-[10px] bg-white/20 px-1 py-0.5 rounded">
                              Max
                            </span>
                          )}
                        </Button>
                      )
                    })()}
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invite to add someone to your workspace.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {inviteRole === "MEMBER"
                            ? "Members can view events, manage attendees, and generate xCards."
                            : "Admins have full access including editing workspace settings and managing team members."}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                      <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
                        {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Invite
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
              }
            </CardHeader >
            <CardContent>
              {loadingMembers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Owner */}
                  {membersData.owner && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{membersData.owner.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{membersData.owner.name}</p>
                          <p className="text-sm text-muted-foreground">{membersData.owner.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Owner
                      </Badge>
                    </div>
                  )}

                  {/* Members */}
                  {membersData.members.map((member) => {
                    const isOwner = user?.id === membersData.owner?.id;
                    // If the user is the owner, they can do everything.
                    // If the user is an admin, they can manage members but usually not other admins (logic can vary, assuming simple allow for now or check below).
                    // But typically we need to know the CURRENT user's role.
                    const currentUserMember = membersData.members.find(m => m.user?.id === user?.id);
                    const isCurrentUserAdmin = currentUserMember?.role === 'ADMIN';
                    const canManage = isOwner || isCurrentUserAdmin;

                    const isSelf = member.user?.id === user?.id;

                    return (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {(member.user?.name || member.inviteEmail)?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center">
                              {member.user?.name || member.inviteEmail}
                              {!member.acceptedAt && (
                                <Badge variant="outline" className="ml-2 text-xs">Pending</Badge>
                              )}
                              {isSelf && (
                                <Badge className="ml-2 text-xs" variant="secondary">You</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {member.user?.email || member.inviteEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>
                            {member.role}
                          </Badge>

                          {/* Admin Actions for others */}
                          {canManage && !isSelf && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!member.acceptedAt && member.inviteToken && (
                                  <DropdownMenuItem onClick={() => copyInviteLink(member.inviteToken)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Invite Link
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleChangeRole(member.id, member.role === "ADMIN" ? "MEMBER" : "ADMIN")
                                  }
                                >
                                  Make {member.role === "ADMIN" ? "Member" : "Admin"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => confirmRemoveMember(member)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          {/* Self Action: Leave Workspace */}
                          {isSelf && !isOwner && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => confirmRemoveMember(member)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Leave Workspace
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {membersData.members.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No team members yet. Invite someone!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Remove Member Confirmation Dialog */}
      < Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <span className="font-semibold">{memberToRemove?.name}</span> from this workspace?
              They will lose access to all workspace resources.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)} disabled={removing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={removing}>
              {removing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </div >
  )
}

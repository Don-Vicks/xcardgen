import { workspacesRequest } from '@/lib/api/requests/workspaces.request'
import { useAuth } from '@/stores/auth-store'
import { useWorkspace } from '@/stores/workspace-store'
import { useEffect, useState } from 'react'

export function useWorkspacePermissions() {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPermissions = async () => {
      if (!currentWorkspace || !user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      // If user is the owner, they are admin
      if (currentWorkspace.ownerId === user.id) {
        setIsAdmin(true)
        setLoading(false)
        return
      }

      // Hack: We don't have roles in currentWorkspace or user store readily available sometimes
      // We'll fetch members once to be sure, or check if we have it locally if optimized later.
      // Ideally currentWorkspace should include the current user's role.
      // For now, let's fetch members if we don't have a reliable way.
      // Actually, checking `workspaceMemberships` in auth store might be faster if it has roles?
      // Based on previous view, it didn't seem to have role.
      // Optimization: Fetch just the current user's member record?
      // Let's rely on fetching members for now, or assume non-owner is member if not found.
      // BUT `workspacesRequest.getMembers` might be heavy.
      // Let's try to assume false until verified.

      try {
        const res = await workspacesRequest.getMembers(currentWorkspace.id)
        const owner = res.data.owner
        const members = res.data.members

        if (owner?.id === user.id) {
          setIsAdmin(true)
        } else {
          const member = members.find((m: any) => m.user?.id === user.id)
          setIsAdmin(member?.role === 'ADMIN')
        }
      } catch (e) {
        console.error('Failed to check permissions', e)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkPermissions()
  }, [currentWorkspace, user])

  return { isAdmin, loading }
}

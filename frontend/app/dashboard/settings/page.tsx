"use client"

import { ProfileView } from "@/components/dashboard/settings/profile-view"
import { SecurityView } from "@/components/dashboard/settings/security-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"

// Dynamic import to avoid SSR issues with the workspace settings
const WorkspaceSettingsContent = dynamic(
  () => import("./workspace/page").then((mod) => ({ default: mod.default })),
  { ssr: false }
)

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "account"

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="space-y-4">
          <ProfileView />
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <SecurityView />
        </TabsContent>
        <TabsContent value="workspace" className="space-y-4">
          <WorkspaceSettingsContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}


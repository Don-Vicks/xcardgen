"use client"

import { ProfileView } from "@/components/dashboard/settings/profile-view"
import { SecurityView } from "@/components/dashboard/settings/security-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="space-y-4">
          <ProfileView />
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <SecurityView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

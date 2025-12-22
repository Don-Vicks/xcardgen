"use client"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { AudienceOverview } from "@/components/dashboard/audience-overview"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { eventsRequest } from "@/lib/api/requests/events.request"
import { useAuth } from "@/stores/auth-store"
import { useWorkspace } from "@/stores/workspace-store"
import { BarChart3, Calendar, CreditCard, Layout, Plus, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { user } = useAuth()
  const hasAdvancedStats = user?.subscription?.plan?.features?.hasAdvancedAnalytics || false

  const [data, setData] = useState<{
    stats: { views: number; generations: number; attendees: number; activeEvents: number }
    activityTrend: any[]
    feed: any[]
    audience: any
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { currentWorkspace } = useWorkspace()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Global Stats
        const statsRes = await eventsRequest.getDashboardStats(currentWorkspace?.id || '')
        // Fetch List for active count
        const eventsRes = await eventsRequest.getAll({ limit: 1, workspaceId: currentWorkspace?.id || '' })

        setData({
          ...statsRes.data,
          stats: {
            ...statsRes.data.stats,
            activeEvents: eventsRes.data.meta.total
          }
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentWorkspace])

  if (loading) {
    return <LoadingScreen text="Analyzing dashboard data..." />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h3 className="text-lg font-semibold text-destructive">Failed to load dashboard data.</h3>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Global analytics and real-time activity across your organization.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/templates">
              <Layout className="mr-2 h-4 w-4" />
              Manage Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create xCard
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active xCards</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Total xCards created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.attendees}</div>
            <p className="text-xs text-muted-foreground">Registered across all xCards</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">xCards Generated</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.generations}</div>
            <p className="text-xs text-muted-foreground">Total images created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.views}</div>
            <p className="text-xs text-muted-foreground">Total visits to registration pages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 relative">
        <div className={`col-span-4 transition-all duration-300 ${!hasAdvancedStats ? "blur-sm opacity-50 pointer-events-none grayscale" : ""}`}>
          <DashboardCharts data={data.activityTrend} />
        </div>
        {!hasAdvancedStats && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            {/* Glassmorphic Minimal Card */}
            <div className="flex flex-col items-center gap-3 bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 px-8 py-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg tracking-tight">Advanced Analytics</h3>
                <p className="text-xs text-muted-foreground/80 max-w-[200px] leading-relaxed">
                  Unlock detailed trends and audience insights.
                </p>
              </div>
              <Button size="sm" className="w-full rounded-full h-8 text-xs font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary" asChild>
                <Link href="/dashboard/billing">
                  Upgrade to Pro
                </Link>
              </Button>
            </div>
          </div>
        )}
        <ActivityFeed items={data.feed} />
      </div>

      <div className="relative">
        <div className={!hasAdvancedStats ? "blur-sm opacity-50 pointer-events-none grayscale" : ""}>
          <AudienceOverview audience={data.audience} />
        </div>
        {!hasAdvancedStats && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Link href="/dashboard/billing" className="group flex items-center gap-2 bg-background/80 hover:bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer">
              <BarChart3 className="h-4 w-4 text-primary group-hover:text-primary/80 transition-colors" />
              <span className="text-xs font-semibold">Unlock Audience Data</span>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links Footer */}
      <div className="flex items-center justify-center pt-8 border-t">
        <Button variant="link" asChild className="text-muted-foreground">
          <Link href="/dashboard/events">View All xCards &rarr;</Link>
        </Button>
      </div>
    </div>
  )
}


// Force rebuild

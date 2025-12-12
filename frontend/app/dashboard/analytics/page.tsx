"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { eventsRequest } from "@/lib/api/requests/events.request"
import { useWorkspace } from "@/stores/workspace-store"
import { ArrowRight, BarChart3, CreditCard, Download, Eye, Share2, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe']

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-2 shadow-sm">
        <p className="text-sm font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill || entry.stroke || entry.color }} />
            <span className="text-sm text-muted-foreground mr-1">{entry.name}:</span>
            <span className="text-sm font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const { currentWorkspace } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [period, setPeriod] = useState("30")
  const [data, setData] = useState<{
    stats: { views: number; generations: number; attendees: number }
    activityTrend: { date: string; views: number; generations: number }[]
    audience: {
      countries: { name: string; value: number }[]
      devices: { name: string; value: number }[]
    }
  } | null>(null)

  useEffect(() => {
    if (!currentWorkspace?.id) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch dashboard stats
        const statsRes = await eventsRequest.getDashboardStats(currentWorkspace.id)
        setData(statsRes.data)

        // Fetch events list
        const eventsRes = await eventsRequest.getAll({ workspaceId: currentWorkspace.id })
        const eventsList = Array.isArray(eventsRes.data)
          ? eventsRes.data
          : (eventsRes.data?.data || [])
        setEvents(eventsList)
      } catch (error) {
        console.error("Failed to load analytics", error)
        toast.error("Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentWorkspace?.id, period])

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground">Loading workspace analytics...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const stats = data?.stats || { views: 0, generations: 0, attendees: 0 }
  const activityTrend = data?.activityTrend || []
  const devices = data?.audience?.devices || []
  const countries = data?.audience?.countries || []

  // Calculate totals from events
  const totalDownloads = events.reduce((sum, e) => sum + (e.stats?.downloads || 0), 0)
  const totalShares = events.reduce((sum, e) => sum + (e.stats?.shares || 0), 0)
  const conversionRate = stats.views > 0 ? ((stats.generations / stats.views) * 100).toFixed(1) : "0"

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Overview of all xCards in {currentWorkspace?.name || "your workspace"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      {/* KPI Cards */}
      <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4">
        <Card className="min-w-[240px] flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all xCards</p>
          </CardContent>
        </Card>
        <Card className="min-w-[240px] flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Generated</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.generations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{conversionRate}% conversion rate</p>
          </CardContent>
        </Card>
        <Card className="min-w-[240px] flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.attendees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unique participants</p>
          </CardContent>
        </Card>
        <Card className="min-w-[240px] flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cards saved to device</p>
          </CardContent>
        </Card>
        <Card className="min-w-[240px] flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalShares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Shared on social media</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Activity Trend */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>Views and card generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {activityTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityTrend}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorGens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="views" name="Views" stroke="#8884d8" fillOpacity={1} fill="url(#colorViews)" />
                    <Area type="monotone" dataKey="generations" name="Generations" stroke="#82ca9d" fillOpacity={1} fill="url(#colorGens)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No activity data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Visitor devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {devices.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={devices}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name || 'Unknown'} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No device data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Countries & xCards Table */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Top Countries */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Where your audience is from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {countries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countries.slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No location data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* xCards Performance Table */}
        <Card className="col-span-5">
          <CardHeader>
            <CardTitle>xCards Performance</CardTitle>
            <CardDescription>Individual xCard metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Generations</TableHead>
                    <TableHead className="text-right">Attendees</TableHead>
                    <TableHead className="text-right">Downloads</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.slice(0, 5).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>
                        <Badge variant={event.status === 'PUBLISHED' ? "default" : "secondary"}>
                          {event.status || 'DRAFT'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{event.stats?.views || 0}</TableCell>
                      <TableCell className="text-right">{event.stats?.generations || 0}</TableCell>
                      <TableCell className="text-right">{event.stats?.attendees || 0}</TableCell>
                      <TableCell className="text-right">{event.stats?.downloads || 0}</TableCell>
                      <TableCell className="text-right">{event.stats?.shares || 0}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/events/${event.slug}/analytics`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            Details <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No xCards yet. Create one to see analytics.</p>
              </div>
            )}

            {events.length > 5 && (
              <div className="mt-4 text-center">
                <Link href="/dashboard/events">
                  <Button variant="outline" size="sm">
                    View all {events.length} xCards
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

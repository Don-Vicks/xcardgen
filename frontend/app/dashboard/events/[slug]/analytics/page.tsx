"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { eventsRequest } from "@/lib/api/requests/events.request"
import { cn } from "@/lib/utils"
import { addDays, format, formatDistanceToNow } from "date-fns"
import { Calendar as CalendarIcon, CreditCard, Download, Eye, FileDown, Gem, Globe, LockIcon, Users } from "lucide-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { DateRange } from "react-day-picker"
import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-popover p-2 shadow-sm">
        <p className="text-sm font-semibold mb-1 ">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.fill || entry.stroke || entry.color }}
            />
            <span className="text-sm text-muted-foreground mr-1">
              {entry.name}:
            </span>
            <span className="text-sm font-bold">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function PremiumOverlay({ label = "Upgrade to Pro" }: { label?: string }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg border border-dashed border-primary/20">
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Gem className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">{label}</h4>
          <p className="text-xs text-muted-foreground w-[200px]">
            Unlock advanced insights with our Pro plan.
          </p>
        </div>
        <Button size="sm" className="mt-2" asChild>
          <a href="/dashboard/billing">Upgrade Plan</a>
        </Button>
      </div>
    </div>
  )
}


import { useAuth } from "@/stores/auth-store"
import { useWorkspace } from "@/stores/workspace-store"

export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const analyticsRef = useRef<HTMLDivElement>(null)
  const { currentWorkspace } = useWorkspace()
  const { user } = useAuth()
  const hasAdvancedStats = user?.subscription?.plan?.features?.hasAdvancedAnalytics
  const canExportAttendees = user?.subscription?.plan?.features?.canCollectEmails

  // Removed reportRef

  const [data, setData] = useState<{
    event: any,
    stats: any,
    visitsOverTime: any[],
    deviceBreakdown: any[],
    countryBreakdown: any[],
    trafficSources: any[],
    recentActivity: any[],
    peakActivity?: { hour: number; count: number }[],
    topDomains?: { name: string; value: number }[],
    trends?: { views: number; generations: number }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  // Removed isExporting state
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  useEffect(() => {
    const fetchStats = async () => {
      if (!params.slug) return
      // Wait for workspace to be loaded if possible, or just proceed. 
      // If currentWorkspace is undefined initially, it might fail if strict mode relies on it.
      // But usually store initializes fast or is persisted.

      try {
        const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug

        // Fetch specific event by slug, providing workspace context
        const eventRes = await eventsRequest.getById(slug, currentWorkspace?.id)
        const event = eventRes.data

        if (event) {
          const res = await eventsRequest.getAnalytics(
            event.id,
            date?.from,
            date?.to
          )
          // Merge event info into data for the UI
          setData({ ...res.data, event })
        }
      } catch (error) {
        console.error("Failed to load analytics", error)
        toast.error("Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [params.slug, date, currentWorkspace?.id])

  const downloadCsv = (blob: any, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  }

  const handleExportAnalytics = async () => {
    try {
      toast.info("Preparing analytics summary...")
      const res = await eventsRequest.exportAnalytics(event.id)
      downloadCsv(res.data, `analytics-${event.slug}.csv`)
      toast.success("Analytics summary downloaded!")
    } catch (e) {
      toast.error("Failed to export analytics")
    }
  }

  const handleExportAttendees = async () => {
    try {
      toast.info("Preparing attendees list...")
      const res = await eventsRequest.exportAttendees(event.id)
      downloadCsv(res.data, `attendees-${event.slug}.csv`)
      toast.success("Attendees list downloaded!")
    } catch (e) {
      toast.error("Failed to export attendees")
    }
  }

  const handleExport = async (format: 'pdf' | 'png') => {
    try {
      toast.info(`Generating ${format.toUpperCase()} report...`, {
        description: "This usually takes 5-10 seconds."
      })

      const res = await (format === 'pdf'
        ? eventsRequest.exportPdf(event.id)
        : eventsRequest.exportPng(event.id))

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Report downloaded successfully")
    } catch (error) {
      console.error("Export failed", error)
      toast.error("Failed to generate report")
    }
  }

  if (loading) return <div className="p-8">Loading analytics...</div>
  // Robustly handle missing properties from backend by defaulting/destructuring safely
  if (!data) return <div className="p-8">No stats available</div>

  const {
    event,
    stats,
    visitsOverTime = [],
    deviceBreakdown = [],
    countryBreakdown = [],
    trafficSources = [],
    recentActivity = [],
    peakActivity = [],
    topDomains = [],
    trends = null
  } = data || {}

  // Calculate Funnel Data
  const funnelData = [
    { name: 'Visits', value: stats.views, fill: '#8884d8' },
    { name: 'Generations', value: stats.generations, fill: '#82ca9d' },
    { name: 'Downloads', value: stats.downloads, fill: '#ffc658' },
    { name: 'Mints', value: stats.nftMints || 0, fill: '#ff8042' },
  ]

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Event Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {event.coverImage && (
            <div className="relative h-16 w-16 rounded-md overflow-hidden border">
              <Image src={event.coverImage} alt={event.name} fill className="object-cover" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">{event.name}</h2>
              <Badge variant={event.status === 'PUBLISHED' ? "default" : "secondary"}>{event.status || 'DRAFT'}</Badge>
            </div>
            <p className="text-muted-foreground flex items-center text-sm">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {format(new Date(event.date), "MMMM d, yyyy")} • {event.slug}
            </p>
          </div>
        </div>

        {/* Controls: Date Picker & Export */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                <FileDown className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Report Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Download Report (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('png')}>
                Download Report (PNG Image)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Data Exports</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleExportAnalytics}>
                Export Analytics (CSV)
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={canExportAttendees ? handleExportAttendees : (e) => {
                  e.preventDefault()
                  router.push('/dashboard/billing')
                }}
                className={cn(!canExportAttendees && "opacity-75 cursor-default")}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Export Attendees (CSV)</span>
                  {!canExportAttendees && <LockIcon className="h-3 w-3 text-muted-foreground ml-2" />}
                </div>
              </DropdownMenuItem>
              {!canExportAttendees && (
                <DropdownMenuItem className="text-xs text-primary focus:text-primary justify-center cursor-pointer bg-primary/5" onClick={() => router.push('/dashboard/billing')}>
                  Upgrade to Export Data
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="default" className="cursor-pointer" onClick={() => window.open(`/${event.slug}`, '_blank')}>
            View Live Page
          </Button>
        </div>
      </div>

      <div ref={analyticsRef} className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.views}</div>
              <p className="text-xs text-muted-foreground">
                +{(stats.views > 0 ? (stats.uniques / stats.views * 100).toFixed(0) : 0)}% unique
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Card Generations</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.generations}</div>
              <p className="text-xs text-muted-foreground">{((stats.generations / (stats.views || 1)) * 100).toFixed(1)}% conv.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.downloads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NFTs Minted</CardTitle>
              <Gem className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nftMints || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Row */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 md:col-span-2 lg:col-span-4 min-w-0">
            <CardHeader>
              <CardTitle>Visits Over Time</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visitsOverTime}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorVisits)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3 min-w-0">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey drop-off.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium: Activity & Audience */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 md:col-span-2 lg:col-span-4 relative group min-w-0">
            {!hasAdvancedStats && <PremiumOverlay label="Peak Activity Locked" />}
            <CardHeader>
              <CardTitle>Peak Activity (UTC)</CardTitle>
              <CardDescription>Busiest hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={cn("h-[250px] w-full", !hasAdvancedStats && "blur-2xl opacity-25")}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakActivity}>
                    <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 lg:col-span-3 relative min-w-0">
            {!hasAdvancedStats && <PremiumOverlay label="Audience Quality Locked" />}
            <CardHeader>
              <CardTitle>Participating Organizations</CardTitle>
              <CardDescription>Based on corporate email domains.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={cn("space-y-4", !hasAdvancedStats && "blur-md opacity-50")}>
                {topDomains.map((d: any, i: number) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <span className="font-medium text-sm">{d.name}</span>
                    <Badge variant="secondary">{d.value}</Badge>
                  </div>
                ))}
                {topDomains.length === 0 && <p className="text-muted-foreground text-sm">No data available</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {/* Traffic Sources */}
          <Card className="col-span-1 relative min-w-0">
            {!hasAdvancedStats && <PremiumOverlay label="Traffic Sources Locked" />}
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Top referrers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={cn("space-y-4", !hasAdvancedStats && "blur-md opacity-50")}>
                {trafficSources.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No referrer data yet.</p>
                ) : (
                  trafficSources.map((source, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{source.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{source.value}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Demographics */}
          <Card className="col-span-1 relative min-w-0">
            {!hasAdvancedStats && <PremiumOverlay label="Demographics Locked" />}
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
              <CardDescription>Top countries.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={cn("h-[200px] w-full", !hasAdvancedStats && "blur-md opacity-50")}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryBreakdown} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {countryBreakdown.length === 0 && (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground pb-20">
                    No location data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="col-span-1 min-w-0">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
                ) : (
                  recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`mt-1 h-2 w-2 rounded-full ${activity.type === 'MINT' ? 'bg-orange-500' : 'bg-green-500'}`} />
                      <div className="space-y-1">
                        <p className="text-xs font-medium leading-none">{activity.description}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  )
}

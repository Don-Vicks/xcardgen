"use client"

import { AnalyticsReport } from "@/components/analytics/AnalyticsReport"
import { eventsRequest } from "@/lib/api/requests/events.request"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function ReportPage() {
  const params = useParams()
  const [data, setData] = useState<{
    event: any,
    stats: any,
    visitsOverTime: any[],
    funnelData: any[],
    deviceBreakdown: any[],
    countryBreakdown: any[],
    trafficSources: any[],
    recentActivity: any[],
    peakActivity?: any[],
    topDomains?: any[],
    trends?: any
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      // Check for injected data from Puppeteer (Bypass Auth)
      if (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__) {
        const injected = (window as any).__INITIAL_DATA__;
        const funnelData = [
          { name: 'Visits', value: injected.stats.views, fill: '#8884d8' },
          { name: 'Generations', value: injected.stats.generations, fill: '#82ca9d' },
          { name: 'Downloads', value: injected.stats.downloads, fill: '#ffc658' },
          { name: 'Mints', value: injected.stats.nftMints || 0, fill: '#ff8042' },
        ];
        setData({ ...injected, funnelData });
        setLoading(false);
        return;
      }

      // Handle slug or ID
      const slugOrId = params.slug as string
      if (!slugOrId) return

      // ALL OF THIS REPLACES THE getAll LOGIC
      try {
        // 1. Resolve Slug/ID directly via public API
        const eventRes = await eventsRequest.getReport(slugOrId)
        const event = eventRes.data

        if (event) {
          // 2. Fetch Deep Analytics (Still might be protected! But let's try)
          const res = await eventsRequest.getAnalytics(event.id)
          console.log(res)

          // 3. Transform Data
          const rawStats = res.data.stats || {}
          const funnelData = [
            { name: 'Visits', value: rawStats.views || 0, fill: '#8884d8' },
            { name: 'Generations', value: rawStats.generations || 0, fill: '#82ca9d' },
            { name: 'Downloads', value: rawStats.downloads || 0, fill: '#ffc658' },
            { name: 'Mints', value: rawStats.nftMints || 0, fill: '#ff8042' },
          ]

          setData({
            ...res.data,
            event,
            funnelData,
            peakActivity: res.data.peakActivity || [],
            topDomains: res.data.topDomains || [],
            trends: res.data.trends || null
          })
        }
      } catch (error) {
        console.error("Fetch error:", error)
        toast.error("Failed to load report data")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [params.slug])

  if (loading) return <div className="p-20 text-white bg-[#04020E] min-h-screen">Genering Report...</div>
  if (!data) return <div className="p-20 text-white bg-[#04020E] min-h-screen">Report not found</div>

  return (
    <div className="bg-[#04020E] min-h-screen w-full flex items-center justify-center p-0">
      {/* Render report without container constraints, letting it dictate size */}
      <div id="report-content" className="w-[1200px]">
        <AnalyticsReport
          event={data.event}
          stats={data.stats}
          visitsOverTime={data.visitsOverTime}
          funnelData={data.funnelData}
          countryBreakdown={data.countryBreakdown}
          trafficSources={data.trafficSources}
          recentActivity={data.recentActivity}
          peakActivity={data.peakActivity}
          topDomains={data.topDomains}
          trends={data.trends}
        />
      </div>
    </div>
  )
}

import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Globe } from "lucide-react"
import Image from "next/image"
import { Area, AreaChart, Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts"

interface AnalyticsReportProps {
  event: any
  stats: any
  visitsOverTime: any[]
  funnelData: any[]
  countryBreakdown: any[]
  trafficSources: any[]
  recentActivity: any[]
  peakActivity?: { hour: number, count: number }[]
  topDomains?: { name: string, value: number }[]
  trends?: { views: number, generations: number }
}

// ... props ...
export function AnalyticsReport({
  event,
  stats,
  visitsOverTime,
  funnelData,
  countryBreakdown,
  trafficSources,
  recentActivity,
  peakActivity,
  topDomains,
  trends
}: AnalyticsReportProps) {
  const now = new Date();
  const endDate = event.endDate ? new Date(event.endDate) : new Date(event.date);
  const isCompleted = event.status === 'PUBLISHED' && now > endDate;
  const displayStatus = isCompleted ? 'COMPLETED' : (event.status || 'EVENT');

  return (
    <div className="relative w-[1200px] h-[1850px] bg-[#04020E] text-white p-16 font-sans shrink-0 mx-auto my-10 border border-white/10 shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-2xl text-white">X</span>
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight">xCardGen</span>
            <p className="text-xs text-indigo-300 font-medium tracking-wide">
              EVENT INTELLIGENCE
            </p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-sm font-bold text-white/40 tracking-widest uppercase">
            Analytics Report
          </h1>
          <p className="text-lg font-medium text-white">
            {format(new Date(), "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Event Hero */}
      <div className="mb-12 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <Badge
              variant="outline"
              className={`mb-4 px-3 py-1 ${isCompleted ? 'text-green-400 border-green-500/30' : 'text-indigo-400 border-indigo-500/30'}`}
            >
              {displayStatus}
            </Badge>
            <h1 className="text-6xl font-black mb-6 leading-tight tracking-tight">
              {event.name}
            </h1>
            <div className="flex items-center gap-8 text-lg text-gray-400">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-indigo-500" />
                <span>
                  {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-500" />
                <span>xcardgen.com/{event.slug}</span>
              </div>
            </div>
          </div>
          {event.coverImage && (
            <div className="h-40 w-40 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src={event.coverImage}
                alt="Cover"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-4 gap-8 mb-16">
        {[
          {
            label: "Total Visits",
            value: stats.views,
            sub: "Unique Interactions",
          },
          {
            label: "Generations",
            value: stats.generations,
            sub: "Cards Created",
          },
          {
            label: "Attendees",
            value: stats.attendees,
            sub: "Registered Users",
          },
          {
            label: "NFT Mints",
            value: stats.nftMints || 0,
            sub: "On-chain Assets",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 p-8 rounded-2xl"
          >
            <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
            <p className="text-5xl font-bold mt-2 mb-1">{stat.value}</p>
            <p className="text-xs text-indigo-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-3 gap-12 mb-16">
        <div className="col-span-2 space-y-6">
          <h3 className="text-2xl font-bold">Growth Trajectory</h3>
          {/* Fixed dimensions for PDF stability */}
          <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02]">
            <AreaChart width={640} height={350} data={visitsOverTime}>
              <defs>
                <linearGradient
                  id="pdfColorVisits"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#666"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#666"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#pdfColorVisits)"
                isAnimationActive={false}
              />
            </AreaChart>
          </div>
        </div>
        <div className="col-span-1 space-y-6">
          <h3 className="text-2xl font-bold">Conversion</h3>
          <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] h-[400px] flex items-center justify-center">
            <BarChart
              width={350}
              height={350}
              data={funnelData}
              layout="vertical"
              margin={{ right: 30 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                fontSize={12}
                stroke="#888"
                tickLine={false}
                axisLine={false}
              />
              <Bar
                dataKey="value"
                radius={[0, 6, 6, 0]}
                barSize={40}
                isAnimationActive={false}
              >
                <LabelList dataKey="value" position="right" fill="#FFFFFF" fontSize={12} fontWeight="bold" />
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </div>
        </div>
      </div>

      {/* Audience Insights Row */}
      <div className="grid grid-cols-2 gap-8 mb-8 shrink-0">
        {/* Peak Activity */}
        <div>
          <h3 className="text-xl font-bold mb-4">Peak Activity (UTC)</h3>
          <div className="h-64 border border-white/10 rounded-xl bg-white/[0.02] p-4 flex items-end justify-center">
            {peakActivity && (
              <BarChart width={500} height={220} data={peakActivity}>
                <Bar dataKey="count" fill="#818cf8" radius={[2, 2, 0, 0]} barSize={12} />
                <XAxis dataKey="hour" stroke="#666" fontSize={10} tickLine={false} axisLine={false} interval={2} />
              </BarChart>
            )}
          </div>
        </div>

        {/* Demographics */}
        <div>
          <h3 className="text-xl font-bold mb-4">Global Reach</h3>
          <div className="h-64 border border-white/10 rounded-xl bg-white/[0.02] p-4 flex items-center justify-center">
            <BarChart width={450} height={220} data={countryBreakdown.slice(0, 6)} layout="vertical" margin={{ left: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={90} fontSize={11} tickLine={false} axisLine={false} stroke="#9ca3af" />
              <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20}>
                <LabelList dataKey="value" position="right" fill="#fff" fontSize={11} />
              </Bar>
            </BarChart>
          </div>
        </div>
      </div>

      {/* Footer / Lead Gen */}
      <div className="mt-auto pt-16 border-t border-white/10 flex justify-between items-end">
        <div>
          <p className="text-xl font-bold mb-2">Ready for your next event?</p>
          <p className="text-gray-400 max-w-md">
            Generate professional event cards, track analytics, and boost social
            sharing with xCardGen.
          </p>
        </div>
        <div className="text-right">
          <div className="bg-white text-black px-6 py-3 rounded-lg font-bold text-lg mb-2 inline-block">
            xcardgen.com
          </div>
          <p className="text-sm text-gray-500">
            Powered by xCardGen Intelligence Engine
          </p>
        </div>
      </div>
    </div>
  )
}

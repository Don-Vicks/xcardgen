"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"

const data = [
  { name: "Mon", generations: 400, shares: 240 },
  { name: "Tue", generations: 300, shares: 139 },
  { name: "Wed", generations: 200, shares: 980 },
  { name: "Thu", generations: 278, shares: 390 },
  { name: "Fri", generations: 189, shares: 480 },
  { name: "Sat", generations: 239, shares: 380 },
  { name: "Sun", generations: 349, shares: 430 },
]

export function MockAnalytics() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Card className="w-full h-full bg-card/50 border-border shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Engagement</CardTitle>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">2,543</span>
          <span className="text-xs text-green-500 font-medium">+12.5% vs last week</span>
        </div>
      </CardHeader>
      <CardContent className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
            />
            <Bar
              dataKey="generations"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              animationDuration={2000}
            />
            <Bar
              dataKey="shares"
              fill="hsl(var(--secondary))"
              radius={[4, 4, 0, 0]}
              animationDuration={2000}
              animationBegin={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

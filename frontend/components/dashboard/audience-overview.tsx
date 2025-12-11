"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Smartphone } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface AudienceOverviewProps {
  audience: {
    countries: { name: string; value: number }[]
    devices: { name: string; value: number }[]
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AudienceOverview({ audience }: AudienceOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      {/* Top Countries */}
      <Card className="col-span-4 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Top Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {audience.countries.length > 0 ? (
              audience.countries.map((country) => (
                <div key={country.name} className="flex items-center">
                  <div className="w-full flex-1 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{country.name === 'Unknown' ? 'Unknown Location' : country.name}</span>
                      <span className="text-muted-foreground">{country.value} visits</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(country.value / Math.max(...audience.countries.map(c => c.value))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">No location data yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Breakdown */}
      <Card className="col-span-3 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            Device Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            {audience.devices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={audience.devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {audience.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No device data yet.
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {audience.devices.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-muted-foreground">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

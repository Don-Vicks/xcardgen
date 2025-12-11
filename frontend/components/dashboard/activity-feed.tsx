"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Activity } from "lucide-react"

interface ActivityFeedProps {
  items: {
    id: string
    type: string
    user: string
    event: string
    timestamp: string
    details: string
    avatar: string
  }[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          Live Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {items.slice(0, 8).map((item) => (
            <div key={item.id} className="flex items-start gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
              <img
                src={item.avatar}
                className="w-9 h-9 rounded-full border bg-muted object-cover"
                alt={item.user}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {item.user} <span className="text-muted-foreground font-normal">{item.details} for</span> {item.event}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity to show.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

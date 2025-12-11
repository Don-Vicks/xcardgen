"use client"

import { EventCard } from "@/components/dashboard/event-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Event, eventsRequest } from "@/lib/api/requests/events.request"
import { Calendar, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsResponse = await eventsRequest.getAll()
        // @ts-ignore
        const eventsList = Array.isArray(eventsResponse.data) ? eventsResponse.data : (eventsResponse.data?.data || [])
        setEvents(eventsList as Event[])
      } catch (error) {
        console.error("Failed to fetch events", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  if (loading) {
    return <LoadingScreen text="Loading dashboard data..." />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total xCards</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">Active campaigns</p>
          </CardContent>
        </Card>
        {/* Placeholders for other agg stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links or Recent 3 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recent xCards</h3>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/events">View All</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {events.slice(0, 3).map((event) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <EventCard key={event.id} event={{ ...event, status: event.isActive ? 'PUBLISHED' : 'DRAFT' } as any} />
          ))}
          {events.length === 0 && (
            <p className="text-muted-foreground">No xCards yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

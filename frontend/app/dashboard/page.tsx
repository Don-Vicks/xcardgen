"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Event, eventsRequest } from "@/lib/api/requests/events.request"
import { format } from "date-fns"
import { Calendar, MoreVertical, Plus, Users } from "lucide-react"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventsRequest.getAll()
        setEvents(res.data)
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
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">Active campaigns</p>
          </CardContent>
        </Card>
        {/* ... other stats static for now or computed */}
      </div>

      {/* Recent Events Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Recent Events</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="group hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="default">Active</Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="mt-2 text-xl group-hover:text-primary transition-colors">{event.name}</CardTitle>
                <CardDescription>{format(new Date(event.date), 'MMM yyyy')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /> {(event._count?.cards || 0).toLocaleString()} Generated
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/10 p-4">
                <Button className="w-full" variant="outline">Manage Event</Button>
              </CardFooter>
            </Card>
          ))}

          {/* Create New Card (Trigger Dialog contextually or just link) */}
          <div className="h-full flex items-center justify-center">
            {/* Reusing the dialog here would require state lifting or just relying on the header button */}
            <Card className="flex flex-col items-center justify-center p-8 border-dashed border-2 hover:border-primary/50 hover:bg-muted/10 transition-all cursor-pointer h-full min-h-[250px] w-full">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Create New Event</h3>
              <p className="text-sm text-muted-foreground text-center mt-2 max-w-[200px]">Start managing a new community gathering</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

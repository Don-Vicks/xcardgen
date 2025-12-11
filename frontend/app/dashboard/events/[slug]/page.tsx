"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { eventsRequest } from "@/lib/api/requests/events.request"
import { ArrowUpRight, BarChart, Calendar, Copy, Edit2, Globe, LayoutTemplate, Users } from "lucide-react"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"

export default function EventDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventsRequest.getById(slug)
        setEvent(res.data)
      } catch (error) {
        console.error(error)
        toast.error("Failed to load event")
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [slug])

  const handlePublishToggle = async (checked: boolean) => {
    try {
      // Optimistic update
      setEvent((prev: any) => ({ ...prev, status: checked ? "PUBLISHED" : "DRAFT" }))

      await eventsRequest.update(event.id, {
        status: checked ? "PUBLISHED" : "DRAFT"
      })

      toast.success(checked ? "Event published!" : "Event unpublished")
    } catch (error) {
      // Revert on failure
      setEvent((prev: any) => ({ ...prev, status: !checked ? "PUBLISHED" : "DRAFT" }))
      toast.error("Failed to update status")
    }
  }

  const copyLink = () => {
    const url = `${window.location.origin}/x/${event.slug}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  }

  if (loading) return <div className="p-8 flex items-center justify-center">Loading event...</div>
  if (!event) return <div className="p-8 text-center text-muted-foreground">Event not found</div>

  const isPublished = event.status === "PUBLISHED"
  const publicUrl = `/x/${event.slug}`

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isPublished
              ? "bg-green-100 text-green-700 border-green-200"
              : "bg-yellow-100 text-yellow-700 border-yellow-200"
              }`}>
              {event.status}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            {isPublished ? (
              <Link href={publicUrl} target="_blank" className="hover:underline text-primary flex items-center gap-1">
                {window.location.host}/x/{event.slug}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            ) : (
              <span className="opacity-70">Event is currently private</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg border">
            <span className="text-xs font-medium px-2 text-muted-foreground">Publish</span>
            <Switch
              checked={isPublished}
              onCheckedChange={handlePublishToggle}
            />
          </div>
          <Button variant="outline" onClick={copyLink} disabled={!isPublished}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/events/${slug}/analytics`}>
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href={publicUrl} target="_blank" className={!isPublished ? "pointer-events-none opacity-50" : ""}>
              View Live Page
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Design Card */}
            <Card className="col-span-2 md:col-span-1 overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5 text-blue-500" />
                  Event Design
                </CardTitle>
                <CardDescription>Customize your registration card</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted relative group">
                  {event.template?.backgroundImage ? (
                    <img src={event.template.backgroundImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      No design selected
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button asChild variant="secondary">
                      <Link href={`/dashboard/events/${slug}/design`}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Design
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="p-4 border-t flex justify-between items-center bg-gray-50/50">
                  <span className="text-xs text-muted-foreground">
                    {event.template ? "Status: Ready" : "Status: Missing Design"}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/events/${slug}/design`}>Open Editor</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Date</span>
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Description</span>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.description || "No description provided."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="font-bold">{event.stats?.views || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Attendees</span>
                  <span className="font-bold">{event.stats?.attendees || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Generations</span>
                  <span className="font-bold">{event.stats?.generations || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="registrations">
          <div className="py-8 text-center text-muted-foreground">
            Registration list coming soon...
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="py-8 text-center text-muted-foreground">
            Event settings coming soon...
          </div>
        </TabsContent>
      </Tabs>

    </div>
  )
}

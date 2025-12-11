"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import {
  BarChart,
  CalendarIcon,
  Download,
  ExternalLink,
  Eye,
  MoreVertical,
  Users
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface EventStats {
  views: number
  uniques: number
  generations: number
  attendees: number
  downloads: number
}

interface EventCardProps {
  event: {
    id: string
    name: string
    slug: string
    date: string
    coverImage?: string
    status: string
    stats?: EventStats
    _count?: {
      cards: number
    }
  }
}

export function EventCard({ event }: EventCardProps) {
  const stats = event.stats || {
    views: 0,
    uniques: 0,
    generations: event._count?.cards || 0,
    attendees: 0,
    downloads: 0
  }

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors group">
      <div className="relative aspect-video w-full bg-muted">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Cover Image
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={event.status === 'PUBLISHED' ? "default" : "secondary"}>
            {event.status}
          </Badge>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold leading-none tracking-tight line-clamp-1">
              {event.name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {format(new Date(event.date), "MMM d, yyyy")}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/events/${event.slug}/design`}>Edit Design</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/events/${event.slug}/analytics`}>View Analytics</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${event.slug}`} target="_blank">View Live Page</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
          <div className="space-y-1">
            <Eye className="h-4 w-4 mx-auto mb-1" />
            <span className="font-semibold text-foreground">{stats.views}</span>
            <span className="block scale-90">Visits</span>
          </div>
          <div className="space-y-1">
            <Users className="h-4 w-4 mx-auto mb-1" />
            <span className="font-semibold text-foreground">{stats.attendees}</span>
            <span className="block scale-90">Going</span>
          </div>
          <div className="space-y-1">
            <Download className="h-4 w-4 mx-auto mb-1" />
            <span className="font-semibold text-foreground">{stats.downloads}</span>
            <span className="block scale-90">Saves</span>
          </div>
          {/* Generations or something else */}
          <div className="space-y-1">
            <ExternalLink className="h-4 w-4 mx-auto mb-1" />
            <span className="font-semibold text-foreground">{stats.generations}</span>
            <span className="block scale-90">Cards</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/dashboard/events/${event.slug}/analytics`}>
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

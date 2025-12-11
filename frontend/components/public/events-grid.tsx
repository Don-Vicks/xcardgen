import { Badge } from "@/components/ui/badge"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { Event } from "@/lib/api/requests/events.request"
import { format } from "date-fns"
import { Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface EventsGridProps {
  events: Event[]
}

export function EventsGrid({ events }: EventsGridProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No public events available yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all group">
          <div className="aspect-video relative bg-muted">
            {event.coverImage ? (
              <Image src={event.coverImage} alt={event.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary/20">
                <Calendar className="h-12 w-12" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="backdrop-blur-md bg-background/80">
                {format(new Date(event.date), "MMM d")}
              </Badge>
            </div>
          </div>

          <CardHeader className="p-5">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              <Link href={`/x/${event.slug}`} className="hover:underline focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                {event.name}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
              {event.description || "No description provided."}
            </p>
          </CardHeader>

          <CardFooter className="p-5 pt-0 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(event.date), "EEE, MMM d, yyyy")}
            </div>
            {/* {(event as any).location && (
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Online
                    </div>
                 )} */}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

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
      <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/20">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-medium">No events yet</h3>
        <p className="text-muted-foreground mt-1 max-w-sm">
          Check back later for upcoming gatherings and experiences.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event) => (
        <Link href={`/x/${event.slug}`} key={event.id} className="group focus:outline-none">
          <Card className="h-full overflow-hidden border-border/50 bg-card/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 flex flex-col group-focus:ring-2 ring-primary">
            {/* Image Container */}
            <div className="aspect-[16/10] relative overflow-hidden bg-muted">
              {event.coverImage ? (
                <Image
                  src={event.coverImage}
                  alt={event.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <Calendar className="h-12 w-12 text-muted-foreground/20" />
                </div>
              )}

              {/* Overlay Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Date Badge */}
              <div className="absolute top-3 right-3 shadow-sm">
                <Badge variant="secondary" className="backdrop-blur-md bg-background/90 text-foreground font-medium px-2.5 py-0.5 border-none shadow-sm">
                  {format(new Date(event.date), "MMM d")}
                </Badge>
              </div>
            </div>

            <CardHeader className="p-6 flex-1 space-y-2">
              <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                {event.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-[2.5em]">
                {event.description || "Join us for this event."}
              </p>
            </CardHeader>

            <CardFooter className="p-6 pt-0 mt-auto flex items-center justify-between text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5 ">
                <Calendar className="h-3.5 w-3.5 opacity-70" />
                <span>{format(new Date(event.date), "EEE, MMM d, yyyy")}</span>
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

"use client"

import { EventCard } from "@/components/dashboard/event-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { LoadingScreen } from "@/components/ui/loading-screen"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Event, eventsRequest } from "@/lib/api/requests/events.request"
import { ChevronLeft, ChevronRight, Plus, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useDebounce } from "use-debounce"

export default function EventsPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 500)
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<any>({})

  const fetchEvents = async () => {
    setLoading(true)
    try {
      // @ts-ignore - mismatch in response type vs client type potentially
      const res = await eventsRequest.getAll({
        search: debouncedSearch,
        sort,
        page,
        limit: 8 // Fits grid nicely
      })
      // Handle the new structure { data, meta } vs old [ ... ]
      if (res.data && (res.data as any).data && Array.isArray((res.data as any).data)) {
        // Case: Backend returns { data: [...], meta: ... } but axios wraps it in data
        setEvents((res.data as any).data)
        setMeta((res.data as any).meta || {})
      } else if (Array.isArray(res.data)) {
        // Fallback if backend returned array directly (legacy)
        setEvents(res.data)
      } else {
        // Fallback
        setEvents([])
      }
    } catch (error) {
      console.error("Failed to fetch events", error)
      toast.error("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [debouncedSearch, sort, page])

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent card click
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await eventsRequest.delete(deleteId)
      toast.success("xCard deleted")
      setDeleteId(null)
      fetchEvents()
    } catch (error) {
      toast.error("Failed to delete event")
    }
  }

  return (
    <div className="space-y-8 p-8 pt-6">
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will mark the xCard as deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete xCard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">xCards</h2>
          <p className="text-muted-foreground">Manage your xCard portfolio.</p>
        </div>
        <Button onClick={() => (document.querySelector('[data-dialog-trigger="create-event"]') as HTMLElement)?.click()}>
          <Plus className="mr-2 h-4 w-4" /> Create xCard
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-lg border">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search xCards..."
            className="pl-8 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingScreen text="Updating list..." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="relative group">
              {/* Delete Button Overlay */}
              <button
                onClick={(e) => handleDeleteClick(e, event.id)}
                className="absolute top-2 right-2 z-10 p-2 bg-background/80 hover:bg-red-100 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm border cursor-pointer"
                title="Delete xCard"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {/* @ts-ignore */}
              <EventCard event={{ ...event, status: event.status || 'DRAFT' }} />
            </div>
          ))}

          {/* Create New Card Placeholder */}
          <div className="h-full flex items-center justify-center min-h-[300px]">
            <Card
              className="flex flex-col items-center justify-center p-8 border-dashed border-2 hover:border-primary/50 hover:bg-muted/10 transition-all cursor-pointer h-full w-full"
              onClick={() => (document.querySelector('[data-dialog-trigger="create-event"]') as HTMLElement)?.click()}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Create New xCard</h3>
              <p className="text-sm text-muted-foreground text-center mt-2 max-w-[200px]">Start managing a new community gathering</p>
            </Card>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm font-medium">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}

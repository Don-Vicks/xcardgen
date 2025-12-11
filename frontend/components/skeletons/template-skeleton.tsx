import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TemplateSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-dashed">
          <div className="aspect-video relative bg-muted">
            <Skeleton className="h-full w-full" />
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

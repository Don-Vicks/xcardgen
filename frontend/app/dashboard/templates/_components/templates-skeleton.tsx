import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TemplatesSkeleton() {
  return (
    <div className="space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-lg border">
        <Skeleton className="h-10 w-full sm:w-[300px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Create New Card Skeleton */}
        <Card className="flex flex-col items-center justify-center p-8 border-dashed border-2 h-full min-h-[250px]">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-32" />
        </Card>

        {/* Regular Template Card Skeletons */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

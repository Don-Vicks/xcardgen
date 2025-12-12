import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"
import Link from "next/link"

export default function DashboardNotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">Resource Not Found</h2>
      <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm">
        The dashboard item you are looking for doesn&apos;t exist or you don&apos;t have permission to view it.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}

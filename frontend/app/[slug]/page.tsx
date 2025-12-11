"use client"

import { EventsGrid } from "@/components/public/events-grid"
import { WorkspaceHero } from "@/components/public/workspace-hero"
import { Button } from "@/components/ui/button"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { workspacesRequest } from "@/lib/api/requests/workspaces.request"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function WorkspacePublicPage() {
  const params = useParams()
  const slug = params.slug as string

  const [workspace, setWorkspace] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await workspacesRequest.getPublic(slug)
        setWorkspace(res.data)
      } catch (err) {
        console.error("Failed to fetch workspace", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchWorkspace()
  }, [slug])

  if (loading) {
    return <LoadingScreen text="Loading workspace..." />
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Workspace not found</h1>
        <p className="text-muted-foreground">The workspace you're looking for doesn't exist or is private.</p>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* xCardGen Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary-foreground">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.8" />
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              xCardGen
            </span>
          </Link>
          <Button asChild size="sm">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <WorkspaceHero workspace={workspace} />

      {/* Events Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Upcoming Events</h2>
        </div>
        <EventsGrid events={workspace.events || []} />
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <div className="size-7 bg-primary rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-primary-foreground">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.8" />
                  <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                xCardGen
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Create stunning event cards in seconds. Powered by xCardGen.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} xCardGen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

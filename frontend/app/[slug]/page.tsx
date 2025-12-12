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
    <div className="min-h-screen bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary">
      {/* xCardGen Header */}
      <header className="fixed top-0 inset-x-0 z-50 border-b bg-background/80 backdrop-blur-md transition-all">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
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
          <Button asChild size="sm" className="rounded-full px-6 font-medium shadow-sm hover:shadow-md transition-all">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <WorkspaceHero workspace={workspace} />

      {/* Events Section */}
      <section className="container mx-auto px-6 py-16 md:py-24 max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
            <p className="text-muted-foreground text-lg">Browse and register for our latest gatherings</p>
          </div>
        </div>
        <EventsGrid events={workspace.events || []} />
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
              <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.8" />
                  <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span>xCardGen</span>
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              Powered by <span className="font-semibold text-foreground">xCardGen</span>. <br className="hidden md:inline" /> Create stunning event pages in seconds.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
            <p>© {new Date().getFullYear()} xCardGen. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, SearchX } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-5 dark:opacity-20" />

      {/* Massive Watermark */}
      <h1 className="select-none text-[15rem] sm:text-[25rem] font-black text-foreground/5 dark:text-foreground/5 absolute z-0 pointer-events-none blur-sm">
        404
      </h1>

      <div className="z-10 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500 max-w-lg px-4">
        {/* Icon Container */}
        <div className="rounded-full bg-muted/50 p-6 backdrop-blur-xl border border-border/50 shadow-2xl skew-y-3">
          <SearchX className="h-12 w-12 text-primary" />
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-6xl bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Lost in Space?
          </h2>
          <p className="mx-auto text-muted-foreground text-lg md:text-xl font-light">
            The page you are looking for has drifted away or doesn&apos;t exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="w-full sm:w-auto h-12 px-8 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-12 px-8 shadow-lg shadow-primary/20"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

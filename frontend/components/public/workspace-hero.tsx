import { Button } from "@/components/ui/button"
import { Workspace } from "@/lib/api/requests/workspaces.request"
import { Globe, Layout, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface WorkspaceHeroProps {
  workspace: Workspace
}

export function WorkspaceHero({ workspace }: WorkspaceHeroProps) {
  const socialLinks = (workspace as any).socialLinks || {}

  return (
    <div className="relative border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03] dark:invert" />
      </div>

      <div className="container relative mx-auto px-4 py-20 md:py-32 max-w-4xl text-center flex flex-col items-center z-10">
        {/* Logo with Glow */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative h-28 w-28 rounded-2xl bg-card border shadow-lg flex items-center justify-center p-1.5 ring-1 ring-border/50">
            {workspace.logo ? (
              <div className="w-full h-full relative rounded-xl overflow-hidden bg-background">
                <Image src={workspace.logo} alt={workspace.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-full h-full rounded-xl bg-muted/30 flex items-center justify-center">
                <Layout className="h-10 w-10 text-primary/80" />
              </div>
            )}
          </div>
        </div>

        {/* Title & Desc */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 drop-shadow-sm">
          {workspace.name}
        </h1>

        {(workspace as any).description && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {(workspace as any).description}
          </p>
        )}

        {/* Socials - Clean & Minimal */}
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {socialLinks.website && (
            <Button variant="outline" size="sm" asChild className="rounded-full h-10 px-6 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Link href={socialLinks.website} target="_blank">
                <Globe className="h-4 w-4 mr-2" />
                Website
              </Link>
            </Button>
          )}
          {socialLinks.twitter && (
            <Button variant="outline" size="sm" asChild className="rounded-full h-10 px-6 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Link href={socialLinks.twitter} target="_blank">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

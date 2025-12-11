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
    <div className="bg-background border-b relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

      <div className="container relative mx-auto px-4 py-16 md:py-24 max-w-5xl text-center flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6 h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border shadow-sm flex items-center justify-center p-1">
          {workspace.logo ? (
            <div className="w-full h-full relative rounded-xl overflow-hidden bg-background">
              <Image src={workspace.logo} alt={workspace.name} fill className="object-cover" />
            </div>
          ) : (
            <Layout className="h-10 w-10 text-primary" />
          )}
        </div>

        {/* Title & Desc */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{workspace.name}</h1>
        {(workspace as any).description && (
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            {(workspace as any).description}
          </p>
        )}

        {/* Socials */}
        <div className="flex items-center gap-3">
          {socialLinks.website && (
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href={socialLinks.website} target="_blank">
                <Globe className="h-4 w-4" />
                Website
              </Link>
            </Button>
          )}
          {socialLinks.twitter && (
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href={socialLinks.twitter} target="_blank">
                <Twitter className="h-4 w-4" />
                Twitter
              </Link>
            </Button>
          )}
          {/* Add more as needed based on schema */}
        </div>
      </div>
    </div>
  )
}

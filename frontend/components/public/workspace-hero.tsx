import { Button } from "@/components/ui/button"
import { Workspace } from "@/lib/api/requests/workspaces.request"
import { EventAppearance, getButtonStyle, getThemeStyles } from "@/lib/theme-utils"
import { Globe, Instagram, Layout, Linkedin, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface WorkspaceHeroProps {
  workspace: Workspace
  appearance?: EventAppearance
}

export function WorkspaceHero({ workspace, appearance }: WorkspaceHeroProps) {
  const socialLinks = (workspace as any).socialLinks || {}
  const styles = getThemeStyles(appearance)
  const buttonStyle = getButtonStyle(appearance)

  return (
    <div
      className="relative border-b transition-colors duration-500"
      style={{
        borderColor: styles.borderColor,
        // If we have a custom theme, rely on parent background, otherwise use default
        backgroundColor: appearance ? 'transparent' : undefined
      }}
    >
      {/* Dynamic Background - Cover Image as Hero Banner */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {workspace.coverImage ? (
          <>
            <Image src={workspace.coverImage} alt="Cover" fill className="object-cover" priority />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, ${styles.background}80 0%, ${styles.background}CC 50%, ${styles.background} 100%)`
              }}
            />
          </>
        ) : !appearance ? (
          <>
            <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03] dark:invert" />
          </>
        ) : null}
      </div>

      <div className="container relative mx-auto px-4 py-20 md:py-32 max-w-4xl text-center flex flex-col items-center z-10">
        {/* Logo with Glow */}
        <div className="relative mb-8 group">
          <div
            className="absolute -inset-1 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"
            style={{
              background: `linear-gradient(to right, ${styles.primaryColor}, ${styles.textColor})`
            }}
          />
          <div
            className="relative h-28 w-28 rounded-2xl border shadow-lg flex items-center justify-center p-1.5"
            style={{
              backgroundColor: styles.cardBg,
              borderColor: styles.borderColor
            }}
          >
            {workspace.logo ? (
              <div className="w-full h-full relative rounded-xl overflow-hidden bg-background">
                <Image src={workspace.logo} alt={workspace.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: `${styles.primaryColor}10` }}>
                <Layout className="h-10 w-10" style={{ color: styles.primaryColor }} />
              </div>
            )}
          </div>
        </div>

        {/* Title & Desc */}
        <h1
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          style={{ color: styles.textColor }}
        >
          {workspace.name}
        </h1>

        {(workspace as any).description && (
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light"
            style={{ color: styles.mutedColor }}
          >
            {(workspace as any).description}
          </p>
        )}

        {/* Socials - Clean & Minimal */}
        <div className="flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {socialLinks.website && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-full h-10 px-6 transition-all hover:brightness-110"
              style={{
                borderColor: styles.borderColor,
                color: styles.textColor,
                backgroundColor: 'transparent' // Let background shine through
              }}
            >
              <Link href={socialLinks.website} target="_blank">
                <Globe className="h-4 w-4 mr-2" />
                Website
              </Link>
            </Button>
          )}
          {socialLinks.twitter && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-full h-10 px-6 transition-all hover:brightness-110"
              style={{
                borderColor: styles.borderColor,
                color: styles.textColor,
                backgroundColor: 'transparent'
              }}
            >
              <Link href={socialLinks.twitter} target="_blank">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Link>
            </Button>
          )}
          {socialLinks.linkedin && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-full h-10 px-6 transition-all hover:brightness-110"
              style={{
                borderColor: styles.borderColor,
                color: styles.textColor,
                backgroundColor: 'transparent'
              }}
            >
              <Link href={socialLinks.linkedin} target="_blank">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Link>
            </Button>
          )}
          {socialLinks.instagram && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-full h-10 px-6 transition-all hover:brightness-110"
              style={{
                borderColor: styles.borderColor,
                color: styles.textColor,
                backgroundColor: 'transparent'
              }}
            >
              <Link href={socialLinks.instagram} target="_blank">
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

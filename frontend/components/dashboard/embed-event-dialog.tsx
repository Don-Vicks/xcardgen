"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Copy, Globe, Terminal } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface EmbedEventDialogProps {
  slug: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmbedEventDialog({ slug, open, onOpenChange }: EmbedEventDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!slug) return null

  const publicUrl = `${window.location.origin}/x/${slug}`
  const embedUrl = `${publicUrl}?embed=true`

  const iframeCode = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  title="Event Registration"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.1);"
></iframe>`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Embed Event</DialogTitle>
          <DialogDescription>
            Copy the code below to embed this event registration page on your website.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="iframe" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="iframe">
              <Terminal className="h-4 w-4 mr-2" />
              Iframe Code
            </TabsTrigger>
            <TabsTrigger value="link">
              <Globe className="h-4 w-4 mr-2" />
              Direct Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="iframe-code">HTML Snippet</Label>
              <div className="relative">
                <pre className="p-4 rounded-lg bg-muted text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all border h-32">
                  {iframeCode}
                </pre>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => handleCopy(iframeCode)}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste this code into your website's HTML where you want the registration form to appear.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="direct-link">Public URL</Label>
              <div className="flex gap-2">
                <Input id="direct-link" value={publicUrl} readOnly />
                <Button variant="outline" size="icon" onClick={() => handleCopy(publicUrl)}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

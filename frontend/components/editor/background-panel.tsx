"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditorStore } from "@/stores/editor-store"
import { ImageIcon, Link as LinkIcon, Upload } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"
import { useState } from "react"

export function BackgroundPanel() {
  const { backgroundImage, setBackgroundImage } = useEditorStore()
  const [urlInput, setUrlInput] = useState("")

  const handleUrlSubmit = () => {
    if (urlInput) {
      setBackgroundImage(urlInput)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" title="Background Settings">
          <ImageIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="right" align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Background</h4>
            <p className="text-sm text-muted-foreground">
              Set the background image for your template.
            </p>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="pt-4">
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "default_preset"}
                onSuccess={(result: any) => {
                  if (result?.info?.secure_url) {
                    setBackgroundImage(result.info.secure_url)
                  }
                }}
              >
                {({ open }) => {
                  return (
                    <div
                      className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors hover:border-primary/50 cursor-pointer"
                      onClick={() => open()}
                    >
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Click to upload
                      </span>
                    </div>
                  );
                }}
              </CldUploadWidget>
            </TabsContent>

            <TabsContent value="url" className="pt-4 space-y-2">
              <div className="grid gap-2">
                <Label htmlFor="bg-url">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-url"
                    placeholder="https://..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <Button size="icon" onClick={handleUrlSubmit}>
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {backgroundImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={backgroundImage}
                alt="Background preview"
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2 h-6 px-2 text-xs"
                onClick={() => setBackgroundImage('')}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

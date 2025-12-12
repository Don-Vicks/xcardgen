"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ImageCropper } from "@/components/ui/image-cropper"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { eventsRequest } from "@/lib/api/requests/events.request"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { cn } from "@/lib/utils"
import { eventSchema } from "@/lib/validations/event.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

type EventFormValues = z.infer<typeof eventSchema>

interface EditEventDialogProps {
  event: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (updatedEvent: any) => void
}

export function EditEventDialog({ event, open, onOpenChange, onUpdate }: EditEventDialogProps) {
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Cropper State
  const [cropperOpen, setCropperOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  const router = useRouter()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      coverImage: "",
    },
  })

  useEffect(() => {
    if (event) {
      form.reset({
        name: event.name,
        slug: event.slug,
        description: event.description || "",
        coverImage: event.coverImage || "",
        date: {
          from: new Date(event.date),
          to: event.endDate ? new Date(event.endDate) : undefined
        }
      })
    }
  }, [event, form])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large (max 5MB)")
      return
    }

    // Read file to data URL for cropper
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImageToCrop(reader.result?.toString() || null)
      setCropperOpen(true)
      // Reset input value so same file can be selected again if needed
      e.target.value = ''
    })
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedFile: File) => {
    setIsUploading(true)
    try {
      const secureUrl = await uploadToCloudinary(croppedFile)
      form.setValue("coverImage", secureUrl, { shouldValidate: true })
      toast.success("Cover image uploaded successfully")
      setCropperOpen(false)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload cover image")
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: EventFormValues) => {
    setLoading(true)
    try {
      const response = await eventsRequest.update(event.id, {
        ...data,
        date: data.date.from.toISOString(),
        endDate: data.date.to?.toISOString(),
      })

      onUpdate(response.data)
      onOpenChange(false)
      toast.success("Event updated successfully")

      // If slug changed, we might need to redirect, but for now assuming slug edits are handled carefully or ignored
      if (data.slug !== event.slug) {
        router.push(`/dashboard/events/${data.slug}`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Error updating event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Event Details</DialogTitle>
          <DialogDescription>
            Update your event information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Solana Breakpoint 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Slug editing - often risky but user requested editing details */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Slug (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="solana-breakpoint-2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date(s)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start" side="bottom">
                      <Calendar
                        mode="range"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date: Date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        numberOfMonths={1}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Event description..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Input type="hidden" {...field} />
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Input
                            id="cover-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                        </div>
                      </div>
                      {isUploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {field.value && !isUploading && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                          <img
                            src={field.value}
                            alt="Cover Preview"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading || isUploading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      <ImageCropper
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        aspect={2.5}
      />
    </Dialog>
  )
}

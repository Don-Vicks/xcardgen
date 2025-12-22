"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { workspacesRequest } from "@/lib/api/requests/workspaces.request"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { cn } from "@/lib/utils"
import { createWorkspace } from "@/lib/validations/workspace.schema"
import { useAuth } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

type WorkspaceFormValues = z.infer<typeof createWorkspace>

const WORKSPACE_TYPES = [
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'ORGANIZATION', label: 'Organization' },
  { value: 'AGENCY', label: 'Agency' },
  { value: 'EVENT_ORGANIZER', label: 'Event Organizer' },
  { value: 'CORPORATE_TEAM', label: 'Corporate Team' },
  { value: 'COMMUNITY_DAO', label: 'Community / DAO' },
  { value: 'CREATOR_INFLUENCER', label: 'Creator / Influencer' },
] as const

interface CreateWorkspaceFormProps {
  onSuccess?: () => void
}

export function CreateWorkspaceForm({ onSuccess }: CreateWorkspaceFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { createWorkspace: createWorkspaceAction } = useAuth()

  const defaultValues: Partial<WorkspaceFormValues> = {
    name: "",
    slug: "",
    type: "EVENT_ORGANIZER",
    description: "",
    socialLinks: {
      website: "",
      twitter: "",
      linkedin: "",
    },
    logo: "",
  }

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(createWorkspace),
    defaultValues,
    mode: "onChange",
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large (max 5MB)")
      form.setError("logo", { message: "File size must be less than 5MB" })
      // Reset input
      e.target.value = ""
      return
    }

    setIsUploading(true)
    // Clear any previous errors
    form.clearErrors("logo")

    try {
      const secureUrl = await uploadToCloudinary(file)
      // Ensure we set the value and trigger validation
      form.setValue("logo", secureUrl, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
      toast.success("Logo uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload logo")
      form.setError("logo", { type: "custom", message: "Failed to upload image. Please try another." })
      // Reset input so they can retry
      e.target.value = ""
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: WorkspaceFormValues) => {
    try {
      await createWorkspaceAction(data)
      toast.success("Workspace created successfully")
      onSuccess?.()
    } catch (error: any) {
      console.error(error)
      // Check if it's the specific slug error
      if (error?.response?.data?.message?.includes('slug')) {
        form.setError("slug", {
          type: "manual",
          message: "This slug is already taken. Please choose another."
        })
        toast.error("Workspace slug already exists")
      } else {
        // Show generic or specific backend error
        const msg = error?.response?.data?.message || "Failed to create workspace"
        toast.error(typeof msg === 'string' ? msg : "Failed to create workspace")
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic Info Section */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} onChange={(e) => {
                    field.onChange(e)
                    const name = e.target.value
                    const slug = name
                      .toLowerCase()
                      .trim()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/[\s_-]+/g, '-')
                      .replace(/^-+|-+$/g, '')
                    form.setValue("slug", slug, { shouldValidate: true })
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="acme-inc"
                        {...field}
                        onBlur={async (e) => {
                          field.onBlur();
                          const val = e.target.value;
                          if (val.length >= 3) {
                            try {
                              await workspacesRequest.checkSlug(val);
                              form.clearErrors("slug");
                            } catch (err) {
                              form.setError("slug", { message: "Slug is already taken or invalid" });
                            }
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Your public workspace URL: <span className="font-mono text-xs text-primary">xcardgen.com/{field.value || 'your-slug'}</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a workspace type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WORKSPACE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <textarea
                    className={cn(
                      "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                    placeholder="What is this workspace about?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Logo Upload Section */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace Logo</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Input type="hidden" {...field} />
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                      />
                    </div>
                    {isUploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {field.value && !isUploading && (
                      <img
                        src={field.value}
                        alt="Logo Preview"
                        className="h-10 w-10 rounded-full object-cover border"
                      />
                    )}
                  </div>
                </FormControl>
                <FormDescription>Accepted formats: .jpg, .png. Max 5MB.</FormDescription>
                <FormMessage />
                {/* Fallback explicit error display */}
                {form.formState.errors.logo && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.logo.message}
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Social Links Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="socialLinks.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialLinks.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter / X</FormLabel>
                  <FormControl>
                    <Input placeholder="https://x.com/@handle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialLinks.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/company-page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isUploading || form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Workspace"
            )}
          </Button>
        </div>

      </form>
    </Form>
  )
}

import { z } from 'zod'

// Create Workspace
export const createWorkspace = z.object({
  name: z.string().min(3).max(255).trim(),
  logo: z.string().url(),
  coverImage: z.string().url().optional(),
  slug: z.string().min(3).max(255).trim(),
  type: z.enum([
    'PERSONAL',
    'ORGANIZATION',
    'AGENCY',
    'EVENT_ORGANIZER',
    'CORPORATE_TEAM',
    'COMMUNITY_DAO',
    'CREATOR_INFLUENCER',
  ]),
  description: z.string().max(500).trim(),
  socialLinks: z.object({
    website: z
      .string()
      .url({ message: 'Invalid URL' })
      .optional()
      .or(z.literal('')),
    twitter: z
      .string()
      .url({ message: 'Invalid URL' })
      .refine(
        (val) => !val || val.includes('twitter.com') || val.includes('x.com'),
        { message: 'Must be a valid Twitter or X URL' }
      )
      .optional()
      .or(z.literal('')),
    linkedin: z
      .string()
      .url({ message: 'Invalid URL' })
      .refine((val) => !val || val.includes('linkedin.com'), {
        message: 'Must be a valid LinkedIn URL',
      })
      .optional()
      .or(z.literal('')),
    instagram: z.string().optional().or(z.literal('')),
  }),
})

export type CreateWorkspace = z.infer<typeof createWorkspace>

// Update Workspace
export const updateWorkspace = createWorkspace.partial()
export type UpdateWorkspace = z.infer<typeof updateWorkspace>

import z from 'zod'

export const eventSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  date: z.object({
    from: z.date(),
    to: z.date().optional(),
  }),
  description: z.string().min(1, 'Description is required'),
  coverImage: z.string().url('Must be a valid URL'),
})

import { z } from 'zod'
import { CATEGORIES, CITIES } from '../constants'

export const CreateEventSchema = z.object({
  title:       z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  category:    z.enum(CATEGORIES),
  venueId:     z.string().cuid(),
  organizer:   z.string().max(200).optional(),
  dateTime:    z.string().datetime(),
  bannerImage: z.string().url().optional(),
  city:        z.enum(CITIES),
})

export const UpdateEventSchema = CreateEventSchema.partial().extend({
  status: z.enum(['UPCOMING', 'LIVE', 'PAST', 'CANCELLED']).optional(),
})

export const EventFiltersSchema = z.object({
  city:     z.enum(CITIES).optional(),
  category: z.enum(CATEGORIES).optional(),
  date:     z.string().datetime().optional(),
  q:        z.string().max(200).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(50).default(20),
})

export type CreateEventInput  = z.infer<typeof CreateEventSchema>
export type UpdateEventInput  = z.infer<typeof UpdateEventSchema>
export type EventFilters      = z.infer<typeof EventFiltersSchema>

import { z } from 'zod'
import { CATEGORIES, CITIES } from '../constants'

export const SearchSchema = z.object({
  q:        z.string().min(1).max(200),
  city:     z.enum(CITIES).optional(),
  category: z.enum(CATEGORIES).optional(),
  date:     z.string().datetime().optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(50).default(20),
})

export type SearchInput = z.infer<typeof SearchSchema>

import { z } from 'zod'

export const CreateListingSchema = z.object({
  eventId:       z.string().cuid(),
  seatSection:   z.string().max(50).optional(),
  seatRow:       z.string().max(10).optional(),
  seatNumber:    z.string().max(10).optional(),
  originalPrice: z.number().int().min(1),   // in paise
  askingPrice:   z.number().int().min(1),   // in paise
  ticketFileUrl: z.string().url(),
})

export const UpdateListingSchema = z.object({
  askingPrice: z.number().int().min(1),
})

export const RejectListingSchema = z.object({
  reason: z.string().min(5).max(500),
})

export type CreateListingInput = z.infer<typeof CreateListingSchema>
export type UpdateListingInput = z.infer<typeof UpdateListingSchema>
export type RejectListingInput = z.infer<typeof RejectListingSchema>

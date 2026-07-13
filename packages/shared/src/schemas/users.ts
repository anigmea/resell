import { z } from 'zod'

export const UpdateUserSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  upiId:       z.string().max(50).optional(),
  bankAccount: z.string().max(200).optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

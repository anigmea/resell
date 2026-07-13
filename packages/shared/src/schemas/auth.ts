import { z } from 'zod'

export const RegisterSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  phone:    z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(8).max(100),
})

export const LoginSchema = z.object({
  emailOrPhone: z.string().min(1),
  password:     z.string().min(1),
})

export const SendOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
})

export const VerifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp:   z.string().length(6),
})

export type RegisterInput  = z.infer<typeof RegisterSchema>
export type LoginInput     = z.infer<typeof LoginSchema>
export type SendOtpInput   = z.infer<typeof SendOtpSchema>
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>

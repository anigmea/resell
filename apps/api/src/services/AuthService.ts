import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@resell/db'
import { Redis } from 'ioredis'
import { RegisterInput, LoginInput } from '@resell/shared'

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export class AuthService {
  constructor(private prisma: PrismaClient, private redis: Redis) {}

  async register(input: RegisterInput) {
    const passwordHash = await bcrypt.hash(input.password, 12)
    try {
      const user = await this.prisma.user.create({
        data: { name: input.name, email: input.email, phone: input.phone, passwordHash },
        select: { id: true, name: true, email: true, phone: true, role: true,
                  kycStatus: true, phoneVerified: true, createdAt: true },
      })
      return user
    } catch (err: any) {
      if (err?.code === 'P2002') throw new Error('Email or phone already registered')
      throw err
    }
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: input.emailOrPhone }, { phone: input.emailOrPhone }],
      },
      select: { id: true, passwordHash: true, role: true, name: true, email: true },
    })
    if (!user) throw new Error('Invalid credentials')

    const valid = await bcrypt.compare(input.password, user.passwordHash)
    if (!valid) throw new Error('Invalid credentials')

    const payload = { sub: user.id, role: user.role }
    const accessToken  = jwt.sign(payload, ACCESS_SECRET,  { expiresIn: '15m' })
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' })

    await this.redis.set(`refresh:${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 30)

    return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  }

  async refresh(refreshToken: string) {
    let payload: any
    try { payload = jwt.verify(refreshToken, REFRESH_SECRET) }
    catch { throw new Error('Invalid refresh token') }

    const stored = await this.redis.get(`refresh:${payload.sub}`)
    if (stored !== refreshToken) throw new Error('Invalid refresh token')

    const newAccess  = jwt.sign({ sub: payload.sub, role: payload.role }, ACCESS_SECRET,  { expiresIn: '15m' })
    const newRefresh = jwt.sign({ sub: payload.sub, role: payload.role }, REFRESH_SECRET, { expiresIn: '30d' })
    await this.redis.set(`refresh:${payload.sub}`, newRefresh, 'EX', 60 * 60 * 24 * 30)

    return { accessToken: newAccess, refreshToken: newRefresh }
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`)
  }

  async sendOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await this.redis.set(`otp:${phone}`, otp, 'EX', 300)
    // MSG91 call omitted; inject MSG91_AUTH_KEY from env in production
    console.log(`[DEV] OTP for ${phone}: ${otp}`)
    return { sent: true }
  }

  async verifyOtp(phone: string, otp: string) {
    const stored = await this.redis.get(`otp:${phone}`)
    if (stored !== otp) throw new Error('Invalid or expired OTP')
    await this.redis.del(`otp:${phone}`)
    await this.prisma.user.update({
      where: { phone },
      data:  { phoneVerified: true, role: 'SELLER' },
    })
    return { verified: true }
  }
}

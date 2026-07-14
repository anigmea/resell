import { FastifyPluginAsync } from 'fastify'
import { AuthService } from '../services/AuthService'
import {
  RegisterSchema, LoginSchema, SendOtpSchema, VerifyOtpSchema,
} from '@resell/shared'
import { verifyJwt } from '../middleware/auth'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const svc = new AuthService(fastify.prisma, fastify.redis)

  fastify.post('/register', async (req, reply) => {
    const body = RegisterSchema.parse(req.body)
    const { accessToken, refreshToken, user } = await svc.register(body)
    const isProd = process.env.NODE_ENV === 'production'
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true, secure: isProd, sameSite: 'lax', path: '/',
    })
    reply.setCookie('accessToken', accessToken, {
      httpOnly: false, secure: isProd, sameSite: 'lax', path: '/', maxAge: 60 * 15,
    })
    return reply.status(201).send({ accessToken, user })
  })

  fastify.post('/login', async (req, reply) => {
    const body = LoginSchema.parse(req.body)
    const { accessToken, refreshToken, user } = await svc.login(body)
    const isProd = process.env.NODE_ENV === 'production'
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true, secure: isProd, sameSite: 'lax', path: '/',
    })
    reply.setCookie('accessToken', accessToken, {
      httpOnly: false, secure: isProd, sameSite: 'lax', path: '/', maxAge: 60 * 15,
    })
    return { accessToken, user }
  })

  fastify.post('/logout', { preHandler: verifyJwt }, async (req, reply) => {
    await svc.logout(req.user.id)
    reply.clearCookie('refreshToken')
    reply.clearCookie('accessToken')
    return { success: true }
  })

  fastify.post('/refresh', async (req, reply) => {
    const token = req.cookies?.refreshToken
    if (!token) return reply.status(401).send({ error: 'No refresh token' })
    const tokens = await svc.refresh(token)
    const isProd = process.env.NODE_ENV === 'production'
    reply.setCookie('refreshToken', tokens.refreshToken, {
      httpOnly: true, secure: isProd, sameSite: 'lax', path: '/',
    })
    reply.setCookie('accessToken', tokens.accessToken, {
      httpOnly: false, secure: isProd, sameSite: 'lax', path: '/', maxAge: 60 * 15,
    })
    return { accessToken: tokens.accessToken }
  })

  fastify.post('/otp/send', async (req, _reply) => {
    const { phone } = SendOtpSchema.parse(req.body)
    return svc.sendOtp(phone)
  })

  fastify.post('/otp/verify', { preHandler: verifyJwt }, async (req, _reply) => {
    const { phone, otp } = VerifyOtpSchema.parse(req.body)
    return svc.verifyOtp(phone, otp)
  })
}

export default authRoutes

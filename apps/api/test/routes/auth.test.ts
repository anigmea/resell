import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import authRoutes from '../../src/routes/auth'
import { errorHandler } from '../../src/middleware/errorHandler'

const prismaStub = {
  user: {
    create: async () => ({
      id: 'c1', name: 'Test', email: 't@t.com', phone: '9000000001',
      role: 'BUYER', kycStatus: 'UNVERIFIED', phoneVerified: false, createdAt: new Date(),
    }),
    findFirst: async () => null,
    update: async () => ({}),
  },
  $disconnect: async () => {},
}
const redisStub = { set: async () => 'OK', get: async () => null, del: async () => 1, quit: async () => {} }

const app = Fastify()

beforeAll(async () => {
  app.decorate('prisma', prismaStub as any)
  app.decorate('redis', redisStub as any)
  app.setErrorHandler(errorHandler)
  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  await app.ready()
})

afterAll(() => app.close())

describe('POST /auth/register', () => {
  it('returns 201 with user', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/auth/register',
      payload: { name: 'Test', email: 't@t.com', phone: '9000000001', password: 'password123' },
    })
    expect(res.statusCode).toBe(201)
    expect(JSON.parse(res.body).user.email).toBe('t@t.com')
  })

  it('returns 400 for invalid phone', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/v1/auth/register',
      payload: { name: 'Test', email: 't@t.com', phone: '1234', password: 'password123' },
    })
    expect(res.statusCode).toBe(400)
  })
})

import { FastifyPluginAsync } from 'fastify'
import { ListingService } from '../services/ListingService'
import { UpdateUserSchema } from '@resell/shared'
import { verifyJwt } from '../middleware/auth'

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const listingSvc = new ListingService(fastify.prisma)

  fastify.get('/me', { preHandler: verifyJwt }, async (req) => {
    return fastify.prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true,
                kycStatus: true, phoneVerified: true, upiId: true, createdAt: true },
    })
  })

  fastify.patch('/me', { preHandler: verifyJwt }, async (req) => {
    const body = UpdateUserSchema.parse(req.body)
    return fastify.prisma.user.update({
      where:  { id: req.user.id },
      data:   body,
      select: { id: true, name: true, email: true, upiId: true },
    })
  })

  fastify.get('/me/listings', { preHandler: verifyJwt }, async (req) => {
    const page  = Number((req.query as any).page  ?? 1)
    const limit = Number((req.query as any).limit ?? 20)
    return listingSvc.myListings(req.user.id, page, limit)
  })

  fastify.get('/me/orders', { preHandler: verifyJwt }, async (req) => {
    const page  = Number((req.query as any).page  ?? 1)
    const limit = Number((req.query as any).limit ?? 20)
    return fastify.prisma.order.findMany({
      where:   { buyerId: req.user.id },
      include: { listing: { include: { event: { select: { id: true, title: true, dateTime: true } } } } },
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })
  })
}

export default userRoutes

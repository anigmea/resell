import { FastifyPluginAsync } from 'fastify'
import { EventService } from '../services/EventService'
import { verifyJwt } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { CreateEventSchema, UpdateEventSchema, RejectListingSchema } from '@resell/shared'
import { z } from 'zod'

const CreateVenueSchema = z.object({
  name:     z.string().min(2).max(200),
  city:     z.string().min(2).max(100),
  address:  z.string().min(5).max(500),
  mapsUrl:  z.string().url().optional(),
  capacity: z.number().int().positive().optional(),
})

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  const eventSvc = new EventService(fastify.prisma)
  const guard = [verifyJwt, requireRole('ADMIN')]

  fastify.get('/venues', { preHandler: guard }, async () => {
    return fastify.prisma.venue.findMany({ orderBy: { name: 'asc' } })
  })

  fastify.post('/venues', { preHandler: guard }, async (req, reply) => {
    const body  = CreateVenueSchema.parse(req.body)
    const venue = await fastify.prisma.venue.create({ data: body })
    return reply.status(201).send(venue)
  })

  fastify.post('/events', { preHandler: guard }, async (req, reply) => {
    const body  = CreateEventSchema.parse(req.body)
    const event = await eventSvc.create(body)
    return reply.status(201).send(event)
  })

  fastify.patch('/events/:id', { preHandler: guard }, async (req: any, _reply) => {
    const body  = UpdateEventSchema.parse(req.body)
    return eventSvc.update(req.params.id, body)
  })

  fastify.patch('/listings/:id/verify', { preHandler: guard }, async (req: any, _reply) => {
    return fastify.prisma.listing.update({
      where: { id: req.params.id },
      data:  { status: 'ACTIVE' },
    })
  })

  fastify.patch('/listings/:id/reject', { preHandler: guard }, async (req: any, _reply) => {
    const { reason } = RejectListingSchema.parse(req.body)
    const listing = await fastify.prisma.listing.update({
      where: { id: req.params.id },
      data:  { status: 'REJECTED' },
    })
    // TODO(notifications spec): send rejection email to seller with reason
    return { ...listing, reason }
  })

  fastify.get('/listings', { preHandler: guard }, async (req) => {
    const page   = Number((req.query as any).page   ?? 1)
    const limit  = Number((req.query as any).limit  ?? 50)
    const status = (req.query as any).status as string | undefined
    const where  = status ? { status: status as any } : {}
    return fastify.prisma.listing.findMany({
      where,
      include: {
        event:  { select: { title: true, dateTime: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })
  })

  fastify.get('/events', { preHandler: guard }, async (req) => {
    const page  = Number((req.query as any).page  ?? 1)
    const limit = Number((req.query as any).limit ?? 50)
    return fastify.prisma.event.findMany({
      include: { venue: { select: { name: true } } },
      orderBy: { dateTime: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })
  })
}

export default adminRoutes

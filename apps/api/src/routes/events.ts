import { FastifyPluginAsync } from 'fastify'
import { EventService } from '../services/EventService'
import { EventFiltersSchema } from '@resell/shared'

const eventRoutes: FastifyPluginAsync = async (fastify) => {
  const svc = new EventService(fastify.prisma)

  fastify.get('/', async (req) => {
    const filters = EventFiltersSchema.parse(req.query)
    return svc.list(filters)
  })

  fastify.get('/:id', async (req: any, reply) => {
    const ev = await svc.getById(req.params.id)
    if (!ev) return reply.status(404).send({ error: 'Event not found' })
    return ev
  })

  fastify.get('/:id/listings', async (req: any) => {
    const page  = Number(req.query.page  ?? 1)
    const limit = Number(req.query.limit ?? 20)
    return svc.getListings(req.params.id, page, limit)
  })
}

export default eventRoutes

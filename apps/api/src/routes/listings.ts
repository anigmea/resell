import { FastifyPluginAsync } from 'fastify'
import { ListingService } from '../services/ListingService'
import { UploadService }  from '../services/UploadService'
import { CreateListingSchema, UpdateListingSchema } from '@resell/shared'
import { verifyJwt } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { z } from 'zod'

const PresignSchema = z.object({
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
})

const listingRoutes: FastifyPluginAsync = async (fastify) => {
  const svc    = new ListingService(fastify.prisma)
  const upload = new UploadService()

  fastify.post('/upload-url',
    { preHandler: [verifyJwt, requireRole('SELLER', 'ADMIN')] },
    async (req, _reply) => {
      const { mimeType } = PresignSchema.parse(req.body)
      return upload.getPresignedUrl(req.user.id, mimeType)
    },
  )

  fastify.post('/',
    { preHandler: [verifyJwt, requireRole('SELLER', 'ADMIN')] },
    async (req, reply) => {
      const body    = CreateListingSchema.parse(req.body)
      const listing = await svc.create(req.user.id, body)
      return reply.status(201).send(listing)
    },
  )

  fastify.get('/:id', async (req: any, reply) => {
    const l = await svc.getById(req.params.id)
    if (!l) return reply.status(404).send({ error: 'Listing not found' })
    return l
  })

  fastify.patch('/:id',
    { preHandler: verifyJwt },
    async (req: any, _reply) => {
      const body = UpdateListingSchema.parse(req.body)
      return svc.update(req.params.id, req.user.id, body)
    },
  )

  fastify.delete('/:id',
    { preHandler: verifyJwt },
    async (req: any, reply) => {
      await svc.delete(req.params.id, req.user.id)
      return reply.status(204).send()
    },
  )
}

export default listingRoutes

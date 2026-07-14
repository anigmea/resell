import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { OrderService } from '../services/OrderService'
import { verifyJwt } from '../middleware/auth'

const CreateOrderSchema = z.object({
  listingId: z.string().min(1),
})

const VerifyPaymentSchema = z.object({
  razorpayPaymentId: z.string(),
  razorpayOrderId:   z.string(),
  razorpaySignature: z.string(),
})

const orderRoutes: FastifyPluginAsync = async (fastify) => {
  const svc = new OrderService(fastify.prisma)

  /** POST /orders — create a Razorpay order for a listing */
  fastify.post('/',
    { preHandler: verifyJwt },
    async (req, reply) => {
      const { listingId } = CreateOrderSchema.parse(req.body)
      const result = await svc.createOrder(listingId, req.user.id)
      return reply.status(201).send(result)
    },
  )

  /** POST /orders/:id/verify — confirm payment after Razorpay callback */
  fastify.post('/:id/verify',
    { preHandler: verifyJwt },
    async (req: any, reply) => {
      const body = VerifyPaymentSchema.parse(req.body)
      const result = await svc.verifyPayment(req.params.id, req.user.id, body)
      return reply.send(result)
    },
  )

  /** GET /orders/me — buyer's own orders */
  fastify.get('/me',
    { preHandler: verifyJwt },
    async (req, _reply) => {
      return svc.myOrders(req.user.id)
    },
  )
}

export default orderRoutes

import 'dotenv/config'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'

import prismaPlugin    from './plugins/prisma'
import redisPlugin     from './plugins/redis'
import corsPlugin      from './plugins/cors'
import rateLimitPlugin from './plugins/rateLimit'
import { errorHandler } from './middleware/errorHandler'

import authRoutes    from './routes/auth'
import eventRoutes   from './routes/events'
import listingRoutes from './routes/listings'
import userRoutes    from './routes/users'
import searchRoutes  from './routes/search'
import adminRoutes   from './routes/admin'
import orderRoutes   from './routes/orders'

const fastify = Fastify({ logger: true })

async function main() {
  await fastify.register(cookie)
  await fastify.register(corsPlugin)
  await fastify.register(rateLimitPlugin)
  await fastify.register(prismaPlugin)
  await fastify.register(redisPlugin)

  fastify.setErrorHandler(errorHandler)

  fastify.get('/api/v1/health', async () => ({ status: 'ok' }))

  await fastify.register(authRoutes,    { prefix: '/api/v1/auth' })
  await fastify.register(eventRoutes,   { prefix: '/api/v1/events' })
  await fastify.register(listingRoutes, { prefix: '/api/v1/listings' })
  await fastify.register(userRoutes,    { prefix: '/api/v1/users' })
  await fastify.register(searchRoutes,  { prefix: '/api/v1/search' })
  await fastify.register(adminRoutes,   { prefix: '/api/v1/admin' })
  await fastify.register(orderRoutes,   { prefix: '/api/v1/orders' })

  await fastify.listen({ port: Number(process.env.PORT ?? 4000), host: '0.0.0.0' })
}

main().catch((err) => { fastify.log.error(err); process.exit(1) })

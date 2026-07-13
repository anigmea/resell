import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import rateLimit from '@fastify/rate-limit'

const rateLimitPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })
})

export default rateLimitPlugin

import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import Redis from 'ioredis'

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

const redisPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const redis = new Redis(process.env.REDIS_URL!)
  fastify.decorate('redis', redis)
  fastify.addHook('onClose', async () => { await redis.quit() })
})

export default redisPlugin

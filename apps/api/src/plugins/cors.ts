import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import cors from '@fastify/cors'

const corsPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(cors, {
    origin: [process.env.WEB_URL ?? 'http://localhost:3000'],
    credentials: true,
  })
})

export default corsPlugin

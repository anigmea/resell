import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import cors from '@fastify/cors'

const corsPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const allowed = (process.env.WEB_URL ?? 'http://localhost:3000')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true) // server-to-server / curl
      if (allowed.some(o => origin === o || origin.endsWith('.vercel.app'))) return cb(null, true)
      cb(new Error('Not allowed by CORS'), false)
    },
    credentials: true,
  })
})

export default corsPlugin

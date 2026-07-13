import { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing token' })
  }
  try {
    const token   = header.slice(7)
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { sub: string; role: string }
    request.user  = { id: payload.sub, role: payload.role }
  } catch {
    return reply.status(401).send({ error: 'Invalid token' })
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: { id: string; role: string }
  }
}

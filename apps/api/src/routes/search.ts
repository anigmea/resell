import { FastifyPluginAsync } from 'fastify'
import { SearchService } from '../services/SearchService'
import { SearchSchema } from '@resell/shared'

const searchRoutes: FastifyPluginAsync = async (fastify) => {
  const svc = new SearchService(fastify.prisma)

  fastify.get('/', async (req) => {
    const input = SearchSchema.parse(req.query)
    return svc.search(input)
  })
}

export default searchRoutes

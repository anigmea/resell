import { PrismaClient, Prisma } from '@resell/db'
import { SearchInput } from '@resell/shared'

export class SearchService {
  constructor(private prisma: PrismaClient) {}

  async search(input: SearchInput) {
    const { q, city, category, date, page, limit } = input
    const offset = (page - 1) * limit

    return this.prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        e.id, e.title, e.description, e.category, e.city,
        e."dateTime", e."bannerImage", e.status,
        v.name AS "venueName", v.city AS "venueCity"
      FROM "Event" e
      JOIN "Venue" v ON v.id = e."venueId"
      WHERE
        e.status != 'CANCELLED'
        AND to_tsvector('english', e.title || ' ' || COALESCE(e.description,'') || ' ' || e.city || ' ' || v.name)
            @@ plainto_tsquery('english', ${q})
        ${city     ? Prisma.sql`AND e.city = ${city}`                        : Prisma.empty}
        ${category ? Prisma.sql`AND e.category = ${category}::"Category"`    : Prisma.empty}
        ${date     ? Prisma.sql`AND e."dateTime" >= ${new Date(date)}`        : Prisma.empty}
      ORDER BY e."dateTime" ASC
      LIMIT ${limit} OFFSET ${offset}
    `)
  }
}

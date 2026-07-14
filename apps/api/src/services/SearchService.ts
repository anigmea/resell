import { PrismaClient, Prisma } from '@resell/db'
import { SearchInput } from '@resell/shared'

export class SearchService {
  constructor(private prisma: PrismaClient) {}

  async search(input: SearchInput) {
    const { q, city, category, date, page, limit } = input
    const offset = (page - 1) * limit

    const rows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT
        e.id, e.title, e.description, e.category, e.city,
        e."dateTime", e."bannerImage", e.status,
        v.name AS "venueName",
        MIN(l."askingPrice") AS "minPrice"
      FROM "Event" e
      JOIN "Venue" v ON v.id = e."venueId"
      LEFT JOIN "Listing" l ON l."eventId" = e.id AND l.status = 'ACTIVE'
      WHERE
        e.status != 'CANCELLED'
        AND to_tsvector('english', e.title || ' ' || COALESCE(e.description,'') || ' ' || e.city || ' ' || v.name)
            @@ plainto_tsquery('english', ${q})
        ${city     ? Prisma.sql`AND e.city = ${city}`                        : Prisma.empty}
        ${category ? Prisma.sql`AND e.category = ${category}::"Category"`    : Prisma.empty}
        ${date     ? Prisma.sql`AND e."dateTime" >= ${new Date(date)}`        : Prisma.empty}
      GROUP BY e.id, v.name
      ORDER BY e."dateTime" ASC
      LIMIT ${limit} OFFSET ${offset}
    `)
    return rows.map(r => ({
      id:          r.id,
      title:       r.title,
      description: r.description,
      category:    r.category,
      city:        r.city,
      dateTime:    r.dateTime,
      bannerImage: r.bannerImage,
      status:      r.status,
      venue:       { name: r.venueName },
      minPrice:    r.minPrice != null ? Number(r.minPrice) : null,
    }))
  }
}

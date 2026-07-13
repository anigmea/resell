import { PrismaClient } from '@resell/db'
import { EventFilters, CreateEventInput, UpdateEventInput } from '@resell/shared'

export class EventService {
  constructor(private prisma: PrismaClient) {}

  async list(filters: EventFilters) {
    const where: any = { status: { not: 'CANCELLED' } }
    if (filters.city)     where.city     = filters.city
    if (filters.category) where.category = filters.category
    if (filters.date)     where.dateTime = { gte: new Date(filters.date) }
    if (filters.q)        where.title    = { contains: filters.q, mode: 'insensitive' }

    return this.prisma.event.findMany({
      where,
      include: { venue: true },
      orderBy: { dateTime: 'asc' },
      skip:    (filters.page - 1) * filters.limit,
      take:    filters.limit,
    })
  }

  async getById(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: { venue: true },
    })
  }

  async getListings(eventId: string, page: number, limit: number) {
    return this.prisma.listing.findMany({
      where:   { eventId, status: 'ACTIVE' },
      include: { seller: { select: { id: true, name: true } } },
      orderBy: { askingPrice: 'asc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })
  }

  async create(input: CreateEventInput) {
    return this.prisma.event.create({
      data: {
        ...input,
        dateTime: new Date(input.dateTime),
      },
      include: { venue: true },
    })
  }

  async update(id: string, input: UpdateEventInput) {
    return this.prisma.event.update({
      where: { id },
      data:  { ...input, dateTime: input.dateTime ? new Date(input.dateTime) : undefined },
      include: { venue: true },
    })
  }
}

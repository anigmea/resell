import { PrismaClient } from '@resell/db'
import { CreateListingInput, UpdateListingInput } from '@resell/shared'

export class ListingService {
  constructor(private prisma: PrismaClient) {}

  async create(sellerId: string, input: CreateListingInput) {
    return this.prisma.listing.create({
      data: { ...input, sellerId },
      include: { event: { include: { venue: true } }, seller: { select: { id: true, name: true } } },
    })
  }

  async getById(id: string) {
    return this.prisma.listing.findUnique({
      where: { id },
      include: { event: { include: { venue: true } }, seller: { select: { id: true, name: true } } },
    })
  }

  async update(id: string, sellerId: string, input: UpdateListingInput) {
    const listing = await this.prisma.listing.findUnique({ where: { id } })
    if (!listing)                     throw new Error('Listing not found')
    if (listing.sellerId !== sellerId) throw new Error('Not authorised')
    return this.prisma.listing.update({ where: { id }, data: input })
  }

  async delete(id: string, sellerId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } })
    if (!listing)                     throw new Error('Listing not found')
    if (listing.sellerId !== sellerId) throw new Error('Not authorised')
    if (listing.status === 'SOLD')    throw new Error('Cannot delete a sold listing')
    return this.prisma.listing.delete({ where: { id } })
  }

  async myListings(sellerId: string, page: number, limit: number) {
    return this.prisma.listing.findMany({
      where:   { sellerId },
      include: { event: { select: { id: true, title: true, dateTime: true } } },
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    })
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListingService } from '../../src/services/ListingService'

const mockPrisma = {
  listing: {
    create:     vi.fn(),
    findUnique: vi.fn(),
    update:     vi.fn(),
    findMany:   vi.fn(),
    delete:     vi.fn(),
  },
}

let svc: ListingService
beforeEach(() => { vi.clearAllMocks(); svc = new ListingService(mockPrisma as any) })

const baseListing = {
  id: 'l1', eventId: 'ev1', sellerId: 'u1',
  originalPrice: 500000, askingPrice: 750000,
  ticketFileUrl: 'https://r2.example.com/t.pdf',
  status: 'PENDING_VERIFICATION',
}

describe('ListingService.create', () => {
  it('creates listing with PENDING_VERIFICATION status', async () => {
    mockPrisma.listing.create.mockResolvedValue(baseListing)
    const l = await svc.create('u1', {
      eventId: 'ev1', originalPrice: 500000, askingPrice: 750000,
      ticketFileUrl: 'https://r2.example.com/t.pdf',
    })
    expect(l.status).toBe('PENDING_VERIFICATION')
    expect(mockPrisma.listing.create.mock.calls[0][0].data.sellerId).toBe('u1')
  })
})

describe('ListingService.delete', () => {
  it('throws if listing is SOLD', async () => {
    mockPrisma.listing.findUnique.mockResolvedValue({ ...baseListing, status: 'SOLD', sellerId: 'u1' })
    await expect(svc.delete('l1', 'u1')).rejects.toThrow('Cannot delete a sold listing')
  })

  it('throws if seller is not owner', async () => {
    mockPrisma.listing.findUnique.mockResolvedValue({ ...baseListing, sellerId: 'other' })
    await expect(svc.delete('l1', 'u1')).rejects.toThrow('Not authorised')
  })
})

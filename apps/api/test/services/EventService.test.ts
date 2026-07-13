import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventService } from '../../src/services/EventService'

const mockPrisma = {
  event: {
    findMany:   vi.fn(),
    findUnique: vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
  },
}

let svc: EventService
beforeEach(() => { vi.clearAllMocks(); svc = new EventService(mockPrisma as any) })

const sampleEvent = {
  id: 'ev1', title: 'Coldplay Mumbai', category: 'CONCERT',
  city: 'Mumbai', status: 'UPCOMING', dateTime: new Date('2026-10-01'),
  venue: { id: 'v1', name: 'DY Patil', city: 'Mumbai', address: 'Navi Mumbai' },
}

describe('EventService.list', () => {
  it('returns events array', async () => {
    mockPrisma.event.findMany.mockResolvedValue([sampleEvent])
    const result = await svc.list({ page: 1, limit: 20 })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Coldplay Mumbai')
  })

  it('filters by city', async () => {
    mockPrisma.event.findMany.mockResolvedValue([])
    await svc.list({ city: 'Delhi', page: 1, limit: 20 })
    const where = mockPrisma.event.findMany.mock.calls[0][0].where
    expect(where.city).toBe('Delhi')
  })
})

describe('EventService.getById', () => {
  it('returns event with venue', async () => {
    mockPrisma.event.findUnique.mockResolvedValue(sampleEvent)
    const ev = await svc.getById('ev1')
    expect(ev?.title).toBe('Coldplay Mumbai')
  })

  it('returns null for unknown id', async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null)
    const ev = await svc.getById('unknown')
    expect(ev).toBeNull()
  })
})

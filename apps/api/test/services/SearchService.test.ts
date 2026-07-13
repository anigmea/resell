import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SearchService } from '../../src/services/SearchService'

const mockPrisma = { $queryRaw: vi.fn() }
let svc: SearchService
beforeEach(() => { vi.clearAllMocks(); svc = new SearchService(mockPrisma as any) })

describe('SearchService.search', () => {
  it('calls $queryRaw and returns results', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ id: 'ev1', title: 'Coldplay' }])
    const results = await svc.search({ q: 'Coldplay', page: 1, limit: 10 })
    expect(results).toHaveLength(1)
    expect(mockPrisma.$queryRaw).toHaveBeenCalledOnce()
  })

  it('returns empty array when nothing matches', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([])
    const results = await svc.search({ q: 'zzznomatch', page: 1, limit: 10 })
    expect(results).toHaveLength(0)
  })
})

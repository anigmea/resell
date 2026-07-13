import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../../src/services/AuthService'

const mockPrisma = {
  user: {
    create:    vi.fn(),
    findFirst: vi.fn(),
    update:    vi.fn(),
  },
}
const mockRedis = {
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
}

let service: AuthService

beforeEach(() => {
  vi.clearAllMocks()
  service = new AuthService(mockPrisma as any, mockRedis as any)
})

describe('AuthService.register', () => {
  it('hashes the password and creates user', async () => {
    mockPrisma.user.create.mockResolvedValue({
      id: 'cuid1', name: 'Raj', email: 'raj@test.com', phone: '9876543210',
      role: 'BUYER', kycStatus: 'UNVERIFIED', phoneVerified: false, createdAt: new Date(),
    })
    const user = await service.register({
      name: 'Raj', email: 'raj@test.com', phone: '9876543210', password: 'password123',
    })
    expect(mockPrisma.user.create).toHaveBeenCalledOnce()
    const call = mockPrisma.user.create.mock.calls[0][0]
    expect(call.data.passwordHash).not.toBe('password123')
    expect(user.id).toBe('cuid1')
  })

  it('throws if email already exists', async () => {
    mockPrisma.user.create.mockRejectedValue({ code: 'P2002' })
    await expect(service.register({
      name: 'Raj', email: 'raj@test.com', phone: '9876543210', password: 'password123',
    })).rejects.toThrow('Email or phone already registered')
  })
})

describe('AuthService.login', () => {
  it('returns token pair for valid credentials', async () => {
    const bcrypt = await import('bcrypt')
    const hash = await bcrypt.hash('password123', 12)
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'cuid1', email: 'raj@test.com', passwordHash: hash, role: 'BUYER',
    })
    const result = await service.login({ emailOrPhone: 'raj@test.com', password: 'password123' })
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
  })

  it('throws for wrong password', async () => {
    const bcrypt = await import('bcrypt')
    const hash = await bcrypt.hash('correct', 12)
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'c1', passwordHash: hash, role: 'BUYER' })
    await expect(service.login({ emailOrPhone: 'raj@test.com', password: 'wrong' }))
      .rejects.toThrow('Invalid credentials')
  })

  it('throws for unknown user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null)
    await expect(service.login({ emailOrPhone: 'nobody@test.com', password: 'x' }))
      .rejects.toThrow('Invalid credentials')
  })
})

/**
 * TDD: Tests for lib/actions/orders.ts
 * Run: pnpm exec jest __tests__/unit/actions/orders.test.ts
 */

// ── Mock Supabase ──────────────────────────────────────────────────────────────

const mockSingle = jest.fn()
const mockLimit = jest.fn(() => ({ single: mockSingle }))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockOrder = jest.fn((..._args: any[]) => ({ limit: mockLimit, single: mockSingle, data: undefined, error: null }))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockEq = jest.fn((..._args: any[]) => ({ order: mockOrder, single: mockSingle }))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelect = jest.fn((..._args: any[]) => ({ eq: mockEq, order: mockOrder }))
const mockFrom = jest.fn(() => ({ select: mockSelect }))

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: jest.fn(() => ({ from: mockFrom })),
  createClient: jest.fn(() => ({ from: mockFrom })),
}))

// ── Mock admin session ─────────────────────────────────────────────────────────
const mockVerify = jest.fn()
jest.mock('@/lib/utils/admin-session', () => ({
  verifyAdminSession: (...args: unknown[]) => mockVerify(...args),
}))

// ── Mock next/headers ──────────────────────────────────────────────────────────
const mockCookiesGet = jest.fn()
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({ get: mockCookiesGet })),
}))

import { getOrdersByEmail, getOrderById, getAllOrders } from '@/lib/actions/orders'

// ── Fixtures ───────────────────────────────────────────────────────────────────
const MOCK_ORDER = {
  id: 'order-1',
  reference_number: 'ORD-2026-001',
  customer_name: 'Nguyễn Văn A',
  customer_email: 'a@example.com',
  delivery_address: '123 Phố Huế',
  total_amount: 500000,
  payment_method: 'COD',
  status: 'pending',
  created_at: '2026-04-23T10:00:00Z',
  order_items: [
    {
      id: 'item-1',
      product_id: 'prod-1',
      product_name: 'Áo Thun',
      quantity: 2,
      unit_price: 250000,
    },
  ],
}

// ── getOrdersByEmail ───────────────────────────────────────────────────────────

describe('getOrdersByEmail', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns orders for given email', async () => {
    mockEq.mockReturnValueOnce({
      order: jest.fn(() => ({ data: [MOCK_ORDER], error: null })),
    } as unknown as ReturnType<typeof mockEq>)

    const result = await getOrdersByEmail('a@example.com')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0].reference_number).toBe('ORD-2026-001')
    }
  })

  it('returns empty array for email with no orders', async () => {
    mockEq.mockReturnValueOnce({
      order: jest.fn(() => ({ data: [], error: null })),
    } as unknown as ReturnType<typeof mockEq>)

    const result = await getOrdersByEmail('nobody@example.com')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(0)
    }
  })

  it('returns VALIDATION_ERROR for empty email', async () => {
    const result = await getOrdersByEmail('')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('VALIDATION_ERROR')
    }
  })

  it('returns SERVER_ERROR when DB fails', async () => {
    mockEq.mockReturnValueOnce({
      order: jest.fn(() => ({ data: null, error: { message: 'db error' } })),
    } as unknown as ReturnType<typeof mockEq>)

    const result = await getOrdersByEmail('a@example.com')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('SERVER_ERROR')
    }
  })
})

// ── getOrderById (admin) ───────────────────────────────────────────────────────

describe('getOrderById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookiesGet.mockReturnValue({ value: 'valid-token' })
    mockVerify.mockResolvedValue({ valid: true })
  })

  it('returns order detail for valid id', async () => {
    mockEq.mockReturnValueOnce({ single: jest.fn().mockResolvedValue({ data: MOCK_ORDER, error: null }) } as unknown as ReturnType<typeof mockEq>)

    const result = await getOrderById('order-1')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reference_number).toBe('ORD-2026-001')
    }
  })

  it('returns NOT_FOUND when order does not exist', async () => {
    mockEq.mockReturnValueOnce({ single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }) } as unknown as ReturnType<typeof mockEq>)

    const result = await getOrderById('nonexistent')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('NOT_FOUND')
    }
  })

  it('returns UNAUTHORIZED when not admin', async () => {
    mockCookiesGet.mockReturnValue({ value: 'bad-token' })
    mockVerify.mockResolvedValue({ valid: false })

    const result = await getOrderById('order-1')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('UNAUTHORIZED')
    }
  })
})

// ── getAllOrders (admin) ───────────────────────────────────────────────────────

describe('getAllOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookiesGet.mockReturnValue({ value: 'valid-token' })
    mockVerify.mockResolvedValue({ valid: true })
  })

  it('returns paginated orders for admin', async () => {
    mockSelect.mockReturnValueOnce({
      order: jest.fn(() => ({ data: [MOCK_ORDER], error: null, count: 1 })),
    } as unknown as ReturnType<typeof mockSelect>)

    const result = await getAllOrders()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(1)
    }
  })

  it('returns UNAUTHORIZED when not admin', async () => {
    mockCookiesGet.mockReturnValue({ value: 'bad-token' })
    mockVerify.mockResolvedValue({ valid: false })

    const result = await getAllOrders()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('UNAUTHORIZED')
    }
  })
})

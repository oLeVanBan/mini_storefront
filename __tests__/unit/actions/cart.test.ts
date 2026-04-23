/**
 * TDD tests for cart Server Actions: lib/actions/cart.ts
 *
 * Tests are written BEFORE implementation (Red phase).
 */
import type { Cart, CartItem } from '@/lib/types'

// ── Mocks ────────────────────────────────────────────────────────────────────

let mockCookieCart: Cart = { items: [], updatedAt: new Date().toISOString() }

jest.mock('@/lib/utils/cart-cookie', () => ({
  getCart: jest.fn(async () => mockCookieCart),
  setCart: jest.fn(async (cart: Cart) => {
    mockCookieCart = cart
  }),
  clearCartCookie: jest.fn(async () => {
    mockCookieCart = { items: [], updatedAt: new Date().toISOString() }
  }),
}))

const mockRevalidatePath = jest.fn()
jest.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

const mockSupabaseSingle = jest.fn()
// Each eq builder returns an object with both .eq() and .single()
// to support chains of length 1 or 2 before .single()
const mockSupabaseEq2 = jest.fn(() => ({ single: mockSupabaseSingle, eq: jest.fn(() => ({ single: mockSupabaseSingle })) }))
const mockSupabaseEq1 = jest.fn(() => ({ eq: mockSupabaseEq2, single: mockSupabaseSingle }))
const mockSupabaseSelect = jest.fn(() => ({ eq: mockSupabaseEq1 }))
const mockSupabaseFrom = jest.fn(() => ({ select: mockSupabaseSelect }))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    from: mockSupabaseFrom,
  })),
}))

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'prod-1',
    name: 'Áo Thun Basic',
    price: 150000,
    quantity: 1,
    imageUrl: undefined,
    ...overrides,
  }
}

function mockProduct(overrides: Partial<{
  id: string; name: string; price: number; stock_quantity: number;
  is_published: boolean; image_url: string | null
}> = {}) {
  mockSupabaseSingle.mockResolvedValue({
    data: {
      id: 'prod-1',
      name: 'Áo Thun Basic',
      price: 150000,
      stock_quantity: 10,
      is_published: true,
      image_url: null,
      ...overrides,
    },
    error: null,
  })
}

// ── addToCart ─────────────────────────────────────────────────────────────────

describe('addToCart', () => {
  let addToCart: (productId: string, quantity: number) => Promise<{ success: boolean; error?: string }>

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    mockCookieCart = { items: [], updatedAt: new Date().toISOString() }
    // Re-require to get fresh module
    addToCart = require('@/lib/actions/cart').addToCart
  })

  it('adds a new product to empty cart', async () => {
    mockProduct()
    const result = await addToCart('prod-1', 1)
    expect(result.success).toBe(true)
    expect(mockCookieCart.items).toHaveLength(1)
    expect(mockCookieCart.items[0].productId).toBe('prod-1')
    expect(mockCookieCart.items[0].quantity).toBe(1)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/cart')
  })

  it('increments quantity when product already in cart', async () => {
    mockCookieCart = {
      items: [makeItem({ quantity: 2 })],
      updatedAt: new Date().toISOString(),
    }
    mockProduct({ stock_quantity: 10 })
    const result = await addToCart('prod-1', 3)
    expect(result.success).toBe(true)
    expect(mockCookieCart.items[0].quantity).toBe(5)
  })

  it('returns PRODUCT_NOT_FOUND when product is not in DB', async () => {
    mockSupabaseSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })
    const result = await addToCart('non-existent', 1)
    expect(result.success).toBe(false)
    expect(result.error).toBe('PRODUCT_NOT_FOUND')
  })

  it('returns PRODUCT_NOT_FOUND when product is unpublished', async () => {
    mockProduct({ is_published: false })
    const result = await addToCart('prod-1', 1)
    expect(result.success).toBe(false)
    expect(result.error).toBe('PRODUCT_NOT_FOUND')
  })

  it('returns EXCEEDS_STOCK when quantity would exceed stock', async () => {
    mockProduct({ stock_quantity: 3 })
    const result = await addToCart('prod-1', 5)
    expect(result.success).toBe(false)
    expect(result.error).toBe('EXCEEDS_STOCK')
  })

  it('returns EXCEEDS_STOCK when existing qty + new qty > stock', async () => {
    mockCookieCart = {
      items: [makeItem({ quantity: 8 })],
      updatedAt: new Date().toISOString(),
    }
    mockProduct({ stock_quantity: 10 })
    const result = await addToCart('prod-1', 3)
    expect(result.success).toBe(false)
    expect(result.error).toBe('EXCEEDS_STOCK')
  })

  it('snapshots product name and price in cart item', async () => {
    mockProduct({ name: 'Quần Jeans', price: 350000 })
    await addToCart('prod-1', 1)
    expect(mockCookieCart.items[0].name).toBe('Quần Jeans')
    expect(mockCookieCart.items[0].price).toBe(350000)
  })
})

// ── updateCartQuantity ────────────────────────────────────────────────────────

describe('updateCartQuantity', () => {
  let updateCartQuantity: (productId: string, quantity: number) => Promise<{ success: boolean; error?: string }>

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    mockCookieCart = {
      items: [makeItem({ quantity: 2 })],
      updatedAt: new Date().toISOString(),
    }
    updateCartQuantity = require('@/lib/actions/cart').updateCartQuantity
  })

  it('updates quantity of existing item', async () => {
    mockProduct({ stock_quantity: 10 })
    const result = await updateCartQuantity('prod-1', 5)
    expect(result.success).toBe(true)
    expect(mockCookieCart.items[0].quantity).toBe(5)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/cart')
  })

  it('removes item when quantity is 0', async () => {
    const result = await updateCartQuantity('prod-1', 0)
    expect(result.success).toBe(true)
    expect(mockCookieCart.items).toHaveLength(0)
  })

  it('returns ITEM_NOT_IN_CART when product not in cart', async () => {
    const result = await updateCartQuantity('prod-not-in-cart', 1)
    expect(result.success).toBe(false)
    expect(result.error).toBe('ITEM_NOT_IN_CART')
  })

  it('returns EXCEEDS_STOCK when new quantity > stock', async () => {
    mockProduct({ stock_quantity: 3 })
    const result = await updateCartQuantity('prod-1', 5)
    expect(result.success).toBe(false)
    expect(result.error).toBe('EXCEEDS_STOCK')
  })
})

// ── removeFromCart ────────────────────────────────────────────────────────────

describe('removeFromCart', () => {
  let removeFromCart: (productId: string) => Promise<{ success: boolean }>

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    mockCookieCart = {
      items: [makeItem(), makeItem({ productId: 'prod-2', name: 'Quần Short' })],
      updatedAt: new Date().toISOString(),
    }
    removeFromCart = require('@/lib/actions/cart').removeFromCart
  })

  it('removes the specified item from cart', async () => {
    const result = await removeFromCart('prod-1')
    expect(result.success).toBe(true)
    expect(mockCookieCart.items).toHaveLength(1)
    expect(mockCookieCart.items[0].productId).toBe('prod-2')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/cart')
  })

  it('succeeds even if product not in cart (idempotent)', async () => {
    const result = await removeFromCart('prod-999')
    expect(result.success).toBe(true)
    expect(mockCookieCart.items).toHaveLength(2)
  })
})

// ── clearCart ─────────────────────────────────────────────────────────────────

describe('clearCart', () => {
  let clearCart: () => Promise<{ success: boolean }>

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    mockCookieCart = {
      items: [makeItem()],
      updatedAt: new Date().toISOString(),
    }
    clearCart = require('@/lib/actions/cart').clearCart
  })

  it('clears all items from cart cookie', async () => {
    const result = await clearCart()
    expect(result.success).toBe(true)
    expect(mockCookieCart.items).toHaveLength(0)
  })
})

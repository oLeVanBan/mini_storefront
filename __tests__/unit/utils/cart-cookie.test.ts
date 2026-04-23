import { getCart, setCart, clearCartCookie } from '@/lib/utils/cart-cookie'
import type { Cart, CartItem } from '@/lib/types'

// Mock next/headers cookies
const mockCookieStore = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
}
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}))

const sampleItem: CartItem = {
  productId: 'prod-1',
  name: 'Áo Thun Basic',
  price: 150000,
  quantity: 2,
  imageUrl: undefined,
}

const sampleCart: Cart = {
  items: [sampleItem],
  updatedAt: '2026-04-23T10:00:00.000Z',
}

describe('getCart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns empty cart when cookie is absent', async () => {
    mockCookieStore.get.mockReturnValue(undefined)
    const cart = await getCart()
    expect(cart.items).toHaveLength(0)
  })

  it('returns empty cart when cookie value is empty string', async () => {
    mockCookieStore.get.mockReturnValue({ value: '' })
    const cart = await getCart()
    expect(cart.items).toHaveLength(0)
  })

  it('parses valid base64-encoded JSON cart', async () => {
    const encoded = Buffer.from(JSON.stringify(sampleCart)).toString('base64')
    mockCookieStore.get.mockReturnValue({ value: encoded })
    const cart = await getCart()
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].productId).toBe('prod-1')
    expect(cart.items[0].price).toBe(150000)
  })

  it('returns empty cart if cookie contains invalid JSON', async () => {
    const encoded = Buffer.from('not-valid-json!!!').toString('base64')
    mockCookieStore.get.mockReturnValue({ value: encoded })
    const cart = await getCart()
    expect(cart.items).toHaveLength(0)
  })

  it('returns empty cart if base64 is malformed', async () => {
    mockCookieStore.get.mockReturnValue({ value: '%%%INVALID%%%' })
    const cart = await getCart()
    expect(cart.items).toHaveLength(0)
  })
})

describe('setCart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets httpOnly cookie with base64-encoded JSON', async () => {
    await setCart(sampleCart)
    expect(mockCookieStore.set).toHaveBeenCalledTimes(1)
    const [name, value, options] = mockCookieStore.set.mock.calls[0]
    expect(name).toBe('cart')
    const decoded = JSON.parse(Buffer.from(value, 'base64').toString('utf-8'))
    expect(decoded.items[0].productId).toBe('prod-1')
    expect(options.httpOnly).toBe(true)
    expect(options.path).toBe('/')
    expect(options.sameSite).toBe('lax')
  })

  it('stores correct quantity snapshot', async () => {
    const cart: Cart = {
      items: [{ ...sampleItem, quantity: 5 }],
      updatedAt: new Date().toISOString(),
    }
    await setCart(cart)
    const [, value] = mockCookieStore.set.mock.calls[0]
    const decoded: Cart = JSON.parse(Buffer.from(value, 'base64').toString('utf-8'))
    expect(decoded.items[0].quantity).toBe(5)
  })
})

describe('clearCartCookie', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deletes the cart cookie', async () => {
    await clearCartCookie()
    expect(mockCookieStore.delete).toHaveBeenCalledWith('cart')
  })
})

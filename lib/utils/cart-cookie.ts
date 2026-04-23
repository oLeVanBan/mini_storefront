import { cookies } from 'next/headers'
import type { Cart } from '@/lib/types'

const CART_COOKIE = 'cart'

function emptyCart(): Cart {
  return { items: [], updatedAt: new Date().toISOString() }
}

/**
 * Read and decode the cart cookie.
 * Returns an empty cart if absent or malformed.
 */
export async function getCart(): Promise<Cart> {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get(CART_COOKIE)?.value
    if (!raw) return emptyCart()

    const json = Buffer.from(raw, 'base64').toString('utf-8')
    const parsed = JSON.parse(json) as Cart
    if (!Array.isArray(parsed?.items)) return emptyCart()
    return parsed
  } catch {
    return emptyCart()
  }
}

/**
 * Encode and persist the cart as an httpOnly cookie.
 */
export async function setCart(cart: Cart): Promise<void> {
  const cookieStore = await cookies()
  const encoded = Buffer.from(JSON.stringify(cart)).toString('base64')
  cookieStore.set(CART_COOKIE, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

/**
 * Delete the cart cookie entirely (called after successful checkout).
 */
export async function clearCartCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CART_COOKIE)
}

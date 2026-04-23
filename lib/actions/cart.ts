'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCart, setCart, clearCartCookie } from '@/lib/utils/cart-cookie'
import type { Cart, CartItem } from '@/lib/types'

// ── addToCart ──────────────────────────────────────────────────────────────

export async function addToCart(
  productId: string,
  quantity: number
): Promise<{ success: true } | { success: false; error: 'PRODUCT_NOT_FOUND' | 'EXCEEDS_STOCK' }> {
  const supabase = await createClient()

  // Fetch product from DB
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, price, stock_quantity, is_published, image_url')
    .eq('id', productId)
    .eq('is_published', true)
    .single()

  if (error || !product || !product.is_published) {
    return { success: false, error: 'PRODUCT_NOT_FOUND' }
  }

  const cart = await getCart()
  const existing = cart.items.find((i) => i.productId === productId)
  const currentQty = existing?.quantity ?? 0
  const newTotal = currentQty + quantity

  if (newTotal > product.stock_quantity) {
    return { success: false, error: 'EXCEEDS_STOCK' }
  }

  const updatedItems: CartItem[] = existing
    ? cart.items.map((i) =>
        i.productId === productId ? { ...i, quantity: newTotal } : i
      )
    : [
        ...cart.items,
        {
          productId,
          name: product.name,
          price: Number(product.price),
          quantity,
          imageUrl: product.image_url ?? undefined,
        },
      ]

  const updatedCart: Cart = {
    items: updatedItems,
    updatedAt: new Date().toISOString(),
  }

  await setCart(updatedCart)
  revalidatePath('/cart')
  return { success: true }
}

// ── updateCartQuantity ────────────────────────────────────────────────────────

export async function updateCartQuantity(
  productId: string,
  quantity: number
): Promise<{ success: true } | { success: false; error: 'ITEM_NOT_IN_CART' | 'EXCEEDS_STOCK' }> {
  const cart = await getCart()
  const existing = cart.items.find((i) => i.productId === productId)

  if (!existing) {
    return { success: false, error: 'ITEM_NOT_IN_CART' }
  }

  // Remove item when quantity reaches 0
  if (quantity === 0) {
    const updatedCart: Cart = {
      items: cart.items.filter((i) => i.productId !== productId),
      updatedAt: new Date().toISOString(),
    }
    await setCart(updatedCart)
    revalidatePath('/cart')
    return { success: true }
  }

  // Check stock when increasing
  if (quantity > existing.quantity) {
    const supabase = await createClient()
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single()

    if (!product || quantity > product.stock_quantity) {
      return { success: false, error: 'EXCEEDS_STOCK' }
    }
  }

  const updatedCart: Cart = {
    items: cart.items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    ),
    updatedAt: new Date().toISOString(),
  }

  await setCart(updatedCart)
  revalidatePath('/cart')
  return { success: true }
}

// ── removeFromCart ────────────────────────────────────────────────────────────

export async function removeFromCart(
  productId: string
): Promise<{ success: true }> {
  const cart = await getCart()
  const updatedCart: Cart = {
    items: cart.items.filter((i) => i.productId !== productId),
    updatedAt: new Date().toISOString(),
  }
  await setCart(updatedCart)
  revalidatePath('/cart')
  return { success: true }
}

// ── clearCart ─────────────────────────────────────────────────────────────────

export async function clearCart(): Promise<{ success: true }> {
  await clearCartCookie()
  return { success: true }
}

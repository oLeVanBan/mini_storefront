'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { getCart, clearCartCookie } from '@/lib/utils/cart-cookie'

// ── Zod schemas ────────────────────────────────────────────────────────────

const baseSchema = z.object({
  customerName: z.string().min(1, 'Vui lòng nhập họ tên'),
  customerEmail: z.string().email('Email không hợp lệ'),
  deliveryAddress: z.string().min(1, 'Vui lòng nhập địa chỉ giao hàng'),
  paymentMethod: z.enum(['COD', 'CARD']),
})

const cardSchema = z.object({
  cardholderName: z.string().min(1, 'Vui lòng nhập tên chủ thẻ'),
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, 'Số thẻ phải đúng 16 chữ số'),
  cardExpiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Ngày hết hạn không hợp lệ (MM/YY)'),
  cardCvv: z
    .string()
    .regex(/^\d{3}$/, 'CVV phải đúng 3 chữ số'),
})

function validateCardExpiry(expiry: string): boolean {
  const [mm, yy] = expiry.split('/')
  const now = new Date()
  const month = parseInt(mm, 10)
  const year = 2000 + parseInt(yy, 10)
  if (year > now.getFullYear()) return true
  if (year === now.getFullYear() && month >= now.getMonth() + 1) return true
  return false
}

// ── Result types ───────────────────────────────────────────────────────────

export type SubmitOrderResult =
  | { success: true; referenceNumber: string }
  | { success: false; error: 'EMPTY_CART' }
  | { success: false; error: 'VALIDATION_ERROR'; fields: Record<string, string> }
  | { success: false; error: 'OUT_OF_STOCK'; productName: string }
  | { success: false; error: 'SERVER_ERROR' }

// ── submitOrder ────────────────────────────────────────────────────────────

export async function submitOrder(formData: FormData): Promise<SubmitOrderResult> {
  // 1. Read cart
  const cart = await getCart()
  if (cart.items.length === 0) {
    return { success: false, error: 'EMPTY_CART' }
  }

  // 2. Parse form
  const raw = {
    customerName: formData.get('customerName') as string,
    customerEmail: formData.get('customerEmail') as string,
    deliveryAddress: formData.get('deliveryAddress') as string,
    paymentMethod: formData.get('paymentMethod') as string,
    cardholderName: formData.get('cardholderName') as string | null,
    cardNumber: formData.get('cardNumber') as string | null,
    cardExpiry: formData.get('cardExpiry') as string | null,
    cardCvv: formData.get('cardCvv') as string | null,
  }

  // 3. Validate base fields
  const baseParsed = baseSchema.safeParse(raw)
  if (!baseParsed.success) {
    const fields: Record<string, string> = {}
    for (const [field, messages] of Object.entries(baseParsed.error.flatten().fieldErrors)) {
      fields[field] = (messages as string[])[0]
    }
    return { success: false, error: 'VALIDATION_ERROR', fields }
  }

  const { customerName, customerEmail, deliveryAddress, paymentMethod } = baseParsed.data

  // 4. Validate card fields if CARD
  let cardLast4: string | null = null
  let cardholderName: string | null = null
  let expMonth: number | null = null
  let expYear: number | null = null

  if (paymentMethod === 'CARD') {
    const cardParsed = cardSchema.safeParse({
      cardholderName: raw.cardholderName,
      cardNumber: raw.cardNumber,
      cardExpiry: raw.cardExpiry,
      cardCvv: raw.cardCvv,
    })
    if (!cardParsed.success) {
      const fields: Record<string, string> = {}
      for (const [field, messages] of Object.entries(cardParsed.error.flatten().fieldErrors)) {
        fields[field] = (messages as string[])[0]
      }
      return { success: false, error: 'VALIDATION_ERROR', fields }
    }
    if (!validateCardExpiry(cardParsed.data.cardExpiry)) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        fields: { cardExpiry: 'Thẻ đã hết hạn' },
      }
    }
    cardLast4 = cardParsed.data.cardNumber.slice(-4)
    cardholderName = cardParsed.data.cardholderName
    const [mm, yy] = cardParsed.data.cardExpiry.split('/')
    expMonth = parseInt(mm, 10)
    expYear = 2000 + parseInt(yy, 10)
  }

  // 5. Use admin client (service role) for all DB operations
  const supabase = createAdminClient()

  // 5a. Try to get authenticated user_id (optional — guest checkout allowed)
  const { createClient } = require('@/lib/supabase/server')
  let userId: string | null = null
  try {
    const anonClient = await createClient()
    const { data: userData } = await anonClient.auth.getUser()
    userId = userData?.user?.id ?? null
  } catch {
    // Ignore — guest checkout is allowed
  }

  // 6. Validate stock for each item
  for (const item of cart.items) {
    const { data: product } = await supabase
      .from('products')
      .select('name, stock_quantity')
      .eq('id', item.productId)
      .single()

    if (!product || product.stock_quantity < item.quantity) {
      return {
        success: false,
        error: 'OUT_OF_STOCK',
        productName: product?.name ?? item.name,
      }
    }
  }

  // 7. Generate reference number
  const date = new Date()
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const randomPart = Math.random().toString(36).toUpperCase().slice(2, 8)
  const referenceNumber = `ORD-${datePart}-${randomPart}`

  // 8. Calculate total
  const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // 9. Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      reference_number: referenceNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      delivery_address: deliveryAddress,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      status: 'pending',
      user_id: userId,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('Order insert error:', orderError)
    return { success: false, error: 'SERVER_ERROR' }
  }

  // 10. Insert order items (snapshot price and name)
  const orderItems = cart.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) {
    console.error('Order items insert error:', itemsError)
    return { success: false, error: 'SERVER_ERROR' }
  }

  // 11. Insert payment details if CARD (only safe data)
  if (paymentMethod === 'CARD' && cardLast4 && cardholderName && expMonth && expYear) {
    const { error: paymentError } = await supabase.from('payment_details').insert({
      order_id: order.id,
      cardholder_name: cardholderName,
      card_last4: cardLast4,
      exp_month: expMonth,
      exp_year: expYear,
    })
    if (paymentError) {
      console.error('Payment detail insert error:', paymentError)
      return { success: false, error: 'SERVER_ERROR' }
    }
  }

  // 12. Decrement stock for each item
  for (const item of cart.items) {
    const { error: stockError } = await supabase.rpc('decrement_stock', {
      p_product_id: item.productId,
      p_quantity: item.quantity,
    })
    // Fallback if RPC doesn't exist: direct update
    if (stockError) {
      await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.productId)
        .single()
        .then(async ({ data }: { data: { stock_quantity: number } | null }) => {
          if (data) {
            await supabase
              .from('products')
              .update({ stock_quantity: Math.max(0, data.stock_quantity - item.quantity) })
              .eq('id', item.productId)
          }
        })
    }
  }

  // 13. Clear cart
  await clearCartCookie()
  revalidatePath('/')
  revalidatePath('/cart')

  redirect(`/orders/${referenceNumber}`)
}

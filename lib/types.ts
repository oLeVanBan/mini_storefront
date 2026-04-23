// ============================================================
// Shared TypeScript Types – Mini Storefront
// ============================================================

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock_quantity: number
  is_published: boolean
  category_id: string
  image_url: string | null
  created_at: string
  updated_at: string
  // joined
  categories?: Category
}

// ---- Cart ----

export interface CartItem {
  productId: string
  name: string
  price: number       // VND integer snapshot
  quantity: number    // always > 0
  imageUrl?: string   // snapshot
}

export interface Cart {
  items: CartItem[]
  updatedAt: string   // ISO 8601
}

// ---- Orders ----

export type PaymentMethod = 'COD' | 'CARD'
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Order {
  id: string
  reference_number: string
  customer_name: string
  customer_email: string
  delivery_address: string
  total_amount: number
  payment_method: PaymentMethod
  status: OrderStatus
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}

export interface PaymentDetail {
  id: string
  order_id: string
  cardholder_name: string
  card_last4: string    // 4 digits only; PAN never stored
  exp_month: number
  exp_year: number
}

// ---- Action Results ----

export type ActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? object : { data: T }))
  | { success: false; error: string; message?: string }

export interface CartActionResult {
  success: boolean
  error?: 'OUT_OF_STOCK' | 'PRODUCT_NOT_FOUND' | 'EXCEEDS_STOCK' | 'ITEM_NOT_IN_CART'
}

// ---- Auth ----

export interface User {
  id: string
  email: string
  fullName: string
  createdAt: string
  bannedUntil: string | null
  lastSignInAt: string | null
}

export interface AdminSession {
  username: string
  expiresAt: number  // Unix timestamp ms
}

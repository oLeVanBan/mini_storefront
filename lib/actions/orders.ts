'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminSession } from '@/lib/utils/admin-session'
import type { Order, OrderItem } from '@/lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderWithItems = Order & { order_items: OrderItem[] }

type OrdersResult =
  | { success: true; data: OrderWithItems[] }
  | { success: false; error: 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'UNAUTHORIZED' | 'NOT_FOUND' }

// ── Auth helper ───────────────────────────────────────────────────────────────

async function checkAdminAccess(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value ?? ''
  const result = await verifyAdminSession(token)
  return result.valid
}

// ── getOrdersByEmail ──────────────────────────────────────────────────────────
// Public: allows customers (guest) to look up their orders by email

const emailSchema = z.string().email()

export async function getOrdersByEmail(
  email: string
): Promise<{ success: true; data: OrderWithItems[] } | { success: false; error: 'VALIDATION_ERROR' | 'SERVER_ERROR' }> {
  const parsed = emailSchema.safeParse(email.trim())
  if (!parsed.success) {
    return { success: false, error: 'VALIDATION_ERROR' }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_email', parsed.data)
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: 'SERVER_ERROR' }
  }

  return { success: true, data: (data ?? []) as OrderWithItems[] }
}

// ── getOrderById ──────────────────────────────────────────────────────────────
// Admin only: fetch single order with items + payment details

export async function getOrderById(
  orderId: string
): Promise<{ success: true; data: OrderWithItems } | { success: false; error: 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVER_ERROR' }> {
  if (!(await checkAdminAccess())) {
    return { success: false, error: 'UNAUTHORIZED' }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payment_details(*)')
    .eq('id', orderId)
    .single()

  if (error || !data) {
    return { success: false, error: 'NOT_FOUND' }
  }

  return { success: true, data: data as OrderWithItems }
}

// ── getAllOrders ──────────────────────────────────────────────────────────────
// Admin only: paginated list of all orders, most recent first

export async function getAllOrders(): Promise<OrdersResult> {
  if (!(await checkAdminAccess())) {
    return { success: false, error: 'UNAUTHORIZED' }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: 'SERVER_ERROR' }
  }

  return { success: true, data: (data ?? []) as OrderWithItems[] }
}

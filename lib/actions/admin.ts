'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

// ── Auth helper ───────────────────────────────────────────────────────────────

async function checkAdminAccess(): Promise<boolean> {
  const cookieStore = await cookies()
  const secret = cookieStore.get('admin_secret')?.value
  return secret === process.env.ADMIN_SECRET
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// ── updateProduct (T036) ──────────────────────────────────────────────────────

export async function updateProduct(
  productId: string,
  data: { price?: number; stockQuantity?: number; isPublished?: boolean }
): Promise<{ success: boolean; error?: string }> {
  if (!(await checkAdminAccess())) {
    return { success: false, error: 'UNAUTHORIZED' }
  }

  if (data.price !== undefined && data.price < 0) {
    return { success: false, error: 'VALIDATION_ERROR' }
  }
  if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
    return { success: false, error: 'VALIDATION_ERROR' }
  }

  const updatePayload: Record<string, unknown> = {}
  if (data.price !== undefined) updatePayload.price = data.price
  if (data.stockQuantity !== undefined) updatePayload.stock_quantity = data.stockQuantity
  if (data.isPublished !== undefined) updatePayload.is_published = data.isPublished

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', productId)
    .single()

  if (error) {
    return { success: false, error: 'SERVER_ERROR' }
  }

  revalidatePath('/')
  revalidatePath(`/products/${productId}`)
  revalidatePath('/admin/products')
  return { success: true }
}

// ── createCategory (T039) ─────────────────────────────────────────────────────

export async function createCategory(
  data: { name: string; slug: string }
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!(await checkAdminAccess())) {
    return { success: false, error: 'UNAUTHORIZED' }
  }

  if (!data.name.trim()) {
    return { success: false, error: 'VALIDATION_ERROR' }
  }
  if (!data.slug.trim() || !SLUG_RE.test(data.slug)) {
    return { success: false, error: 'VALIDATION_ERROR' }
  }

  const supabase = createAdminClient()
  const { data: row, error } = await supabase
    .from('categories')
    .insert({ name: data.name.trim(), slug: data.slug.trim() })
    .single()

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('slug')) return { success: false, error: 'SLUG_TAKEN' }
      return { success: false, error: 'NAME_TAKEN' }
    }
    return { success: false, error: 'SERVER_ERROR' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true, id: (row as { id: string }).id }
}

// ── updateCategory (T040) ─────────────────────────────────────────────────────

export async function updateCategory(
  categoryId: string,
  data: { name?: string; slug?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!(await checkAdminAccess())) {
    return { success: false, error: 'UNAUTHORIZED' }
  }

  if (data.name !== undefined && !data.name.trim()) {
    return { success: false, error: 'VALIDATION_ERROR' }
  }
  if (data.slug !== undefined && (!data.slug.trim() || !SLUG_RE.test(data.slug))) {
    return { success: false, error: 'VALIDATION_ERROR' }
  }

  const updatePayload: Record<string, unknown> = {}
  if (data.name !== undefined) updatePayload.name = data.name.trim()
  if (data.slug !== undefined) updatePayload.slug = data.slug.trim()

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('categories')
    .update(updatePayload)
    .eq('id', categoryId)
    .single()

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('slug')) return { success: false, error: 'SLUG_TAKEN' }
      return { success: false, error: 'NAME_TAKEN' }
    }
    return { success: false, error: 'SERVER_ERROR' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true }
}

// ── deleteCategory (T041) ─────────────────────────────────────────────────────

export async function deleteCategory(
  categoryId: string
): Promise<{ success: boolean; error?: string; count?: number }> {
  if (!(await checkAdminAccess())) {
    return { success: false, error: 'UNAUTHORIZED' }
  }

  const supabase = createAdminClient()

  // Count products in this category
  const { count, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)

  if (countError) {
    return { success: false, error: 'SERVER_ERROR' }
  }

  if ((count ?? 0) > 0) {
    return { success: false, error: 'HAS_PRODUCTS', count: count ?? 0 }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    return { success: false, error: 'SERVER_ERROR' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true }
}

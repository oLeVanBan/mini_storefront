'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminSession } from '@/lib/utils/admin-session'

// ── Auth helper ───────────────────────────────────────────────────────────────

async function checkAdminAccess(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value ?? ''
  const result = await verifyAdminSession(token)
  return result.valid
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// ── updateProduct (T036) ──────────────────────────────────────────────────────

export async function updateProduct(
  productId: string,
  data: { name?: string; price?: number; stockQuantity?: number; isPublished?: boolean; categoryId?: string }
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
  if (data.name !== undefined) {
    const trimmed = data.name.trim()
    if (!trimmed) return { success: false, error: 'VALIDATION_ERROR' }
    updatePayload.name = trimmed
  }
  if (data.price !== undefined) updatePayload.price = data.price
  if (data.stockQuantity !== undefined) updatePayload.stock_quantity = data.stockQuantity
  if (data.isPublished !== undefined) updatePayload.is_published = data.isPublished
  if (data.categoryId !== undefined) updatePayload.category_id = data.categoryId

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', productId)

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
    .select()
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

// ── uploadProductImage (T085) ─────────────────────────────────────────────────

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function uploadProductImage(
  productId: string,
  formData: FormData
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  if (!(await checkAdminAccess())) {
    return { success: false, error: 'UNAUTHORIZED' }
  }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { success: false, error: 'NO_FILE' }
  }
  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    return { success: false, error: 'INVALID_TYPE' }
  }
  if (file.size > MAX_BYTES) {
    return { success: false, error: 'FILE_TOO_LARGE' }
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const path = `${productId}.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const supabase = createAdminClient()

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return { success: false, error: 'UPLOAD_FAILED' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('products')
    .update({ image_url: publicUrl })
    .eq('id', productId)

  if (updateError) {
    return { success: false, error: 'SERVER_ERROR' }
  }

  revalidatePath('/')
  revalidatePath(`/products/${productId}`)
  revalidatePath('/admin/products')
  return { success: true, imageUrl: publicUrl }
}

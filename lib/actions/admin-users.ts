'use server'

import { createAdminClient } from '@/lib/supabase/server'
import type { User } from '@/lib/types'

type ListUsersResult =
  | { success: true; users: User[]; total: number; page: number; totalPages: number }
  | { success: false; error: 'SERVER_ERROR'; message?: string }

type UserResult =
  | { success: true; user: User }
  | { success: false; error: 'NOT_FOUND' | 'SERVER_ERROR'; message?: string }

type ActionResult =
  | { success: true }
  | { success: false; error: 'NOT_FOUND' | 'SERVER_ERROR'; message?: string }

const PAGE_SIZE = 20

function mapUser(u: {
  id: string
  email?: string
  user_metadata?: { full_name?: string }
  created_at: string
  banned_until?: string | null
  last_sign_in_at?: string | null
}): User {
  return {
    id: u.id,
    email: u.email ?? '',
    fullName: u.user_metadata?.full_name ?? '',
    createdAt: u.created_at,
    bannedUntil: u.banned_until ?? null,
    lastSignInAt: u.last_sign_in_at ?? null,
  }
}

export async function listUsers(page = 1): Promise<ListUsersResult> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.listUsers({
    page,
    perPage: PAGE_SIZE,
  })

  if (error || !data) {
    return { success: false, error: 'SERVER_ERROR', message: error?.message }
  }

  const users = data.users.map(mapUser)
  const total = data.total ?? users.length
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1

  return { success: true, users, total, page, totalPages }
}

export async function getUserById(userId: string): Promise<UserResult> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.getUserById(userId)

  if (error) {
    return { success: false, error: 'SERVER_ERROR', message: error.message }
  }

  if (!data?.user) {
    return { success: false, error: 'NOT_FOUND' }
  }

  return { success: true, user: mapUser(data.user) }
}

/**
 * Ban or unban a user.
 * @param ban true = ban (set ban_duration to a very long value), false = unban
 */
export async function toggleUserBan(userId: string, ban: boolean): Promise<ActionResult> {
  const supabase = createAdminClient()

  const updatePayload = ban
    ? { ban_duration: '876000h' } // ~100 years
    : { ban_duration: 'none' }

  const { error } = await supabase.auth.admin.updateUserById(userId, updatePayload)

  if (error) {
    return { success: false, error: 'SERVER_ERROR', message: error.message }
  }

  return { success: true }
}

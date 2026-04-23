'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { signAdminSession } from '@/lib/utils/admin-session'

const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type AdminLoginResult =
  | { success: true }
  | { success: false; error: 'VALIDATION_ERROR'; fields: Record<string, string> }
  | { success: false; error: 'INVALID_CREDENTIALS' }

export async function adminLogin(formData: FormData): Promise<AdminLoginResult> {
  const raw = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fields[key] = msgs?.[0] ?? 'Không hợp lệ'
    }
    return { success: false, error: 'VALIDATION_ERROR', fields }
  }

  const { username, password } = parsed.data
  const expectedUsername = process.env.ADMIN_USERNAME
  const passwordHash = process.env.ADMIN_PASSWORD_HASH

  if (!expectedUsername || !passwordHash) {
    return { success: false, error: 'INVALID_CREDENTIALS' }
  }

  // Username check (timing-safe via bcrypt comparison of password regardless)
  if (username !== expectedUsername) {
    // Perform a dummy bcrypt compare to prevent timing attacks on username enumeration
    await bcrypt.compare(password, '$2b$12$dummy.hash.for.timing.protection.xxxxx')
    return { success: false, error: 'INVALID_CREDENTIALS' }
  }

  const valid = await bcrypt.compare(password, passwordHash)
  if (!valid) {
    return { success: false, error: 'INVALID_CREDENTIALS' }
  }

  const token = await signAdminSession(username)
  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })

  redirect('/admin')
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}

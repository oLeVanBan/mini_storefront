'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải ít nhất 8 ký tự'),
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
})

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type AuthResult =
  | { success: true }
  | { success: false; error: 'VALIDATION_ERROR'; fields: Record<string, string> }
  | { success: false; error: 'EMAIL_IN_USE' | 'INVALID_CREDENTIALS' | 'SERVER_ERROR'; message?: string }

export async function registerUser(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fields[key] = msgs?.[0] ?? 'Không hợp lệ'
    }
    return { success: false, error: 'VALIDATION_ERROR', fields }
  }

  const { email, password, fullName } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already exists')) {
      return { success: false, error: 'EMAIL_IN_USE' }
    }
    return { success: false, error: 'SERVER_ERROR', message: error.message }
  }

  return { success: true }
}

export async function loginUser(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get('email') as string,
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

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, error: 'INVALID_CREDENTIALS' }
  }

  redirect('/')
}

export async function logoutUser(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

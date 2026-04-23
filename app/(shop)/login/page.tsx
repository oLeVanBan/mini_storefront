'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/lib/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setServerError(null)

    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await loginUser(fd)
        if (!result.success) {
          if (result.error === 'VALIDATION_ERROR' && 'fields' in result) {
            setFieldErrors(result.fields as Record<string, string>)
          } else if (result.error === 'INVALID_CREDENTIALS') {
            setServerError('Email hoặc mật khẩu không đúng.')
          } else {
            setServerError('Có lỗi xảy ra. Vui lòng thử lại.')
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
          router.push('/')
        }
      }
    })
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Đăng nhập</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-6 shadow-sm">
          {serverError && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit" disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline font-medium">Đăng ký ngay</Link>
        </p>
      </div>
    </main>
  )
}

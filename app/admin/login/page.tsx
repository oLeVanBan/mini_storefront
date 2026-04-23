/**
 * Admin login page — authenticates via bcrypt + Server Action,
 * stores HMAC-signed session cookie, then redirects to /admin.
 */
'use client'

import { useState, useTransition } from 'react'
import { adminLogin } from '@/lib/actions/admin-auth'

export default function AdminLoginPage() {
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
        const result = await adminLogin(fd)
        if (!result.success) {
          if (result.error === 'VALIDATION_ERROR' && 'fields' in result) {
            setFieldErrors(result.fields as Record<string, string>)
          } else {
            setServerError('Tên đăng nhập hoặc mật khẩu không đúng.')
          }
        }
      } catch (err: unknown) {
        // redirect() throws — not a real error, Next.js handles it
        if (err instanceof Error && err.message !== 'NEXT_REDIRECT') {
          setServerError('Có lỗi xảy ra. Vui lòng thử lại.')
        }
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm space-y-5">
        <h1 className="text-xl font-bold text-gray-800 text-center">Admin Đăng nhập</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              id="username" name="username" type="text" required autoComplete="username"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      </div>
    </div>
  )
}

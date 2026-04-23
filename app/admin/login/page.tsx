/**
 * Admin login page — sets the admin_secret cookie via a server action,
 * then redirects to /admin/products.
 *
 * Access via: /admin/login
 * This page is outside the (admin) layout group so the guard doesn't block it.
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      })
      if (res.ok) {
        router.push('/admin/products')
      } else {
        setError('Mật khẩu không đúng.')
      }
    } catch {
      setError('Lỗi kết nối.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm space-y-5">
        <h1 className="text-xl font-bold text-gray-800 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="secret" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Secret
            </label>
            <input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập admin secret"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg
              hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}

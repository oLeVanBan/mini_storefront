'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createCategory } from '@/lib/actions/admin'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function AdminNewCategoryPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugManual) {
      setSlug(slugify(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlugManual(true)
    setSlug(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await createCategory({ name: name.trim(), slug: slug.trim() })
      if (result.success) {
        router.push('/admin/categories')
      } else {
        const msgs: Record<string, string> = {
          UNAUTHORIZED: 'Không có quyền truy cập.',
          VALIDATION_ERROR: 'Tên hoặc slug không hợp lệ.',
          NAME_TAKEN: 'Tên danh mục đã tồn tại.',
          SLUG_TAKEN: 'Slug đã tồn tại.',
          SERVER_ERROR: 'Lỗi máy chủ.',
        }
        setError(msgs[result.error ?? ''] ?? 'Có lỗi xảy ra.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <Link href="/admin/categories" className="text-sm text-indigo-600 hover:underline">
          ← Danh sách danh mục
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Tạo danh mục mới</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="VD: Áo Thun Nam"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 ml-1">(tự sinh từ tên, có thể sửa)</span>
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              title="Chỉ dùng chữ thường a-z, số 0-9, và dấu gạch ngang"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="vd-ao-thun-nam"
            />
            <p className="text-xs text-gray-400 mt-1">
              Chỉ dùng chữ thường, số và dấu gạch ngang. VD: <code>ao-thun-nam</code>
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg
                hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Đang tạo…' : 'Tạo danh mục'}
            </button>
            <Link href="/admin/categories" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

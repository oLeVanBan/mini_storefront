import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { updateCategory } from '@/lib/actions/admin'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminEditCategoryPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, created_at')
    .eq('id', id)
    .single()

  if (!category) notFound()

  const cat = category as Category

  async function handleSave(formData: FormData) {
    'use server'
    const name = (formData.get('name') as string).trim()
    const slug = (formData.get('slug') as string).trim()

    const result = await updateCategory(id, { name, slug })
    if (result.success) {
      redirect('/admin/categories')
    }
    // On error, Next.js will re-render with the same form — a toast would be better
    // but is out of scope for this phase
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <Link href="/admin/categories" className="text-sm text-indigo-600 hover:underline">
          ← Danh sách danh mục
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Chỉnh sửa danh mục</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form action={handleSave} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={cat.name}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              defaultValue={cat.slug}
              required
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              title="Chỉ dùng chữ thường a-z, số 0-9, và dấu gạch ngang"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              ⚠️ Thay đổi slug sẽ làm hỏng URL cũ.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg
                hover:bg-indigo-700 transition-colors"
            >
              Lưu thay đổi
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

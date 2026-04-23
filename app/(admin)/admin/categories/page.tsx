import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { deleteCategory } from '@/lib/actions/admin'

export const dynamic = 'force-dynamic'

interface CategoryWithCount {
  id: string
  name: string
  slug: string
  product_count: number
}

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient()

  // Fetch categories with product count via JOIN
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, products(id)')
    .order('name')

  const list: CategoryWithCount[] = (categories ?? []).map((cat: Record<string, unknown>) => ({
    id: cat.id as string,
    name: cat.name as string,
    slug: cat.slug as string,
    product_count: Array.isArray(cat.products) ? cat.products.length : 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg
            hover:bg-indigo-700 transition-colors"
        >
          ＋ Danh mục mới
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Tên</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Slug</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Sản phẩm</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                <td className="px-4 py-3 text-right text-gray-800">{cat.product_count}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      className="text-indigo-600 hover:underline text-xs font-medium"
                    >
                      Đổi tên
                    </Link>
                    <form
                      action={async () => {
                        'use server'
                        await deleteCategory(cat.id)
                      }}
                    >
                      <button
                        type="submit"
                        disabled={cat.product_count > 0}
                        title={
                          cat.product_count > 0
                            ? `Không thể xóa — có ${cat.product_count} sản phẩm`
                            : 'Xóa danh mục'
                        }
                        className="text-xs font-medium text-red-600 hover:text-red-800
                          disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                        onClick={(e) => {
                          if (!confirm(`Xóa danh mục "${cat.name}"?`)) e.preventDefault()
                        }}
                      >
                        Xóa
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Chưa có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

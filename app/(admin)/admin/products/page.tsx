import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatVND } from '@/lib/utils/format'
import { updateProduct } from '@/lib/actions/admin'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const supabase = createAdminClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .order('created_at', { ascending: false })

  const list = (products as Product[]) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
        <span className="text-sm text-gray-500">{list.length} sản phẩm</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Tên</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell">Danh mục</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Giá</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Tồn kho</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Trạng thái</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                  {product.name}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                  {product.categories?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-800">
                  {formatVND(product.price)}
                </td>
                <td className="px-4 py-3 text-right text-gray-800">
                  {product.stock_quantity}
                </td>
                <td className="px-4 py-3 text-center">
                  <form
                    action={async () => {
                      'use server'
                      await updateProduct(product.id, { isPublished: !product.is_published })
                    }}
                  >
                    <button
                      type="submit"
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border
                        ${product.is_published
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      title={product.is_published ? 'Nhấn để ẩn' : 'Nhấn để hiển thị'}
                    >
                      {product.is_published ? '● Đang bán' : '○ Ẩn'}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-indigo-600 hover:underline text-xs font-medium"
                  >
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

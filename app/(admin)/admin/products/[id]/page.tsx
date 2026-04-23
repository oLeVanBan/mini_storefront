import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatVND } from '@/lib/utils/format'
import { updateProduct } from '@/lib/actions/admin'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const p = product as Product

  async function handleSave(formData: FormData) {
    'use server'
    const price = Number(formData.get('price'))
    const stockQuantity = Number(formData.get('stock_quantity'))
    const isPublished = formData.get('is_published') === 'true'

    const result = await updateProduct(id, { price, stockQuantity, isPublished })
    if (result.success) {
      redirect('/admin/products')
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm text-indigo-600 hover:underline">
          ← Danh sách sản phẩm
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
        <p className="text-sm text-gray-500 mt-0.5">{p.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <form action={handleSave} className="space-y-5">
          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Giá (VND)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step={1000}
              defaultValue={p.price}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">Giá hiện tại: {formatVND(p.price)}</p>
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Tồn kho
            </label>
            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min={0}
              defaultValue={p.stock_quantity}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Published */}
          <div>
            <label htmlFor="is_published" className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              id="is_published"
              name="is_published"
              defaultValue={p.is_published ? 'true' : 'false'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="true">Đang bán</option>
              <option value="false">Ẩn</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg
                hover:bg-indigo-700 transition-colors"
            >
              Lưu thay đổi
            </button>
            <Link
              href="/admin/products"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

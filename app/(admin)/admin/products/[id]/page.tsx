import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatVND } from '@/lib/utils/format'
import { updateProduct } from '@/lib/actions/admin'
import ImageUploadButton from '@/components/ImageUploadButton'
import SaveSuccessBanner from '@/components/SaveSuccessBanner'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}

export default async function AdminProductEditPage({ params, searchParams }: Props) {
  const { id } = await params
  const { saved } = await searchParams
  const supabase = createAdminClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('id', id)
      .single(),
    supabase
      .from('categories')
      .select('id, name, slug')
      .order('name'),
  ])

  if (!product) notFound()

  const p = product as Product
  const categoryList = (categories ?? []) as Category[]

  async function handleSave(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const price = Number(formData.get('price'))
    const stockQuantity = Number(formData.get('stock_quantity'))
    const isPublished = formData.get('is_published') === 'true'
    const categoryId = formData.get('category_id') as string

    const result = await updateProduct(id, { name, price, stockQuantity, isPublished, categoryId })
    if (result.success) {
      redirect(`/admin/products/${id}?saved=1`)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      {saved === '1' && <SaveSuccessBanner message="Đã lưu thay đổi thành công!" />}
      <div>
        <Link href="/admin/products" className="text-sm text-indigo-600 hover:underline">
          ← Danh sách sản phẩm
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
        <p className="text-sm text-gray-500 mt-0.5">{p.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        {/* Image upload — separate from save form */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Ảnh sản phẩm</p>
          <ImageUploadButton productId={id} currentImageUrl={p.image_url ?? null} />
        </div>

        <hr className="border-gray-100" />

        <form action={handleSave} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={p.name}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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

          {/* Category */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={p.category_id}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categoryList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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

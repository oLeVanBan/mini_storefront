import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatVND } from '@/lib/utils/format'
import AddToCartButton from '@/components/AddToCartButton'
import { addToCart } from '@/lib/actions/cart'
import type { Product } from '@/lib/types'

export const revalidate = 60

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!product) notFound()

  const p = product as Product

  async function handleAddToCart(quantity: number) {
    'use server'
    await addToCart(id, quantity)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-indigo-600">Trang chủ</Link>
        {p.categories && (
          <>
            <span>/</span>
            <Link
              href={`/categories/${p.categories.slug}`}
              className="hover:text-indigo-600"
            >
              {p.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-800 font-medium line-clamp-1">{p.name}</span>
      </nav>

      {/* Product layout */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {p.image_url ? (
            <Image
              src={p.image_url}
              alt={p.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{p.name}</h1>
            {p.categories && (
              <Link
                href={`/categories/${p.categories.slug}`}
                className="mt-1 inline-block text-xs text-indigo-600 hover:underline"
              >
                {p.categories.name}
              </Link>
            )}
          </div>

          <p className="text-3xl font-bold text-indigo-600">{formatVND(p.price)}</p>

          {p.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
          )}

          <div className="text-sm text-gray-500">
            {p.stock_quantity > 0 ? (
              <span className="text-green-600 font-medium">
                Còn {p.stock_quantity} sản phẩm
              </span>
            ) : (
              <span className="text-red-500 font-medium">Hết hàng</span>
            )}
          </div>

          <AddToCartButton
            stockQuantity={p.stock_quantity}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  )
}

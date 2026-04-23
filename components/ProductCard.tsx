import Link from 'next/link'
import Image from 'next/image'
import { formatVND } from '@/lib/utils/format'
import { addToCart } from '@/lib/actions/cart'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock_quantity === 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Image */}
      <Link href={`/products/${product.id}`} tabIndex={-1} aria-hidden>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div
              data-testid="product-image-placeholder"
              className="w-full h-full flex items-center justify-center text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
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
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                Hết hàng
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <Link
          href={`/products/${product.id}`}
          className="font-medium text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 text-sm leading-snug"
        >
          {product.name}
        </Link>
        <p className="text-indigo-600 font-semibold text-sm mt-auto">
          {formatVND(product.price)}
        </p>

        <form action={async () => { 'use server'; await addToCart(product.id, 1) }}>
          <button
            type="submit"
            disabled={isOutOfStock}
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
            className="w-full mt-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useTransition } from 'react'
import Image from 'next/image'
import { updateCartQuantity, removeFromCart } from '@/lib/actions/cart'
import { formatVND } from '@/lib/utils/format'
import type { CartItem } from '@/lib/types'

interface CartItemRowProps {
  item: CartItem
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const [isPending, startTransition] = useTransition()

  function handleDecrement() {
    startTransition(async () => {
      await updateCartQuantity(item.productId, item.quantity - 1)
    })
  }

  function handleIncrement() {
    startTransition(async () => {
      await updateCartQuantity(item.productId, item.quantity + 1)
    })
  }

  function handleRemove() {
    startTransition(async () => {
      await removeFromCart(item.productId)
    })
  }

  return (
    <div
      className={`flex items-start gap-4 py-4 border-b border-gray-100 last:border-0 transition-opacity ${isPending ? 'opacity-50' : ''}`}
    >
      {/* Image */}
      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
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

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">
          {item.name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{formatVND(item.price)}</p>

        {/* Quantity stepper */}
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isPending}
            aria-label="Giảm số lượng"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300
              text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors text-base leading-none"
          >
            −
          </button>
          <span className="min-w-[1.5rem] text-center text-sm font-semibold text-gray-900">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isPending}
            aria-label="Tăng số lượng"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-300
              text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors text-base leading-none"
          >
            +
          </button>
        </div>
      </div>

      {/* Line total + remove */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className="font-semibold text-indigo-600 text-sm">
          {formatVND(item.price * item.quantity)}
        </p>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          aria-label="Xóa sản phẩm"
          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
        >
          Xóa
        </button>
      </div>
    </div>
  )
}

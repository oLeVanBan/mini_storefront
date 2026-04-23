'use client'

import { useState, useTransition } from 'react'

interface QuantitySelectorProps {
  stockQuantity: number
  onAddToCart: (quantity: number) => Promise<void>
}

export default function AddToCartButton({
  stockQuantity,
  onAddToCart,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isOutOfStock = stockQuantity === 0

  function decrement() {
    setQuantity((q) => Math.max(1, q - 1))
  }
  function increment() {
    setQuantity((q) => Math.min(stockQuantity, q + 1))
  }

  async function handleAdd() {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      try {
        await onAddToCart(quantity)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      } catch (e) {
        setError('Không thể thêm vào giỏ. Vui lòng thử lại.')
      }
    })
  }

  if (isOutOfStock) {
    return (
      <div className="mt-4 px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-center text-sm font-medium">
        Hết hàng
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 font-medium">Số lượng:</span>
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <button
            type="button"
            onClick={decrement}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
            className="px-3 py-1.5 text-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="px-4 py-1.5 text-sm font-semibold min-w-[2.5rem] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={increment}
            disabled={quantity >= stockQuantity}
            aria-label="Tăng số lượng"
            className="px-3 py-1.5 text-lg text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
        <span className="text-xs text-gray-400">({stockQuantity} còn lại)</span>
      </div>

      {/* Add to cart */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending}
        aria-label={`Thêm ${quantity} sản phẩm vào giỏ hàng`}
        className="w-full py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-60 transition-colors text-sm cursor-pointer disabled:cursor-not-allowed"
      >
        {isPending ? 'Đang thêm...' : success ? '✓ Đã thêm vào giỏ!' : 'Thêm vào giỏ hàng'}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}

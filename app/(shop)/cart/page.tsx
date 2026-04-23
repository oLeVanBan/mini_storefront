import Link from 'next/link'
import { getCart } from '@/lib/utils/cart-cookie'
import { formatVND } from '@/lib/utils/format'
import CartItemRow from '@/components/CartItemRow'

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const cart = await getCart()
  const items = cart.items
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-20 w-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13L5.4 5M17 21a1 1 0 11-2 0 1 1 0 012 0zm-8 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng trống</h1>
        <p className="text-gray-500 text-sm">
          Bạn chưa thêm sản phẩm nào vào giỏ hàng.
        </p>
        <Link
          href="/"
          className="inline-block mt-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Giỏ hàng ({totalQty} sản phẩm)
      </h1>

      {/* Item list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 divide-y divide-gray-100">
        {items.map((item) => (
          <CartItemRow key={item.productId} item={item} />
        ))}
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-lg">Tóm tắt đơn hàng</h2>
        <div className="space-y-2 text-sm text-gray-600">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between gap-2">
              <span className="line-clamp-1 flex-1">
                {item.name} × {item.quantity}
              </span>
              <span className="shrink-0 font-medium text-gray-800">
                {formatVND(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-base font-semibold text-gray-800">Tổng cộng</span>
          <span className="text-xl font-bold text-indigo-600">{formatVND(total)}</span>
        </div>

        {/* CTA */}
        <Link
          href="/checkout"
          className="block w-full text-center py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg
            hover:bg-indigo-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          Tiến hành thanh toán →
        </Link>
        <Link
          href="/"
          className="block text-center text-sm text-indigo-600 hover:underline"
        >
          ← Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  )
}

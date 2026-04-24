'use client'

import { useState, useTransition } from 'react'
import { getOrdersByEmail } from '@/lib/actions/orders'
import { formatVND, formatDate } from '@/lib/utils/format'
import type { OrderWithItems } from '@/lib/actions/orders'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã huỷ',
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrderLookup() {
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<OrderWithItems[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOrders(null)
    startTransition(async () => {
      const result = await getOrdersByEmail(email.trim())
      if (!result.success) {
        if (result.error === 'VALIDATION_ERROR') {
          setError('Vui lòng nhập email hợp lệ.')
        } else {
          setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
        }
        return
      }
      setOrders(result.data)
    })
  }

  return (
    <div className="space-y-8">
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email bạn đã dùng khi đặt hàng"
          required
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none
            focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg
            hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
          {isPending ? 'Đang tìm...' : 'Tra cứu'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Results */}
      {orders !== null && (
        orders.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            Không tìm thấy đơn hàng nào với email <strong>{email}</strong>.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Tìm thấy <strong>{orders.length}</strong> đơn hàng cho <strong>{email}</strong>
            </p>
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Mã đơn hàng</p>
                    <p className="font-bold text-indigo-700 tracking-wide">{order.reference_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Ngày đặt</p>
                    <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_CLASS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {order.order_items.map(item => (
                    <div key={item.id} className="flex justify-between items-center px-5 py-3 text-sm">
                      <span className="text-gray-800">{item.product_name}</span>
                      <span className="text-gray-500">x{item.quantity}</span>
                      <span className="font-medium">{formatVND(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <span className="text-sm text-gray-600">
                    {order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thẻ tín dụng'}
                  </span>
                  <span className="font-bold text-gray-900">{formatVND(order.total_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

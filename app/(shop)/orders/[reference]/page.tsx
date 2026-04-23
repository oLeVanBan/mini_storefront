import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatVND, formatDate } from '@/lib/utils/format'

interface Props {
  params: Promise<{ reference: string }>
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { reference } = await params
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*), payment_details(*)')
    .eq('reference_number', reference)
    .single()

  if (!order) notFound()

  const paymentDetails = Array.isArray(order.payment_details)
    ? order.payment_details[0]
    : order.payment_details

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Đặt hàng thành công!</h1>
        <p className="text-gray-500 mt-1">Cảm ơn bạn đã mua hàng tại Mini Storefront</p>
        <div className="mt-3 inline-block bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
          <span className="text-xs text-indigo-500 font-medium">Mã đơn hàng</span>
          <p className="text-lg font-bold text-indigo-700 tracking-wide">{order.reference_number}</p>
        </div>
      </div>

      {/* Order info */}
      <div className="bg-white border rounded-xl divide-y">
        {/* Customer info */}
        <div className="p-5 space-y-1">
          <h2 className="font-semibold text-gray-800 mb-3">Thông tin đặt hàng</h2>
          <div className="grid grid-cols-3 text-sm gap-y-2">
            <span className="text-gray-500">Họ tên</span>
            <span className="col-span-2 text-gray-900 font-medium">{order.customer_name}</span>
            <span className="text-gray-500">Email</span>
            <span className="col-span-2 text-gray-900">{order.customer_email}</span>
            <span className="text-gray-500">Địa chỉ</span>
            <span className="col-span-2 text-gray-900">{order.delivery_address}</span>
            <span className="text-gray-500">Ngày đặt</span>
            <span className="col-span-2 text-gray-900">{formatDate(order.created_at)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="p-5 space-y-1 text-sm">
          <h2 className="font-semibold text-gray-800 mb-2">Phương thức thanh toán</h2>
          {order.payment_method === 'COD' ? (
            <p className="text-gray-700">💵 Thanh toán khi nhận hàng (COD)</p>
          ) : (
            <p className="text-gray-700">
              💳 Thẻ Visa/Mastercard —{' '}
              <span className="font-mono">
                **** **** **** {paymentDetails?.card_last4 ?? '****'}
              </span>
              {paymentDetails && (
                <span className="text-gray-400 ml-2">
                  (HH {paymentDetails.exp_month}/{paymentDetails.exp_year})
                </span>
              )}
            </p>
          )}
        </div>

        {/* Items */}
        <div className="p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Sản phẩm đã đặt</h2>
          <ul className="divide-y divide-gray-100 text-sm">
            {order.order_items?.map((item: { id: string; product_name: string; quantity: number; unit_price: number }) => (
              <li key={item.id} className="py-2 flex justify-between">
                <span className="text-gray-700">
                  {item.product_name} <span className="text-gray-400">× {item.quantity}</span>
                </span>
                <span className="font-medium text-gray-900">{formatVND(item.unit_price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
            <span>Tổng cộng</span>
            <span className="text-indigo-600">{formatVND(order.total_amount)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </main>
  )
}

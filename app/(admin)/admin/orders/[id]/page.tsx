import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatVND, formatDate } from '@/lib/utils/format'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

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

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*), payment_details(*)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const paymentDetail = Array.isArray(order.payment_details)
    ? order.payment_details[0]
    : order.payment_details

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-indigo-600 hover:underline">
          ← Danh sách đơn hàng
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">
            Đơn hàng #{order.reference_number}
          </h1>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">Đặt ngày {formatDate(order.created_at)}</p>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-800">Thông tin khách hàng</h2>
        <dl className="grid grid-cols-3 text-sm gap-y-2">
          <dt className="text-gray-500">Họ tên</dt>
          <dd className="col-span-2 font-medium">{order.customer_name}</dd>
          <dt className="text-gray-500">Email</dt>
          <dd className="col-span-2">{order.customer_email}</dd>
          <dt className="text-gray-500">Địa chỉ</dt>
          <dd className="col-span-2">{order.delivery_address}</dd>
        </dl>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Sản phẩm đặt mua</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-2.5 text-left text-gray-600 font-medium">Sản phẩm</th>
              <th className="px-5 py-2.5 text-center text-gray-600 font-medium">Số lượng</th>
              <th className="px-5 py-2.5 text-right text-gray-600 font-medium">Đơn giá</th>
              <th className="px-5 py-2.5 text-right text-gray-600 font-medium">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.order_items.map((item: { id: string; product_name: string; quantity: number; unit_price: number }) => (
              <tr key={item.id}>
                <td className="px-5 py-3 text-gray-800">{item.product_name}</td>
                <td className="px-5 py-3 text-center text-gray-600">{item.quantity}</td>
                <td className="px-5 py-3 text-right text-gray-600">{formatVND(item.unit_price)}</td>
                <td className="px-5 py-3 text-right font-medium">{formatVND(item.unit_price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50">
            <tr>
              <td colSpan={3} className="px-5 py-3 text-right font-semibold text-gray-700">Tổng cộng</td>
              <td className="px-5 py-3 text-right font-bold text-gray-900">{formatVND(order.total_amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-800">Thanh toán</h2>
        <dl className="grid grid-cols-3 text-sm gap-y-2">
          <dt className="text-gray-500">Phương thức</dt>
          <dd className="col-span-2">
            {order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Thẻ tín dụng'}
          </dd>
          {paymentDetail && (
            <>
              <dt className="text-gray-500">Chủ thẻ</dt>
              <dd className="col-span-2">{paymentDetail.cardholder_name}</dd>
              <dt className="text-gray-500">Số thẻ</dt>
              <dd className="col-span-2">**** **** **** {paymentDetail.card_last4}</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  )
}

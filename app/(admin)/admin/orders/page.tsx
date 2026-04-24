import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { formatVND, formatDate } from '@/lib/utils/format'
import type { Order } from '@/lib/types'

export const dynamic = 'force-dynamic'

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

export default async function AdminOrdersPage() {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const list = (orders ?? []) as Order[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
        <span className="text-sm text-gray-500">{list.length} đơn</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Mã đơn</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell">Khách hàng</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden lg:table-cell">Email</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Tổng tiền</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Trạng thái</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell">Ngày đặt</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            )}
            {list.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-indigo-700">
                  {order.reference_number}
                </td>
                <td className="px-4 py-3 text-gray-800 hidden md:table-cell">
                  {order.customer_name}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                  {order.customer_email}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatVND(order.total_amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-indigo-600 hover:underline text-xs font-medium"
                  >
                    Xem
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatVND, formatDate } from '@/lib/utils/format'

export const dynamic = 'force-dynamic'

export default async function ProfileOrdersPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) {
    redirect('/login')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('id, reference_number, created_at, total_amount, payment_method, status')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Đơn hàng của tôi</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-4">Bạn chưa có đơn hàng nào.</p>
          <Link href="/" className="text-indigo-600 hover:underline font-medium">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="bg-white border rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 font-mono tracking-wide">
                    {order.reference_number}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {order.payment_method === 'COD' ? '💵 COD' : '💳 Thẻ'}
                  </span>
                  <span className="font-semibold text-indigo-600">
                    {formatVND(order.total_amount)}
                  </span>
                  <Link
                    href={`/orders/${order.reference_number}`}
                    className="text-sm text-indigo-600 hover:underline font-medium"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

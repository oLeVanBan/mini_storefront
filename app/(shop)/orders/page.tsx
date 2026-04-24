import OrderLookup from '@/components/OrderLookup'

export const metadata = { title: 'Tra cứu đơn hàng – Mini Storefront' }
export const dynamic = 'force-dynamic'

export default function OrdersPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Tra cứu đơn hàng</h1>
      <p className="text-gray-500 text-sm mb-8">
        Nhập email bạn đã sử dụng khi đặt hàng để xem lịch sử mua hàng.
      </p>
      <OrderLookup />
    </main>
  )
}

import { redirect } from 'next/navigation'
import { getCart } from '@/lib/utils/cart-cookie'
import CheckoutForm from '@/components/CheckoutForm'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const cart = await getCart()

  if (cart.items.length === 0) {
    redirect('/cart')
  }

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Thanh toán</h1>
      <CheckoutForm items={cart.items} total={total} />
    </main>
  )
}

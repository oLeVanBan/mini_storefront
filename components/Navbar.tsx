import Link from 'next/link'
import { cookies } from 'next/headers'
import { getCart } from '@/lib/utils/cart-cookie'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types'

export default async function Navbar() {
  // Read categories for navigation
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  // Read cart count from cookie (server-side)
  const cart = await getCart()
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-indigo-600 shrink-0 hover:text-indigo-700 transition-colors"
        >
          Mini Store
        </Link>

        {/* Category nav */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          {(categories as Category[] | null)?.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="px-3 py-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Cart icon */}
        <Link
          href="/cart"
          aria-label={`Giỏ hàng${cartCount > 0 ? `, ${cartCount} sản phẩm` : ' trống'}`}
          className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {/* Shopping bag icon (inline SVG, no extra deps) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
            />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path strokeLinecap="round" d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span className="hidden sm:inline">Giỏ hàng</span>
          {cartCount > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
              aria-hidden="true"
            >
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}

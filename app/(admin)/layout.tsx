import Link from 'next/link'
import { adminLogout } from '@/lib/actions/admin-auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth guard is handled by middleware.ts — no cookie check needed here.
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-indigo-700 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg hover:text-indigo-200 transition-colors">
            Mini Store
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/admin/products" className="hover:text-indigo-200 transition-colors">
              Sản phẩm
            </Link>
            <Link href="/admin/categories" className="hover:text-indigo-200 transition-colors">
              Danh mục
            </Link>
            <Link href="/admin/users" className="hover:text-indigo-200 transition-colors">
              Người dùng
            </Link>
          </nav>
          <form action={adminLogout}>
            <button
              type="submit"
              className="text-xs text-indigo-300 hover:text-white transition-colors"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  )
}

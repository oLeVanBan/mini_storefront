import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/ProductGrid'
import Link from 'next/link'
import type { Category, Product } from '@/lib/types'

export const revalidate = 60 // ISR: revalidate every 60s

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  // Fetch all published products with their categories
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(id, name, slug)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const categoryList = (categories as Category[]) ?? []
  const productList = (products as Product[]) ?? []

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">Tất cả sản phẩm</h1>

      {categoryList.length === 0 ? (
        <ProductGrid products={productList} />
      ) : (
        categoryList.map((cat) => {
          const catProducts = productList.filter(
            (p) => p.category_id === cat.id
          )
          if (catProducts.length === 0) return null
          return (
            <section key={cat.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  {cat.name}
                </h2>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Xem tất cả →
                </Link>
              </div>
              <ProductGrid products={catProducts} />
            </section>
          )
        })
      )}

      {productList.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          <p className="text-lg font-medium">Chưa có sản phẩm nào.</p>
          <p className="text-sm mt-2">Vui lòng quay lại sau.</p>
        </div>
      )}
    </div>
  )
}

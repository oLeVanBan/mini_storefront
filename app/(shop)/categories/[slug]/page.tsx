import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/ProductGrid'
import Link from 'next/link'
import type { Category, Product } from '@/lib/types'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch category by slug
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, created_at')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const cat = category as Category

  // Fetch published products for this category
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', cat.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600">
          ← Trang chủ
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{cat.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {(products?.length ?? 0)} sản phẩm
        </p>
      </div>
      <ProductGrid products={(products as Product[]) ?? []} />
    </div>
  )
}

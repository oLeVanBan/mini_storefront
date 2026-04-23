import ProductCard from './ProductCard'
import type { Product } from '@/lib/types'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="text-lg">Không có sản phẩm nào trong danh mục này.</p>
        <p className="text-sm mt-1">Vui lòng quay lại sau.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

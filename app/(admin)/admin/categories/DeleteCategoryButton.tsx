'use client'

import { deleteCategory } from '@/lib/actions/admin'

interface Props {
  categoryId: string
  categoryName: string
  productCount: number
}

export default function DeleteCategoryButton({ categoryId, categoryName, productCount }: Props) {
  const disabled = productCount > 0
  const title = disabled
    ? `Không thể xóa — có ${productCount} sản phẩm`
    : 'Xóa danh mục'

  async function handleDelete() {
    if (!confirm(`Xóa danh mục "${categoryName}"?`)) return
    await deleteCategory(categoryId)
  }

  return (
    <form action={handleDelete}>
      <button
        type="submit"
        disabled={disabled}
        title={title}
        className="text-xs font-medium text-red-600 hover:text-red-800
          disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Xóa
      </button>
    </form>
  )
}

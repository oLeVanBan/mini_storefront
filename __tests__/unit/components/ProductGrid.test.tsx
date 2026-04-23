/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import ProductGrid from '@/components/ProductGrid'
import type { Product } from '@/lib/types'

jest.mock('@/lib/actions/cart', () => ({
  addToCart: jest.fn(),
}))

const makeProduct = (id: string, name: string): Product => ({
  id,
  name,
  description: null,
  price: 100000,
  stock_quantity: 5,
  is_published: true,
  category_id: 'cat-1',
  image_url: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
})

describe('ProductGrid', () => {
  it('renders all products', () => {
    const products = [
      makeProduct('p1', 'Sản phẩm A'),
      makeProduct('p2', 'Sản phẩm B'),
      makeProduct('p3', 'Sản phẩm C'),
    ]
    render(<ProductGrid products={products} />)
    expect(screen.getByText('Sản phẩm A')).toBeInTheDocument()
    expect(screen.getByText('Sản phẩm B')).toBeInTheDocument()
    expect(screen.getByText('Sản phẩm C')).toBeInTheDocument()
  })

  it('renders empty state when no products', () => {
    render(<ProductGrid products={[]} />)
    expect(screen.getByText(/không có sản phẩm/i)).toBeInTheDocument()
  })

  it('renders a grid container', () => {
    const products = [makeProduct('p1', 'Test')]
    const { container } = render(<ProductGrid products={products} />)
    // Grid should have CSS grid or flex layout
    const grid = container.querySelector('[class*="grid"]')
    expect(grid).not.toBeNull()
  })
})

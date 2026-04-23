/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/types'

jest.mock('@/lib/actions/cart', () => ({
  addToCart: jest.fn(),
}))

const baseProduct: Product = {
  id: 'prod-1',
  name: 'Áo Thun Basic',
  description: 'Áo thun cotton 100%',
  price: 150000,
  stock_quantity: 10,
  is_published: true,
  category_id: 'cat-1',
  image_url: null,
  created_at: '2026-04-23T00:00:00Z',
  updated_at: '2026-04-23T00:00:00Z',
}

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByText('Áo Thun Basic')).toBeInTheDocument()
  })

  it('renders formatted price in VND', () => {
    render(<ProductCard product={baseProduct} />)
    // Price should contain 150.000 and ₫
    expect(screen.getByText(/150[\.,]000/)).toBeInTheDocument()
  })

  it('renders a link to the product detail page', () => {
    render(<ProductCard product={baseProduct} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/products/prod-1')
  })

  it('shows placeholder when image_url is null', () => {
    render(<ProductCard product={baseProduct} />)
    // Should show an img or placeholder div
    const img = screen.queryByRole('img')
    // Either an img element or a placeholder div should exist
    const placeholder = screen.queryByTestId('product-image-placeholder')
    expect(img || placeholder).toBeTruthy()
  })

  it('shows out-of-stock indicator when stock is 0', () => {
    render(<ProductCard product={{ ...baseProduct, stock_quantity: 0 }} />)
    // Multiple 'Hết hàng' elements are rendered (badge + button) — that's expected
    const outOfStockEls = screen.getAllByText(/hết hàng/i)
    expect(outOfStockEls.length).toBeGreaterThanOrEqual(1)
  })

  it('shows add-to-cart button when in stock', () => {
    render(<ProductCard product={baseProduct} />)
    // Button has aria-label containing 'Thêm ... vào giỏ hàng'
    expect(
      screen.getByRole('button', { name: /thêm .* vào giỏ hàng/i })
    ).toBeInTheDocument()
  })
})

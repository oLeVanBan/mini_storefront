/**
 * @jest-environment jsdom
 *
 * TDD tests for CartItemRow component (written BEFORE implementation).
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { CartItem } from '@/lib/types'

// Mock server actions
const mockUpdateCartQuantity = jest.fn()
const mockRemoveFromCart = jest.fn()

jest.mock('@/lib/actions/cart', () => ({
  updateCartQuantity: (...args: unknown[]) => mockUpdateCartQuantity(...args),
  removeFromCart: (...args: unknown[]) => mockRemoveFromCart(...args),
}))

// Lazy-import after mocks are set up
let CartItemRow: React.ComponentType<{ item: CartItem }>

beforeAll(() => {
  CartItemRow = require('@/components/CartItemRow').default
})

const sampleItem: CartItem = {
  productId: 'prod-1',
  name: 'Áo Thun Basic',
  price: 150000,
  quantity: 2,
  imageUrl: undefined,
}

describe('CartItemRow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateCartQuantity.mockResolvedValue({ success: true })
    mockRemoveFromCart.mockResolvedValue({ success: true })
  })

  it('renders the product name', () => {
    render(<CartItemRow item={sampleItem} />)
    expect(screen.getByText('Áo Thun Basic')).toBeInTheDocument()
  })

  it('renders unit price formatted in VND', () => {
    render(<CartItemRow item={sampleItem} />)
    // 150.000 ₫ per unit
    expect(screen.getByText(/150[\.,]000/)).toBeInTheDocument()
  })

  it('renders line total (quantity × price) formatted in VND', () => {
    render(<CartItemRow item={sampleItem} />)
    // 2 × 150.000 = 300.000 ₫
    expect(screen.getByText(/300[\.,]000/)).toBeInTheDocument()
  })

  it('renders current quantity', () => {
    render(<CartItemRow item={sampleItem} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('calls updateCartQuantity with incremented quantity when + is clicked', async () => {
    render(<CartItemRow item={sampleItem} />)
    fireEvent.click(screen.getByRole('button', { name: /tăng|increase|\+/i }))
    await waitFor(() => {
      expect(mockUpdateCartQuantity).toHaveBeenCalledWith('prod-1', 3)
    })
  })

  it('calls updateCartQuantity with decremented quantity when − is clicked', async () => {
    render(<CartItemRow item={{ ...sampleItem, quantity: 3 }} />)
    fireEvent.click(screen.getByRole('button', { name: /giảm|decrease|−|-/i }))
    await waitFor(() => {
      expect(mockUpdateCartQuantity).toHaveBeenCalledWith('prod-1', 2)
    })
  })

  it('calls removeFromCart when − button at quantity 1 is clicked', async () => {
    render(<CartItemRow item={{ ...sampleItem, quantity: 1 }} />)
    fireEvent.click(screen.getByRole('button', { name: /giảm|decrease|−|-/i }))
    await waitFor(() => {
      expect(mockUpdateCartQuantity).toHaveBeenCalledWith('prod-1', 0)
    })
  })

  it('calls removeFromCart when delete button is clicked', async () => {
    render(<CartItemRow item={sampleItem} />)
    fireEvent.click(screen.getByRole('button', { name: /xóa|remove|delete/i }))
    await waitFor(() => {
      expect(mockRemoveFromCart).toHaveBeenCalledWith('prod-1')
    })
  })
})

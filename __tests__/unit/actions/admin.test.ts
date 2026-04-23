/**
 * TDD tests for admin Server Actions: lib/actions/admin.ts
 * Written BEFORE implementation (Red phase).
 *
 * Covers: updateProduct, createCategory, updateCategory, deleteCategory
 */

// ── Environment & Mocks ──────────────────────────────────────────────────────

// Admin secret for tests
process.env.ADMIN_SECRET = 'test-admin-secret'

const mockRevalidatePath = jest.fn()
jest.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

// Mock next/headers cookies for admin secret validation
const mockCookieStore = {
  get: jest.fn(),
}
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}))

// ------------ Supabase admin client mock ------------------------------------
// We mock the full chain: from(table).update/insert/delete.eq.single / select.eq
const mockUpdate = jest.fn()
const mockInsert = jest.fn()
const mockDelete = jest.fn()
const mockSelect = jest.fn()

// Builder that collects chainable .eq() calls and terminates with .single() or
// direct resolution (for insert returning single row).
function makeChain(terminal: jest.Mock) {
  const chain: Record<string, unknown> = {}
  chain.eq = jest.fn(() => chain)
  chain.neq = jest.fn(() => chain)
  chain.single = terminal
  chain.select = jest.fn(() => chain)
  // For count queries
  chain.count = terminal
  return chain
}

const updateChain = makeChain(jest.fn())
const insertChain = makeChain(jest.fn())
const deleteChain = makeChain(jest.fn())
const selectChain = makeChain(jest.fn())

mockUpdate.mockReturnValue(updateChain)
mockInsert.mockReturnValue(insertChain)
mockDelete.mockReturnValue(deleteChain)
mockSelect.mockReturnValue(selectChain)

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: mockUpdate,
      insert: mockInsert,
      delete: mockDelete,
      select: mockSelect,
    })),
  })),
}))

// ── Helper: simulate admin cookie ─────────────────────────────────────────────
function asAdmin() {
  mockCookieStore.get.mockImplementation((key: string) => {
    if (key === 'admin_secret') return { value: 'test-admin-secret' }
    return undefined
  })
}

function asNonAdmin() {
  mockCookieStore.get.mockReturnValue(undefined)
}

// ── updateProduct ─────────────────────────────────────────────────────────────

describe('updateProduct', () => {
  let updateProduct: (
    productId: string,
    data: { price?: number; stockQuantity?: number; isPublished?: boolean }
  ) => Promise<{ success: boolean; error?: string }>

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env.ADMIN_SECRET = 'test-admin-secret'
    updateProduct = require('@/lib/actions/admin').updateProduct
  })

  it('updates product successfully when admin', async () => {
    asAdmin()
    ;(updateChain.single as jest.Mock).mockResolvedValue({ data: {}, error: null })
    const result = await updateProduct('prod-1', { price: 200000 })
    expect(result.success).toBe(true)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/products')
  })

  it('returns UNAUTHORIZED when not admin', async () => {
    asNonAdmin()
    const result = await updateProduct('prod-1', { price: 200000 })
    expect(result.success).toBe(false)
    expect(result.error).toBe('UNAUTHORIZED')
  })

  it('returns VALIDATION_ERROR when price is negative', async () => {
    asAdmin()
    const result = await updateProduct('prod-1', { price: -1 })
    expect(result.success).toBe(false)
    expect(result.error).toBe('VALIDATION_ERROR')
  })

  it('returns VALIDATION_ERROR when stockQuantity is negative', async () => {
    asAdmin()
    const result = await updateProduct('prod-1', { stockQuantity: -5 })
    expect(result.success).toBe(false)
    expect(result.error).toBe('VALIDATION_ERROR')
  })

  it('accepts zero price and zero stock as valid', async () => {
    asAdmin()
    ;(updateChain.single as jest.Mock).mockResolvedValue({ data: {}, error: null })
    const result = await updateProduct('prod-1', { price: 0, stockQuantity: 0 })
    expect(result.success).toBe(true)
  })

  it('revalidates correct paths on success', async () => {
    asAdmin()
    ;(updateChain.single as jest.Mock).mockResolvedValue({ data: {}, error: null })
    await updateProduct('prod-1', { isPublished: true })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/products/prod-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/products')
  })
})

// ── createCategory ────────────────────────────────────────────────────────────

describe('createCategory', () => {
  let createCategory: (
    data: { name: string; slug: string }
  ) => Promise<{ success: boolean; id?: string; error?: string }>

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env.ADMIN_SECRET = 'test-admin-secret'
    createCategory = require('@/lib/actions/admin').createCategory
  })

  it('creates category successfully', async () => {
    asAdmin()
    ;(insertChain.single as jest.Mock).mockResolvedValue({
      data: { id: 'cat-new' },
      error: null,
    })
    const result = await createCategory({ name: 'Áo Thun', slug: 'ao-thun' })
    expect(result.success).toBe(true)
    expect(result.id).toBe('cat-new')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/categories')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
  })

  it('returns UNAUTHORIZED when not admin', async () => {
    asNonAdmin()
    const result = await createCategory({ name: 'Test', slug: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('UNAUTHORIZED')
  })

  it('returns VALIDATION_ERROR when name is empty', async () => {
    asAdmin()
    const result = await createCategory({ name: '', slug: 'test' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('VALIDATION_ERROR')
  })

  it('returns VALIDATION_ERROR when slug is empty', async () => {
    asAdmin()
    const result = await createCategory({ name: 'Test', slug: '' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('VALIDATION_ERROR')
  })

  it('returns VALIDATION_ERROR for invalid slug format (uppercase)', async () => {
    asAdmin()
    const result = await createCategory({ name: 'Test', slug: 'Ao-Thun' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('VALIDATION_ERROR')
  })

  it('returns VALIDATION_ERROR for slug with special chars', async () => {
    asAdmin()
    const result = await createCategory({ name: 'Test', slug: 'ao_thun' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('VALIDATION_ERROR')
  })

  it('accepts valid slug with multiple segments', async () => {
    asAdmin()
    ;(insertChain.single as jest.Mock).mockResolvedValue({
      data: { id: 'cat-new' },
      error: null,
    })
    const result = await createCategory({ name: 'Áo Thun Nam', slug: 'ao-thun-nam' })
    expect(result.success).toBe(true)
  })

  it('returns SLUG_TAKEN on unique constraint violation for slug', async () => {
    asAdmin()
    ;(insertChain.single as jest.Mock).mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint "categories_slug_key"' },
    })
    const result = await createCategory({ name: 'Test', slug: 'existing-slug' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('SLUG_TAKEN')
  })

  it('returns NAME_TAKEN on unique constraint violation for name', async () => {
    asAdmin()
    ;(insertChain.single as jest.Mock).mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint "categories_name_key"' },
    })
    const result = await createCategory({ name: 'Existing', slug: 'existing' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('NAME_TAKEN')
  })
})

// ── updateCategory ────────────────────────────────────────────────────────────

describe('updateCategory', () => {
  let updateCategory: (
    categoryId: string,
    data: { name?: string; slug?: string }
  ) => Promise<{ success: boolean; error?: string }>

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env.ADMIN_SECRET = 'test-admin-secret'
    updateCategory = require('@/lib/actions/admin').updateCategory
  })

  it('updates category successfully', async () => {
    asAdmin()
    ;(updateChain.single as jest.Mock).mockResolvedValue({ data: {}, error: null })
    const result = await updateCategory('cat-1', { name: 'New Name', slug: 'new-name' })
    expect(result.success).toBe(true)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/categories')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
  })

  it('returns UNAUTHORIZED when not admin', async () => {
    asNonAdmin()
    const result = await updateCategory('cat-1', { name: 'X' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('UNAUTHORIZED')
  })

  it('returns VALIDATION_ERROR for invalid slug', async () => {
    asAdmin()
    const result = await updateCategory('cat-1', { slug: 'INVALID SLUG' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('VALIDATION_ERROR')
  })

  it('returns SLUG_TAKEN on duplicate slug', async () => {
    asAdmin()
    ;(updateChain.single as jest.Mock).mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'categories_slug_key' },
    })
    const result = await updateCategory('cat-1', { slug: 'taken-slug' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('SLUG_TAKEN')
  })
})

// ── deleteCategory ────────────────────────────────────────────────────────────

describe('deleteCategory', () => {
  let deleteCategory: (
    categoryId: string
  ) => Promise<{ success: boolean; error?: string; count?: number }>

  // Separate mocked supabase for deleteCategory since it needs select for count
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env.ADMIN_SECRET = 'test-admin-secret'
    deleteCategory = require('@/lib/actions/admin').deleteCategory
  })

  it('deletes category when no products', async () => {
    asAdmin()
    // The count query: .select(...).eq(...) is awaited directly (no .single())
    ;(selectChain.eq as jest.Mock).mockResolvedValue({ count: 0, error: null })
    ;(deleteChain.eq as jest.Mock).mockResolvedValue({ error: null })
    const result = await deleteCategory('cat-1')
    expect(result.success).toBe(true)
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/categories')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/')
  })

  it('returns HAS_PRODUCTS when category has products', async () => {
    asAdmin()
    ;(selectChain.eq as jest.Mock).mockResolvedValue({ count: 3, error: null })
    const result = await deleteCategory('cat-1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('HAS_PRODUCTS')
    expect(result.count).toBe(3)
  })

  it('returns UNAUTHORIZED when not admin', async () => {
    asNonAdmin()
    const result = await deleteCategory('cat-1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('UNAUTHORIZED')
  })
})

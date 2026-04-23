/**
 * TDD: Tests for lib/actions/admin-auth.ts
 * Run: pnpm exec jest __tests__/unit/actions/admin-auth.test.ts
 */

// Mock bcryptjs so tests don't depend on real hash values
const mockBcryptCompare = jest.fn()
jest.mock('bcryptjs', () => ({
  compare: (...args: unknown[]) => mockBcryptCompare(...args),
}))

// Setup env vars
beforeAll(() => {
  process.env.ADMIN_USERNAME = 'admin'
  process.env.ADMIN_PASSWORD_HASH = '$2b$12$test-hash-placeholder'
  process.env.ADMIN_SESSION_SECRET = '35cfa5b8b28028d1b7d7d8409f67b266ec1bc250dfc11013b8f4df0cbb2e5544'
})

// Mock next/headers
const mockCookiesSet = jest.fn()
const mockCookiesDelete = jest.fn()
const mockCookiesGet = jest.fn()
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    set: mockCookiesSet,
    delete: mockCookiesDelete,
    get: mockCookiesGet,
  })),
}))

// Mock next/navigation
const mockRedirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url)
    throw new Error('NEXT_REDIRECT')
  },
}))

import { adminLogin, adminLogout } from '@/lib/actions/admin-auth'

describe('adminLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBcryptCompare.mockResolvedValue(false)  // default: invalid
  })

  it('redirects to /admin on valid credentials', async () => {
    mockBcryptCompare.mockResolvedValue(true)  // correct password
    const fd = new FormData()
    fd.set('username', 'admin')
    fd.set('password', 'adminpassword')  // matches hash in env

    await expect(adminLogin(fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/admin')
    expect(mockCookiesSet).toHaveBeenCalledWith(
      'admin_session',
      expect.any(String),
      expect.objectContaining({ httpOnly: true, path: '/' })
    )
  })

  it('returns INVALID_CREDENTIALS for wrong password', async () => {
    const fd = new FormData()
    fd.set('username', 'admin')
    fd.set('password', 'wrongpassword')

    const result = await adminLogin(fd)
    expect(result.success).toBe(false)
    expect(!result.success && result.error).toBe('INVALID_CREDENTIALS')
    expect(mockCookiesSet).not.toHaveBeenCalled()
  })

  it('returns INVALID_CREDENTIALS for wrong username', async () => {
    const fd = new FormData()
    fd.set('username', 'notadmin')
    fd.set('password', 'adminpassword')

    const result = await adminLogin(fd)
    expect(result.success).toBe(false)
    expect(!result.success && result.error).toBe('INVALID_CREDENTIALS')
    expect(mockCookiesSet).not.toHaveBeenCalled()
  })

  it('returns VALIDATION_ERROR for empty fields', async () => {
    const fd = new FormData()
    fd.set('username', '')
    fd.set('password', '')

    const result = await adminLogin(fd)
    expect(result.success).toBe(false)
    expect(!result.success && result.error).toBe('VALIDATION_ERROR')
  })
})

describe('adminLogout', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes admin_session cookie and redirects to /admin/login', async () => {
    await expect(adminLogout()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockCookiesDelete).toHaveBeenCalledWith('admin_session')
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
  })
})

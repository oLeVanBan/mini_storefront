/**
 * TDD: Tests for lib/actions/auth.ts (Customer Auth via Supabase)
 * Run: pnpm exec jest __tests__/unit/actions/auth.test.ts
 */

// Mock Supabase client
const mockSignUp = jest.fn()
const mockSignInWithPassword = jest.fn()
const mockSignOut = jest.fn()
const mockAuth = {
  auth: {
    signUp: mockSignUp,
    signInWithPassword: mockSignInWithPassword,
    signOut: mockSignOut,
    getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
  },
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => mockAuth),
  createAdminClient: jest.fn(() => mockAuth),
}))

// Mock next/headers (cookies)
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
    delete: jest.fn(),
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

import { registerUser, loginUser, logoutUser } from '@/lib/actions/auth'

describe('registerUser', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns success on valid input', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    const fd = new FormData()
    fd.set('email', 'user@example.com')
    fd.set('password', 'SecurePass123!')
    fd.set('fullName', 'Test User')

    const result = await registerUser(fd)
    expect(result.success).toBe(true)
    expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({
      email: 'user@example.com',
      password: 'SecurePass123!',
    }))
  })

  it('returns VALIDATION_ERROR for missing email', async () => {
    const fd = new FormData()
    fd.set('email', '')
    fd.set('password', 'SecurePass123!')
    fd.set('fullName', 'Test User')

    const result = await registerUser(fd)
    expect(result.success).toBe(false)
    expect(!result.success && result.error).toBe('VALIDATION_ERROR')
  })

  it('returns VALIDATION_ERROR for short password', async () => {
    const fd = new FormData()
    fd.set('email', 'user@example.com')
    fd.set('password', '123')
    fd.set('fullName', 'Test User')

    const result = await registerUser(fd)
    expect(result.success).toBe(false)
    expect(!result.success && result.error).toBe('VALIDATION_ERROR')
  })

  it('returns EMAIL_IN_USE when Supabase returns user already registered error', async () => {
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: 'User already registered' },
    })
    const fd = new FormData()
    fd.set('email', 'existing@example.com')
    fd.set('password', 'SecurePass123!')
    fd.set('fullName', 'Test User')

    const result = await registerUser(fd)
    expect(result.success).toBe(false)
    expect(!result.success && result.error).toBe('EMAIL_IN_USE')
  })

  it('returns SERVER_ERROR for generic Supabase error', async () => {
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    })
    const fd = new FormData()
    fd.set('email', 'user@example.com')
    fd.set('password', 'SecurePass123!')
    fd.set('fullName', 'Test User')

    const result = await registerUser(fd)
    expect(result.success).toBe(false)
    expect(!result.success && result.error).toBe('SERVER_ERROR')
  })
})

describe('loginUser', () => {
  beforeEach(() => jest.clearAllMocks())

  it('redirects to / on successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
      error: null,
    })
    const fd = new FormData()
    fd.set('email', 'user@example.com')
    fd.set('password', 'SecurePass123!')

    await expect(loginUser(fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  it('returns VALIDATION_ERROR for missing email', async () => {
    const fd = new FormData()
    fd.set('email', '')
    fd.set('password', 'SecurePass123!')

    const result = await loginUser(fd)
    expect(result.success).toBe(false)
    expect(!result.success && result.error).toBe('VALIDATION_ERROR')
  })

  it('returns INVALID_CREDENTIALS when Supabase returns auth error', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    })
    const fd = new FormData()
    fd.set('email', 'user@example.com')
    fd.set('password', 'WrongPassword!')

    const result = await loginUser(fd)
    expect(result.success).toBe(false)
    expect(!result.success && result.error).toBe('INVALID_CREDENTIALS')
  })
})

describe('logoutUser', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls signOut and redirects to /login', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    await expect(logoutUser()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockSignOut).toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})

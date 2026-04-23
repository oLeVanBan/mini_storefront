/**
 * TDD: Tests for lib/actions/admin-users.ts
 * Run: pnpm exec jest __tests__/unit/actions/admin-users.test.ts
 */

const mockListUsers = jest.fn()
const mockGetUserById = jest.fn()
const mockUpdateUserById = jest.fn()
const mockDeleteUser = jest.fn()

const mockAdminAuth = {
  auth: {
    admin: {
      listUsers: mockListUsers,
      getUserById: mockGetUserById,
      updateUserById: mockUpdateUserById,
      deleteUser: mockDeleteUser,
    },
  },
}

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: jest.fn(() => mockAdminAuth),
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: 'mock-admin-session-token' })),
  })),
}))

import { listUsers, getUserById, toggleUserBan } from '@/lib/actions/admin-users'

describe('listUsers', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns paginated user list', async () => {
    mockListUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: 'u1',
            email: 'user1@example.com',
            user_metadata: { full_name: 'User One' },
            created_at: '2024-01-01T00:00:00Z',
            banned_until: null,
            last_sign_in_at: '2024-06-01T00:00:00Z',
          },
        ],
        nextPage: null,
        lastPage: 1,
        total: 1,
      },
      error: null,
    })

    const result = await listUsers(1)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.users).toHaveLength(1)
      expect(result.users[0].email).toBe('user1@example.com')
    }
  })

  it('returns SERVER_ERROR on Supabase error', async () => {
    mockListUsers.mockResolvedValue({
      data: null,
      error: { message: 'Internal server error' },
    })

    const result = await listUsers(1)
    expect(result.success).toBe(false)
    expect('error' in result && result.error).toBe('SERVER_ERROR')
  })
})

describe('getUserById', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns user details', async () => {
    mockGetUserById.mockResolvedValue({
      data: {
        user: {
          id: 'u1',
          email: 'user1@example.com',
          user_metadata: { full_name: 'User One' },
          created_at: '2024-01-01T00:00:00Z',
          banned_until: null,
          last_sign_in_at: null,
        },
      },
      error: null,
    })

    const result = await getUserById('u1')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.user.id).toBe('u1')
    }
  })

  it('returns NOT_FOUND when user does not exist', async () => {
    mockGetUserById.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const result = await getUserById('nonexistent')
    expect(result.success).toBe(false)
    expect('error' in result && result.error).toBe('NOT_FOUND')
  })
})

describe('toggleUserBan', () => {
  beforeEach(() => jest.clearAllMocks())

  it('bans a user (sets banned_until far in future)', async () => {
    mockUpdateUserById.mockResolvedValue({
      data: { user: { id: 'u1', banned_until: '2099-01-01T00:00:00Z' } },
      error: null,
    })

    const result = await toggleUserBan('u1', true)
    expect(result.success).toBe(true)
    expect(mockUpdateUserById).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ ban_duration: expect.any(String) })
    )
  })

  it('unbans a user (sets ban_duration to none)', async () => {
    mockUpdateUserById.mockResolvedValue({
      data: { user: { id: 'u1', banned_until: null } },
      error: null,
    })

    const result = await toggleUserBan('u1', false)
    expect(result.success).toBe(true)
    expect(mockUpdateUserById).toHaveBeenCalledWith(
      'u1',
      { ban_duration: 'none' }
    )
  })

  it('returns SERVER_ERROR on Supabase error', async () => {
    mockUpdateUserById.mockResolvedValue({
      data: null,
      error: { message: 'Update failed' },
    })

    const result = await toggleUserBan('u1', true)
    expect(result.success).toBe(false)
    expect('error' in result && result.error).toBe('SERVER_ERROR')
  })
})

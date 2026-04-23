/**
 * TDD: Tests for lib/utils/admin-session.ts
 * Run: pnpm exec jest __tests__/unit/utils/admin-session.test.ts
 */

const mockSecret = 'test-secret-12345678901234567890123456789012'

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = mockSecret
})

afterEach(() => {
  delete process.env.ADMIN_SESSION_SECRET
})

describe('admin-session utils', () => {
  let signAdminSession: (username: string) => Promise<string>
  let verifyAdminSession: (token: string) => Promise<{ valid: boolean; session?: import('@/lib/types').AdminSession }>
  let createHmacToken: (payload: import('@/lib/types').AdminSession) => Promise<string>

  beforeAll(async () => {
    const mod = await import('@/lib/utils/admin-session')
    signAdminSession = mod.signAdminSession
    verifyAdminSession = mod.verifyAdminSession
    createHmacToken = mod.createHmacToken
  })

  describe('signAdminSession', () => {
    it('returns a non-empty string', async () => {
      const token = await signAdminSession('admin')
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(20)
    })

    it('produces tokens that are valid', async () => {
      const t1 = await signAdminSession('admin')
      await new Promise(r => setTimeout(r, 5))
      const t2 = await signAdminSession('admin')
      expect((await verifyAdminSession(t1)).valid).toBe(true)
      expect((await verifyAdminSession(t2)).valid).toBe(true)
    })
  })

  describe('verifyAdminSession', () => {
    it('returns valid:true and session for a fresh valid token', async () => {
      const token = await signAdminSession('admin')
      const result = await verifyAdminSession(token)
      expect(result.valid).toBe(true)
      expect(result.session?.username).toBe('admin')
      expect(typeof result.session?.expiresAt).toBe('number')
    })

    it('returns valid:false for a tampered payload', async () => {
      const token = await signAdminSession('admin')
      const parts = token.split('.')
      parts[0] = parts[0].slice(0, -2) + 'XX'
      const tampered = parts.join('.')
      const result = await verifyAdminSession(tampered)
      expect(result.valid).toBe(false)
    })

    it('returns valid:false for an expired token', async () => {
      const expiredPayload = { username: 'admin', expiresAt: Date.now() - 1000 }
      const token = await createHmacToken(expiredPayload)
      const result = await verifyAdminSession(token)
      expect(result.valid).toBe(false)
    })

    it('returns valid:false for an empty string', async () => {
      const result = await verifyAdminSession('')
      expect(result.valid).toBe(false)
    })

    it('returns valid:false for a random garbage string', async () => {
      const result = await verifyAdminSession('not-a-real-token')
      expect(result.valid).toBe(false)
    })

    it('returns valid:false when ADMIN_SESSION_SECRET differs (HMAC mismatch)', async () => {
      const token = await signAdminSession('admin')
      process.env.ADMIN_SESSION_SECRET = 'different-secret-9999999999999999999999'
      const result = await verifyAdminSession(token)
      expect(result.valid).toBe(false)
    })
  })
})

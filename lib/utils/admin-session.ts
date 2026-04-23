/**
 * Admin session utils — Edge Runtime compatible (uses Web Crypto API).
 * Works in middleware (Edge) and in Server Actions (Node.js).
 */
import type { AdminSession } from '@/lib/types'

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set')
  return secret
}

// ── Web Crypto helpers ───────────────────────────────────────────────────────

async function importKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

async function hmacSign(payload: string, secret: string): Promise<string> {
  const key = await importKey(secret)
  const enc = new TextEncoder()
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  // Convert ArrayBuffer → hex string
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacVerify(payload: string, sigHex: string, secret: string): Promise<boolean> {
  try {
    const key = await importKey(secret)
    const enc = new TextEncoder()
    // Convert hex → Uint8Array
    const sigBytes = new Uint8Array(sigHex.match(/.{2}/g)!.map(b => parseInt(b, 16)))
    return crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payload))
  } catch {
    return false
  }
}

// ── base64url helpers (no Buffer — Edge compatible) ──────────────────────────

function base64urlEncode(str: string): string {
  const enc = new TextEncoder()
  const bytes = enc.encode(str)
  let binary = ''
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(encoded: string): string {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    encoded.length + ((4 - (encoded.length % 4)) % 4),
    '=',
  )
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Encode a JSON payload + HMAC signature into a URL-safe token.
 * Format: base64url(JSON) + '.' + hmac-hex
 */
export async function createHmacToken(payload: AdminSession): Promise<string> {
  const secret = getSecret()
  const encoded = base64urlEncode(JSON.stringify(payload))
  const sig = await hmacSign(encoded, secret)
  return `${encoded}.${sig}`
}

/**
 * Sign a new session for the given admin username.
 * Returns the token string to store in the cookie.
 */
export async function signAdminSession(username: string): Promise<string> {
  const session: AdminSession = {
    username,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  }
  return createHmacToken(session)
}

/**
 * Verify a token string.
 * Returns { valid: true, session } on success, { valid: false } on any failure.
 */
export async function verifyAdminSession(
  token: string,
): Promise<{ valid: true; session: AdminSession } | { valid: false; session?: never }> {
  if (!token) return { valid: false }

  try {
    const secret = getSecret()
    const dotIndex = token.lastIndexOf('.')
    if (dotIndex === -1) return { valid: false }

    const encoded = token.slice(0, dotIndex)
    const sig = token.slice(dotIndex + 1)

    const valid = await hmacVerify(encoded, sig, secret)
    if (!valid) return { valid: false }

    const session = JSON.parse(base64urlDecode(encoded)) as AdminSession

    if (typeof session.expiresAt !== 'number' || Date.now() > session.expiresAt) {
      return { valid: false }
    }

    return { valid: true, session }
  } catch {
    return { valid: false }
  }
}

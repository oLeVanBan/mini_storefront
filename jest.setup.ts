import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { webcrypto } from 'crypto'

// Polyfill Web Crypto globals for jsdom environment (Edge Runtime APIs used in tests)
// jsdom's crypto lacks `subtle`, so we replace it via defineProperty (direct assignment is blocked)
if (!globalThis.TextEncoder) {
  // @ts-ignore
  globalThis.TextEncoder = TextEncoder
}
if (!globalThis.TextDecoder) {
  // @ts-expect-error — Node.js util vs DOM type mismatch
  globalThis.TextDecoder = TextDecoder
}
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
    configurable: true,
  })
}

import { formatVND, formatDate } from '@/lib/utils/format'

describe('formatVND', () => {
  it('formats zero correctly', () => {
    expect(formatVND(0)).toBe('0 ₫')
  })

  it('formats whole thousands with dot separator', () => {
    expect(formatVND(150000)).toBe('150.000 ₫')
  })

  it('formats large amounts', () => {
    expect(formatVND(1500000)).toBe('1.500.000 ₫')
  })

  it('formats amounts under 1000', () => {
    expect(formatVND(999)).toBe('999 ₫')
  })

  it('formats exactly 1000', () => {
    expect(formatVND(1000)).toBe('1.000 ₫')
  })

  it('formats amount with multiple millions', () => {
    expect(formatVND(12345678)).toBe('12.345.678 ₫')
  })
})

describe('formatDate', () => {
  it('formats ISO date string to dd/mm/yyyy', () => {
    expect(formatDate('2026-04-23T10:00:00Z')).toMatch(/23\/04\/2026/)
  })

  it('formats another date correctly', () => {
    expect(formatDate('2026-01-01T00:00:00Z')).toMatch(/01\/01\/2026/)
  })
})

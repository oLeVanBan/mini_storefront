/**
 * Format a VND amount to display string.
 * Example: 150000 → "150.000 ₫"
 */
export function formatVND(amount: number): string {
  return (
    amount
      .toLocaleString('vi-VN', { maximumFractionDigits: 0 })
      .replace(/\./g, '.') + ' ₫'
  )
}

/**
 * Format an ISO date string to dd/MM/yyyy.
 * Example: "2026-04-23T10:00:00Z" → "23/04/2026"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
}

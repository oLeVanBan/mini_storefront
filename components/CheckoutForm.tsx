'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import PaymentMethodSelector, { type CardInfo } from '@/components/PaymentMethodSelector'
import { submitOrder, type SubmitOrderResult } from '@/lib/actions/checkout'
import { formatVND } from '@/lib/utils/format'
import type { CartItem } from '@/lib/types'

interface Props {
  items: CartItem[]
  total: number
}

export default function CheckoutForm({ items, total }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD')
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    cardholderName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  // Client-side validation before submit
  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (paymentMethod === 'CARD') {
      if (cardInfo.cardNumber.length !== 16) errs.cardNumber = 'Số thẻ phải đúng 16 chữ số'
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardInfo.cardExpiry)) errs.cardExpiry = 'Ngày hết hạn không hợp lệ (MM/YY)'
      if (cardInfo.cardCvv.length !== 3) errs.cardCvv = 'CVV phải đúng 3 chữ số'
      if (!cardInfo.cardholderName.trim()) errs.cardholderName = 'Vui lòng nhập tên chủ thẻ'
    }
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    if (!validate()) return

    const formData = new FormData(e.currentTarget)
    // Inject card info (not from hidden inputs to avoid PAN in DOM)
    if (paymentMethod === 'CARD') {
      formData.set('cardholderName', cardInfo.cardholderName)
      formData.set('cardNumber', cardInfo.cardNumber)
      formData.set('cardExpiry', cardInfo.cardExpiry)
      formData.set('cardCvv', cardInfo.cardCvv)
    }

    startTransition(async () => {
      let result: SubmitOrderResult
      try {
        result = await submitOrder(formData)
      } catch (err: unknown) {
        // redirect() throws — not a real error
        if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err
        setServerError('Có lỗi xảy ra. Vui lòng thử lại.')
        return
      }

      if (!result.success) {
        if (result.error === 'VALIDATION_ERROR' && 'fields' in result) {
          setFieldErrors(result.fields as Record<string, string>)
        } else if (result.error === 'OUT_OF_STOCK' && 'productName' in result) {
          setServerError(`Sản phẩm "${result.productName}" đã hết hàng.`)
        } else if (result.error === 'EMPTY_CART') {
          router.push('/cart')
        } else {
          setServerError('Có lỗi xảy ra. Vui lòng thử lại.')
        }
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Order summary */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Tóm tắt đơn hàng</h2>
        <ul className="divide-y divide-gray-200">
          {items.map(item => (
            <li key={item.productId} className="py-3 flex justify-between text-sm">
              <span className="text-gray-700">
                {item.name} <span className="text-gray-400">× {item.quantity}</span>
              </span>
              <span className="font-medium text-gray-900">{formatVND(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t pt-3 flex justify-between font-semibold text-base">
          <span>Tổng cộng</span>
          <span className="text-indigo-600">{formatVND(total)}</span>
        </div>
      </div>

      {/* Checkout form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="text-lg font-semibold text-gray-800">Thông tin đặt hàng</h2>

        {serverError && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {serverError}
          </div>
        )}

        {/* Customer info */}
        <div className="space-y-4">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span aria-hidden="true">*</span>
            </label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              required
              autoComplete="name"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-describedby={fieldErrors.customerName ? 'customerName-error' : undefined}
            />
            {fieldErrors.customerName && (
              <p id="customerName-error" className="text-red-500 text-xs mt-1">{fieldErrors.customerName}</p>
            )}
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              required
              autoComplete="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-describedby={fieldErrors.customerEmail ? 'customerEmail-error' : undefined}
            />
            {fieldErrors.customerEmail && (
              <p id="customerEmail-error" className="text-red-500 text-xs mt-1">{fieldErrors.customerEmail}</p>
            )}
          </div>

          <div>
            <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ giao hàng <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="deliveryAddress"
              name="deliveryAddress"
              required
              rows={3}
              autoComplete="street-address"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-describedby={fieldErrors.deliveryAddress ? 'deliveryAddress-error' : undefined}
            />
            {fieldErrors.deliveryAddress && (
              <p id="deliveryAddress-error" className="text-red-500 text-xs mt-1">{fieldErrors.deliveryAddress}</p>
            )}
          </div>
        </div>

        {/* Hidden payment method field */}
        <input type="hidden" name="paymentMethod" value={paymentMethod} />

        {/* Payment selector */}
        <PaymentMethodSelector
          value={paymentMethod}
          onChange={setPaymentMethod}
          cardInfo={cardInfo}
          onCardInfoChange={setCardInfo}
          errors={fieldErrors}
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Đặt hàng'
          )}
        </button>
      </form>
    </div>
  )
}

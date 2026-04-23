'use client'

import { useState } from 'react'

export interface CardInfo {
  cardholderName: string
  cardNumber: string    // 16 digits, client only
  cardExpiry: string    // MM/YY
  cardCvv: string       // 3 digits, client only
}

interface Props {
  value: 'COD' | 'CARD'
  onChange: (method: 'COD' | 'CARD') => void
  cardInfo: CardInfo
  onCardInfoChange: (info: CardInfo) => void
  errors?: Partial<Record<keyof CardInfo, string>>
}

export default function PaymentMethodSelector({
  value,
  onChange,
  cardInfo,
  onCardInfoChange,
  errors = {},
}: Props) {
  const [showCvv, setShowCvv] = useState(false)

  const handleCardField = (field: keyof CardInfo, raw: string) => {
    let v = raw
    if (field === 'cardNumber') {
      v = raw.replace(/\D/g, '').slice(0, 16)
    } else if (field === 'cardExpiry') {
      v = raw.replace(/\D/g, '').slice(0, 4)
      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
    } else if (field === 'cardCvv') {
      v = raw.replace(/\D/g, '').slice(0, 3)
    }
    onCardInfoChange({ ...cardInfo, [field]: v })
  }

  return (
    <div className="space-y-3">
      <p className="font-medium text-gray-700">Phương thức thanh toán</p>

      {/* COD */}
      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="radio"
          name="paymentMethod"
          value="COD"
          checked={value === 'COD'}
          onChange={() => onChange('COD')}
          className="accent-indigo-600"
          aria-label="Thanh toán khi nhận hàng"
        />
        <span className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</span>
      </label>

      {/* CARD */}
      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="radio"
          name="paymentMethod"
          value="CARD"
          checked={value === 'CARD'}
          onChange={() => onChange('CARD')}
          className="accent-indigo-600"
          aria-label="Thẻ Visa/Mastercard"
        />
        <span className="text-sm font-medium">Thẻ Visa/Mastercard</span>
      </label>

      {/* Card details */}
      {value === 'CARD' && (
        <div className="border rounded-lg p-4 space-y-3 bg-gray-50" role="group" aria-label="Thông tin thẻ">
          {/* Cardholder name */}
          <div>
            <label htmlFor="cardholderName" className="block text-xs font-medium text-gray-600 mb-1">
              Tên chủ thẻ <span aria-hidden="true">*</span>
            </label>
            <input
              id="cardholderName"
              type="text"
              placeholder="NGUYEN VAN A"
              value={cardInfo.cardholderName}
              onChange={e => handleCardField('cardholderName', e.target.value.toUpperCase())}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoComplete="cc-name"
              aria-describedby={errors.cardholderName ? 'cardholderName-error' : undefined}
            />
            {errors.cardholderName && (
              <p id="cardholderName-error" className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>
            )}
          </div>

          {/* Card number */}
          <div>
            <label htmlFor="cardNumber" className="block text-xs font-medium text-gray-600 mb-1">
              Số thẻ <span aria-hidden="true">*</span>
            </label>
            <input
              id="cardNumber"
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={cardInfo.cardNumber.replace(/(.{4})/g, '$1 ').trim()}
              onChange={e => handleCardField('cardNumber', e.target.value.replace(/\s/g, ''))}
              maxLength={19}
              className="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoComplete="cc-number"
              aria-describedby={errors.cardNumber ? 'cardNumber-error' : undefined}
            />
            {errors.cardNumber && (
              <p id="cardNumber-error" className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
            )}
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cardExpiry" className="block text-xs font-medium text-gray-600 mb-1">
                Ngày hết hạn <span aria-hidden="true">*</span>
              </label>
              <input
                id="cardExpiry"
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={cardInfo.cardExpiry}
                onChange={e => handleCardField('cardExpiry', e.target.value)}
                maxLength={5}
                className="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                autoComplete="cc-exp"
                aria-describedby={errors.cardExpiry ? 'cardExpiry-error' : undefined}
              />
              {errors.cardExpiry && (
                <p id="cardExpiry-error" className="text-red-500 text-xs mt-1">{errors.cardExpiry}</p>
              )}
            </div>
            <div>
              <label htmlFor="cardCvv" className="block text-xs font-medium text-gray-600 mb-1">
                CVV <span aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="cardCvv"
                  type={showCvv ? 'text' : 'password'}
                  inputMode="numeric"
                  placeholder="123"
                  value={cardInfo.cardCvv}
                  onChange={e => handleCardField('cardCvv', e.target.value)}
                  maxLength={3}
                  className="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  autoComplete="cc-csc"
                  aria-describedby={errors.cardCvv ? 'cardCvv-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowCvv(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                  aria-label={showCvv ? 'Ẩn CVV' : 'Hiện CVV'}
                >
                  {showCvv ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              {errors.cardCvv && (
                <p id="cardCvv-error" className="text-red-500 text-xs mt-1">{errors.cardCvv}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

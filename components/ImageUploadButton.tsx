'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { uploadProductImage } from '@/lib/actions/admin'

interface Props {
  productId: string
  currentImageUrl: string | null
}

const ERROR_MESSAGES: Record<string, string> = {
  NO_FILE: 'Vui lòng chọn file.',
  INVALID_TYPE: 'Chỉ chấp nhận JPEG, PNG hoặc WebP.',
  FILE_TOO_LARGE: 'File không được vượt quá 5MB.',
  UPLOAD_FAILED: 'Upload thất bại. Vui lòng thử lại.',
  SERVER_ERROR: 'Lỗi server. Vui lòng thử lại.',
  UNAUTHORIZED: 'Không có quyền truy cập.',
}

export default function ImageUploadButton({ productId, currentImageUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentImageUrl)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation first
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError(ERROR_MESSAGES.INVALID_TYPE)
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(ERROR_MESSAGES.FILE_TOO_LARGE)
      e.target.value = ''
      return
    }

    setError(null)
    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Upload
    const formData = new FormData()
    formData.append('file', file)
    startTransition(async () => {
      const result = await uploadProductImage(productId, formData)
      if (!result.success) {
        setError(ERROR_MESSAGES[result.error ?? ''] ?? 'Đã có lỗi xảy ra.')
        setPreview(currentImageUrl) // revert preview on error
      }
    })
  }

  return (
    <div className="space-y-3">
      {/* Current / preview image */}
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        {preview ? (
          <Image
            src={preview}
            alt="Ảnh sản phẩm"
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 50vw"
            unoptimized={preview.startsWith('blob:')}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Chưa có ảnh</span>
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm text-gray-600 font-medium">Đang upload...</span>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isPending}
      />

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg
          hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50
          disabled:cursor-not-allowed"
      >
        {isPending ? 'Đang upload...' : preview ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
      </button>

      <p className="text-xs text-gray-400">JPEG, PNG, WebP · Tối đa 5MB</p>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

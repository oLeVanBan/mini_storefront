'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleUserBan } from '@/lib/actions/admin-users'

interface Props {
  userId: string
  isBanned: boolean
}

export default function BanToggleButton({ userId, isBanned }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      await toggleUserBan(userId, !isBanned)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${
        isBanned
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-red-600 hover:bg-red-700 text-white'
      }`}
    >
      {isPending ? 'Đang xử lý...' : isBanned ? 'Mở khoá tài khoản' : 'Khoá tài khoản'}
    </button>
  )
}

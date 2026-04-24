'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  message: string
  /** ms before auto-dismiss; default 4000 */
  duration?: number
}

export default function SaveSuccessBanner({ message, duration = 4000 }: Props) {
  const router = useRouter()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Scroll to top so banner is visible
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Auto-dismiss: fade out then clean URL
    const fadeTimer = setTimeout(() => setVisible(false), duration)
    const cleanTimer = setTimeout(() => {
      // Remove ?saved=1 from URL without re-fetching the page
      const url = new URL(window.location.href)
      url.searchParams.delete('saved')
      router.replace(url.pathname + (url.search || ''), { scroll: false })
    }, duration + 300)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(cleanTimer)
    }
  }, [duration, router])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200
        rounded-xl text-green-800 text-sm font-medium transition-opacity duration-300
        ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Check icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-green-600 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  )
}

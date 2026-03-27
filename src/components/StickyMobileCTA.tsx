'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const DISMISSED_KEY = 'sticky_mobile_cta_dismissed'

export default function StickyMobileCTA() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const isExcludedPath = useMemo(() => {
    return pathname.startsWith('/pricing') || pathname.startsWith('/saju/free') || pathname.startsWith('/admin')
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsDismissed(sessionStorage.getItem(DISMISSED_KEY) === '1')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || isDismissed || isExcludedPath) {
      setIsVisible(false)
      return
    }

    const onScroll = () => {
      setIsVisible(window.scrollY >= 300)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [isDismissed, isExcludedPath])

  if (isExcludedPath || isDismissed) {
    return null
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 md:hidden transition-all duration-300 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <div className="mx-0 h-16 border-t border-slate-800 bg-slate-900/95 px-3 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-5xl items-center gap-2">
          <Link
            href="/#saju-form-card"
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-bold text-slate-950 transition hover:bg-amber-400"
          >
            무료 사주 분석 받기 →
          </Link>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem(DISMISSED_KEY, '1')
              setIsDismissed(true)
              setIsVisible(false)
            }}
            aria-label="닫기"
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
          >
            <span aria-hidden>×</span>
          </button>
        </div>
        <p className="-mt-1 text-center text-[11px] text-slate-400">AI가 30초만에 분석해드려요</p>
      </div>
    </div>
  )
}

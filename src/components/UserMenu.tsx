'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface CreditInfo {
  authenticated: boolean
  plan: string
  remaining: number
  total: number
}

export default function UserMenu() {
  const { data: session, status } = useSession()
  const [credits, setCredits] = useState<CreditInfo | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchCredits()
  }, [session])

  async function fetchCredits() {
    try {
      const res = await fetch('/api/credits')
      if (res.ok) {
        const data = await res.json()
        setCredits(data)
      }
    } catch { /* ignore */ }
  }

  if (status === 'loading') {
    return (
      <div className="h-9 w-20 rounded-full animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
    )
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="px-4 py-2 rounded-full text-xs font-medium hover-scale theme-transition"
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-text)',
        }}
      >
        로그인
      </button>
    )
  }

  const planLabel = credits?.plan === 'free' ? '' :
    credits?.plan === 'starter' ? '스타터' :
    credits?.plan === 'pro' ? '프로' :
    credits?.plan === 'unlimited' ? '언리미티드' : ''

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium hover-scale theme-transition"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Credit badge */}
        {credits && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              background: credits.remaining > 10 ? 'rgba(74,222,128,0.15)' : credits.remaining > 0 ? 'rgba(250,204,21,0.15)' : 'rgba(248,113,113,0.15)',
              color: credits.remaining > 10 ? '#4ade80' : credits.remaining > 0 ? '#facc15' : '#f87171',
            }}
          >
            {credits.remaining}회
          </span>
        )}
        <span style={{ color: 'var(--text-primary)' }}>
          {session.user?.name?.slice(0, 6) || '사용자'}
        </span>
        {session.user?.image && (
          <img
            src={session.user.image}
            alt=""
            className="w-6 h-6 rounded-full"
            referrerPolicy="no-referrer"
          />
        )}
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg z-50 py-2 theme-transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            {/* User info */}
            <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {session.user?.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {session.user?.email}
              </p>
            </div>

            {/* Credits */}
            {credits && (
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>크레딧</span>
                  {planLabel && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--text-accent)' }}
                    >
                      {planLabel}
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--text-accent)' }}>
                  {credits.remaining}회 <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>남음</span>
                </p>
                {/* Mini progress bar */}
                <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${credits.total > 0 ? (credits.remaining / credits.total) * 100 : 0}%`,
                      background: 'var(--accent)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <a
              href="/pricing"
              className="block px-4 py-2.5 text-sm hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-accent)' }}
              onClick={() => setMenuOpen(false)}
            >
              ✨ 크레딧 충전하기
            </a>
            <button
              onClick={() => { signOut(); setMenuOpen(false) }}
              className="block w-full text-left px-4 py-2.5 text-sm hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  )
}

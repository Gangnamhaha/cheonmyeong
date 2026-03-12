'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { shareReferralInvite } from '@/lib/kakao'

interface CreditInfo {
  authenticated: boolean
  guest?: boolean
  guestEmail?: string
  plan: string
  remaining: number
  total: number
}

interface ReferralInfo {
  code: string
  totalReferrals: number
  creditsEarned: number
}

export default function UserMenu() {
  const { data: session, status } = useSession()
  const [credits, setCredits] = useState<CreditInfo | null>(null)
  const [referral, setReferral] = useState<ReferralInfo | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchCredits()
    if (session?.user) {
      fetchReferral()
    } else {
      setReferral(null)
    }
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

  async function fetchReferral() {
    try {
      const res = await fetch('/api/referral')
      if (!res.ok) return
      const data = await res.json()
      setReferral(data)
    } catch {
      // ignore
    }
  }

  async function copyReferralLink() {
    if (!referral?.code) return
    const link = `https://sajuhae.vercel.app/signup?ref=${referral.code}`
    try {
      await navigator.clipboard.writeText(link)
      alert('초대 링크가 복사되었습니다!')
    } catch {
      alert('초대 링크 복사에 실패했습니다.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="h-9 w-20 rounded-full animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
    )
  }

  // 비회원 로그인 상태
  if (!session && credits?.guest && credits.guestEmail) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium hover-scale theme-transition"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
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
          <span style={{ color: 'var(--text-secondary)' }}>
            {credits.guestEmail.length > 15 ? credits.guestEmail.slice(0, 15) + '…' : credits.guestEmail}
          </span>
          <span
            className="px-1.5 py-0.5 rounded text-[9px]"
            style={{ background: 'rgba(156,163,175,0.15)', color: 'var(--text-muted)' }}
          >
            비회원
          </span>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg z-50 py-2 theme-transition"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  비회원
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {credits.guestEmail}
                </p>
              </div>

              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>크레딧</span>
                <p className="text-lg font-bold" style={{ color: 'var(--text-accent)' }}>
                  {credits.remaining}회 <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>남음</span>
                </p>
              </div>

              <a
                href="/pricing"
                className="block px-4 py-2.5 text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-accent)' }}
                onClick={() => setMenuOpen(false)}
              >
                ✨ 크레딧 충전하기
              </a>
              <a
                href="/login"
                className="block px-4 py-2.5 text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMenuOpen(false)}
              >
                회원 로그인
              </a>
              <button
                onClick={() => {
                  fetch('/api/auth/guest', { method: 'DELETE' }).finally(() => {
                    window.location.reload()
                  })
                  setMenuOpen(false)
                }}
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

            {referral && (
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>친구 초대</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>내 코드</span>
                  <span className="text-sm font-bold tracking-wider" style={{ color: 'var(--text-accent)' }}>{referral.code}</span>
                </div>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
                  초대한 친구: {referral.totalReferrals}명 | 보너스 크레딧: {referral.creditsEarned}
                </p>
                <div className="space-y-1.5">
                  <button
                    onClick={copyReferralLink}
                    className="w-full rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  >
                    초대 링크 복사
                  </button>
                  <button
                    onClick={() => shareReferralInvite(referral.code)}
                    className="w-full rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
                    style={{ background: '#FEE500', color: '#000000' }}
                  >
                    카카오톡으로 초대
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <a
              href="/history"
              className="block px-4 py-2.5 text-sm hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMenuOpen(false)}
            >
              📋 내 히스토리
            </a>
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

'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { SITE_URL } from '@/lib/constants'

export default function ReferralBanner() {
  const { data: session } = useSession()
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch('/api/referral')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.code) setCode(data.code) })
      .catch(() => {})
  }, [session])

  if (!session || !code) return null

  const link = `${SITE_URL}/signup?ref=${code}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div
      className="rounded-2xl p-5 theme-transition"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🎁</span>
        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          친구 초대하고 이용권 받기
        </h3>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
        친구가 가입하면 나에게 <span style={{ color: 'var(--text-accent)' }}>5회</span>,
        친구에게 <span style={{ color: 'var(--text-accent)' }}>3회</span> AI 해석 이용권이 지급됩니다.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold hover-scale transition-all"
          style={{
            background: copied ? 'var(--bg-secondary)' : 'var(--accent)',
            color: copied ? 'var(--text-accent)' : 'var(--accent-text)',
          }}
        >
          {copied ? '복사 완료!' : '초대 링크 복사'}
        </button>
      </div>
      <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
        월 최대 10명까지 초대 가능
      </p>
    </div>
  )
}

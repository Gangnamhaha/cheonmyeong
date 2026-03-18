'use client'

import { useState } from 'react'

interface ErrorRetryProps {
  error: string
  onRetry: () => void
}

export default function ErrorRetry({ error, onRetry }: ErrorRetryProps) {
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    setRetrying(true)
    onRetry()
    setTimeout(() => setRetrying(false), 2000)
  }

  return (
    <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <span className="text-3xl mb-3 block">⚠️</span>
      <p className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>분석 중 오류가 발생했습니다</p>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{error}</p>
      <button
        onClick={handleRetry}
        disabled={retrying}
        className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
      >
        {retrying ? '재시도 중...' : '🔄 다시 시도하기'}
      </button>
    </div>
  )
}

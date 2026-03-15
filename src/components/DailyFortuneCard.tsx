'use client'

import { useState, useEffect } from 'react'

interface DailyFortuneCardProps {
  stem: string
  branch: string
}

export default function DailyFortuneCard({ stem, branch }: DailyFortuneCardProps) {
  const [fortune, setFortune] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [date, setDate] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchFortune() {
      try {
        const res = await fetch(
          `/api/daily-fortune?stem=${encodeURIComponent(stem)}&branch=${encodeURIComponent(branch)}`,
        )
        if (cancelled) return
        if (!res.ok) { setError(true); return }
        const data = await res.json()
        if (cancelled) return
        setFortune(data.content)
        setDate(data.date)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchFortune()
    return () => { cancelled = true }
  }, [stem, branch])

  if (error || (!loading && !fortune)) return null

  return (
    <div
      className="glass-card rounded-2xl p-5 theme-transition"
      style={{ borderTop: '2px solid var(--accent)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{'🌅'}</span>
        <h3 className="font-bold text-sm" style={{ color: 'var(--text-accent)' }}>
          {'오늘의 운세'}
        </h3>
        {date && (
          <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
            {date}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2.5">
          <div
            className="h-3 rounded-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-card-hover) 50%, var(--bg-secondary) 75%)',
              backgroundSize: '200% 100%',
              width: '90%',
            }}
          />
          <div
            className="h-3 rounded-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-card-hover) 50%, var(--bg-secondary) 75%)',
              backgroundSize: '200% 100%',
              width: '70%',
              animationDelay: '0.15s',
            }}
          />
          <div
            className="h-3 rounded-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-card-hover) 50%, var(--bg-secondary) 75%)',
              backgroundSize: '200% 100%',
              width: '80%',
              animationDelay: '0.3s',
            }}
          />
        </div>
      ) : (
        <p
          className="text-sm leading-relaxed whitespace-pre-line"
          style={{ color: 'var(--text-secondary)' }}
        >
          {fortune}
        </p>
      )}
    </div>
  )
}

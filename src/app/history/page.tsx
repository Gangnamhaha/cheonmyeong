'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'

interface SajuResult {
  id: string
  form_data: {
    name: string
    year: number
    month: number
    day: number
    hour: number
    minute: number
    gender: string
    calendarType: string
  }
  created_at: string
  view_count: number
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--bg-primary)' }} />}>
      <HistoryContent />
    </Suspense>
  )
}

function HistoryContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, toggleTheme, cycleFontSize, fontSizeLabel } = useTheme()
  const [results, setResults] = useState<SajuResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch history
  useEffect(() => {
    if (status !== 'authenticated') return

    async function fetchHistory() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/history')

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('결과를 불러올 수 없습니다.')
        }

        const data = await res.json()
        setResults(data.results || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen px-4 py-12" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-lg mx-auto">
          <div className="h-8 w-32 rounded-lg animate-pulse mb-8" style={{ background: 'var(--bg-card)' }} />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <a href="/" className="text-sm hover-scale" style={{ color: 'var(--text-muted)' }}>← 홈</a>
          <div className="flex items-center gap-2">
            <button
              onClick={cycleFontSize}
              className="p-2 rounded-full hover-scale theme-transition text-xs font-bold"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              aria-label="글씨 크기 조절"
              title="글씨 크기 조절"
            >
              {fontSizeLabel}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover-scale theme-transition"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              aria-label="테마 전환">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-serif-kr text-3xl font-bold mb-2" style={{ color: 'var(--text-accent)' }}>
            내 분석 히스토리
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            지금까지 분석한 사주 결과를 확인하세요
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div
            className="rounded-2xl p-4 mb-6 theme-transition"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}
          >
            <p className="text-sm" style={{ color: '#f87171' }}>
              {error}
            </p>
          </div>
        )}

        {/* Empty state */}
        {results.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              아직 분석 결과가 없습니다
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              사주 분석을 시작해 보세요
            </p>
            <Link
              href="/#saju-form-card"
              className="inline-block px-6 py-3 rounded-xl text-sm font-bold hover-scale transition-all"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              무료 분석 시작하기
            </Link>
          </div>
        )}

        {/* Results list */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map(result => {
              const birthDate = `${result.form_data.year}.${String(result.form_data.month).padStart(2, '0')}.${String(result.form_data.day).padStart(2, '0')}`
              const analysisDate = new Date(result.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }).replace(/\./g, '.').replace(/\s/g, '')

              return (
                <Link
                  key={result.id}
                  href={`/result/${result.id}`}
                  className="block rounded-2xl p-5 theme-transition hover-scale"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {result.form_data.name}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        생년월일: {birthDate}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                      조회 {result.view_count}회
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      분석일: {analysisDate}
                    </p>
                    <span style={{ color: 'var(--text-accent)' }}>상세보기 →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Results count */}
        {results.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              총 {results.length}개의 분석 결과
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

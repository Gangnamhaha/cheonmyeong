'use client'

import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PLANS, type PlanKey } from '@/lib/credits'
import { useTheme } from '@/components/ThemeProvider'

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--bg-primary)' }} />}>
      <PricingContent />
    </Suspense>
  )
}

function PricingContent() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const searchParams = useSearchParams()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [credits, setCredits] = useState<{ remaining: number; plan: string } | null>(null)

  const success = searchParams.get('success')
  const cancelled = searchParams.get('cancelled')
  const planParam = searchParams.get('plan')

  useEffect(() => {
    if (success && planParam) {
      const plan = PLANS[planParam as PlanKey]
      if (plan) {
        setToast(`${plan.name} 크레딧 ${plan.credits}회가 충전되었습니다! 🎉`)
        setTimeout(() => setToast(null), 5000)
      }
    }
    if (cancelled) {
      setToast('결제가 취소되었습니다.')
      setTimeout(() => setToast(null), 3000)
    }
  }, [success, cancelled, planParam])

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

  async function handlePurchase(planKey: PlanKey) {
    if (!session) {
      window.location.href = '/login'
      return
    }

    setLoadingPlan(planKey)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setToast(data.error || '결제 오류가 발생했습니다.')
        setTimeout(() => setToast(null), 3000)
      }
    } catch {
      setToast('네트워크 오류가 발생했습니다.')
      setTimeout(() => setToast(null), 3000)
    } finally {
      setLoadingPlan(null)
    }
  }

  const paidPlans: PlanKey[] = ['starter', 'pro', 'unlimited']

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <a href="/" className="text-sm hover-scale" style={{ color: 'var(--text-muted)' }}>← 홈</a>
          <button onClick={toggleTheme} className="p-2 rounded-full hover-scale theme-transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            aria-label="테마 전환">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-serif-kr text-3xl font-bold mb-2" style={{ color: 'var(--text-accent)' }}>
            요금제
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            AI 사주 해석 크레딧을 충전하세요
          </p>

          {credits && credits.remaining > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>현재 크레딧</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-accent)' }}>
                {credits.remaining}회
              </span>
            </div>
          )}
        </div>

        {/* Free tier */}
        <div
          className="rounded-2xl p-5 mb-4 theme-transition"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>무료</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>로그인 없이 사용</p>
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--text-accent)' }}>₩0</span>
          </div>
          <ul className="space-y-1.5">
            {PLANS.free.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-accent)' }}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Paid plans */}
        <div className="space-y-4">
          {paidPlans.map(key => {
            const plan = PLANS[key]
            const isPopular = plan.popular
            const isCurrent = credits?.plan === key

            return (
              <div
                key={key}
                className="rounded-2xl p-5 theme-transition relative overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  border: isPopular ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                  boxShadow: isPopular ? '0 4px 24px rgba(245,158,11,0.15)' : undefined,
                }}
              >
                {isPopular && (
                  <div
                    className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-lg"
                    style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                  >
                    인기
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>크레딧 {plan.credits}회</p>
                  </div>
                  <span className="text-xl font-bold" style={{ color: 'var(--text-accent)' }}>
                    {plan.priceLabel}
                  </span>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--text-accent)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(key)}
                  disabled={loadingPlan === key}
                  className="w-full py-3 rounded-xl text-sm font-bold hover-scale transition-all disabled:cursor-not-allowed"
                  style={{
                    background: isCurrent ? 'var(--bg-secondary)' : isPopular ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: isCurrent ? 'var(--text-muted)' : isPopular ? 'var(--accent-text)' : 'var(--text-primary)',
                    border: isPopular ? 'none' : '1px solid var(--border-color)',
                  }}
                >
                  {loadingPlan === key ? '처리 중...' : isCurrent ? '현재 플랜' :
                    !session ? '로그인 후 구매' : '크레딧 충전'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Note */}
        <div className="mt-8 text-center">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            크레딧은 만료되지 않으며, AI 해석 1회당 1크레딧이 차감됩니다.<br />
            결제는 Stripe를 통해 안전하게 처리됩니다.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-medium shadow-lg animate-fadeIn z-50"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { PLANS, type PlanKey, type SubscriptionPlanKey, type OnetimePlanKey } from '@/lib/credits'
import { useTheme } from '@/components/ThemeProvider'
import type { UserSubscription } from '@/lib/subscription'

// PortOne V2 Browser SDK (loaded via CDN)
declare global {
  interface Window {
    PortOne?: {
      requestPayment: (params: {
        storeId: string
        channelKey: string
        paymentId: string
        orderName: string
        totalAmount: number
        currency: string
        payMethod: string
        redirectUrl?: string
        customer?: {
          email?: string
          fullName?: string
        }
        customData?: string
      }) => Promise<{
        code?: string
        message?: string
        paymentId?: string
        transactionType?: string
      }>
    }
  }
}

type PlanMode = 'onetime' | 'subscription'

const ONETIME_PLANS: OnetimePlanKey[] = ['starter', 'pro', 'unlimited']
const SUBSCRIPTION_PLANS: SubscriptionPlanKey[] = ['sub_basic', 'sub_pro', 'sub_premium']

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--bg-primary)' }} />}>
      <PricingContent />
    </Suspense>
  )
}

function PricingContent() {
  const { data: session } = useSession()
  const { theme, toggleTheme, cycleFontSize, fontSizeLabel } = useTheme()
  const searchParams = useSearchParams()

  const [planMode, setPlanMode] = useState<PlanMode>('subscription')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [credits, setCredits] = useState<{ remaining: number; plan: string } | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [cancelingSubscription, setCancelingSubscription] = useState(false)
  const [guestEmail, setGuestEmail] = useState('')

  const success = searchParams.get('success')
  const cancelled = searchParams.get('cancelled')
  const planParam = searchParams.get('plan')
  const portonePaymentId = searchParams.get('paymentId')

  const showToast = useCallback((msg: string, duration = 3000) => {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }, [])

  // Load PortOne V2 SDK
  useEffect(() => {
    if (document.querySelector('script[src*="portone"]')) return
    const script = document.createElement('script')
    script.src = 'https://cdn.portone.io/v2/browser-sdk.js'
    script.async = true
    document.head.appendChild(script)
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [])

  // Handle URL params (Stripe success/cancelled)
  useEffect(() => {
    if (success && planParam) {
      const plan = PLANS[planParam as PlanKey]
      if (plan) showToast(`${plan.name} 크레딧 ${plan.credits}회가 충전되었습니다! 🎉`, 5000)
    }
    if (cancelled) showToast('결제가 취소되었습니다.')
  }, [success, cancelled, planParam, showToast])

  // Handle PortOne V2 mobile redirect (paymentId in query)
  useEffect(() => {
    if (portonePaymentId) {
      verifyPayment(portonePaymentId)
    }
  }, [portonePaymentId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch credits and subscription
  useEffect(() => {
    fetchCredits()
    if (session) fetchSubscription()
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchCredits() {
    try {
      const res = await fetch('/api/credits')
      if (res.ok) setCredits(await res.json())
    } catch { /* ignore */ }
  }

  async function fetchSubscription() {
    try {
      const res = await fetch('/api/subscription')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription ?? null)
      }
    } catch { /* ignore */ }
  }

  // Verify payment (called after V2 SDK success or mobile redirect)
  async function verifyPayment(paymentId: string, isGuest = false) {
    try {
      const verifyRes = await fetch('/api/portone/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, isGuest }),
      })
      if (verifyRes.ok) {
        showToast('결제가 완료되었습니다! 🎉', 5000)
        fetchCredits()
        fetchSubscription()
        window.history.replaceState({}, '', '/pricing')
      } else {
        showToast('결제 검증에 실패했습니다. 고객센터에 문의해 주세요.')
      }
    } catch {
      showToast('결제 검증 중 오류가 발생했습니다.')
    }
  }

  // PortOne V2 payment flow
  async function handlePayment(planKey: PlanKey) {
    const isGuest = !session

    // 비회원이면 이메일 필수
    if (isGuest && !guestEmail.trim()) {
      showToast('이메일 주소를 입력해주세요.')
      return
    }

    if (isGuest && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      showToast('올바른 이메일 형식을 입력해주세요.')
      return
    }

    setLoadingPlan(planKey)

    try {
      // 1. Get payment params from server
      const res = await fetch('/api/portone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          ...(isGuest ? { guestEmail: guestEmail.trim() } : {}),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        showToast(err.error || '결제 준비에 실패했습니다.')
        setLoadingPlan(null)
        return
      }

      const data = await res.json()

      // 2. Check V2 SDK loaded
      if (!window.PortOne) {
        showToast('결제 모듈을 로딩 중입니다. 잠시 후 다시 시도해 주세요.')
        setLoadingPlan(null)
        return
      }

      // 3. Call V2 SDK
      const response = await window.PortOne.requestPayment({
        storeId: data.storeId,
        channelKey: data.channelKey,
        paymentId: data.paymentId,
        orderName: data.orderName,
        totalAmount: data.totalAmount,
        currency: data.currency,
        payMethod: 'CARD',
        redirectUrl: `${window.location.origin}/pricing`,
        customer: {
          email: session?.user?.email || guestEmail.trim() || undefined,
          fullName: session?.user?.name || undefined,
        },
        customData: JSON.stringify({ userId: data.userId, plan: planKey }),
      })

      // 4. Check result
      if (response?.code) {
        const isCanceled = response.code === 'PAY_PROCESS_CANCELED' || response.code === 'PAY_PROCESS_ABORTED'
        showToast(isCanceled ? '결제가 취소되었습니다.' : (response.message || '결제 처리 중 오류가 발생했습니다.'))
        setLoadingPlan(null)
        return
      }

      // 5. Verify on server
      await verifyPayment(data.paymentId, isGuest)
    } catch {
      showToast('네트워크 오류가 발생했습니다.')
    } finally {
      setLoadingPlan(null)
    }
  }

  // Subscription cancel
  async function handleCancelSubscription() {
    if (!confirm('정말 구독을 취소하시겠습니까? 현재 기간 종료 후 크레딧이 갱신되지 않습니다.')) return
    setCancelingSubscription(true)
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      if (res.ok) {
        showToast('구독이 취소되었습니다. 현재 기간까지는 사용 가능합니다.', 5000)
        fetchSubscription()
      } else {
        const data = await res.json()
        showToast(data.error || '구독 취소에 실패했습니다.')
      }
    } catch {
      showToast('네트워크 오류가 발생했습니다.')
    } finally {
      setCancelingSubscription(false)
    }
  }

  const currentPlans = planMode === 'onetime' ? ONETIME_PLANS : SUBSCRIPTION_PLANS

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

        {/* Title + Credits */}
        <div className="text-center mb-6">
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

        {/* Active Subscription Banner */}
        {subscription && subscription.status === 'active' && (
          <div
            className="rounded-2xl p-5 mb-6 theme-transition"
            style={{
              background: 'var(--bg-card)',
              borderLeft: '4px solid var(--accent)',
              border: '1px solid var(--border-color)',
              borderLeftWidth: '4px',
              borderLeftColor: 'var(--accent)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                구독 중
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {PLANS[subscription.plan]?.name ?? subscription.plan}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>다음 갱신</span>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>남은 크레딧</span>
                <p className="font-medium" style={{ color: 'var(--text-accent)' }}>
                  {credits?.remaining ?? 0}회
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancelSubscription}
                disabled={cancelingSubscription}
                className="flex-1 py-2 rounded-xl text-xs font-bold hover-scale transition-all disabled:opacity-50"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
              >
                {cancelingSubscription ? '처리 중...' : '구독 취소'}
              </button>
            </div>
          </div>
        )}

        {/* Plan Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full p-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setPlanMode('onetime')}
              className="px-5 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                background: planMode === 'onetime' ? 'var(--accent)' : 'transparent',
                color: planMode === 'onetime' ? 'var(--accent-text)' : 'var(--text-muted)',
              }}
            >
              일회성
            </button>
            <button
              onClick={() => setPlanMode('subscription')}
              className="px-5 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                background: planMode === 'subscription' ? 'var(--accent)' : 'transparent',
                color: planMode === 'subscription' ? 'var(--accent-text)' : 'var(--text-muted)',
              }}
            >
              구독
            </button>
          </div>
        </div>

        {/* Guest email input */}
        {!session && (
          <div
            className="rounded-2xl p-4 mb-6 theme-transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
              비회원 결제 — 이메일을 입력하면 로그인 없이 결제할 수 있습니다.
            </p>
            <input
              type="email"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
              placeholder="이메일 주소"
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
              나중에 같은 이메일로 회원가입하면 크레딧이 자동 연동됩니다.
            </p>
          </div>
        )}

        {/* Plan Cards */}
        <div className="space-y-4">
          {currentPlans.map((key) => {
            const plan = PLANS[key]
            const isPopular = plan.popular
            const isCurrent = credits?.plan === key
            const isSubscription = plan.type === 'subscription'

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
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        {plan.name}
                      </h3>
                      {isSubscription && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'var(--bg-secondary)', color: 'var(--text-accent)', border: '1px solid var(--border-color)' }}>
                          매월 자동 충전
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      크레딧 {plan.credits}회{isSubscription ? '/월' : ''}
                    </p>
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
                  onClick={() => handlePayment(key)}
                  disabled={loadingPlan === key}
                  className="w-full py-3 rounded-xl text-sm font-bold hover-scale transition-all disabled:cursor-not-allowed"
                  style={{
                    background: isCurrent ? 'var(--bg-secondary)' : isPopular ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: isCurrent ? 'var(--text-muted)' : isPopular ? 'var(--accent-text)' : 'var(--text-primary)',
                    border: isPopular ? 'none' : '1px solid var(--border-color)',
                  }}
                >
                  {loadingPlan === key
                    ? '처리 중...'
                    : isCurrent
                      ? '현재 플랜'
                      : isSubscription
                        ? '구독 시작'
                        : '크레딧 충전'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Free tier */}
        <div
          className="rounded-2xl p-5 mt-4 theme-transition"
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

        {/* Note */}
        <div className="mt-8 text-center">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            크레딧은 만료되지 않으며, AI 해석 1회당 1크레딧이 차감됩니다.<br />
            토스페이먼츠를 통해 안전하게 결제됩니다. (카드, 간편결제 지원)
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

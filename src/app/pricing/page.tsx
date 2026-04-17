'use client'

import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { PLANS, type PlanKey, type SubscriptionPlanKey } from '@/lib/credits'
import { isNativeApp } from '@/lib/constants'
import { useTheme } from '@/components/ThemeProvider'
import type { UserSubscription } from '@/lib/subscription'
import { trackPurchase } from '@/lib/analytics'

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
      requestIssueBillingKey: (params: {
        storeId: string
        channelKey: string
        billingKeyMethod: string
        issueKey: string
        issueId?: string
        issueName?: string
        customer?: {
          id?: string
          email?: string
          fullName?: string
          phoneNumber?: string
        }
      }) => Promise<{
        code?: string
        message?: string
        billingKey?: string
      }>
    }
  }
}

const SHOW_PASS_COUNTS = process.env.NEXT_PUBLIC_SHOW_PASS_COUNTS === 'true'

const SUBSCRIPTION_PLANS: SubscriptionPlanKey[] = ['sub_light', 'sub_standard', 'sub_premium']

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

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [credits, setCredits] = useState<{ remaining: number; plan: string } | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [cancelingSubscription, setCancelingSubscription] = useState(false)
  const [subPhone, setSubPhone] = useState('')
  const [phoneModal, setPhoneModal] = useState<{ planKey: SubscriptionPlanKey } | null>(null)
  const [phoneInput, setPhoneInput] = useState('')
  const [nativeApp, setNativeApp] = useState(false)

  useEffect(() => {
    setNativeApp(isNativeApp())
  }, [])

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
      if (plan) {
        showToast(
          SHOW_PASS_COUNTS
            ? `${plan.name} 이용권 ${plan.credits}회가 지급되었습니다! 🎉`
            : `${plan.name} AI 해석 이용권이 지급되었습니다! 🎉`,
          5000,
        )
      }
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
  async function verifyPayment(paymentId: string, isGuest = false, customData?: string) {
    try {
      const verifyRes = await fetch('/api/portone/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          isGuest,
          ...(customData ? { customData } : {}),
        }),
      })
      if (verifyRes.ok) {
        showToast('결제가 완료되었습니다! 🎉', 5000)
        trackPurchase({ paymentId, planName: 'plan', amount: 0 })
        fetchCredits()
        fetchSubscription()
        window.history.replaceState({}, '', '/pricing')
      } else {
        const verifyData = await verifyRes.json().catch(() => null)
        showToast(
          (verifyData && typeof verifyData.error === 'string' && verifyData.error) ||
            '결제 검증에 실패했습니다. 고객센터에 문의해 주세요.',
        )
      }
    } catch {
      showToast('결제 검증 중 오류가 발생했습니다.')
    }
  }

  // PortOne V2 billingKey subscription flow
  async function handleSubscription(planKey: SubscriptionPlanKey, phoneOverride?: string) {
    if (!session) {
      showToast('구독은 로그인이 필요합니다.')
      return
    }

    const phone = (phoneOverride || subPhone).replace(/[^0-9]/g, '')
    if (!phone || phone.length < 10) {
      setPhoneInput(subPhone)
      setPhoneModal({ planKey })
      return
    }

    setLoadingPlan(planKey)

    try {
      // 1. Get billingKey issuance params from server
      const res = await fetch('/api/portone/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })

      if (!res.ok) {
        const err = await res.json()
        showToast(err.error || '구독 준비에 실패했습니다.')
        setLoadingPlan(null)
        return
      }

      const data = await res.json()

      // 2. Check SDK loaded
      if (!window.PortOne?.requestIssueBillingKey) {
        showToast('결제 모듈을 로딩 중입니다. 잠시 후 다시 시도해 주세요.')
        setLoadingPlan(null)
        return
      }

      // 3. Issue billingKey via SDK
      const billingResult = await window.PortOne.requestIssueBillingKey({
        storeId: data.storeId,
        channelKey: data.channelKey,
        billingKeyMethod: 'CARD',
        issueKey: data.issueKey,
        issueId: data.issueKey,
        issueName: data.issueName,
        customer: {
          id: data.userId,
          email: session.user?.email || undefined,
          fullName: session.user?.name || undefined,
          phoneNumber: phone,
        },
      })

      // 4. Check result
      if (billingResult?.code) {
        const isCanceled = billingResult.code === 'PAY_PROCESS_CANCELED' || billingResult.code === 'PAY_PROCESS_ABORTED'
        showToast(isCanceled ? '카드 등록이 취소되었습니다.' : (billingResult.message || '카드 등록에 실패했습니다.'))
        setLoadingPlan(null)
        return
      }

      if (!billingResult?.billingKey) {
        showToast('빌링키 발급에 실패했습니다.')
        setLoadingPlan(null)
        return
      }

      // 5. Send billingKey to server for first charge + subscription creation
      const payRes = await fetch('/api/portone/billing/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingKey: billingResult.billingKey,
          plan: planKey,
        }),
      })

      if (!payRes.ok) {
        const err = await payRes.json()
        showToast(err.error || '첫 결제에 실패했습니다.')
        setLoadingPlan(null)
        return
      }

      const payData = await payRes.json()

      // 6. Track purchase
      trackPurchase({
        paymentId: payData.paymentId,
        planName: PLANS[planKey].name,
        amount: PLANS[planKey].price,
      })

      showToast('구독이 시작되었습니다! 이용권이 지급되었습니다.', 5000)
      fetchSubscription()
    } catch (err) {
      console.error('구독 결제 에러:', err)
      showToast(err instanceof Error ? `결제 오류: ${err.message}` : '네트워크 오류가 발생했습니다.')
    } finally {
      setLoadingPlan(null)
    }
  }

  // Subscription cancel
  async function handleCancelSubscription() {
    if (!confirm('정말 구독을 취소하시겠습니까? 현재 기간 종료 후 이용권이 갱신되지 않습니다.')) return
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

  const currentPlans = SUBSCRIPTION_PLANS

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
            AI 사주 해석 구독을 시작하세요
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-accent)' }}>Patent Pending</span>
            <span>|</span>
            <span>특허 출원 멀티모달 AI 기술 기반</span>
          </div>
          {credits && credits.remaining > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>AI 해석 이용권</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-accent)' }}>
                {SHOW_PASS_COUNTS ? `${credits.remaining}회` : '보유 중'}
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
                <span style={{ color: 'var(--text-muted)' }}>남은 이용권</span>
                <p className="font-medium" style={{ color: 'var(--text-accent)' }}>
                  {SHOW_PASS_COUNTS
                    ? `${credits?.remaining ?? 0}회`
                    : ((credits?.remaining ?? 0) > 0 ? '보유' : '없음')}
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

          {/* Native App: hide payment UI (Apple/Google policy) */}
          {nativeApp && (
            <div
              className="rounded-2xl p-6 mb-6 text-center theme-transition"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <p className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                이용권 구매 안내
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                이용권 구매는 웹사이트에서 가능합니다.<br />
                브라우저에서 <span style={{ color: 'var(--text-accent)' }}>sajuhae.vercel.app</span>에 접속해 주세요.
              </p>
            </div>
          )}

          {!nativeApp && <>
          {/* 무료 vs 구독 비교 */}
        <div
          className="rounded-2xl p-5 mb-6 theme-transition"
          style={{ background: 'var(--bg-card)', border: '2px solid var(--accent)' }}
        >
          <p className="text-xs font-bold text-center mb-3" style={{ color: 'var(--text-accent)' }}>
            🔮 구독하면 이렇게 달라져요
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)' }}>
              <p className="font-bold mb-2" style={{ color: 'var(--text-muted)' }}>무료</p>
              <p style={{ color: 'var(--text-muted)' }}>✗ 사주팔자 기본 정보</p>
              <p style={{ color: 'var(--text-muted)' }}>✗ 오행 요약만</p>
              <p style={{ color: 'var(--text-muted)' }}>✗ AI 해석 1개 항목</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid var(--accent)' }}>
              <p className="font-bold mb-2" style={{ color: 'var(--text-accent)' }}>구독</p>
              <p style={{ color: 'var(--text-secondary)' }}>✓ 연애운 상세 분석</p>
              <p style={{ color: 'var(--text-secondary)' }}>✓ 재물운·직업운</p>
              <p style={{ color: 'var(--text-secondary)' }}>✓ 월별 운세 리포트</p>
            </div>
          </div>
        </div>

        {/* Card-Only Notice */}
          <div
            className="rounded-2xl p-4 mb-6 theme-transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
              정기결제(카드)로 진행됩니다. 언제든 해지 가능합니다.
            </p>
          </div>

        {/* Login prompt for non-members */}
        {!session && (
          <div
            className="rounded-2xl p-4 mb-6 theme-transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <p className="text-xs text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
              구독을 시작하려면 <a href="/login" className="underline" style={{ color: 'var(--text-accent)' }}>로그인</a>이 필요합니다.
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
                          매월 자동 지급
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {SHOW_PASS_COUNTS
                        ? `이용권 ${plan.credits}회${isSubscription ? '/월' : ''}`
                        : 'AI 해석 이용권'}
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
                  onClick={() => handleSubscription(key as SubscriptionPlanKey)}
                  disabled={loadingPlan === key || !session}
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
                      : !session
                        ? '로그인 후 구독'
                        : '구독 시작'}
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
            구독은 매월 자동 갱신되며, 이용권은 매달 초기화됩니다.<br />
            언제든 구독을 해지할 수 있으며, 해지 후에도 현재 기간까지 이용 가능합니다.<br />
            토스페이먼츠를 통해 안전하게 결제됩니다.
          </p>
        </div>
        </>}

        {/* Phone Number Modal */}
        {phoneModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setPhoneModal(null)}
          >
            <div
              className="w-full max-w-xs rounded-2xl p-6 shadow-xl theme-transition"
              style={{ background: 'var(--bg-card)' }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                휴대폰 번호 입력
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                정기결제 등록을 위해 필요합니다.
              </p>
              <input
                type="tel"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                placeholder="01012345678"
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm mb-4 focus:outline-none focus:ring-1"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && phoneInput.length >= 10) {
                    const planKey = phoneModal.planKey
                    setSubPhone(phoneInput)
                    setPhoneModal(null)
                    handleSubscription(planKey, phoneInput)
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setPhoneModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (phoneInput.length < 10) {
                      showToast('올바른 휴대폰 번호를 입력해주세요.')
                      return
                    }
                    const planKey = phoneModal.planKey
                    setSubPhone(phoneInput)
                    setPhoneModal(null)
                    handleSubscription(planKey, phoneInput)
                  }}
                  disabled={phoneInput.length < 10}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                  style={{
                    background: phoneInput.length >= 10 ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: phoneInput.length >= 10 ? 'var(--accent-text)' : 'var(--text-muted)',
                  }}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

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

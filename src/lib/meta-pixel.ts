/**
 * Meta Pixel 이벤트 트래킹 유틸리티
 *
 * 환경변수: NEXT_PUBLIC_META_PIXEL_ID
 */

declare global {
  interface Window {
    fbq?: (event: string, eventName: string, params?: Record<string, unknown>) => void
  }
}

function isEnabled(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function'
}

/** 사주 분석 시작 */
export function trackSajuStart() {
  if (!isEnabled()) return
  window.fbq!('track', 'Lead', { content_name: 'saju_start' })
}

/** 사주 분석 완료 (가장 중요한 이벤트) */
export function trackSajuComplete() {
  if (!isEnabled()) return
  window.fbq!('track', 'CompleteRegistration', { content_name: 'saju_complete' })
}

/** AI 해석 조회 */
export function trackAiInterpretation() {
  if (!isEnabled()) return
  window.fbq!('track', 'ViewContent', { content_name: 'ai_interpretation' })
}

/** 요금제 페이지 진입 */
export function trackPricingView() {
  if (!isEnabled()) return
  window.fbq!('track', 'InitiateCheckout', { content_name: 'pricing' })
}

/** 구독 시작 (가장 중요한 전환) */
export function trackSubscribe(plan: string, value: number) {
  if (!isEnabled()) return
  window.fbq!('track', 'Subscribe', {
    content_name: plan,
    value,
    currency: 'KRW',
  })
}

/** 리포트 구매 */
export function trackPurchase(product: string, value: number) {
  if (!isEnabled()) return
  window.fbq!('track', 'Purchase', {
    content_name: product,
    value,
    currency: 'KRW',
  })
}

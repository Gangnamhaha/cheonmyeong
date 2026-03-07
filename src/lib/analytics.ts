// GA4 Analytics Utility
// Events: page_view, sign_up, purchase, analysis, share

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID || ''

// Check if GA4 is loaded
function isGtagLoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

// Generic event sender
export function sendGAEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (!isGtagLoaded()) return
  window.gtag('event', eventName, params)
}

// Page view (auto-tracked by gtag, but useful for SPA navigation)
export function trackPageView(url: string) {
  if (!isGtagLoaded()) return
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  })
}

// Sign up event
export function trackSignUp(method: 'google' | 'kakao' | 'email') {
  sendGAEvent('sign_up', { method })
}

// Purchase event (revenue tracking)
export function trackPurchase(params: {
  paymentId: string
  planName: string
  amount: number
  currency?: string
}) {
  sendGAEvent('purchase', {
    transaction_id: params.paymentId,
    value: params.amount,
    currency: params.currency || 'KRW',
    items: params.planName,
  })
}

// Saju analysis event
export function trackAnalysis(category: string) {
  sendGAEvent('analysis', { category })
}

// Share event
export function trackShare(method: string, contentType: string) {
  sendGAEvent('share', { method, content_type: contentType })
}

// Declare gtag on window
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

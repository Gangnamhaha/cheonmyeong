/**
 * Credit management system
 * 
 * Storage strategy:
 * - Logged-in users: Server-side Map (in-memory, resets on cold start)
 *   In production, replace with Redis/KV store
 * - Guest users: Rate limited by IP (existing logic in interpret route)
 * 
 * Credit tiers:
 * - Free: 3 AI interpretations per day (no login required)
 * - Starter: 30 credits (₩3,900)
 * - Pro: 100 credits (₩9,900)
 * - Unlimited: 500 credits (₩29,900)
 */

export interface UserCredits {
  total: number
  used: number
  plan: 'free' | 'starter' | 'pro' | 'unlimited'
  lastRefill: string // ISO date
}

export const PLANS = {
  free: {
    name: '무료',
    nameEn: 'Free',
    credits: 3,
    price: 0,
    priceLabel: '무료',
    features: ['기본 사주 분석', 'AI 해석 1일 3회', '오행·십신 차트'],
    popular: false,
    stripePriceId: null,
  },
  starter: {
    name: '스타터',
    nameEn: 'Starter',
    credits: 30,
    price: 3900,
    priceLabel: '₩3,900',
    features: ['AI 해석 30회', '모든 카테고리 해석', '후속 질문 가능', '궁합 분석'],
    popular: false,
    stripePriceId: 'price_starter', // Replace with real Stripe Price ID
  },
  pro: {
    name: '프로',
    nameEn: 'Pro',
    credits: 100,
    price: 9900,
    priceLabel: '₩9,900',
    features: ['AI 해석 100회', '모든 카테고리 해석', '무제한 후속 질문', '궁합 분석', '대운 상세 해석'],
    popular: true,
    stripePriceId: 'price_pro', // Replace with real Stripe Price ID
  },
  unlimited: {
    name: '언리미티드',
    nameEn: 'Unlimited',
    credits: 500,
    price: 29900,
    priceLabel: '₩29,900',
    features: ['AI 해석 500회', '모든 기능 무제한', '우선 응답', '월간 운세 리포트'],
    popular: false,
    stripePriceId: 'price_unlimited', // Replace with real Stripe Price ID
  },
} as const

export type PlanKey = keyof typeof PLANS

// ─── In-memory credit store (replace with Redis/KV in production) ───
const creditStore = new Map<string, UserCredits>()

// Daily free credit tracking by IP
const dailyFreeUsage = new Map<string, { count: number; date: string }>()

export function getUserCredits(userId: string): UserCredits {
  const existing = creditStore.get(userId)
  if (existing) return existing

  const defaultCredits: UserCredits = {
    total: PLANS.free.credits,
    used: 0,
    plan: 'free',
    lastRefill: new Date().toISOString().slice(0, 10),
  }
  creditStore.set(userId, defaultCredits)
  return defaultCredits
}

export function addCredits(userId: string, plan: PlanKey): UserCredits {
  const current = getUserCredits(userId)
  const planInfo = PLANS[plan]
  const updated: UserCredits = {
    total: current.total + planInfo.credits - current.used, // remaining + new
    used: 0,
    plan: plan === 'free' ? current.plan : plan,
    lastRefill: new Date().toISOString().slice(0, 10),
  }
  creditStore.set(userId, updated)
  return updated
}

export function useCredit(userId: string): { success: boolean; remaining: number } {
  const credits = getUserCredits(userId)
  const remaining = credits.total - credits.used

  if (remaining <= 0) {
    return { success: false, remaining: 0 }
  }

  credits.used += 1
  creditStore.set(userId, credits)
  return { success: true, remaining: remaining - 1 }
}

export function getRemainingCredits(userId: string): number {
  const credits = getUserCredits(userId)
  return credits.total - credits.used
}

// ─── Free tier daily limit (by IP) ───
export function checkFreeLimit(ip: string): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().slice(0, 10)
  const usage = dailyFreeUsage.get(ip)

  if (!usage || usage.date !== today) {
    dailyFreeUsage.set(ip, { count: 0, date: today })
    return { allowed: true, remaining: PLANS.free.credits }
  }

  const remaining = PLANS.free.credits - usage.count
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) }
}

export function useFreeCredit(ip: string): { success: boolean; remaining: number } {
  const today = new Date().toISOString().slice(0, 10)
  const usage = dailyFreeUsage.get(ip) || { count: 0, date: today }

  if (usage.date !== today) {
    usage.count = 0
    usage.date = today
  }

  if (usage.count >= PLANS.free.credits) {
    return { success: false, remaining: 0 }
  }

  usage.count += 1
  dailyFreeUsage.set(ip, usage)
  return { success: true, remaining: PLANS.free.credits - usage.count }
}

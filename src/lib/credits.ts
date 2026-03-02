/**
 * Credit management system
 * 
 * Storage strategy:
 * - Production (Upstash Redis): Persistent across cold starts
 * - Development fallback: In-memory Map (when REDIS_URL not set)
 * 
 * Credit tiers:
 * - Free: 3 AI interpretations per day (no login required)
 * - Starter: 30 credits (₩3,900)
 * - Pro: 100 credits (₩9,900)
 * - Unlimited: 500 credits (₩29,900)
 */

import { Redis } from '@upstash/redis'

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

// ─── Storage backend ───────────────────────────────────────────────

const redisUrl = process.env.REDIS_URL || process.env.KV_REST_API_URL
const redisToken = process.env.REDIS_TOKEN || process.env.KV_REST_API_TOKEN

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null

// In-memory fallback (dev mode / when Redis not configured)
const memCreditStore = new Map<string, UserCredits>()
const memFreeUsage = new Map<string, { count: number; date: string }>()

const CREDIT_KEY = (userId: string) => `credits:user:${userId}`
const FREE_KEY = (ip: string, date: string) => `credits:free:${ip}:${date}`

// ─── User credit functions ─────────────────────────────────────────

export async function getUserCredits(userId: string): Promise<UserCredits> {
  if (redis) {
    const data = await redis.get<UserCredits>(CREDIT_KEY(userId))
    if (data) return data
  } else {
    const existing = memCreditStore.get(userId)
    if (existing) return existing
  }

  const defaultCredits: UserCredits = {
    total: PLANS.free.credits,
    used: 0,
    plan: 'free',
    lastRefill: new Date().toISOString().slice(0, 10),
  }

  if (redis) {
    await redis.set(CREDIT_KEY(userId), defaultCredits)
  } else {
    memCreditStore.set(userId, defaultCredits)
  }

  return defaultCredits
}

export async function addCredits(userId: string, plan: PlanKey): Promise<UserCredits> {
  const current = await getUserCredits(userId)
  const planInfo = PLANS[plan]
  const updated: UserCredits = {
    total: current.total + planInfo.credits - current.used, // remaining + new
    used: 0,
    plan: plan === 'free' ? current.plan : plan,
    lastRefill: new Date().toISOString().slice(0, 10),
  }

  if (redis) {
    await redis.set(CREDIT_KEY(userId), updated)
  } else {
    memCreditStore.set(userId, updated)
  }

  return updated
}

export async function useCredit(userId: string): Promise<{ success: boolean; remaining: number }> {
  const credits = await getUserCredits(userId)
  const remaining = credits.total - credits.used

  if (remaining <= 0) {
    return { success: false, remaining: 0 }
  }

  credits.used += 1

  if (redis) {
    await redis.set(CREDIT_KEY(userId), credits)
  } else {
    memCreditStore.set(userId, credits)
  }

  return { success: true, remaining: remaining - 1 }
}

export async function getRemainingCredits(userId: string): Promise<number> {
  const credits = await getUserCredits(userId)
  return credits.total - credits.used
}

// ─── Free tier daily limit (by IP) ─────────────────────────────────

export async function checkFreeLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().slice(0, 10)

  if (redis) {
    const count = await redis.get<number>(FREE_KEY(ip, today))
    const used = count ?? 0
    const remaining = PLANS.free.credits - used
    return { allowed: remaining > 0, remaining: Math.max(0, remaining) }
  }

  // In-memory fallback
  const usage = memFreeUsage.get(ip)
  if (!usage || usage.date !== today) {
    memFreeUsage.set(ip, { count: 0, date: today })
    return { allowed: true, remaining: PLANS.free.credits }
  }

  const remaining = PLANS.free.credits - usage.count
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) }
}

export async function useFreeCredit(ip: string): Promise<{ success: boolean; remaining: number }> {
  const today = new Date().toISOString().slice(0, 10)

  if (redis) {
    const key = FREE_KEY(ip, today)
    const count = await redis.get<number>(key) ?? 0

    if (count >= PLANS.free.credits) {
      return { success: false, remaining: 0 }
    }

    const newCount = count + 1
    await redis.set(key, newCount, { ex: 86400 }) // TTL: 24 hours
    return { success: true, remaining: PLANS.free.credits - newCount }
  }

  // In-memory fallback
  const usage = memFreeUsage.get(ip) || { count: 0, date: today }

  if (usage.date !== today) {
    usage.count = 0
    usage.date = today
  }

  if (usage.count >= PLANS.free.credits) {
    return { success: false, remaining: 0 }
  }

  usage.count += 1
  memFreeUsage.set(ip, usage)
  return { success: true, remaining: PLANS.free.credits - usage.count }
}

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
import { getSupabase } from '@/lib/db'

export interface UserCredits {
  total: number
  used: number
  plan: PlanKey
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
    type: 'free' as const,
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
    type: 'onetime' as const,
    stripePriceId: process.env.STRIPE_PRICE_STARTER || null,
  },
  pro: {
    name: '프로',
    nameEn: 'Pro',
    credits: 100,
    price: 9900,
    priceLabel: '₩9,900',
    features: ['AI 해석 100회', '모든 카테고리 해석', '무제한 후속 질문', '궁합 분석', '대운 상세 해석'],
    popular: true,
    type: 'onetime' as const,
    stripePriceId: process.env.STRIPE_PRICE_PRO || null,
  },
  premium_report: {
    name: '프리미엄 종합 리포트',
    nameEn: 'Premium Report',
    credits: 0,
    price: 9900,
    priceLabel: '₩9,900',
    features: ['gpt-4o 7개 카테고리 심층 분석', '프리미엄 DOCX 리포트 다운로드'],
    popular: false,
    type: 'onetime' as const,
    stripePriceId: null,
  },
  unlimited: {
    name: '언리미티드',
    nameEn: 'Unlimited',
    credits: 500,
    price: 29900,
    priceLabel: '₩29,900',
    features: ['AI 해석 500회', '모든 기능 무제한', '우선 응답', '월간 운세 리포트'],
    popular: false,
    type: 'onetime' as const,
    stripePriceId: process.env.STRIPE_PRICE_UNLIMITED || null,
  },
  sub_basic: {
    name: '베이직 구독',
    nameEn: 'Basic Subscription',
    credits: 50,
    price: 4900,
    priceLabel: '₩4,900/월',
    features: ['매월 50회 크레딧 자동 충전', '모든 카테고리 해석', '후속 질문 가능', '궁합 분석'],
    popular: false,
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_PRICE_SUB_BASIC || null,
    interval: 'month' as const,
  },
  sub_pro: {
    name: '프로 구독',
    nameEn: 'Pro Subscription',
    credits: 150,
    price: 9900,
    priceLabel: '₩9,900/월',
    features: ['매월 150회 크레딧 자동 충전', '모든 기능 무제한', '대운 상세 해석', '우선 응답'],
    popular: true,
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_PRICE_SUB_PRO || null,
    interval: 'month' as const,
  },
  sub_premium: {
    name: '프리미엄 구독',
    nameEn: 'Premium Subscription',
    credits: 500,
    price: 19900,
    priceLabel: '₩19,900/월',
    features: ['매월 500회 크레딧 자동 충전', '모든 기능 무제한', '우선 응답', '월간 운세 리포트', '1:1 상담'],
    popular: false,
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_PRICE_SUB_PREMIUM || null,
    interval: 'month' as const,
  },
  sub_basic_annual: {
    name: '베이직 연간',
    nameEn: 'Basic Annual',
    credits: 50,
    price: 47000,
    priceLabel: '₩47,000/년',
    features: ['매월 50회 크레딧 자동 충전', '모든 카테고리 해석', '후속 질문 가능', '궁합 분석', '월 ₩3,917 (20% 할인)'],
    popular: false,
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_PRICE_SUB_BASIC_ANNUAL || null,
    interval: 'year' as const,
  },
  sub_pro_annual: {
    name: '프로 연간',
    nameEn: 'Pro Annual',
    credits: 150,
    price: 95000,
    priceLabel: '₩95,000/년',
    features: ['매월 150회 크레딧 자동 충전', '모든 기능 무제한', '대운 상세 해석', '우선 응답', '월 ₩7,917 (20% 할인)'],
    popular: true,
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_PRICE_SUB_PRO_ANNUAL || null,
    interval: 'year' as const,
  },
  bundle_50: {
    name: '50 크레딧 번들',
    nameEn: '50 Credit Bundle',
    credits: 50,
    price: 5900,
    priceLabel: '₩5,900',
    features: ['AI 해석 50회', '모든 카테고리 해석', '후속 질문 가능', '궁합 분석', '회당 ₩118'],
    popular: false,
    type: 'onetime' as const,
    stripePriceId: null,
  },
  bundle_200: {
    name: '200 크레딧 번들',
    nameEn: '200 Credit Bundle',
    credits: 200,
    price: 15900,
    priceLabel: '₩15,900',
    features: ['AI 해석 200회', '모든 기능 무제한', '대운 상세 해석', '우선 응답', '회당 ₩80 (최저가)'],
    popular: false,
    type: 'onetime' as const,
    stripePriceId: null,
  },
} as const

export type PlanKey = keyof typeof PLANS
export type SubscriptionPlanKey = Extract<PlanKey, `sub_${string}`>
export type OnetimePlanKey = Exclude<PlanKey, 'free' | `sub_${string}`>

// ─── Storage backend ───────────────────────────────────────────────

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null

// In-memory fallback (dev mode / when Redis not configured)
const memCreditStore = new Map<string, UserCredits>()
const memFreeUsage = new Map<string, { count: number; date: string }>()

const CREDIT_KEY = (userId: string) => `credits:user:${userId}`
const USED_COUNTER_KEY = (userId: string) => `credits:used:${userId}`
const FREE_KEY = (ip: string, date: string) => `credits:free:${ip}:${date}`

// ─── User credit functions ─────────────────────────────────────────

export async function getUserCredits(userId: string): Promise<UserCredits> {
  // Try Supabase first
  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (data) {
      return {
        total: data.total,
        used: data.used,
        plan: data.plan as PlanKey,
        lastRefill: data.last_refill,
      }
    }
  }

  // Fallback to Redis
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

  if (supabase) {
    await supabase.from('credits').upsert({
      user_id: userId,
      total: defaultCredits.total,
      used: defaultCredits.used,
      plan: defaultCredits.plan,
      last_refill: defaultCredits.lastRefill,
    }, { onConflict: 'user_id' })
  }

  if (redis) {
    await redis.set(CREDIT_KEY(userId), defaultCredits)
  } else if (!supabase) {
    memCreditStore.set(userId, defaultCredits)
  }

  return defaultCredits
}

export async function addCredits(userId: string, plan: PlanKey): Promise<UserCredits> {
  const current = await getUserCredits(userId)
  const supabase = getSupabase()
  const planInfo = PLANS[plan]
  const updated: UserCredits = {
    total: current.total + planInfo.credits - current.used, // remaining + new
    used: 0,
    plan: plan === 'free' ? current.plan : plan,
    lastRefill: new Date().toISOString().slice(0, 10),
  }

  if (supabase) {
    await supabase.from('credits').upsert({
      user_id: userId,
      total: updated.total,
      used: updated.used,
      plan: updated.plan,
      last_refill: updated.lastRefill,
    }, { onConflict: 'user_id' })
  }

  if (redis) {
    await redis.set(CREDIT_KEY(userId), updated)
    // Reset the atomic counter to match used=0
    await redis.set(USED_COUNTER_KEY(userId), 0)
  } else if (!supabase) {
    memCreditStore.set(userId, updated)
  }

  return updated
}

export async function refillSubscriptionCredits(userId: string, plan: SubscriptionPlanKey): Promise<UserCredits> {
  const supabase = getSupabase()
  const planInfo = PLANS[plan]
  const updated: UserCredits = {
    total: planInfo.credits,
    used: 0,
    plan,
    lastRefill: new Date().toISOString().slice(0, 10),
  }

  if (supabase) {
    await supabase.from('credits').upsert({
      user_id: userId,
      total: updated.total,
      used: updated.used,
      plan: updated.plan,
      last_refill: updated.lastRefill,
    }, { onConflict: 'user_id' })
  }

  if (redis) {
    await redis.set(CREDIT_KEY(userId), updated)
    // Reset the atomic counter to match used=0
    await redis.set(USED_COUNTER_KEY(userId), 0)
  } else if (!supabase) {
    memCreditStore.set(userId, updated)
  }

  return updated
}

/**
 * Atomically consume one credit.
 *
 * Strategy (Upstash Redis):
 *   1. Read the full UserCredits object for the `total` value.
 *   2. INCR an atomic counter key (`credits:used:<userId>`) — this is the
 *      single source of truth for `used` count and is race-condition-safe.
 *   3. If the incremented value exceeds `total`, DECR it back and reject.
 *   4. Sync the `used` field in the main object (best-effort, non-critical).
 */
export async function useCredit(userId: string): Promise<{ success: boolean; remaining: number }> {
  if (redis) {
    const key = CREDIT_KEY(userId)
    const cached = await redis.get<UserCredits>(key)
    const credits = cached ?? await getUserCredits(userId)

    const currentCounter = await redis.get<number>(USED_COUNTER_KEY(userId))
    if (typeof currentCounter !== 'number') {
      await redis.set(USED_COUNTER_KEY(userId), credits.used)
    }

    // Atomic increment — returns the value AFTER incrementing
    const newUsed = await redis.incr(USED_COUNTER_KEY(userId))

    if (newUsed > credits.total) {
      // Over limit — roll back the increment
      await redis.decr(USED_COUNTER_KEY(userId))
      return { success: false, remaining: 0 }
    }

    // Best-effort sync of the main object (non-critical if this fails)
    try {
      const updatedCredits = { ...credits, used: newUsed }
      await redis.set(key, updatedCredits)

      const supabase = getSupabase()
      if (supabase) {
        void (async () => {
          try {
            await supabase.from('credits').upsert({
              user_id: userId,
              total: updatedCredits.total,
              used: updatedCredits.used,
              plan: updatedCredits.plan,
              last_refill: updatedCredits.lastRefill,
            }, { onConflict: 'user_id' })
          } catch {
            // Non-critical async sync
          }
        })()
      }
    } catch {
      // Counter is the source of truth; object sync failure is non-fatal
    }

    return { success: true, remaining: credits.total - newUsed }
  }

  const supabase = getSupabase()
  if (supabase) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!data) {
        await getUserCredits(userId)
        continue
      }

      if (data.used >= data.total) {
        return { success: false, remaining: 0 }
      }

      const nextUsed = data.used + 1
      const { data: updated } = await supabase
        .from('credits')
        .update({ used: nextUsed })
        .eq('user_id', userId)
        .eq('used', data.used)
        .select('total, used')
        .single()

      if (updated) {
        return { success: true, remaining: updated.total - updated.used }
      }
    }
    return { success: false, remaining: 0 }
  }

  // In-memory fallback (dev only — single process, no race condition)
  const credits = await getUserCredits(userId)
  const remaining = credits.total - credits.used

  if (remaining <= 0) {
    return { success: false, remaining: 0 }
  }

  credits.used += 1
  memCreditStore.set(userId, credits)
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

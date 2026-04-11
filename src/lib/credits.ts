/**
 * Usage pass management system
 * 
 * Storage strategy:
 * - Production (Upstash Redis): Persistent across cold starts
 * - Development fallback: In-memory Map (when REDIS_URL not set)
 * 
 * Usage pass tiers:
 * - Free: 3 AI interpretations per day (no login required)
 * - Starter: 30 passes (₩3,900)
 * - Pro: 100 passes (₩9,900)
 * - Unlimited: 500 passes (₩29,900)
 */

import { Redis } from '@upstash/redis'
import { getSupabase } from '@/lib/db'

export interface UserCredits {
  total: number
  used: number
  plan: PlanKey
  lastRefill: string // ISO date
  expiresAt?: string // ISO date — null/undefined means never expires
}

export const PLANS = {
  free: {
    name: '무료',
    nameEn: 'Free',
    credits: 1,
    price: 0,
    priceLabel: '무료',
    features: ['기본 사주 분석', 'AI 해석 1일 1회', '오행·십신 차트'],
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
    features: ['AI 해석 이용권', '모든 카테고리 해석', '후속 질문 가능', '궁합 분석', '구매일로부터 3개월간 유효'],
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
    features: ['AI 해석 이용권', '모든 카테고리 해석', '무제한 후속 질문', '궁합 분석', '대운 상세 해석', '구매일로부터 3개월간 유효'],
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
    features: ['GPT-5.4 7개 카테고리 심층 분석', '프리미엄 DOCX 리포트 다운로드'],
    popular: false,
    type: 'onetime' as const,
    stripePriceId: null,
  },
  premium_report_pro: {
    name: '프로페셔널 종합 리포트',
    nameEn: 'Professional Report',
    credits: 0,
    price: 25000,
    priceLabel: '₩25,000',
    features: ['GPT-5.4 10개 카테고리 심층 분석', '대운 10년 타임라인', '세운 3년 전망', '맞춤 인생 조언', '프리미엄 DOCX 다운로드'],
    popular: false,
    type: 'onetime' as const,
    stripePriceId: null,
  },
  gunghap_premium: {
    name: '궁합 프리미엄 리포트',
    nameEn: 'Gunghap Premium Report',
    credits: 0,
    price: 15000,
    priceLabel: '₩15,000',
    features: ['AI 궁합 심층 분석', 'DOCX 리포트 다운로드'],
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
    features: ['AI 해석 이용권', '모든 기능 무제한', '우선 응답', '월간 운세 리포트', '구매일로부터 3개월간 유효'],
    popular: false,
    type: 'onetime' as const,
    stripePriceId: process.env.STRIPE_PRICE_UNLIMITED || null,
  },
  sub_light: {
    name: '라이트',
    nameEn: 'Light',
    credits: 5,
    price: 3900,
    priceLabel: '₩3,900/월',
    features: ['AI 해석 월 5회', '모든 카테고리 해석', '후속 질문 가능', '오늘의 운세 매일 푸시'],
    popular: false,
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_PRICE_SUB_LIGHT || null,
    interval: 'month' as const,
  },
  sub_standard: {
    name: '스탠다드',
    nameEn: 'Standard',
    credits: 15,
    price: 7900,
    priceLabel: '₩7,900/월',
    features: ['AI 해석 월 15회', '궁합 분석', '대운 상세 해석', '월간 운세 리포트', '오늘의 운세 매일 푸시'],
    popular: true,
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_PRICE_SUB_STANDARD || null,
    interval: 'month' as const,
  },
  sub_premium: {
    name: '프리미엄',
    nameEn: 'Premium',
    credits: 9999,
    price: 14900,
    priceLabel: '₩14,900/월',
    features: ['AI 해석 무제한', '모든 기능 이용', '우선 응답', '월간 운세 리포트', '프리미엄 리포트(DOCX) 월 1회 포함'],
    popular: false,
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_PRICE_SUB_PREMIUM || null,
    interval: 'month' as const,
  },
  sub_light_annual: {
    name: '라이트 연간',
    nameEn: 'Light Annual',
    credits: 5,
    price: 37400,
    priceLabel: '₩37,400/년',
    features: ['AI 해석 월 5회', '모든 카테고리 해석', '후속 질문 가능', '오늘의 운세 매일 푸시', '월 ₩3,117 (20% 할인)'],
    popular: false,
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_PRICE_SUB_LIGHT_ANNUAL || null,
    interval: 'year' as const,
  },
  sub_standard_annual: {
    name: '스탠다드 연간',
    nameEn: 'Standard Annual',
    credits: 15,
    price: 75800,
    priceLabel: '₩75,800/년',
    features: ['AI 해석 월 15회', '궁합 분석', '대운 상세 해석', '월간 운세 리포트', '월 ₩6,317 (20% 할인)'],
    popular: true,
    type: 'subscription' as const,
    stripePriceId: process.env.STRIPE_PRICE_SUB_STANDARD_ANNUAL || null,
    interval: 'year' as const,
  },
  bundle_50: {
    name: '이용권 번들 S',
    nameEn: '50 Credit Bundle',
    credits: 50,
    price: 5900,
    priceLabel: '₩5,900',
    features: ['AI 해석 이용권', '모든 카테고리 해석', '후속 질문 가능', '궁합 분석', '가성비 번들', '구매일로부터 3개월간 유효'],
    popular: false,
    type: 'onetime' as const,
    stripePriceId: null,
  },
  bundle_200: {
    name: '이용권 번들 L',
    nameEn: '200 Credit Bundle',
    credits: 200,
    price: 15900,
    priceLabel: '₩15,900',
    features: ['AI 해석 이용권', '모든 기능 무제한', '대운 상세 해석', '우선 응답', '최고 가성비', '구매일로부터 3개월간 유효'],
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

// Auto-detect whether the expires_at column exists in the credits table.
// Starts as true (optimistic); flips to false on first column-not-found error.
let _hasExpiresAtColumn = true

async function upsertCredits(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  userId: string,
  data: { total: number; used: number; plan: string; last_refill: string; expires_at?: string | null },
) {
  const payload = _hasExpiresAtColumn
    ? { user_id: userId, ...data }
    : { user_id: userId, total: data.total, used: data.used, plan: data.plan, last_refill: data.last_refill }

  const { error } = await supabase.from('credits').upsert(payload, { onConflict: 'user_id' })

  if (error?.message?.includes('expires_at')) {
    // Column doesn't exist yet — retry without it
    _hasExpiresAtColumn = false
    const { total, used, plan, last_refill } = data
    await supabase.from('credits').upsert(
      { user_id: userId, total, used, plan, last_refill },
      { onConflict: 'user_id' },
    )
  }
}

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
        expiresAt: data.expires_at ?? undefined,
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
    await upsertCredits(supabase, userId, {
      total: defaultCredits.total,
      used: defaultCredits.used,
      plan: defaultCredits.plan,
      last_refill: defaultCredits.lastRefill,
    })
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

  // Set expiration: 3 months from now for onetime plans
  const expiresAt = planInfo.type === 'onetime'
    ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : undefined

  const updated: UserCredits = {
    total: current.total + planInfo.credits - current.used, // remaining + new
    used: 0,
    plan: plan === 'free' ? current.plan : plan,
    lastRefill: new Date().toISOString().slice(0, 10),
    expiresAt: expiresAt ?? current.expiresAt,
  }

  if (supabase) {
    await upsertCredits(supabase, userId, {
      total: updated.total,
      used: updated.used,
      plan: updated.plan,
      last_refill: updated.lastRefill,
      expires_at: updated.expiresAt || null,
    })
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
    expiresAt: undefined,
  }

  if (supabase) {
    await upsertCredits(supabase, userId, {
      total: updated.total,
      used: updated.used,
      plan: updated.plan,
      last_refill: updated.lastRefill,
      expires_at: null,
    })
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

    // Check expiration
    if (credits.expiresAt && new Date(credits.expiresAt) < new Date()) {
      return { success: false, remaining: 0 }
    }

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
            await upsertCredits(supabase, userId, {
              total: updatedCredits.total,
              used: updatedCredits.used,
              plan: updatedCredits.plan,
              last_refill: updatedCredits.lastRefill,
            })
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

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { success: false, remaining: 0 }
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
  if (credits.expiresAt && new Date(credits.expiresAt) < new Date()) {
    return 0
  }
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

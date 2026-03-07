/**
 * Subscription management
 *
 * Storage strategy:
 * - Primary: Supabase PostgreSQL (when configured)
 * - Fallback: Redis (Upstash) with in-memory fallback
 * - Dual-write: writes to both when both available
 */

import { Redis } from '@upstash/redis'
import type { SubscriptionPlanKey } from '@/lib/credits'
import { getSupabase } from '@/lib/db'

export interface UserSubscription {
  userId: string
  plan: SubscriptionPlanKey
  status: 'active' | 'canceled' | 'past_due' | 'expired'
  paymentProvider: 'stripe' | 'portone'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  portoneCustomerUid?: string
  portoneMerchantUid?: string
  billingKey?: string
  currentPeriodStart: string
  currentPeriodEnd: string
  canceledAt?: string
  createdAt: string
}

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null

const memSubscriptionStore = new Map<string, UserSubscription>()

const SUBSCRIPTION_KEY = (userId: string) => `subscription:user:${userId}`

export async function getSubscription(userId: string): Promise<UserSubscription | null> {
  // Try Supabase first
  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (data) {
      return {
        userId: data.user_id,
        plan: data.plan as SubscriptionPlanKey,
        status: data.status,
        paymentProvider: data.payment_provider,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        billingKey: data.billing_key,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        canceledAt: data.canceled_at,
        createdAt: data.created_at,
      }
    }
  }

  // Fallback to Redis
  if (redis) {
    const data = await redis.get<UserSubscription>(SUBSCRIPTION_KEY(userId))
    return data ?? null
  }

  return memSubscriptionStore.get(userId) ?? null
}

export async function createSubscription(sub: UserSubscription): Promise<void> {
  // Dual-write: Supabase + Redis
  const supabase = getSupabase()
  if (supabase) {
    await supabase.from('subscriptions').upsert({
      user_id: sub.userId,
      plan: sub.plan,
      status: sub.status,
      payment_provider: sub.paymentProvider,
      billing_key: sub.billingKey,
      stripe_customer_id: sub.stripeCustomerId,
      stripe_subscription_id: sub.stripeSubscriptionId,
      current_period_start: sub.currentPeriodStart,
      current_period_end: sub.currentPeriodEnd,
      canceled_at: sub.canceledAt,
      created_at: sub.createdAt,
    }, { onConflict: 'user_id' })
  }

  if (redis) {
    await redis.set(SUBSCRIPTION_KEY(sub.userId), sub)
  } else if (!supabase) {
    memSubscriptionStore.set(sub.userId, sub)
  }
}

export async function updateSubscription(userId: string, updates: Partial<UserSubscription>): Promise<void> {
  const current = await getSubscription(userId)
  if (!current) return

  const updated: UserSubscription = {
    ...current,
    ...updates,
    userId: current.userId,
  }

  // Dual-write
  const supabase = getSupabase()
  if (supabase) {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.plan) dbUpdates.plan = updates.plan
    if (updates.status) dbUpdates.status = updates.status
    if (updates.billingKey !== undefined) dbUpdates.billing_key = updates.billingKey
    if (updates.currentPeriodStart) dbUpdates.current_period_start = updates.currentPeriodStart
    if (updates.currentPeriodEnd) dbUpdates.current_period_end = updates.currentPeriodEnd
    if (updates.canceledAt) dbUpdates.canceled_at = updates.canceledAt

    await supabase.from('subscriptions').update(dbUpdates).eq('user_id', userId)
  }

  if (redis) {
    await redis.set(SUBSCRIPTION_KEY(userId), updated)
  } else if (!supabase) {
    memSubscriptionStore.set(userId, updated)
  }
}

export async function cancelSubscription(userId: string): Promise<void> {
  await updateSubscription(userId, {
    status: 'canceled',
    canceledAt: new Date().toISOString(),
  })
}

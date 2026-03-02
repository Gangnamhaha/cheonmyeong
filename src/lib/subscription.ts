import { Redis } from '@upstash/redis'
import type { SubscriptionPlanKey } from '@/lib/credits'

export interface UserSubscription {
  userId: string
  plan: SubscriptionPlanKey
  status: 'active' | 'canceled' | 'past_due' | 'expired'
  paymentProvider: 'stripe' | 'portone'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  portoneCustomerUid?: string
  portoneMerchantUid?: string
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
  if (redis) {
    const data = await redis.get<UserSubscription>(SUBSCRIPTION_KEY(userId))
    return data ?? null
  }

  return memSubscriptionStore.get(userId) ?? null
}

export async function createSubscription(sub: UserSubscription): Promise<void> {
  if (redis) {
    await redis.set(SUBSCRIPTION_KEY(sub.userId), sub)
    return
  }

  memSubscriptionStore.set(sub.userId, sub)
}

export async function updateSubscription(userId: string, updates: Partial<UserSubscription>): Promise<void> {
  const current = await getSubscription(userId)
  if (!current) return

  const updated: UserSubscription = {
    ...current,
    ...updates,
    userId: current.userId,
  }

  if (redis) {
    await redis.set(SUBSCRIPTION_KEY(userId), updated)
    return
  }

  memSubscriptionStore.set(userId, updated)
}

export async function cancelSubscription(userId: string): Promise<void> {
  await updateSubscription(userId, {
    status: 'canceled',
    canceledAt: new Date().toISOString(),
  })
}

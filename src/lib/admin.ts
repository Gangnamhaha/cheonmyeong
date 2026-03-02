import { Redis } from '@upstash/redis'
import { getUserCredits, type UserCredits } from '@/lib/credits'
import { getSubscription } from '@/lib/subscription'

export interface AdminUserProfile {
  userId: string
  email: string
  name: string
  createdAt: string
  lastLoginAt: string
}

export interface AdminStats {
  totalUsers: number
  totalAnalyses: number
  todayAnalyses: number
  activeSubscriptions: number
}

export interface AdminAnnouncement {
  id: string
  title: string
  content: string
  createdAt: string
  active: boolean
}

export interface CreditAdjustment {
  id: string
  userId: string
  amount: number
  reason: string
  createdAt: string
}

export interface AdminUsersPage {
  users: AdminUserProfile[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null

const memUsers = new Set<string>()
const memProfiles = new Map<string, AdminUserProfile>()
const memAnnouncements: AdminAnnouncement[] = []
const memDailyAnalyses = new Map<string, number>()
let memTotalAnalyses = 0
const memCreditHistory = new Map<string, CreditAdjustment[]>()

const ADMIN_USERS_KEY = 'admin:users'
const ADMIN_TOTAL_ANALYSES_KEY = 'admin:stats:total_analyses'
const ADMIN_DAILY_ANALYSES_KEY = (date: string) => `admin:stats:daily:${date}`
const ADMIN_ANNOUNCEMENTS_KEY = 'admin:announcements'
const ADMIN_USER_PROFILE_KEY = (userId: string) => `admin:user:${userId}`
const ADMIN_CREDIT_HISTORY_KEY = (userId: string) => `admin:credits:history:${userId}`
const CREDIT_KEY = (userId: string) => `credits:user:${userId}`

export function isAdminEmail(email: string): boolean {
  const allowList = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return allowList.includes(email.toLowerCase())
}

export function getRedis(): Redis | null {
  return redis
}

async function getAllUserIds(): Promise<string[]> {
  if (redis) {
    const ids = await redis.smembers<string[]>(ADMIN_USERS_KEY)
    return ids ?? []
  }

  return Array.from(memUsers)
}

async function getProfile(userId: string): Promise<AdminUserProfile> {
  if (redis) {
    const profile = await redis.get<AdminUserProfile>(ADMIN_USER_PROFILE_KEY(userId))
    if (profile) return profile
  } else {
    const profile = memProfiles.get(userId)
    if (profile) return profile
  }

  return {
    userId,
    email: '',
    name: '',
    createdAt: new Date(0).toISOString(),
    lastLoginAt: new Date(0).toISOString(),
  }
}

export async function registerUser(userId: string, email: string, name?: string): Promise<void> {
  const now = new Date().toISOString()

  if (redis) {
    await redis.sadd(ADMIN_USERS_KEY, userId)
    const existing = await redis.get<AdminUserProfile>(ADMIN_USER_PROFILE_KEY(userId))
    const profile: AdminUserProfile = {
      userId,
      email,
      name: name ?? existing?.name ?? '',
      createdAt: existing?.createdAt ?? now,
      lastLoginAt: now,
    }
    await redis.set(ADMIN_USER_PROFILE_KEY(userId), profile)
    return
  }

  const existing = memProfiles.get(userId)
  memUsers.add(userId)
  memProfiles.set(userId, {
    userId,
    email,
    name: name ?? existing?.name ?? '',
    createdAt: existing?.createdAt ?? now,
    lastLoginAt: now,
  })
}

export async function getAdminStats(): Promise<AdminStats> {
  const userIds = await getAllUserIds()
  const today = new Date().toISOString().slice(0, 10)

  let totalAnalyses = memTotalAnalyses
  let todayAnalyses = memDailyAnalyses.get(today) ?? 0

  if (redis) {
    totalAnalyses = (await redis.get<number>(ADMIN_TOTAL_ANALYSES_KEY)) ?? 0
    todayAnalyses = (await redis.get<number>(ADMIN_DAILY_ANALYSES_KEY(today))) ?? 0
  }

  let activeSubscriptions = 0
  for (const userId of userIds) {
    const sub = await getSubscription(userId)
    if (sub?.status === 'active') activeSubscriptions += 1
  }

  return {
    totalUsers: userIds.length,
    totalAnalyses,
    todayAnalyses,
    activeSubscriptions,
  }
}

export async function getAllUsers(page = 1, limit = 20): Promise<AdminUsersPage> {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.floor(limit))) : 20
  const userIds = await getAllUserIds()

  const profiles = await Promise.all(userIds.map((userId) => getProfile(userId)))
  profiles.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const total = profiles.length
  const totalPages = Math.max(1, Math.ceil(total / safeLimit))
  const start = (safePage - 1) * safeLimit
  const users = profiles.slice(start, start + safeLimit)

  return {
    users,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
  }
}

export async function adjustCredits(userId: string, amount: number, reason: string): Promise<UserCredits> {
  const current = await getUserCredits(userId)
  const currentRemaining = current.total - current.used
  const nextRemaining = Math.max(0, currentRemaining + amount)

  const updated: UserCredits = {
    total: nextRemaining,
    used: 0,
    plan: current.plan,
    lastRefill: new Date().toISOString().slice(0, 10),
  }

  if (redis) {
    await redis.set(CREDIT_KEY(userId), updated)
  } else {
    current.total = updated.total
    current.used = updated.used
    current.plan = updated.plan
    current.lastRefill = updated.lastRefill
  }

  const adjustment: CreditAdjustment = {
    id: crypto.randomUUID(),
    userId,
    amount,
    reason,
    createdAt: new Date().toISOString(),
  }

  if (redis) {
    const history = await redis.get<CreditAdjustment[]>(ADMIN_CREDIT_HISTORY_KEY(userId)) ?? []
    history.unshift(adjustment)
    await redis.set(ADMIN_CREDIT_HISTORY_KEY(userId), history.slice(0, 100))
  } else {
    const history = memCreditHistory.get(userId) ?? []
    history.unshift(adjustment)
    memCreditHistory.set(userId, history.slice(0, 100))
  }

  return updated
}

export async function getCreditAdjustmentHistory(userId: string): Promise<CreditAdjustment[]> {
  if (redis) {
    return (await redis.get<CreditAdjustment[]>(ADMIN_CREDIT_HISTORY_KEY(userId))) ?? []
  }

  return memCreditHistory.get(userId) ?? []
}

export async function getAnnouncements(): Promise<AdminAnnouncement[]> {
  if (redis) {
    const raw = await redis.get<string | AdminAnnouncement[]>(ADMIN_ANNOUNCEMENTS_KEY)
    if (!raw) return []
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as AdminAnnouncement[]
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    return Array.isArray(raw) ? raw : []
  }

  return [...memAnnouncements]
}

export async function saveAnnouncements(list: AdminAnnouncement[]): Promise<void> {
  if (redis) {
    await redis.set(ADMIN_ANNOUNCEMENTS_KEY, JSON.stringify(list))
    return
  }

  memAnnouncements.length = 0
  memAnnouncements.push(...list)
}

export async function recordAnalysisEvent(date = new Date().toISOString().slice(0, 10)): Promise<void> {
  if (redis) {
    const total = (await redis.get<number>(ADMIN_TOTAL_ANALYSES_KEY)) ?? 0
    const daily = (await redis.get<number>(ADMIN_DAILY_ANALYSES_KEY(date))) ?? 0
    await redis.set(ADMIN_TOTAL_ANALYSES_KEY, total + 1)
    await redis.set(ADMIN_DAILY_ANALYSES_KEY(date), daily + 1)
    return
  }

  memTotalAnalyses += 1
  memDailyAnalyses.set(date, (memDailyAnalyses.get(date) ?? 0) + 1)
}

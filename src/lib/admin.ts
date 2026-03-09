import { createHmac } from 'crypto'
import { Redis } from '@upstash/redis'
import { getUserCredits, type UserCredits } from '@/lib/credits'
import { getSupabase } from '@/lib/db'
import { getSubscription } from '@/lib/subscription'
import { getCheckinAdminStats } from '@/lib/checkin'

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
  totalCheckins: number
  todayCheckins: number
  activeStreakUsers: number
  rewardCreditsGiven: number
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

const ADMIN_TOKEN_SECRET = process.env.NEXTAUTH_SECRET || 'cheonmyeong-dev-secret-change-in-production'

export function verifyAdminCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminUsername || !adminPassword) return false
  return username === adminUsername && password === adminPassword
}

export function createAdminToken(): string {
  const payload = JSON.stringify({ admin: true, exp: Date.now() + 24 * 60 * 60 * 1000 })
  const payloadB64 = Buffer.from(payload).toString('base64url')
  const sig = createHmac('sha256', ADMIN_TOKEN_SECRET).update(payloadB64).digest('base64url')
  return `${payloadB64}.${sig}`
}

export function verifyAdminToken(token: string): boolean {
  try {
    const [payloadB64, sig] = token.split('.')
    if (!payloadB64 || !sig) return false
    const expectedSig = createHmac('sha256', ADMIN_TOKEN_SECRET).update(payloadB64).digest('base64url')
    if (sig !== expectedSig) return false
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as { admin?: boolean; exp?: number }
    if (!payload.admin || !payload.exp) return false
    if (Date.now() > payload.exp) return false
    return true
  } catch {
    return false
  }
}

export function getRedis(): Redis | null {
  return redis
}

async function getAllUserIds(): Promise<string[]> {
  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('admin_profiles')
      .select('user_id')
      .order('created_at', { ascending: false })
    if (data) {
      return data.map((row) => row.user_id)
    }
  }

  if (redis) {
    const ids = await redis.smembers<string[]>(ADMIN_USERS_KEY)
    return ids ?? []
  }

  return Array.from(memUsers)
}

async function getProfile(userId: string): Promise<AdminUserProfile> {
  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (data) {
      return {
        userId: data.user_id,
        email: data.email,
        name: data.name,
        createdAt: data.created_at,
        lastLoginAt: data.last_login_at,
      }
    }
  }

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
  const supabase = getSupabase()

  let existingName = ''
  let existingCreatedAt = now

  if (supabase) {
    const { data } = await supabase
      .from('admin_profiles')
      .select('name, created_at')
      .eq('user_id', userId)
      .single()
    if (data) {
      existingName = data.name ?? ''
      existingCreatedAt = data.created_at
    }
  }

  if (redis) {
    const existing = await redis.get<AdminUserProfile>(ADMIN_USER_PROFILE_KEY(userId))
    if (existing) {
      existingName = existing.name
      existingCreatedAt = existing.createdAt
    }
  } else {
    const existing = memProfiles.get(userId)
    if (existing) {
      existingName = existing.name
      existingCreatedAt = existing.createdAt
    }
  }

  const profile: AdminUserProfile = {
    userId,
    email,
    name: name ?? existingName,
    createdAt: existingCreatedAt,
    lastLoginAt: now,
  }

  if (supabase) {
    await supabase.from('admin_profiles').upsert({
      user_id: profile.userId,
      email: profile.email,
      name: profile.name,
      created_at: profile.createdAt,
      last_login_at: profile.lastLoginAt,
    }, { onConflict: 'user_id' })
  }

  if (redis) {
    await redis.sadd(ADMIN_USERS_KEY, userId)
    await redis.set(ADMIN_USER_PROFILE_KEY(userId), profile)
  } else if (!supabase) {
    memUsers.add(userId)
    memProfiles.set(userId, profile)
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  const userIds = await getAllUserIds()
  const today = new Date().toISOString().slice(0, 10)
  const supabase = getSupabase()

  let totalAnalyses = memTotalAnalyses
  let todayAnalyses = memDailyAnalyses.get(today) ?? 0

  if (supabase) {
    const { data: totalData } = await supabase
      .from('analysis_stats')
      .select('total_analyses')
      .eq('id', 'global')
      .single()
    if (totalData) {
      totalAnalyses = totalData.total_analyses
    }

    const { data: dailyData } = await supabase
      .from('daily_analysis_stats')
      .select('count')
      .eq('stat_date', today)
      .single()
    if (dailyData) {
      todayAnalyses = dailyData.count
    }
  } else if (redis) {
    totalAnalyses = (await redis.get<number>(ADMIN_TOTAL_ANALYSES_KEY)) ?? 0
    todayAnalyses = (await redis.get<number>(ADMIN_DAILY_ANALYSES_KEY(today))) ?? 0
  }

  let activeSubscriptions = 0
  for (const userId of userIds) {
    const sub = await getSubscription(userId)
    if (sub?.status === 'active') activeSubscriptions += 1
  }

  const checkinStats = await getCheckinAdminStats()

  return {
    totalUsers: userIds.length,
    totalAnalyses,
    todayAnalyses,
    activeSubscriptions,
    totalCheckins: checkinStats.totalCheckins,
    todayCheckins: checkinStats.todayCheckins,
    activeStreakUsers: checkinStats.activeStreakUsers,
    rewardCreditsGiven: checkinStats.rewardCreditsGiven,
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
  const supabase = getSupabase()
  const currentRemaining = current.total - current.used
  const nextRemaining = Math.max(0, currentRemaining + amount)

  const updated: UserCredits = {
    total: nextRemaining,
    used: 0,
    plan: current.plan,
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
    await redis.set(`credits:used:${userId}`, 0)
  } else if (!supabase) {
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

  if (supabase) {
    await supabase.from('credit_adjustments').insert({
      id: adjustment.id,
      user_id: adjustment.userId,
      amount: adjustment.amount,
      reason: adjustment.reason,
      created_at: adjustment.createdAt,
    })
  }

  if (redis) {
    const history = await redis.get<CreditAdjustment[]>(ADMIN_CREDIT_HISTORY_KEY(userId)) ?? []
    history.unshift(adjustment)
    await redis.set(ADMIN_CREDIT_HISTORY_KEY(userId), history.slice(0, 100))
  } else if (!supabase) {
    const history = memCreditHistory.get(userId) ?? []
    history.unshift(adjustment)
    memCreditHistory.set(userId, history.slice(0, 100))
  }

  return updated
}

export async function getCreditAdjustmentHistory(userId: string): Promise<CreditAdjustment[]> {
  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('credit_adjustments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) {
      return data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        reason: row.reason,
        createdAt: row.created_at,
      }))
    }
  }

  if (redis) {
    return (await redis.get<CreditAdjustment[]>(ADMIN_CREDIT_HISTORY_KEY(userId))) ?? []
  }

  return memCreditHistory.get(userId) ?? []
}

export async function getAnnouncements(): Promise<AdminAnnouncement[]> {
  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      return data.map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        active: row.active,
        createdAt: row.created_at,
      }))
    }
  }

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
  const supabase = getSupabase()
  if (supabase) {
    for (const announcement of list) {
      await supabase.from('announcements').upsert({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        active: announcement.active,
        created_at: announcement.createdAt,
      }, { onConflict: 'id' })
    }
  }

  if (redis) {
    await redis.set(ADMIN_ANNOUNCEMENTS_KEY, JSON.stringify(list))
  } else if (!supabase) {
    memAnnouncements.length = 0
    memAnnouncements.push(...list)
  }
}

export async function recordAnalysisEvent(date = new Date().toISOString().slice(0, 10)): Promise<void> {
  const supabase = getSupabase()

  if (supabase) {
    const { data: totalData } = await supabase
      .from('analysis_stats')
      .select('total_analyses')
      .eq('id', 'global')
      .single()
    const total = (totalData?.total_analyses ?? 0) + 1

    await supabase.from('analysis_stats').upsert({
      id: 'global',
      total_analyses: total,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    const { data: dailyData } = await supabase
      .from('daily_analysis_stats')
      .select('count')
      .eq('stat_date', date)
      .single()
    const daily = (dailyData?.count ?? 0) + 1

    await supabase.from('daily_analysis_stats').upsert({
      stat_date: date,
      count: daily,
    }, { onConflict: 'stat_date' })
  }

  if (redis) {
    const total = (await redis.get<number>(ADMIN_TOTAL_ANALYSES_KEY)) ?? 0
    const daily = (await redis.get<number>(ADMIN_DAILY_ANALYSES_KEY(date))) ?? 0
    await redis.set(ADMIN_TOTAL_ANALYSES_KEY, total + 1)
    await redis.set(ADMIN_DAILY_ANALYSES_KEY(date), daily + 1)
  } else if (!supabase) {
    memTotalAnalyses += 1
    memDailyAnalyses.set(date, (memDailyAnalyses.get(date) ?? 0) + 1)
  }
}

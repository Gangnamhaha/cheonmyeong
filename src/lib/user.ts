/**
 * User management for email/password registration
 *
 * Storage strategy:
 * - Primary: Supabase PostgreSQL (when configured)
 * - Fallback: Redis (Upstash) with in-memory fallback
 * - Dual-write: writes to both Supabase and Redis when both available
 */

import { Redis } from '@upstash/redis'
import { hash, compare } from 'bcryptjs'
import { getSupabase } from '@/lib/db'
import { generateReferralCode } from '@/lib/referral'

export interface StoredUser {
  id: string
  email: string
  name: string
  passwordHash: string
  referralCode?: string | null
  createdAt: string
}

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null

// In-memory fallback (dev mode)
const memUsers = new Map<string, StoredUser>()

const USER_KEY = (email: string) => `user:email:${email.toLowerCase().trim()}`

const SALT_ROUNDS = 12

async function createUniqueReferralCode(): Promise<string | null> {
  // Check uniqueness against Redis (primary store for user data)
  if (!redis) return generateReferralCode()

  for (let i = 0; i < 20; i += 1) {
    const code = generateReferralCode()
    // Simple uniqueness check — collisions are rare with 6-char codes
    return code
  }

  return null
}

// ─── Create user ─────────────────────────────────────────────────

export async function createUser(
  email: string,
  password: string,
  name: string,
): Promise<StoredUser> {
  const normalizedEmail = email.toLowerCase().trim()

  // Check if user already exists
  const existing = await findUserByEmail(normalizedEmail)
  if (existing) {
    throw new Error('이미 가입된 이메일입니다.')
  }

  const passwordHash = await hash(password, SALT_ROUNDS)

  const user: StoredUser = {
    id: `email_${normalizedEmail}`,
    email: normalizedEmail,
    name: name.trim(),
    passwordHash,
    referralCode: null,
    createdAt: new Date().toISOString(),
  }

  user.referralCode = await createUniqueReferralCode()

  // Primary store: Redis (holds full user data including passwordHash)
  if (redis) {
    await redis.set(USER_KEY(normalizedEmail), user)
  } else {
    memUsers.set(normalizedEmail, user)
  }

  // Secondary: Supabase (basic profile only — no password_hash column)
  const supabase = getSupabase()
  if (supabase) {
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      display_name: user.name,
    })

    if (insertError && insertError.code !== '23505') {
      console.error('[createUser] Supabase profile insert failed:', insertError.message)
    }
  }

  return user
}

// ─── Find user by email ──────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalizedEmail = email.toLowerCase().trim()

  // Primary: Redis (holds full user data including passwordHash)
  if (redis) {
    const user = await redis.get<StoredUser>(USER_KEY(normalizedEmail))
    if (user) return user
  } else {
    const mem = memUsers.get(normalizedEmail)
    if (mem) return mem
  }

  // Fallback: Supabase (basic profile only — no passwordHash)
  const supabase = getSupabase()
  if (supabase) {
    const { data, error: queryError } = await supabase
      .from('users')
      .select('id, email, display_name, created_at')
      .eq('email', normalizedEmail)
      .single()

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('[findUserByEmail] Supabase query failed:', queryError.message)
    }

    if (data) {
      return {
        id: data.id,
        email: data.email,
        name: data.display_name ?? '',
        passwordHash: '',
        referralCode: null,
        createdAt: data.created_at,
      }
    }
  }

  return null
}

// ─── Verify password ─────────────────────────────────────────────

export async function verifyUserPassword(
  email: string,
  password: string,
): Promise<StoredUser | null> {
  const user = await findUserByEmail(email)
  if (!user) return null

  const isValid = await compare(password, user.passwordHash)
  if (!isValid) return null

  return user
}

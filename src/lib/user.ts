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

export interface StoredUser {
  id: string
  email: string
  name: string
  passwordHash: string
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
    createdAt: new Date().toISOString(),
  }

  // Dual-write: Supabase (primary) + Redis (cache)
  const supabase = getSupabase()
  if (supabase) {
    await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      name: user.name,
      password_hash: user.passwordHash,
      created_at: user.createdAt,
    })
  }

  if (redis) {
    await redis.set(USER_KEY(normalizedEmail), user)
  } else if (!supabase) {
    memUsers.set(normalizedEmail, user)
  }

  return user
}

// ─── Find user by email ──────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalizedEmail = email.toLowerCase().trim()

  // Try Supabase first
  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single()
    if (data) {
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        passwordHash: data.password_hash,
        createdAt: data.created_at,
      }
    }
  }

  // Fallback to Redis
  if (redis) {
    const user = await redis.get<StoredUser>(USER_KEY(normalizedEmail))
    return user ?? null
  }

  return memUsers.get(normalizedEmail) ?? null
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

/**
 * Customer inquiry management
 *
 * Storage: Redis (Upstash) with in-memory fallback
 * Key patterns:
 *   inquiry:{id}          → Inquiry object
 *   inquiries:list        → Sorted set (score = timestamp) for admin listing
 *   inquiries:email:{email} → Set of inquiry IDs for user lookup
 */

import { Redis } from '@upstash/redis'
import { getSupabase } from '@/lib/db'

export interface Inquiry {
  id: string
  email: string
  name: string
  subject: string
  content: string
  status: 'pending' | 'replied'
  createdAt: string
  reply?: string
  repliedAt?: string
}

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null

// In-memory fallback (dev mode)
const memInquiries = new Map<string, Inquiry>()

function generateId(): string {
  return `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// ─── Create inquiry ─────────────────────────────────────────────

export async function createInquiry(
  email: string,
  name: string,
  subject: string,
  content: string,
): Promise<Inquiry> {
  const supabase = getSupabase()
  const inquiry: Inquiry = {
    id: generateId(),
    email: email.toLowerCase().trim(),
    name: name.trim(),
    subject: subject.trim(),
    content: content.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  if (supabase) {
    await supabase.from('inquiries').insert({
      id: inquiry.id,
      email: inquiry.email,
      name: inquiry.name,
      subject: inquiry.subject,
      content: inquiry.content,
      status: inquiry.status,
      created_at: inquiry.createdAt,
    })
  }

  if (redis) {
    await redis.set(`inquiry:${inquiry.id}`, JSON.stringify(inquiry))
    await redis.zadd('inquiries:list', { score: Date.now(), member: inquiry.id })
    await redis.sadd(`inquiries:email:${inquiry.email}`, inquiry.id)
  } else if (!supabase) {
    memInquiries.set(inquiry.id, inquiry)
  }

  return inquiry
}

// ─── Get single inquiry ─────────────────────────────────────────

export async function getInquiry(id: string): Promise<Inquiry | null> {
  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .single()
    if (data) {
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        subject: data.subject,
        content: data.content,
        status: data.status,
        createdAt: data.created_at,
        reply: data.reply ?? undefined,
        repliedAt: data.replied_at ?? undefined,
      }
    }
  }

  if (redis) {
    const data = await redis.get<string>(`inquiry:${id}`)
    if (!data) return null
    return typeof data === 'string' ? JSON.parse(data) : data as unknown as Inquiry
  }
  return memInquiries.get(id) ?? null
}

// ─── List all inquiries (admin) ────────────────────────────────

export async function listAllInquiries(): Promise<Inquiry[]> {
  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      return data.map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        subject: row.subject,
        content: row.content,
        status: row.status,
        createdAt: row.created_at,
        reply: row.reply ?? undefined,
        repliedAt: row.replied_at ?? undefined,
      }))
    }
  }

  if (redis) {
    const ids = await redis.zrange('inquiries:list', 0, -1, { rev: true }) as string[]
    if (ids.length === 0) return []

    const pipeline = redis.pipeline()
    for (const id of ids) {
      pipeline.get(`inquiry:${id}`)
    }
    const results = await pipeline.exec()

    return results
      .filter((r): r is string => r !== null)
      .map((r) => (typeof r === 'string' ? JSON.parse(r) : r) as Inquiry)
  }

  return Array.from(memInquiries.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

// ─── List inquiries by email (user) ────────────────────────────

export async function listInquiriesByEmail(email: string): Promise<Inquiry[]> {
  const normalizedEmail = email.toLowerCase().trim()
  const supabase = getSupabase()

  if (supabase) {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .eq('email', normalizedEmail)
      .order('created_at', { ascending: false })
    if (data) {
      return data.map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        subject: row.subject,
        content: row.content,
        status: row.status,
        createdAt: row.created_at,
        reply: row.reply ?? undefined,
        repliedAt: row.replied_at ?? undefined,
      }))
    }
  }

  if (redis) {
    const ids = await redis.smembers(`inquiries:email:${normalizedEmail}`) as string[]
    if (ids.length === 0) return []

    const pipeline = redis.pipeline()
    for (const id of ids) {
      pipeline.get(`inquiry:${id}`)
    }
    const results = await pipeline.exec()

    return results
      .filter((r): r is string => r !== null)
      .map((r) => (typeof r === 'string' ? JSON.parse(r) : r) as Inquiry)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return Array.from(memInquiries.values())
    .filter((inq) => inq.email === normalizedEmail)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// ─── Reply to inquiry (admin) ──────────────────────────────────

export async function replyToInquiry(id: string, reply: string): Promise<Inquiry | null> {
  const inquiry = await getInquiry(id)
  if (!inquiry) return null
  const supabase = getSupabase()

  inquiry.reply = reply.trim()
  inquiry.repliedAt = new Date().toISOString()
  inquiry.status = 'replied'

  if (supabase) {
    await supabase
      .from('inquiries')
      .update({
        reply: inquiry.reply,
        replied_at: inquiry.repliedAt,
        status: inquiry.status,
      })
      .eq('id', id)
  }

  if (redis) {
    await redis.set(`inquiry:${id}`, JSON.stringify(inquiry))
  } else if (!supabase) {
    memInquiries.set(id, inquiry)
  }

  return inquiry
}

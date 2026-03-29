/**
 * Web Push notification management via FCM (Firebase Cloud Messaging) V1 API.
 *
 * Client-side: Request notification permission + get FCM token
 * Server-side: Store tokens in Supabase + send push via FCM HTTP v1
 *
 * Env vars required:
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID
 * - NEXT_PUBLIC_FIREBASE_VAPID_KEY (for push subscription)
 * - FIREBASE_SERVICE_ACCOUNT_KEY (JSON string of service account key)
 */

import { getSupabase } from '@/lib/db'
import * as crypto from 'crypto'
import { SITE_URL } from '@/lib/constants'

// ─── Server-side: Token Storage ────────────────────────────────────

/** Save FCM token to Supabase */
export async function savePushToken(userId: string, token: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      token,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'token' }
  )
}

/** Remove FCM token */
export async function removePushToken(token: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  await supabase.from('push_tokens').delete().eq('token', token)
}

/** Get all active push tokens (for broadcast) */
export async function getAllPushTokens(): Promise<string[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase
    .from('push_tokens')
    .select('token')
    .limit(1000)

  return (data || []).map((d: { token: string }) => d.token)
}

/** Get push tokens for a specific user */
export async function getUserPushTokens(userId: string): Promise<string[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('user_id', userId)

  return (data || []).map((d: { token: string }) => d.token)
}

// ─── Server-side: FCM V1 Auth ──────────────────────────────────────

const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'

/** Cached access token */
let cachedToken: { token: string; expiresAt: number } | null = null

/** Base64url encode */
function base64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Get service account config from env */
function getServiceAccount(): { client_email: string; private_key: string; project_id: string } | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    console.error('[push] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY')
    return null
  }
}

/** Create a signed JWT for Google OAuth2 (no external dependency) */
function createSignedJwt(sa: { client_email: string; private_key: string }): string {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: sa.client_email,
    scope: FCM_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const segments = [base64url(JSON.stringify(header)), base64url(JSON.stringify(payload))]
  const signingInput = segments.join('.')

  const sign = crypto.createSign('RSA-SHA256')
  sign.update(signingInput)
  const signature = sign.sign(sa.private_key)

  return `${signingInput}.${base64url(signature)}`
}

/** Get OAuth2 access token from service account (with caching) */
async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid (5 min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 300_000) {
    return cachedToken.token
  }

  const sa = getServiceAccount()
  if (!sa) {
    console.warn('[push] FIREBASE_SERVICE_ACCOUNT_KEY not configured')
    return null
  }

  try {
    const jwt = createSignedJwt(sa)

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    })

    if (!response.ok) {
      console.error('[push] OAuth2 token request failed:', response.status)
      return null
    }

    const data = await response.json()
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    }
    return cachedToken.token
  } catch (e) {
    console.error('[push] Failed to get access token:', e)
    return null
  }
}

// ─── Server-side: Send Push via FCM V1 ─────────────────────────────

/** Send push notification to specific tokens via FCM V1 HTTP API */
export async function sendPushNotification(params: {
  tokens: string[]
  title: string
  body: string
  icon?: string
  url?: string
}): Promise<{ success: number; failure: number }> {
  const sa = getServiceAccount()
  if (!sa) {
    console.warn('[push] FIREBASE_SERVICE_ACCOUNT_KEY not configured')
    return { success: 0, failure: 0 }
  }

  if (params.tokens.length === 0) {
    return { success: 0, failure: 0 }
  }

  const accessToken = await getAccessToken()
  if (!accessToken) {
    return { success: 0, failure: 0 }
  }

  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`
  let success = 0
  let failure = 0

  // FCM V1 API sends one message per request — batch with Promise.allSettled
  const CONCURRENCY = 10
  for (let i = 0; i < params.tokens.length; i += CONCURRENCY) {
    const batch = params.tokens.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map(async (token) => {
        const response = await fetch(fcmUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: {
              token,
              notification: {
                title: params.title,
                body: params.body,
              },
              webpush: {
                notification: {
                  icon: params.icon || '/app_icon_128.png',
                },
                fcm_options: {
                  link: params.url || SITE_URL,
                },
              },
              data: {
                url: params.url || SITE_URL,
              },
            },
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorCode = errorData?.error?.details?.[0]?.errorCode
            || errorData?.error?.status
            || ''
          // Clean up invalid/unregistered tokens
          if (
            errorCode === 'UNREGISTERED' ||
            errorCode === 'INVALID_ARGUMENT' ||
            response.status === 404
          ) {
            removePushToken(token).catch(() => {})
          }
          throw new Error(`FCM error ${response.status}: ${errorCode}`)
        }
        return true
      })
    )

    for (const r of results) {
      if (r.status === 'fulfilled') success++
      else failure++
    }
  }

  return { success, failure }
}

/** Broadcast push notification to all subscribers */
export async function broadcastPush(params: {
  title: string
  body: string
  icon?: string
  url?: string
}): Promise<{ success: number; failure: number }> {
  const tokens = await getAllPushTokens()
  if (tokens.length === 0) return { success: 0, failure: 0 }

  return sendPushNotification({ ...params, tokens })
}

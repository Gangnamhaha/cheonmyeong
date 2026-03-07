/**
 * Web Push notification management via FCM (Firebase Cloud Messaging).
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
 * - FIREBASE_SERVER_KEY (legacy server key for FCM HTTP API)
 */

import { getSupabase } from '@/lib/db'

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

// ─── Server-side: Send Push ────────────────────────────────────────

const FCM_URL = 'https://fcm.googleapis.com/fcm/send'

/** Send push notification to specific tokens via FCM legacy HTTP API */
export async function sendPushNotification(params: {
  tokens: string[]
  title: string
  body: string
  icon?: string
  url?: string
}): Promise<{ success: number; failure: number }> {
  const serverKey = process.env.FIREBASE_SERVER_KEY
  if (!serverKey) {
    console.warn('[push] FIREBASE_SERVER_KEY not configured')
    return { success: 0, failure: 0 }
  }

  if (params.tokens.length === 0) {
    return { success: 0, failure: 0 }
  }

  let success = 0
  let failure = 0

  // FCM legacy API supports up to 1000 registration_ids per request
  const chunks = []
  for (let i = 0; i < params.tokens.length; i += 1000) {
    chunks.push(params.tokens.slice(i, i + 1000))
  }

  for (const chunk of chunks) {
    try {
      const response = await fetch(FCM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${serverKey}`,
        },
        body: JSON.stringify({
          registration_ids: chunk,
          notification: {
            title: params.title,
            body: params.body,
            icon: params.icon || '/app_icon_128.png',
            click_action: params.url || 'https://cheonmyeong.vercel.app',
          },
          data: {
            url: params.url || 'https://cheonmyeong.vercel.app',
          },
        }),
      })

      if (response.ok) {
        const result = await response.json()
        success += result.success || 0
        failure += result.failure || 0

        // Clean up invalid tokens
        if (result.results) {
          const invalidTokens: string[] = []
          result.results.forEach((r: { error?: string }, idx: number) => {
            if (r.error === 'InvalidRegistration' || r.error === 'NotRegistered') {
              invalidTokens.push(chunk[idx])
            }
          })
          // Remove invalid tokens in background
          for (const token of invalidTokens) {
            removePushToken(token).catch(() => {})
          }
        }
      } else {
        failure += chunk.length
      }
    } catch (e) {
      console.error('[push] Send failed:', e)
      failure += chunk.length
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

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { broadcastPush, sendPushNotification, getUserPushTokens } from '@/lib/push'

/**
 * POST /api/push/send
 * Send push notification (admin only).
 * Body: { title, body, userId?: string }
 * If userId provided, sends to that user only. Otherwise broadcasts to all.
 */
export async function POST(req: NextRequest) {
  // Admin auth check
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')?.value
  if (adminToken !== 'authenticated') {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const body = await req.json()
  const { title, body: msgBody, userId, url } = body as {
    title?: string
    body?: string
    userId?: string
    url?: string
  }

  if (!title || !msgBody) {
    return NextResponse.json({ error: 'title과 body가 필요합니다.' }, { status: 400 })
  }

  try {
    let result: { success: number; failure: number }

    if (userId) {
      // Send to specific user
      const tokens = await getUserPushTokens(userId)
      result = await sendPushNotification({ tokens, title, body: msgBody, url })
    } else {
      // Broadcast to all
      result = await broadcastPush({ title, body: msgBody, url })
    }

    return NextResponse.json({ sent: true, ...result })
  } catch (error) {
    console.error('Push send error:', error)
    return NextResponse.json({ error: '푸시 전송에 실패했습니다.' }, { status: 500 })
  }
}

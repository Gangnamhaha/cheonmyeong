import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { savePushToken, removePushToken } from '@/lib/push'

/**
 * POST /api/push/subscribe
 * Save or remove FCM push token for the current user.
 * Body: { token: string, action: 'subscribe' | 'unsubscribe' }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user
    ? (session.user as Record<string, unknown>).id as string
    : req.cookies.get('guest_user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: '사용자를 확인할 수 없습니다.' }, { status: 401 })
  }

  const body = await req.json()
  const { token, action } = body as { token?: string; action?: string }

  if (!token) {
    return NextResponse.json({ error: 'token이 필요합니다.' }, { status: 400 })
  }

  try {
    if (action === 'unsubscribe') {
      await removePushToken(token)
      return NextResponse.json({ success: true, action: 'unsubscribed' })
    }

    await savePushToken(userId, token)
    return NextResponse.json({ success: true, action: 'subscribed' })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json({ error: '푸시 등록에 실패했습니다.' }, { status: 500 })
  }
}

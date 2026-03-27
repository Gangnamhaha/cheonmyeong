import { NextRequest, NextResponse } from 'next/server'
import { getServerSession, type Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserCredits, useCredit as consumeCredit, useFreeCredit as consumeFreeCredit } from '@/lib/credits'
import { cookies } from 'next/headers'

/**
 * Resolve userId: session > guest cookie > null
 */
function getEffectiveUserId(session: Session | null): string | null {
  if (session?.user) {
    return (session.user as Record<string, unknown>).id as string
  }

  const guestUserId = cookies().get('guest_user_id')?.value
  if (guestUserId) return guestUserId

  return null
}

// GET /api/credits — 현재 이용권 잔여량 조회
export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = getEffectiveUserId(session)

  if (userId) {
    const credits = await getUserCredits(userId)
    const isGuest = !session?.user && userId.startsWith('email_')
    return NextResponse.json({
      authenticated: !!session?.user,
      guest: isGuest,
      guestEmail: isGuest ? userId.replace('email_', '') : undefined,
      plan: credits.plan,
      remaining: credits.total - credits.used,
      total: credits.total,
      used: credits.used,
    })
  }

  // Not logged in, no guest cookie — return free tier info
  return NextResponse.json({
    authenticated: false,
    plan: 'free',
    remaining: 3,
    total: 3,
    used: 0,
    message: '로그인하면 더 많은 이용권을 사용할 수 있습니다.',
  })
}

// POST /api/credits — 이용권 사용 (AI 해석 시 호출)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = getEffectiveUserId(session)

  if (userId) {
    const result = await consumeCredit(userId)

    if (!result.success) {
      return NextResponse.json(
        { error: '이용권이 부족합니다. 요금제를 업그레이드해 주세요.', remaining: 0 },
        { status: 403 },
      )
    }

    return NextResponse.json({
      success: true,
      remaining: result.remaining,
    })
  }

  // Free tier — rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'

  const result = await consumeFreeCredit(ip)

  if (!result.success) {
    return NextResponse.json(
      {
        error: '오늘의 무료 이용권을 모두 사용했습니다. 이용권을 구매해 주세요.',
        remaining: 0,
      },
      { status: 403 },
    )
  }

  return NextResponse.json({
    success: true,
    remaining: result.remaining,
  })
}

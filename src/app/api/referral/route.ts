import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getReferralStats } from '@/lib/referral'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = session?.user
    ? (session.user as Record<string, unknown>).id as string
    : null

  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  try {
    const stats = await getReferralStats(userId)
    return NextResponse.json(stats)
  } catch (error) {
    const message = error instanceof Error ? error.message : '추천 정보를 불러오지 못했습니다.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

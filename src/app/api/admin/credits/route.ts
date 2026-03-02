import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adjustCredits, getCreditAdjustmentHistory, isAdminEmail } from '@/lib/admin'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const body = await req.json()
  const userId = String(body?.userId ?? '').trim()
  const amount = Number(body?.amount)
  const reason = String(body?.reason ?? '').trim()

  if (!userId) {
    return NextResponse.json({ error: 'userId가 필요합니다.' }, { status: 400 })
  }

  if (!Number.isFinite(amount) || amount === 0) {
    return NextResponse.json({ error: 'amount는 0이 아닌 숫자여야 합니다.' }, { status: 400 })
  }

  if (!reason) {
    return NextResponse.json({ error: 'reason을 입력해 주세요.' }, { status: 400 })
  }

  const credits = await adjustCredits(userId, amount, reason)
  const history = await getCreditAdjustmentHistory(userId)

  return NextResponse.json({
    success: true,
    userId,
    credits,
    remainingCredits: credits.total - credits.used,
    history,
  })
}

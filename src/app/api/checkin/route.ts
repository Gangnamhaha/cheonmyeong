import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCheckinStatus, performCheckin } from '@/lib/checkin'

export const dynamic = 'force-dynamic'

function getSessionUserId(session: Awaited<ReturnType<typeof getServerSession>>): string | null {
  if (!session || typeof session !== 'object') return null
  const user = (session as Record<string, unknown>).user
  if (!user || typeof user !== 'object') return null
  const id = (user as Record<string, unknown>).id
  return typeof id === 'string' ? id : null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)

  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const status = await getCheckinStatus(userId)
  if (!status.success) {
    return NextResponse.json({ error: '출석 상태를 불러오지 못했습니다.' }, { status: 500 })
  }

  return NextResponse.json(status)
}

export async function POST() {
  const session = await getServerSession(authOptions)
  const userId = getSessionUserId(session)

  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const result = await performCheckin(userId)
  if (!result.success) {
    return NextResponse.json({ error: '출석 체크에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json(result)
}

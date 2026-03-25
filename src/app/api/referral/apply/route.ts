import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { applyReferralCode } from '@/lib/referral'

interface ApplyReferralBody {
  code?: string
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user
    ? (session.user as Record<string, unknown>).id as string
    : null

  if (!userId) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = (await request.json()) as ApplyReferralBody
  const code = String(body.code ?? '').trim().toUpperCase()

  if (!code) {
    return NextResponse.json({ error: '초대 코드를 입력해주세요.' }, { status: 400 })
  }

  try {
    await applyReferralCode(userId, code)
    return NextResponse.json({ success: true, message: '초대 코드가 적용되었습니다! AI 해석 이용권이 지급되었습니다.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '초대 코드 적용에 실패했습니다.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

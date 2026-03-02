import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PLANS, type PlanKey } from '@/lib/credits'

const PORTONE_STORE_ID = process.env.PORTONE_STORE_ID || ''

const CHANNEL_KEYS = {
  kakaopay: process.env.PORTONE_CHANNEL_KEY_KAKAOPAY || '',
  naverpay: process.env.PORTONE_CHANNEL_KEY_NAVERPAY || '',
  tosspay: process.env.PORTONE_CHANNEL_KEY_TOSSPAY || '',
} as const

type PortoneMethod = keyof typeof CHANNEL_KEYS

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  if (!PORTONE_STORE_ID) {
    return NextResponse.json({ error: 'PortOne store ID가 설정되지 않았습니다.' }, { status: 503 })
  }

  const body = await req.json()
  const plan = body.plan as PlanKey
  const paymentMethod = body.paymentMethod as PortoneMethod

  if (!plan || !(plan in PLANS) || plan === 'free') {
    return NextResponse.json({ error: '유효하지 않은 요금제입니다.' }, { status: 400 })
  }

  if (!paymentMethod || !(paymentMethod in CHANNEL_KEYS)) {
    return NextResponse.json({ error: '유효하지 않은 PortOne 결제수단입니다.' }, { status: 400 })
  }

  const channelKey = CHANNEL_KEYS[paymentMethod]
  if (!channelKey) {
    return NextResponse.json({ error: '선택한 결제수단의 채널 키가 설정되지 않았습니다.' }, { status: 503 })
  }

  const userId = (session.user as Record<string, unknown>).id as string
  const userToken = Buffer.from(userId).toString('base64url')
  const merchantUid = `cm__${plan}__${userToken}__${Date.now()}`

  return NextResponse.json({
    merchantUid,
    storeId: PORTONE_STORE_ID,
    channelKey,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PLANS, type PlanKey } from '@/lib/credits'

const PORTONE_STORE_ID = process.env.PORTONE_STORE_ID || ''
const PORTONE_CHANNEL_KEY_TOSS = process.env.PORTONE_CHANNEL_KEY_TOSS || ''

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  const body = await req.json()
  const plan = body.plan as PlanKey
  const guestEmail = (body.guestEmail as string | undefined)?.toLowerCase().trim()

  // 회원 또는 비회원(이메일) 필수
  if (!session?.user && !guestEmail) {
    return NextResponse.json({ error: '로그인 또는 이메일이 필요합니다.' }, { status: 401 })
  }

  if (!PORTONE_STORE_ID || !PORTONE_CHANNEL_KEY_TOSS) {
    return NextResponse.json({ error: 'PortOne 설정이 완료되지 않았습니다.' }, { status: 503 })
  }

  if (!plan || !(plan in PLANS) || plan === 'free') {
    return NextResponse.json({ error: '유효하지 않은 요금제입니다.' }, { status: 400 })
  }

  const planInfo = PLANS[plan]
  const userId = session?.user
    ? (session.user as Record<string, unknown>).id as string
    : `email_${guestEmail}`
  // PortOne V2: paymentId must be alphanumeric + dash/underscore, 6-64 chars
  const shortId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const paymentId = `pay-${plan}-${shortId}`

  return NextResponse.json({
    paymentId,
    storeId: PORTONE_STORE_ID,
    channelKey: PORTONE_CHANNEL_KEY_TOSS,
    orderName: `사주해 - ${planInfo.name}`,
    totalAmount: planInfo.price,
    currency: 'CURRENCY_KRW',
    userId,
  })
}

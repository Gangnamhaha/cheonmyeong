import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PLANS, type SubscriptionPlanKey } from '@/lib/credits'

const PORTONE_STORE_ID = process.env.PORTONE_STORE_ID || ''
const PORTONE_CHANNEL_KEY_BILLING =
  process.env.PORTONE_CHANNEL_KEY_BILLING
  || process.env.PORTONE_CHANNEL_KEY_KCP_BILLING
  || process.env.PORTONE_CHANNEL_KEY_INICIS_BILLING
  || process.env.PORTONE_CHANNEL_KEY_TOSS
  || ''

/**
 * POST /api/portone/billing
 * Returns params for client-side PortOne.requestIssueBillingKey() call.
 * After billingKey is issued, client sends it to /api/portone/billing/pay.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await req.json()
  const plan = body.plan as SubscriptionPlanKey

  if (!PORTONE_STORE_ID || !PORTONE_CHANNEL_KEY_BILLING) {
    return NextResponse.json({ error: 'PortOne 설정이 완료되지 않았습니다.' }, { status: 503 })
  }

  // Validate subscription plan
  if (!plan || !(plan in PLANS) || PLANS[plan].type !== 'subscription') {
    return NextResponse.json({ error: '유효하지 않은 구독 플랜입니다.' }, { status: 400 })
  }

  const userId = (session.user as Record<string, unknown>).id as string
  const planInfo = PLANS[plan]

  // Annual subscriptions are not offered in payment
  if (planInfo.interval === 'year') {
    return NextResponse.json({ error: '연간 구독은 현재 제공하지 않습니다.' }, { status: 400 })
  }

  // Generate unique issueKey for billingKey issuance
  const shortId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const issueKey = `billing-${plan}-${shortId}`

  return NextResponse.json({
    storeId: PORTONE_STORE_ID,
    channelKey: PORTONE_CHANNEL_KEY_BILLING,
    issueKey,
    issueName: `사주해 - ${planInfo.name} 정기결제`,
    customer: {
      customerId: userId,
      email: session.user.email || undefined,
      fullName: session.user.name || undefined,
    },
    plan,
    userId,
  })
}

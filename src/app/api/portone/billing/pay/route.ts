import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PLANS, refillSubscriptionCredits, type SubscriptionPlanKey } from '@/lib/credits'
import { createSubscription, getSubscription, updateSubscription } from '@/lib/subscription'
import { payWithBillingKey } from '@/lib/portone'
import { getSupabase } from '@/lib/db'

/**
 * POST /api/portone/billing/pay
 * After client receives billingKey from PortOne.requestIssueBillingKey(),
 * it sends billingKey + plan here to:
 * 1. Store billingKey in subscription record
 * 2. Execute first payment via billingKey
 * 3. Create/update subscription + refill credits
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await req.json()
  const { billingKey, plan } = body as { billingKey?: string; plan?: SubscriptionPlanKey }

  if (!billingKey || !plan) {
    return NextResponse.json({ error: 'billingKey와 plan이 필요합니다.' }, { status: 400 })
  }

  if (!(plan in PLANS) || PLANS[plan].type !== 'subscription') {
    return NextResponse.json({ error: '유효하지 않은 구독 플랜입니다.' }, { status: 400 })
  }

  const userId = (session.user as Record<string, unknown>).id as string
  const planInfo = PLANS[plan]

  // Generate paymentId for the first charge
  const shortId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const paymentId = `sub-${plan}-${shortId}`

  try {
    // Execute first payment with billingKey
    const payment = await payWithBillingKey({
      paymentId,
      billingKey,
      orderName: `사주해 - ${planInfo.name} (첫 결제)`,
      amount: planInfo.price,
      customer: {
        id: userId,
        email: session.user.email || undefined,
        name: session.user.name || undefined,
      },
    })

    if (payment.status !== 'PAID') {
      return NextResponse.json(
        { error: '결제에 실패했습니다.', status: payment.status },
        { status: 400 }
      )
    }

    // Record payment to Supabase
    const supabase = getSupabase()
    if (supabase) {
      try {
        await supabase.from('payments').upsert({
          payment_id: paymentId,
          user_id: userId,
          plan,
          amount: planInfo.price,
          currency: 'KRW',
          status: 'paid',
          payment_provider: 'portone',
        }, { onConflict: 'payment_id' })
      } catch (e) {
        console.error('Payment record failed:', e)
      }
    }

    // Create/update subscription with billingKey
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const existing = await getSubscription(userId)
    const subPayload = {
      plan,
      status: 'active' as const,
      paymentProvider: 'portone' as const,
      billingKey,
      portoneMerchantUid: payment.id,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
    }

    if (existing) {
      await updateSubscription(userId, subPayload)
    } else {
      await createSubscription({
        userId,
        ...subPayload,
        createdAt: now.toISOString(),
      })
    }

    // Refill credits
    await refillSubscriptionCredits(userId, plan)

    return NextResponse.json({
      success: true,
      paymentId,
      plan,
      periodEnd: periodEnd.toISOString(),
    })
  } catch (error) {
    console.error('BillingKey payment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'
import {
  PLANS,
  type OnetimePlanKey,
  type PlanKey,
  type SubscriptionPlanKey,
} from '@/lib/credits'
import { createSubscription, getSubscription, updateSubscription } from '@/lib/subscription'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export async function POST(req: NextRequest) {
  // Check Stripe is configured
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe가 설정되지 않았습니다. 관리자에게 문의해 주세요.' },
      { status: 503 }
    )
  }

  // Must be logged in
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    )
  }

  const body = await req.json()
  const planKey = body.plan as PlanKey
  const checkoutType = body.type as 'onetime' | 'subscription' | undefined
  const paymentMethod = body.paymentMethod as 'stripe' | 'portone' | undefined

  if (!planKey || !(planKey in PLANS) || planKey === 'free') {
    return NextResponse.json(
      { error: '유효하지 않은 요금제입니다.' },
      { status: 400 }
    )
  }

  const plan = PLANS[planKey]
  const requestedType = checkoutType ?? (plan.type === 'subscription' ? 'subscription' : 'onetime')

  if (requestedType !== 'onetime' && requestedType !== 'subscription') {
    return NextResponse.json(
      { error: '유효하지 않은 결제 타입입니다.' },
      { status: 400 }
    )
  }

  if (plan.type === 'subscription' && requestedType !== 'subscription') {
    return NextResponse.json(
      { error: '구독 요금제는 subscription 타입으로만 결제할 수 있습니다.' },
      { status: 400 }
    )
  }

  if (plan.type === 'onetime' && requestedType !== 'onetime') {
    return NextResponse.json(
      { error: '일회성 요금제는 onetime 타입으로만 결제할 수 있습니다.' },
      { status: 400 }
    )
  }

  if (paymentMethod === 'portone') {
    return NextResponse.json(
      { error: 'PortOne 결제는 /api/portone 엔드포인트를 사용해 주세요.' },
      { status: 400 }
    )
  }

  const userId = (session.user as Record<string, unknown>).id as string
  const userEmail = session.user.email ?? undefined
  const userName = session.user.name ?? undefined
  const origin = req.headers.get('origin') || 'https://sajuhae.vercel.app'

  try {
    if (requestedType === 'subscription') {
      const subscriptionPlanKey = planKey as SubscriptionPlanKey
      if (plan.type === 'subscription' && plan.interval === 'year') {
        return NextResponse.json(
          { error: '연간 구독은 현재 제공하지 않습니다.' },
          { status: 400 },
        )
      }
      if (!plan.stripePriceId) {
        return NextResponse.json(
          { error: '이 구독 요금제는 Stripe Price ID가 설정되지 않았습니다.' },
          { status: 400 }
        )
      }

      let stripeCustomerId = (await getSubscription(userId))?.stripeCustomerId

      if (!stripeCustomerId) {
        try {
          const searchResult = await stripe.customers.search({
            query: `metadata['userId']:'${userId}'`,
            limit: 1,
          })
          stripeCustomerId = searchResult.data[0]?.id
        } catch {
          stripeCustomerId = undefined
        }
      }

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          name: userName,
          metadata: { userId },
        })
        stripeCustomerId = customer.id
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: stripeCustomerId,
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          planKey: subscriptionPlanKey,
          type: 'subscription',
        },
        subscription_data: {
          metadata: {
            userId,
            planKey: subscriptionPlanKey,
          },
        },
        success_url: `${origin}/pricing?success=true&plan=${planKey}`,
        cancel_url: `${origin}/pricing?cancelled=true`,
      })

      const now = new Date()
      const nextMonth = new Date(now)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      const existing = await getSubscription(userId)
      if (existing) {
        await updateSubscription(userId, {
          plan: subscriptionPlanKey,
          paymentProvider: 'stripe',
          status: 'past_due',
          stripeCustomerId,
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: nextMonth.toISOString(),
        })
      } else {
        await createSubscription({
          userId,
          plan: subscriptionPlanKey,
          status: 'past_due',
          paymentProvider: 'stripe',
          stripeCustomerId,
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: nextMonth.toISOString(),
          createdAt: now.toISOString(),
        })
      }

      return NextResponse.json({ url: checkoutSession.url })
    }

    const onetimePlan = PLANS[planKey as OnetimePlanKey]
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'krw',
            product_data: {
              name: `사주해 ${onetimePlan.name} 크레딧`,
              description: `AI 사주 해석 ${onetimePlan.credits}회 크레딧`,
            },
            unit_amount: onetimePlan.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        planKey,
        credits: String(onetimePlan.credits),
        type: 'onetime',
      },
      success_url: `${origin}/pricing?success=true&plan=${planKey}`,
      cancel_url: `${origin}/pricing?cancelled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: '결제 세션 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

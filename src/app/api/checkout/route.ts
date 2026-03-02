import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'
import { PLANS, type PlanKey } from '@/lib/credits'

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

  if (!planKey || !(planKey in PLANS) || planKey === 'free') {
    return NextResponse.json(
      { error: '유효하지 않은 요금제입니다.' },
      { status: 400 }
    )
  }

  const plan = PLANS[planKey]
  const userId = (session.user as Record<string, unknown>).id as string
  const origin = req.headers.get('origin') || 'https://cheonmyeong.vercel.app'

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'krw',
            product_data: {
              name: `천명(天命) ${plan.name} 크레딧`,
              description: `AI 사주 해석 ${plan.credits}회 크레딧`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        planKey,
        credits: String(plan.credits),
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

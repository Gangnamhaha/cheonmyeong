import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { authOptions } from '@/lib/auth'
import { cancelSubscription, getSubscription, updateSubscription } from '@/lib/subscription'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const userId = (session.user as Record<string, unknown>).id as string
  const subscription = await getSubscription(userId)

  return NextResponse.json({ subscription })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const userId = (session.user as Record<string, unknown>).id as string
  const body = await req.json()

  if (body.action !== 'cancel') {
    return NextResponse.json({ error: '지원하지 않는 action입니다.' }, { status: 400 })
  }

  const subscription = await getSubscription(userId)
  if (!subscription) {
    return NextResponse.json({ error: '구독 정보가 없습니다.' }, { status: 404 })
  }

  if (subscription.paymentProvider === 'stripe') {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe가 설정되지 않았습니다.' }, { status: 503 })
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json({ error: 'Stripe 구독 ID가 없습니다.' }, { status: 400 })
    }

    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
    await updateSubscription(userId, {
      status: 'canceled',
      canceledAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, provider: 'stripe' })
  }

  await cancelSubscription(userId)
  return NextResponse.json({ success: true, provider: 'portone' })
}

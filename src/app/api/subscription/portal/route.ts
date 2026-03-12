import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { authOptions } from '@/lib/auth'
import { getSubscription } from '@/lib/subscription'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe가 설정되지 않았습니다.' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const userId = (session.user as Record<string, unknown>).id as string
  const subscription = await getSubscription(userId)
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'Stripe 고객 정보가 없습니다.' }, { status: 404 })
  }

  const origin = req.headers.get('origin') || 'https://sajuhae.vercel.app'
  const portal = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${origin}/pricing`,
  })

  return NextResponse.json({ url: portal.url })
}

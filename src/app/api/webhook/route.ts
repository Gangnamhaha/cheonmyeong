import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  PLANS,
  addCredits,
  refillSubscriptionCredits,
  type OnetimePlanKey,
  type PlanKey,
  type SubscriptionPlanKey,
} from '@/lib/credits'
import { createSubscription, getSubscription, updateSubscription } from '@/lib/subscription'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

const toIsoDate = (unixSeconds: number) => new Date(unixSeconds * 1000).toISOString()

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): 'active' | 'canceled' | 'past_due' | 'expired' {
  if (status === 'active' || status === 'trialing') return 'active'
  if (status === 'past_due' || status === 'unpaid' || status === 'incomplete') return 'past_due'
  if (status === 'canceled') return 'canceled'
  return 'expired'
}

function getSubscriptionPlanFromMetadata(subscription: Stripe.Subscription): SubscriptionPlanKey | null {
  const direct = subscription.metadata?.planKey as SubscriptionPlanKey | undefined
  if (direct && direct in PLANS && direct.startsWith('sub_')) return direct

  const priceId = subscription.items.data[0]?.price.id
  if (!priceId) return null

  for (const key of Object.keys(PLANS) as PlanKey[]) {
    const plan = PLANS[key]
    if (plan.type === 'subscription' && plan.stripePriceId === priceId) {
      return key as SubscriptionPlanKey
    }
  }

  return null
}

function getStripePeriod(subscription: Stripe.Subscription): { start: string; end: string } {
  const firstItem = subscription.items.data[0]
  if (firstItem?.current_period_start && firstItem?.current_period_end) {
    return {
      start: toIsoDate(firstItem.current_period_start),
      end: toIsoDate(firstItem.current_period_end),
    }
  }

  const start = toIsoDate(subscription.start_date)
  return {
    start,
    end: start,
  }
}

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook not configured' },
      { status: 503 }
    )
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata

    if (metadata?.userId && metadata?.planKey) {
      const userId = metadata.userId
      const planKey = metadata.planKey as PlanKey

      if (session.mode === 'payment') {
        console.log(`[Webhook] Adding ${planKey} credits to user ${userId}`)
        await addCredits(userId, planKey as OnetimePlanKey)
      }

      if (session.mode === 'subscription' && session.subscription) {
        const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string)
        const resolvedPlan = getSubscriptionPlanFromMetadata(stripeSub)
        if (resolvedPlan) {
          const period = getStripePeriod(stripeSub)
          const existing = await getSubscription(userId)
          const payload = {
            plan: resolvedPlan,
            paymentProvider: 'stripe' as const,
            stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
            stripeSubscriptionId: stripeSub.id,
            status: mapStripeSubscriptionStatus(stripeSub.status),
            currentPeriodStart: period.start,
            currentPeriodEnd: period.end,
          }

          if (existing) {
            await updateSubscription(userId, payload)
          } else {
            await createSubscription({
              userId,
              ...payload,
              createdAt: new Date().toISOString(),
            })
          }
        }
      }
    }
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    const invoiceSubscription = invoice.parent?.subscription_details?.subscription

    if (typeof invoiceSubscription === 'string') {
      const stripeSub = await stripe.subscriptions.retrieve(invoiceSubscription)
      const userId = stripeSub.metadata?.userId
      const planKey = getSubscriptionPlanFromMetadata(stripeSub)

      if (userId && planKey) {
        const period = getStripePeriod(stripeSub)
        await refillSubscriptionCredits(userId, planKey)
        const existing = await getSubscription(userId)
        const payload = {
          status: 'active' as const,
          plan: planKey,
          paymentProvider: 'stripe' as const,
          stripeCustomerId: typeof stripeSub.customer === 'string' ? stripeSub.customer : undefined,
          stripeSubscriptionId: stripeSub.id,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
        }

        if (existing) {
          await updateSubscription(userId, payload)
        } else {
          await createSubscription({
            userId,
            ...payload,
            createdAt: new Date().toISOString(),
          })
        }
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const stripeSub = event.data.object as Stripe.Subscription
    const userId = stripeSub.metadata?.userId
    const planKey = getSubscriptionPlanFromMetadata(stripeSub)

    if (userId && planKey) {
      const period = getStripePeriod(stripeSub)
      const existing = await getSubscription(userId)
      const payload = {
        plan: planKey,
        status: mapStripeSubscriptionStatus(stripeSub.status),
        stripeSubscriptionId: stripeSub.id,
        stripeCustomerId: typeof stripeSub.customer === 'string' ? stripeSub.customer : undefined,
        currentPeriodStart: period.start,
        currentPeriodEnd: period.end,
      }

      if (existing) {
        await updateSubscription(userId, payload)
      } else {
        await createSubscription({
          userId,
          ...payload,
          paymentProvider: 'stripe',
          createdAt: new Date().toISOString(),
        })
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const stripeSub = event.data.object as Stripe.Subscription
    const userId = stripeSub.metadata?.userId
    const planKey = getSubscriptionPlanFromMetadata(stripeSub)

    if (userId && planKey) {
      const period = getStripePeriod(stripeSub)
      const existing = await getSubscription(userId)
      const payload = {
        plan: planKey,
        status: 'expired' as const,
        stripeSubscriptionId: stripeSub.id,
        stripeCustomerId: typeof stripeSub.customer === 'string' ? stripeSub.customer : undefined,
        currentPeriodStart: period.start,
        currentPeriodEnd: period.end,
        canceledAt: new Date().toISOString(),
      }

      if (existing) {
        await updateSubscription(userId, payload)
      } else {
        await createSubscription({
          userId,
          ...payload,
          paymentProvider: 'stripe',
          createdAt: new Date().toISOString(),
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}

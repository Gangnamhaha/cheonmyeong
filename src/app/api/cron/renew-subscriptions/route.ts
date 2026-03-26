import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'
import { payWithBillingKey } from '@/lib/portone'
import { refillSubscriptionCredits, PLANS, type SubscriptionPlanKey } from '@/lib/credits'
import { updateSubscription } from '@/lib/subscription'

/**
 * GET /api/cron/renew-subscriptions
 * Vercel Cron job — runs daily at 06:00 UTC (15:00 KST).
 * Finds active subscriptions with expired periods and renews them.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'DB not configured' }, { status: 503 })
  }

  const now = new Date().toISOString()
  let renewed = 0
  let failed = 0
  let skipped = 0

  try {
    // Find active subscriptions past their period end with a billingKey
    const { data: expiredSubs, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .not('billing_key', 'is', null)
      .lt('current_period_end', now)
      .limit(100)

    if (error) {
      console.error('Failed to query expired subscriptions:', error)
      return NextResponse.json({ error: 'DB query failed' }, { status: 500 })
    }

    if (!expiredSubs || expiredSubs.length === 0) {
      return NextResponse.json({ renewed: 0, failed: 0, skipped: 0, message: 'No subscriptions to renew' })
    }

    for (const sub of expiredSubs) {
      const plan = sub.plan as SubscriptionPlanKey
      const planInfo = PLANS[plan]

      if (!planInfo || planInfo.type !== 'subscription') {
        skipped++
        continue
      }

      // Annual subscriptions are not offered/renewed by this job.
      // Prevent accidental monthly charging for legacy annual plans.
      if (planInfo.interval === 'year') {
        await updateSubscription(sub.user_id as string, { status: 'expired' })
        skipped++
        continue
      }

      const billingKey = sub.billing_key as string
      const userId = sub.user_id as string
      const shortId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      const paymentId = `renew-${plan}-${shortId}`

      try {
        // Charge via billingKey
        const payment = await payWithBillingKey({
          paymentId,
          billingKey,
          orderName: `사주해 - ${planInfo.name} (자동 갱신)`,
          amount: planInfo.price,
          customer: { id: userId },
        })

        if (payment.status !== 'PAID') {
          // Mark subscription as past_due
          await updateSubscription(userId, { status: 'past_due' })
          failed++
          continue
        }

        // Record payment
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
          console.error(`Payment record failed for ${userId}:`, e)
        }

        // Update subscription period
        const newPeriodStart = new Date()
        const newPeriodEnd = new Date()
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1)

        await updateSubscription(userId, {
          status: 'active',
          currentPeriodStart: newPeriodStart.toISOString(),
          currentPeriodEnd: newPeriodEnd.toISOString(),
        })

        // Refill credits
        await refillSubscriptionCredits(userId, plan)

        renewed++
      } catch (e) {
        console.error(`Renewal failed for user ${userId}:`, e)
        // Mark as past_due on payment failure
        await updateSubscription(userId, { status: 'past_due' })
        failed++
      }
    }

    return NextResponse.json({
      renewed,
      failed,
      skipped,
      total: expiredSubs.length,
      timestamp: now,
    })
  } catch (error) {
    console.error('Subscription renewal cron error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

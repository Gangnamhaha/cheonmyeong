import { NextRequest, NextResponse } from 'next/server'
import {
  PLANS,
  addCredits,
  refillSubscriptionCredits,
  type OnetimePlanKey,
  type PlanKey,
  type SubscriptionPlanKey,
} from '@/lib/credits'
import { createSubscription, getSubscription, updateSubscription } from '@/lib/subscription'
import { verifyPortonePayment } from '@/lib/portone'
import { getSupabase } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { ReceiptEmail } from '@/emails/ReceiptEmail'
import { Redis } from '@upstash/redis'

const _redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const _redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const idempotencyRedis = _redisUrl && _redisToken ? new Redis({ url: _redisUrl, token: _redisToken }) : null

interface ParsedPaymentData {
  userId: string
  plan: PlanKey
}

/**
 * Parse V2 paymentId format: payment__${plan}__${userToken}__${timestamp}
 */
const parsePaymentId = (paymentId: string): ParsedPaymentData | null => {
  const parts = paymentId.split('__')
  if (parts.length !== 4 || parts[0] !== 'payment') return null

  const plan = parts[1] as PlanKey
  if (!(plan in PLANS)) return null

  try {
    const userId = Buffer.from(parts[2], 'base64url').toString('utf8')
    if (!userId) return null
    return { userId, plan }
  } catch {
    return null
  }
}

/**
 * Fallback: parse customData JSON
 */
const parseCustomData = (customData?: string): ParsedPaymentData | null => {
  if (!customData) return null

  try {
    const parsed = JSON.parse(customData) as { userId?: string; plan?: PlanKey }
    if (!parsed.userId || !parsed.plan || !(parsed.plan in PLANS)) return null
    return { userId: parsed.userId, plan: parsed.plan }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  let lockKey: string | null = null
  try {
    const body = await req.json()
    // V2: paymentId from frontend verify or PortOne server webhook
    const paymentId = (body.paymentId ?? body.data?.paymentId) as string | undefined
    const isGuest = body.isGuest === true
    const customDataFromBody = (body.customData ?? body.data?.customData) as string | undefined

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId가 필요합니다.' }, { status: 400 })
    }

    // Idempotency: skip if already processed
    if (idempotencyRedis) {
      const already = await idempotencyRedis.get(`payment:done:${paymentId}`)
      if (already) {
        return NextResponse.json({ received: true, duplicate: true })
      }

      // Prevent concurrent processing of the same paymentId
      lockKey = `payment:lock:${paymentId}`
      const locked = await idempotencyRedis.set(lockKey, '1', { nx: true, ex: 600 })
      if (!locked) {
        return NextResponse.json({ received: true, duplicate: true })
      }
    }

    const payment = await verifyPortonePayment(paymentId)
    if (payment.status !== 'PAID') {
      return NextResponse.json({ received: true, ignored: true, status: payment.status })
    }

    const parsedData =
      parsePaymentId(paymentId) ??
      parseCustomData(customDataFromBody) ??
      parseCustomData(payment.customData)
    if (!parsedData) {
      return NextResponse.json({ error: 'paymentId 또는 customData 파싱 실패' }, { status: 400 })
    }

    // Verify payment amount matches plan
    const planInfo = PLANS[parsedData.plan]
    if (payment.amount.total !== planInfo.price) {
      console.error(`Amount mismatch: expected ${planInfo.price}, got ${payment.amount.total}`)
      return NextResponse.json({ error: '결제 금액이 요금제와 일치하지 않습니다.' }, { status: 400 })
    }

    // Helper to build response with optional guest cookie
    const buildResponse = (data: Record<string, unknown>) => {
      const res = NextResponse.json(data)
      if (isGuest && parsedData.userId) {
        res.cookies.set('guest_user_id', parsedData.userId, {
          path: '/',
          maxAge: 365 * 24 * 60 * 60, // 1 year
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      }
      return res
    }

    const supabase = getSupabase()

    const getReceiptTarget = async (): Promise<{ email: string | null; name: string }> => {
      const customerEmail = payment.customer?.email?.trim() || null
      const customerName = payment.customer?.name?.trim() || ''

      if (!supabase) {
        return { email: customerEmail, name: customerName || '고객' }
      }

      if (customerEmail) {
        const { data } = await supabase
          .from('users')
          .select('name')
          .eq('email', customerEmail)
          .maybeSingle()
        return { email: customerEmail, name: data?.name || customerName || '고객' }
      }

      const { data } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', parsedData.userId)
        .maybeSingle()

      return {
        email: data?.email?.trim() || null,
        name: data?.name || customerName || '고객',
      }
    }

    const sendReceipt = async () => {
      const target = await getReceiptTarget()
      if (!target.email) {
        return
      }

      const paidDate = payment.paidAt ? new Date(payment.paidAt) : new Date()
      await sendEmail(
        target.email,
        '사주해 AI 결제 영수증 안내',
        ReceiptEmail({
          name: target.name,
          planName: planInfo.name,
          amount: `${payment.amount.total.toLocaleString('ko-KR')}원`,
          date: paidDate.toLocaleString('ko-KR'),
          orderId: payment.id,
        }),
      )
    }

    if (supabase) {
      try {
        await supabase.from('payments').upsert({
          payment_id: paymentId,
          user_id: parsedData.userId,
          plan: parsedData.plan,
          amount: payment.amount.total,
          currency: 'KRW',
          status: 'paid',
          payment_provider: 'portone',
        }, { onConflict: 'payment_id' })
      } catch (e) { console.error('Payment record failed:', e) }
    }

    if (planInfo.type === 'subscription') {
      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      await refillSubscriptionCredits(parsedData.userId, parsedData.plan as SubscriptionPlanKey)

      const existing = await getSubscription(parsedData.userId)
      const payload = {
        plan: parsedData.plan as SubscriptionPlanKey,
        status: 'active' as const,
        paymentProvider: 'portone' as const,
        portoneMerchantUid: payment.id,
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
      }

      if (existing) {
        await updateSubscription(parsedData.userId, payload)
      } else {
        await createSubscription({
          userId: parsedData.userId,
          ...payload,
          createdAt: now.toISOString(),
        })
      }

      try {
        await sendReceipt()
      } catch (emailError) {
        console.error('Receipt email send failed:', emailError)
      }

      if (idempotencyRedis) {
        await idempotencyRedis.set(`payment:done:${paymentId}`, '1', { ex: 86400 * 30 })
        if (lockKey) await idempotencyRedis.del(lockKey)
      }

      return buildResponse({ received: true, type: 'subscription' })
    }

    const isReportPurchase =
      (parsedData.plan === 'premium_report' ||
        parsedData.plan === 'premium_report_pro' ||
        parsedData.plan === 'gunghap_premium') &&
      planInfo.credits === 0

    if (isReportPurchase) {
      try {
        await sendReceipt()
      } catch (emailError) {
        console.error('Receipt email send failed:', emailError)
      }

      if (idempotencyRedis) {
        await idempotencyRedis.set(`payment:done:${paymentId}`, '1', { ex: 86400 * 30 })
        if (lockKey) await idempotencyRedis.del(lockKey)
      }

      return buildResponse({ received: true, type: 'report' })
    }

    await addCredits(parsedData.userId, parsedData.plan as OnetimePlanKey)

    try {
      await sendReceipt()
    } catch (emailError) {
      console.error('Receipt email send failed:', emailError)
    }

    if (idempotencyRedis) {
      await idempotencyRedis.set(`payment:done:${paymentId}`, '1', { ex: 86400 * 30 })
      if (lockKey) await idempotencyRedis.del(lockKey)
    }

    return buildResponse({ received: true, type: 'onetime' })
  } catch (error) {
    console.error('PortOne webhook handling error:', error)
    return NextResponse.json({ error: 'PortOne webhook 처리 중 오류가 발생했습니다.' }, { status: 500 })
  } finally {
    if (idempotencyRedis && lockKey) {
      try {
        await idempotencyRedis.del(lockKey)
      } catch {
        // ignore
      }
    }
  }
}

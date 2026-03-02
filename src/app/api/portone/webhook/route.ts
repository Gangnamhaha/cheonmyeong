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

interface ParsedMerchantData {
  userId: string
  plan: PlanKey
}

const parseMerchantUid = (merchantUid: string): ParsedMerchantData | null => {
  const parts = merchantUid.split('__')
  if (parts.length !== 4 || parts[0] !== 'cm') return null

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

const parseCustomData = (customData?: string): ParsedMerchantData | null => {
  if (!customData) return null

  try {
    const parsed = JSON.parse(customData) as { userId?: string; plan?: PlanKey }
    if (!parsed.userId || !parsed.plan || !(parsed.plan in PLANS)) return null
    return { userId: parsed.userId, plan: parsed.plan }
  } catch {
    return null
  }
}

const resolveWebhookImpUid = async (req: NextRequest): Promise<string | null> => {
  const text = await req.text()
  if (!text) return null

  try {
    const json = JSON.parse(text) as { imp_uid?: string }
    if (json.imp_uid) return json.imp_uid
  } catch {}

  const params = new URLSearchParams(text)
  return params.get('imp_uid')
}

export async function POST(req: NextRequest) {
  try {
    const impUid = await resolveWebhookImpUid(req)
    if (!impUid) {
      return NextResponse.json({ error: 'imp_uid가 필요합니다.' }, { status: 400 })
    }

    const payment = await verifyPortonePayment(impUid)
    if (payment.status !== 'paid') {
      return NextResponse.json({ received: true, ignored: true })
    }

    const parsedData = parseMerchantUid(payment.merchantUid) ?? parseCustomData(payment.customData)
    if (!parsedData) {
      return NextResponse.json({ error: 'merchant_uid 또는 custom_data 파싱 실패' }, { status: 400 })
    }

    const plan = PLANS[parsedData.plan]
    if (plan.type === 'subscription') {
      const now = new Date()
      const periodEnd = new Date(now)
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      await refillSubscriptionCredits(parsedData.userId, parsedData.plan as SubscriptionPlanKey)

      const existing = await getSubscription(parsedData.userId)
      const payload = {
        plan: parsedData.plan as SubscriptionPlanKey,
        status: 'active' as const,
        paymentProvider: 'portone' as const,
        portoneCustomerUid: payment.customerUid,
        portoneMerchantUid: payment.merchantUid,
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

      return NextResponse.json({ received: true, type: 'subscription' })
    }

    await addCredits(parsedData.userId, parsedData.plan as OnetimePlanKey)
    return NextResponse.json({ received: true, type: 'onetime' })
  } catch (error) {
    console.error('PortOne webhook handling error:', error)
    return NextResponse.json({ error: 'PortOne webhook 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

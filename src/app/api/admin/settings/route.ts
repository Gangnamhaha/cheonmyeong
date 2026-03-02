import { NextResponse } from 'next/server'
import { PLANS } from '@/lib/credits'
import { checkAdminAuth } from '@/lib/admin-auth'

function getMaskedStatus(value: string | undefined): '설정됨' | '미설정' {
  return value && value.trim() ? '설정됨' : '미설정'
}

export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const plans = Object.entries(PLANS).map(([key, plan]) => ({
    key,
    name: plan.name,
    type: plan.type,
    credits: plan.credits,
    price: plan.price,
    priceLabel: plan.priceLabel,
  }))

  return NextResponse.json({
    plans,
    envStatus: {
      OPENAI_API_KEY: getMaskedStatus(process.env.OPENAI_API_KEY),
      NEXTAUTH_SECRET: getMaskedStatus(process.env.NEXTAUTH_SECRET),
      GOOGLE_CLIENT_ID: getMaskedStatus(process.env.GOOGLE_CLIENT_ID),
      KAKAO_CLIENT_ID: getMaskedStatus(process.env.KAKAO_CLIENT_ID),
      STRIPE_SECRET_KEY: getMaskedStatus(process.env.STRIPE_SECRET_KEY),
      KV_REST_API_URL: getMaskedStatus(process.env.KV_REST_API_URL),
      ADMIN_EMAILS: getMaskedStatus(process.env.ADMIN_EMAILS),
      ADMIN_USERNAME: getMaskedStatus(process.env.ADMIN_USERNAME),
    },
  })
}

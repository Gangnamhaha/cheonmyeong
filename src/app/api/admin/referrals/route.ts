import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/admin-auth'
import { getAdminReferralStats } from '@/lib/referral'

export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const stats = await getAdminReferralStats()
  return NextResponse.json(stats)
}

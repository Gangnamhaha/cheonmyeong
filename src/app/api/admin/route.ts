import { NextResponse } from 'next/server'
import { getAdminStats } from '@/lib/admin'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const stats = await getAdminStats()
  return NextResponse.json(stats)
}

/**
 * 사주해 주간 KPI 자동 리포트 Cron
 * 매주 월요일 오전 9시(KST) = UTC 00:00 실행
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const start = weekAgo.toISOString()
  const end = now.toISOString()

  try {
    // 신규 구독자
    const { count: newSubs } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end)
      .eq('status', 'active')

    // 해지
    const { count: churned } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .gte('cancelled_at', start)
      .lte('cancelled_at', end)

    // 활성 구독자 전체
    const { count: totalActive } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // 무료 분석 수
    const { count: freeAnalysis } = await supabase
      .from('saju_results')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end)

    // 신규 가입자
    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', start)
      .lte('created_at', end)

    const report = {
      period: { start: start.slice(0, 10), end: end.slice(0, 10) },
      subscriptions: { new: newSubs, churned, totalActive },
      usage: { freeAnalysis, newUsers },
      conversionRate: newUsers && newSubs ? ((newSubs / newUsers) * 100).toFixed(2) + '%' : 'N/A',
      generatedAt: now.toISOString()
    }

    // TODO: Slack/Telegram 알림 발송
    console.log('[Weekly KPI]', JSON.stringify(report, null, 2))

    return NextResponse.json({ ok: true, report })
  } catch (error) {
    console.error('[Weekly KPI Error]', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

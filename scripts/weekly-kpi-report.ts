/**
 * 사주해 주간 KPI 자동 리포트
 * 실행: npx ts-node scripts/weekly-kpi-report.ts
 * 또는 cron으로 매주 월요일 9시 실행
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getWeekRange() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday.toISOString(), end: sunday.toISOString() }
}

async function getSubscriptionMetrics(start: string, end: string) {
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

  // 플랜별 구독자
  const { data: planBreakdown } = await supabase
    .from('subscriptions')
    .select('plan, count')
    .eq('status', 'active')

  return { newSubs: newSubs || 0, churned: churned || 0, totalActive: totalActive || 0 }
}

async function getUsageMetrics(start: string, end: string) {
  // 무료 사주 분석 수
  const { count: freeAnalysis } = await supabase
    .from('saju_results')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start)
    .lte('created_at', end)

  // AI 해석 수
  const { count: aiInterpret } = await supabase
    .from('interpretations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start)
    .lte('created_at', end)
    .catch(() => ({ count: 0 }))

  // 신규 가입자
  const { count: newUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start)
    .lte('created_at', end)

  return { freeAnalysis: freeAnalysis || 0, aiInterpret: aiInterpret || 0, newUsers: newUsers || 0 }
}

async function generateReport() {
  const { start, end } = await getWeekRange()
  const startDate = start.slice(0, 10)
  const endDate = end.slice(0, 10)

  console.log(`\n📊 사주해 주간 KPI 리포트`)
  console.log(`기간: ${startDate} ~ ${endDate}`)
  console.log('='.repeat(50))

  const [subs, usage] = await Promise.all([
    getSubscriptionMetrics(start, end),
    getUsageMetrics(start, end)
  ])

  const report = `
# 📊 사주해 주간 KPI 리포트
기간: ${startDate} ~ ${endDate}

## 🔑 핵심 지표

| 지표 | 이번 주 |
|------|---------|
| 신규 구독자 | ${subs.newSubs}명 |
| 해지 | ${subs.churned}명 |
| 활성 구독자 (누적) | ${subs.totalActive}명 |
| 무료 분석 완료 | ${usage.freeAnalysis}건 |
| AI 해석 요청 | ${usage.aiInterpret}건 |
| 신규 가입자 | ${usage.newUsers}명 |

## 📈 퍼널 전환율
- 가입 → 분석: ${usage.freeAnalysis && usage.newUsers ? ((usage.freeAnalysis / usage.newUsers) * 100).toFixed(1) : 'N/A'}%
- 분석 → AI해석: ${usage.freeAnalysis && usage.aiInterpret ? ((usage.aiInterpret / usage.freeAnalysis) * 100).toFixed(1) : 'N/A'}%
- 분석 → 구독: ${usage.freeAnalysis && subs.newSubs ? ((subs.newSubs / usage.freeAnalysis) * 100).toFixed(1) : 'N/A'}%

## 📝 다음 주 실행 계획
- [ ] 
- [ ] 
- [ ] 

생성일시: ${new Date().toISOString()}
`

  console.log(report)

  // 파일로 저장
  const fs = await import('fs/promises')
  const filename = `marketing/reports/weekly-${startDate}.md`
  await fs.mkdir('marketing/reports', { recursive: true })
  await fs.writeFile(filename, report)
  console.log(`\n✅ 저장됨: ${filename}`)

  return report
}

generateReport().catch(console.error)

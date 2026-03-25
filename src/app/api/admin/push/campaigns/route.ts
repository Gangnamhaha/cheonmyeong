import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/admin-auth'
import { getSupabase } from '@/lib/db'
import { sendPushNotification } from '@/lib/push'

interface CampaignSegment {
  tiers?: string[]
  minCredits?: number
  maxCredits?: number
  inactiveDays?: number
}

interface CampaignRecord {
  id: string
  title: string
  body: string
  url: string | null
  segment_filter: CampaignSegment
  status: string
  sent_at: string | null
  total_targets: number
  success_count: number
  failure_count: number
  created_at: string
}

function hasSegmentFilters(segment: CampaignSegment): boolean {
  return Boolean(
    (segment.tiers && segment.tiers.length > 0)
    || Number.isFinite(segment.minCredits)
    || Number.isFinite(segment.maxCredits)
    || Number.isFinite(segment.inactiveDays)
  )
}

function parseSegment(raw: unknown): CampaignSegment {
  const input = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : {}

  const tiers = Array.isArray(input.tiers)
    ? input.tiers.map((tier) => String(tier).trim()).filter(Boolean)
    : []

  const minCredits = input.minCredits === undefined ? undefined : Number(input.minCredits)
  const maxCredits = input.maxCredits === undefined ? undefined : Number(input.maxCredits)
  const inactiveDays = input.inactiveDays === undefined ? undefined : Number(input.inactiveDays)

  return {
    ...(tiers.length > 0 ? { tiers } : {}),
    ...(Number.isFinite(minCredits) ? { minCredits } : {}),
    ...(Number.isFinite(maxCredits) ? { maxCredits } : {}),
    ...(Number.isFinite(inactiveDays) ? { inactiveDays } : {}),
  }
}

function getCreditBalance(row: Record<string, unknown>): number {
  if (typeof row.balance === 'number') return row.balance

  const total = typeof row.total === 'number' ? row.total : 0
  const used = typeof row.used === 'number' ? row.used : 0
  return total - used
}

export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: '데이터베이스가 설정되지 않았습니다.' }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('push_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: '캠페인 목록을 불러오지 못했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ campaigns: (data ?? []) as CampaignRecord[] })
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: '데이터베이스가 설정되지 않았습니다.' }, { status: 500 })
  }

  const payload = await req.json()
  const title = String(payload?.title ?? '').trim()
  const messageBody = String(payload?.body ?? '').trim()
  const url = String(payload?.url ?? '').trim()
  const segment = parseSegment(payload?.segment)

  if (!title || !messageBody) {
    return NextResponse.json({ error: 'title과 body가 필요합니다.' }, { status: 400 })
  }

  if (
    Number.isFinite(segment.minCredits)
    && Number.isFinite(segment.maxCredits)
    && Number(segment.minCredits) > Number(segment.maxCredits)
  ) {
    return NextResponse.json({ error: 'minCredits는 maxCredits보다 클 수 없습니다.' }, { status: 400 })
  }

  const { data: tokenRows, error: tokenError } = await supabase
    .from('push_tokens')
    .select('user_id, token')

  if (tokenError) {
    return NextResponse.json({ error: '푸시 토큰을 조회하지 못했습니다.' }, { status: 500 })
  }

  const baseTokens = (tokenRows ?? []) as Array<{ user_id: string; token: string }>
  const tokenUsers = new Set(baseTokens.map((row) => row.user_id))
  let targetUserIds = new Set(tokenUsers)

  if (hasSegmentFilters(segment)) {
    if (segment.tiers && segment.tiers.length > 0) {
      const { data: subscriptionRows, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('user_id, plan')
        .in('plan', segment.tiers)

      if (subscriptionError) {
        return NextResponse.json({ error: '구독 등급 필터 조회에 실패했습니다.' }, { status: 500 })
      }

      const tierMatched = new Set((subscriptionRows ?? []).map((row) => row.user_id as string))
      targetUserIds = new Set(Array.from(targetUserIds).filter((id) => tierMatched.has(id)))
    }

    if (Number.isFinite(segment.minCredits) || Number.isFinite(segment.maxCredits)) {
      const { data: creditRows, error: creditError } = await supabase
        .from('credits')
        .select('*')

      if (creditError) {
        return NextResponse.json({ error: '이용권 필터 조회에 실패했습니다.' }, { status: 500 })
      }

      const creditMatched = new Set(
        (creditRows ?? [])
          .filter((rawRow) => {
            const row = rawRow as Record<string, unknown>
            const balance = getCreditBalance(row)
            if (Number.isFinite(segment.minCredits) && balance < Number(segment.minCredits)) return false
            if (Number.isFinite(segment.maxCredits) && balance > Number(segment.maxCredits)) return false
            return true
          })
          .map((row) => String((row as Record<string, unknown>).user_id ?? ''))
          .filter(Boolean)
      )

      targetUserIds = new Set(Array.from(targetUserIds).filter((id) => creditMatched.has(id)))
    }

    if (Number.isFinite(segment.inactiveDays) && Number(segment.inactiveDays) > 0) {
      const cutoffDate = new Date(Date.now() - Number(segment.inactiveDays) * 24 * 60 * 60 * 1000).toISOString()
      const { data: userRows, error: userError } = await supabase
        .from('users')
        .select('id, last_login_at')
        .lt('last_login_at', cutoffDate)

      if (userError) {
        return NextResponse.json({ error: '최근 활동 필터 조회에 실패했습니다.' }, { status: 500 })
      }

      const inactiveMatched = new Set((userRows ?? []).map((row) => row.id as string))
      targetUserIds = new Set(Array.from(targetUserIds).filter((id) => inactiveMatched.has(id)))
    }
  }

  const targetTokens = baseTokens
    .filter((row) => targetUserIds.has(row.user_id))
    .map((row) => row.token)

  const sendResult = await sendPushNotification({
    tokens: targetTokens,
    title,
    body: messageBody,
    ...(url ? { url } : {}),
  })

  const campaignPayload = {
    title,
    body: messageBody,
    url: url || null,
    segment_filter: segment,
    status: 'sent',
    sent_at: new Date().toISOString(),
    total_targets: targetTokens.length,
    success_count: sendResult.success,
    failure_count: sendResult.failure,
  }

  const { data: createdCampaign, error: insertError } = await supabase
    .from('push_campaigns')
    .insert(campaignPayload)
    .select('*')
    .single()

  if (insertError) {
    return NextResponse.json({ error: '캠페인 저장에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    campaign: createdCampaign as CampaignRecord,
  })
}

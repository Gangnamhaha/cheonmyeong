import { getSupabase } from '@/lib/db'
import { getUserCredits } from '@/lib/credits'

const REFERRER_BONUS = 5
const REFERRED_BONUS = 3
const MONTHLY_REFERRAL_CAP = 10

export interface ReferralStats {
  code: string
  totalReferrals: number
  creditsEarned: number
  monthlyReferrals: number
  monthlyCap: number
}

export interface AdminReferralStats {
  totalReferrals: number
  topReferrers: Array<{ referrerId: string; count: number; creditsEarned: number }>
  recentReferrals: Array<{
    id: number
    referrerId: string
    referredId: string
    referralCode: string
    creditsAwardedReferrer: number
    creditsAwardedReferred: number
    createdAt: string
  }>
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase()
}

function getMonthStartIso(): string {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
  return monthStart.toISOString()
}

async function awardBonusCredits(userId: string, amount: number): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('이용권 보너스 처리를 위해 Supabase 설정이 필요합니다.')
  }

  const current = await getUserCredits(userId)
  const updatedTotal = current.total - current.used + amount

  await supabase.from('credits').upsert({
    user_id: userId,
    total: updatedTotal,
    used: 0,
    plan: current.plan,
    last_refill: new Date().toISOString().slice(0, 10),
  }, { onConflict: 'user_id' })
}

export async function getUserReferralCode(userId: string): Promise<string> {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('추천 코드 기능을 사용하려면 Supabase 설정이 필요합니다.')
  }

  const { data: existingUser } = await supabase
    .from('users')
    .select('id, referral_code')
    .eq('id', userId)
    .maybeSingle()

  if (!existingUser) {
    throw new Error('사용자 정보를 찾을 수 없습니다.')
  }

  if (existingUser.referral_code) {
    return String(existingUser.referral_code).toUpperCase()
  }

  for (let i = 0; i < 20; i += 1) {
    const nextCode = generateReferralCode()
    const { data: duplicate } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', nextCode)
      .maybeSingle()

    if (duplicate) {
      continue
    }

    const { data: updated } = await supabase
      .from('users')
      .update({ referral_code: nextCode })
      .eq('id', userId)
      .select('referral_code')
      .maybeSingle()

    if (updated?.referral_code) {
      return String(updated.referral_code).toUpperCase()
    }
  }

  throw new Error('추천 코드 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('추천 통계를 조회하려면 Supabase 설정이 필요합니다.')
  }

  const code = await getUserReferralCode(userId)
  const monthStart = getMonthStartIso()

  const [{ data: allRows, count: totalReferrals }, { count: monthlyReferrals }] = await Promise.all([
    supabase
      .from('referrals')
      .select('credits_awarded_referrer', { count: 'exact' })
      .eq('referrer_id', userId),
    supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .gte('created_at', monthStart),
  ])

  const creditsEarned = (allRows ?? []).reduce((sum, row) => {
    return sum + Number(row.credits_awarded_referrer ?? 0)
  }, 0)

  return {
    code,
    totalReferrals: totalReferrals ?? 0,
    creditsEarned,
    monthlyReferrals: monthlyReferrals ?? 0,
    monthlyCap: MONTHLY_REFERRAL_CAP,
  }
}

export async function applyReferralCode(referredUserId: string, code: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('추천 코드 적용을 위해 Supabase 설정이 필요합니다.')
  }

  const normalizedCode = code.trim().toUpperCase()
  if (!normalizedCode || normalizedCode.length !== 6) {
    throw new Error('유효한 추천 코드를 입력해주세요.')
  }

  const [{ data: referrer }, { data: alreadyReferred }] = await Promise.all([
    supabase
      .from('users')
      .select('id')
      .eq('referral_code', normalizedCode)
      .maybeSingle(),
    supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', referredUserId)
      .maybeSingle(),
  ])

  if (!referrer?.id) {
    throw new Error('존재하지 않는 추천 코드입니다.')
  }

  if (referrer.id === referredUserId) {
    throw new Error('본인 추천 코드는 사용할 수 없습니다.')
  }

  if (alreadyReferred) {
    throw new Error('이미 추천 코드가 적용된 계정입니다.')
  }

  const monthStart = getMonthStartIso()
  const { count: monthlyReferrals } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', referrer.id)
    .gte('created_at', monthStart)

  if ((monthlyReferrals ?? 0) >= MONTHLY_REFERRAL_CAP) {
    throw new Error('추천 보너스는 월 최대 10회까지 지급됩니다.')
  }

  const { data: inserted, error: insertError } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrer.id,
      referred_id: referredUserId,
      referral_code: normalizedCode,
      credits_awarded_referrer: REFERRER_BONUS,
      credits_awarded_referred: REFERRED_BONUS,
    })
    .select('id')
    .single()

  if (insertError) {
    if (insertError.message.toLowerCase().includes('duplicate')) {
      throw new Error('이미 추천 코드가 적용된 계정입니다.')
    }
    throw new Error('추천 코드 적용에 실패했습니다.')
  }

  try {
    await awardBonusCredits(referredUserId, REFERRED_BONUS)
    await awardBonusCredits(referrer.id, REFERRER_BONUS)
  } catch {
    if (inserted?.id) {
      await supabase.from('referrals').delete().eq('id', inserted.id)
    }
    throw new Error('추천 보너스 지급에 실패했습니다. 다시 시도해주세요.')
  }
}

export async function getAdminReferralStats(): Promise<AdminReferralStats> {
  const supabase = getSupabase()
  if (!supabase) {
    return {
      totalReferrals: 0,
      topReferrers: [],
      recentReferrals: [],
    }
  }

  const [{ data: allRows, count: totalReferrals }, { data: recentRows }] = await Promise.all([
    supabase
      .from('referrals')
      .select('referrer_id, credits_awarded_referrer', { count: 'exact' }),
    supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const referrerMap = new Map<string, { count: number; creditsEarned: number }>()

  for (const row of allRows ?? []) {
    const referrerId = String(row.referrer_id)
    const current = referrerMap.get(referrerId) ?? { count: 0, creditsEarned: 0 }
    current.count += 1
    current.creditsEarned += Number(row.credits_awarded_referrer ?? 0)
    referrerMap.set(referrerId, current)
  }

  const topReferrers = Array.from(referrerMap.entries())
    .map(([referrerId, value]) => ({
      referrerId,
      count: value.count,
      creditsEarned: value.creditsEarned,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const recentReferrals = (recentRows ?? []).map((row) => ({
    id: Number(row.id),
    referrerId: String(row.referrer_id),
    referredId: String(row.referred_id),
    referralCode: String(row.referral_code),
    creditsAwardedReferrer: Number(row.credits_awarded_referrer ?? REFERRER_BONUS),
    creditsAwardedReferred: Number(row.credits_awarded_referred ?? REFERRED_BONUS),
    createdAt: String(row.created_at),
  }))

  return {
    totalReferrals: totalReferrals ?? 0,
    topReferrers,
    recentReferrals,
  }
}

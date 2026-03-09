import { getSupabase } from '@/lib/db'

const REWARD_MILESTONES: Record<number, number> = {
  7: 2,
  30: 5,
  100: 10,
}

interface CheckinRow {
  id: number
  checkin_date: string
  streak: number
  reward_credits: number
  created_at: string
}

export interface PerformCheckinResult {
  success: boolean
  streak: number
  reward: number
  todayCheckin: boolean
  alreadyCheckedIn?: boolean
}

export interface CheckinStatusResult {
  success: boolean
  todayCheckin: boolean
  streak: number
  reward: number
  history: Array<{
    date: string
    streak: number
    reward: number
  }>
}

export interface CheckinAdminStats {
  totalCheckins: number
  todayCheckins: number
  activeStreakUsers: number
  rewardCreditsGiven: number
}

function getUtcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function getUtcDateOffset(baseDate: Date, dayOffset: number): string {
  const utc = Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate() + dayOffset)
  return new Date(utc).toISOString().slice(0, 10)
}

async function grantRewardCredits(userId: string, reward: number): Promise<void> {
  if (reward <= 0) return

  const supabase = getSupabase()
  if (!supabase) return

  const { data: current } = await supabase
    .from('credits')
    .select('total, used, plan, last_refill')
    .eq('user_id', userId)
    .single()

  if (current) {
    await supabase
      .from('credits')
      .update({ total: current.total + reward })
      .eq('user_id', userId)
    return
  }

  await supabase
    .from('credits')
    .upsert({
      user_id: userId,
      total: 3 + reward,
      used: 0,
      plan: 'free',
      last_refill: getUtcDateKey(),
    }, { onConflict: 'user_id' })
}

export async function performCheckin(userId: string): Promise<PerformCheckinResult> {
  const supabase = getSupabase()
  if (!supabase) {
    return { success: false, streak: 0, reward: 0, todayCheckin: false }
  }

  const now = new Date()
  const today = getUtcDateKey(now)
  const yesterday = getUtcDateOffset(now, -1)

  const { data: todayData } = await supabase
    .from('user_checkins')
    .select('id, checkin_date, streak, reward_credits, created_at')
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .maybeSingle<CheckinRow>()

  if (todayData) {
    return {
      success: true,
      streak: todayData.streak,
      reward: todayData.reward_credits,
      todayCheckin: true,
      alreadyCheckedIn: true,
    }
  }

  const { data: yesterdayData } = await supabase
    .from('user_checkins')
    .select('id, checkin_date, streak, reward_credits, created_at')
    .eq('user_id', userId)
    .eq('checkin_date', yesterday)
    .maybeSingle<CheckinRow>()

  const streak = yesterdayData ? yesterdayData.streak + 1 : 1
  const reward = REWARD_MILESTONES[streak] ?? 0

  const { error: insertError } = await supabase
    .from('user_checkins')
    .insert({
      user_id: userId,
      checkin_date: today,
      streak,
      reward_credits: reward,
    })

  if (insertError) {
    const { data: latestToday } = await supabase
      .from('user_checkins')
      .select('id, checkin_date, streak, reward_credits, created_at')
      .eq('user_id', userId)
      .eq('checkin_date', today)
      .maybeSingle<CheckinRow>()

    if (latestToday) {
      return {
        success: true,
        streak: latestToday.streak,
        reward: latestToday.reward_credits,
        todayCheckin: true,
        alreadyCheckedIn: true,
      }
    }

    return { success: false, streak: 0, reward: 0, todayCheckin: false }
  }

  await grantRewardCredits(userId, reward)

  return {
    success: true,
    streak,
    reward,
    todayCheckin: true,
  }
}

export async function getCheckinStatus(userId: string): Promise<CheckinStatusResult> {
  const supabase = getSupabase()
  if (!supabase) {
    return { success: false, todayCheckin: false, streak: 0, reward: 0, history: [] }
  }

  const today = getUtcDateKey()

  const { data: todayData } = await supabase
    .from('user_checkins')
    .select('id, checkin_date, streak, reward_credits, created_at')
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .maybeSingle<CheckinRow>()

  const { data: latestData } = await supabase
    .from('user_checkins')
    .select('id, checkin_date, streak, reward_credits, created_at')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false })
    .limit(1)
    .maybeSingle<CheckinRow>()

  const { data: historyData } = await supabase
    .from('user_checkins')
    .select('id, checkin_date, streak, reward_credits, created_at')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false })
    .limit(14)

  return {
    success: true,
    todayCheckin: !!todayData,
    streak: todayData?.streak ?? latestData?.streak ?? 0,
    reward: todayData?.reward_credits ?? 0,
    history: (historyData ?? []).map((row) => ({
      date: row.checkin_date,
      streak: row.streak,
      reward: row.reward_credits,
    })),
  }
}

export async function getCheckinAdminStats(): Promise<CheckinAdminStats> {
  const supabase = getSupabase()
  if (!supabase) {
    return {
      totalCheckins: 0,
      todayCheckins: 0,
      activeStreakUsers: 0,
      rewardCreditsGiven: 0,
    }
  }

  const today = getUtcDateKey()
  const yesterday = getUtcDateOffset(new Date(), -1)

  const { count: totalCheckins } = await supabase
    .from('user_checkins')
    .select('*', { count: 'exact', head: true })

  const { count: todayCheckins } = await supabase
    .from('user_checkins')
    .select('*', { count: 'exact', head: true })
    .eq('checkin_date', today)

  const { count: activeStreakUsers } = await supabase
    .from('user_checkins')
    .select('*', { count: 'exact', head: true })
    .eq('checkin_date', yesterday)

  const { data: rewardData } = await supabase
    .from('user_checkins')
    .select('reward_credits')

  const rewardCreditsGiven = (rewardData ?? []).reduce((acc, row) => acc + (row.reward_credits ?? 0), 0)

  return {
    totalCheckins: totalCheckins ?? 0,
    todayCheckins: todayCheckins ?? 0,
    activeStreakUsers: activeStreakUsers ?? 0,
    rewardCreditsGiven,
  }
}

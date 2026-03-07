import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'
import { Redis } from '@upstash/redis'

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

import { getDayPillarGroupIndex } from '@/lib/fortune'

// removed: STEMS, BRANCHES, getDayPillarGroupIndex moved to @/lib/fortune
// 12 Earthly Branches  


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const stem = searchParams.get('stem') || ''
  const branch = searchParams.get('branch') || ''
  
  if (!stem || !branch) {
    return NextResponse.json({ error: 'stem and branch params required' }, { status: 400 })
  }

  const groupIndex = getDayPillarGroupIndex(stem, branch)
  const today = new Date().toISOString().slice(0, 10)
  const cacheKey = `daily-fortune:${today}:${groupIndex}`

  // Try Redis cache first (fastest)
  if (redis) {
    const cached = await redis.get<string>(cacheKey)
    if (cached) {
      return NextResponse.json({ content: cached, group: groupIndex, date: today, cached: true })
    }
  }

  // Try Supabase
  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('daily_fortunes')
      .select('content')
      .eq('group_index', groupIndex)
      .eq('fortune_date', today)
      .single()
    
    if (data) {
      // Cache in Redis for next time
      if (redis) {
        await redis.set(cacheKey, data.content, { ex: 86400 })
      }
      return NextResponse.json({ content: data.content, group: groupIndex, date: today, cached: false })
    }
  }

  return NextResponse.json({ 
    error: 'Fortune not available yet. Please try again later.',
    group: groupIndex, 
    date: today 
  }, { status: 404 })
}

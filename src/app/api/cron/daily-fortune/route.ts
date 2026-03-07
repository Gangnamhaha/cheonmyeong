import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getSupabase } from '@/lib/db'
import { Redis } from '@upstash/redis'

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null

import { get60Jiazi } from '@/lib/fortune'


export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const supabase = getSupabase()
  const today = new Date().toISOString().slice(0, 10)
  const jiazi = get60Jiazi()

  let generated = 0
  let skipped = 0

  // Process in batches of 10 to avoid rate limits
  for (let batch = 0; batch < 6; batch++) {
    const batchItems = jiazi.slice(batch * 10, (batch + 1) * 10)
    
    const promises = batchItems.map(async (item) => {
      // Check if already generated today
      if (supabase) {
        const { data } = await supabase
          .from('daily_fortunes')
          .select('id')
          .eq('group_index', item.index)
          .eq('fortune_date', today)
          .single()
        if (data) { skipped++; return }
      }

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `당신은 동양 명리학 전문가입니다. 오늘 날짜: ${today}. 일주(日柱)가 "${item.name}"인 사람들의 오늘 운세를 150-200자로 간결하게 작성하세요. 재물운, 건강운, 대인관계 중 하나를 중점으로 다루세요. 긍정적이고 실용적인 조언을 포함하세요. 존댓말을 사용하세요.`
            },
            {
              role: 'user',
              content: `일주 ${item.name}의 오늘 운세를 알려주세요.`
            }
          ],
          max_tokens: 300,
          temperature: 0.8,
        })

        const content = response.choices[0]?.message?.content || ''
        
        // Save to Supabase
        if (supabase && content) {
          await supabase.from('daily_fortunes').upsert({
            group_index: item.index,
            fortune_date: today,
            content,
          }, { onConflict: 'group_index,fortune_date' })
        }

        // Cache in Redis
        if (redis && content) {
          const cacheKey = `daily-fortune:${today}:${item.index}`
          await redis.set(cacheKey, content, { ex: 86400 })
        }

        generated++
      } catch (err) {
        console.error(`Failed to generate fortune for ${item.name}:`, err)
      }
    })

    await Promise.all(promises)
    
    // Small delay between batches
    if (batch < 5) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return NextResponse.json({ 
    ok: true, 
    date: today, 
    generated, 
    skipped, 
    total: 60 
  })
}

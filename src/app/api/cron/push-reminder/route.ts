import { NextRequest, NextResponse } from 'next/server'
import { broadcastPush } from '@/lib/push'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const kstHour = now.getUTCHours() + 9

  let pushResult = { success: 0, failure: 0 }
  let notificationType = 'none'

  try {
    // Evening Check-in Reminder (18:00 KST = 09:00 UTC)
    if (kstHour === 18) {
      pushResult = await broadcastPush({
        title: '✅ 오늘 체크인 하셨나요?',
        body: '매일 체크인하면 무료 크레딧을 드려요! 지금 확인해보세요.',
        url: 'https://sajuhae.vercel.app',
      })
      notificationType = 'evening-checkin'
    }
    // Weekend Engagement (Saturday 10:00 KST = 01:00 UTC)
    else if (now.getUTCDay() === 6 && now.getUTCHours() === 1) {
      pushResult = await broadcastPush({
        title: '🌟 이번 주말 운세가 궁금하다면?',
        body: 'AI 사주 분석으로 주말 운세를 확인해보세요. 무료!',
        url: 'https://sajuhae.vercel.app/fortune/today',
      })
      notificationType = 'weekend-engagement'
    }
  } catch (e) {
    console.error('Push broadcast failed:', e)
  }

  return NextResponse.json({
    ok: true,
    notificationType,
    push: pushResult,
  })
}

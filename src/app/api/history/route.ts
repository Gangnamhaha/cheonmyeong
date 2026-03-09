import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface SajuResult {
  id: string
  form_data: {
    name: string
    year: number
    month: number
    day: number
    hour: number
    minute: number
    gender: string
    calendarType: string
  }
  created_at: string
  view_count: number
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Require authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const userId = (session.user as Record<string, unknown>).id as string
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 401 }
      )
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json(
        { error: '데이터베이스 연결에 실패했습니다.' },
        { status: 500 }
      )
    }

    // Fetch user's saju results
    const { data, error } = await supabase
      .from('saju_results')
      .select('id, form_data, created_at, view_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: '결과를 불러올 수 없습니다.' },
        { status: 500 }
      )
    }

    const results = (data ?? []) as SajuResult[]

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    })
  } catch (err) {
    console.error('History API error:', err)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

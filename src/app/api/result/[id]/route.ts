import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'DB가 설정되지 않았습니다.' }, { status: 500 })
  }

  const id = params.id
  if (!id) {
    return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('saju_results')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '결과를 찾을 수 없습니다.' }, { status: 404 })
  }

  const nextViewCount = (data.view_count ?? 0) + 1
  await supabase
    .from('saju_results')
    .update({ view_count: nextViewCount })
    .eq('id', id)

  return NextResponse.json({
    ...data,
    view_count: nextViewCount,
  })
}

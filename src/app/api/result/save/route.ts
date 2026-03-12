import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'

const BASE_URL = 'https://sajuhae.vercel.app'

function generateShortId(): string {
  return randomUUID().replace(/-/g, '').slice(0, 8)
}

export async function POST(req: NextRequest) {
  let body: {
    userId?: string
    formData?: unknown
    sajuData?: unknown
    traditionalData?: unknown
    aiInterpretations?: unknown
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  if (!body.formData || !body.sajuData) {
    return NextResponse.json({ error: 'formData와 sajuData는 필수입니다.' }, { status: 400 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'DB가 설정되지 않았습니다.' }, { status: 500 })
  }

  let id = generateShortId()

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { error } = await supabase.from('saju_results').insert({
      id,
      user_id: typeof body.userId === 'string' ? body.userId : null,
      form_data: body.formData,
      saju_data: body.sajuData,
      traditional_data: body.traditionalData ?? null,
      ai_interpretations: typeof body.aiInterpretations === 'object' && body.aiInterpretations !== null ? body.aiInterpretations : {},
    })

    if (!error) {
      return NextResponse.json({ id, url: `${BASE_URL}/result/${id}` })
    }

    if (error.code === '23505') {
      id = generateShortId()
      continue
    }

    return NextResponse.json({ error: '결과 저장에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ error: 'ID 생성에 실패했습니다. 다시 시도해 주세요.' }, { status: 500 })
}

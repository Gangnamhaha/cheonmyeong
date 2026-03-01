import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `당신은 20년 경력의 한국 명리학 전문가입니다. 사주팔자와 오행 분석 데이터를 받아 자연스러운 한국어로 해석해 주세요.

다음 내용을 포함하여 작성하세요:
1. 사주 개요 (전체적인 사주의 특징)
2. 성격과 기질 (타고난 성품)
3. 재능과 적성 (잘 맞는 분야)
4. 주의할 점 (보완해야 할 부분)
5. 종합 조언 (삶의 방향)

따뜻하고 공감적이되 구체적인 조언을 제공하세요. 800자 이내로 작성하세요.`

export async function POST(req: NextRequest) {
  // API 키 확인
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API 키가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  // 요청 본문 파싱
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청 형식입니다.' },
      { status: 400 }
    )
  }

  const { saju, oheng } = body as { saju?: unknown; oheng?: unknown }

  if (!saju || !oheng) {
    return NextResponse.json(
      { error: '사주 데이터가 필요합니다. saju와 oheng 필드를 포함해 주세요.' },
      { status: 400 }
    )
  }

  // OpenAI 호출
  try {
    const openai = new OpenAI({ apiKey })

    const userMessage = `다음 사주팔자를 해석해 주세요:

${JSON.stringify(saju, null, 2)}

오행 분석:
${JSON.stringify(oheng, null, 2)}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })

    const interpretation = completion.choices[0]?.message?.content ?? ''

    return NextResponse.json({ interpretation })
  } catch (err) {
    console.error('OpenAI API 오류:', err)
    return NextResponse.json(
      { error: 'AI 해석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    )
  }
}

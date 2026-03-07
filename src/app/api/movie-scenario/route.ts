import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export interface MovieScene {
  type: 'prologue' | 'birth' | 'pillars' | 'elements' | 'guardian' | 'fortune' | 'message' | 'epilogue'
  narration: string
  mood: 'mystical' | 'dramatic' | 'warm' | 'intense' | 'serene' | 'hopeful'
  subtitle: string
}

export interface MovieScenario {
  title: string
  scenes: MovieScene[]
}

const SYSTEM_PROMPT = `당신은 사주팔자 데이터를 한 편의 단편 영화 시나리오로 변환하는 시나리오 작가입니다.
주어진 사주 분석 데이터를 8장면의 드라마틱한 영화 내레이션으로 작성하세요.

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이 순수 JSON만):

{
  "title": "영화 제목 (4-8글자, 시적이고 운명적인 느낌)",
  "scenes": [
    {
      "type": "prologue",
      "narration": "프롤로그 내레이션 (2-3문장, 신비로운 시작)",
      "mood": "mystical",
      "subtitle": "서막"
    },
    {
      "type": "birth",
      "narration": "탄생 장면 내레이션 (2-3문장, 태어난 날의 하늘과 기운 묘사)",
      "mood": "warm",
      "subtitle": "탄생"
    },
    {
      "type": "pillars",
      "narration": "사주팔자 장면 (2-3문장, 네 기둥이 의미하는 운명의 구조 설명)",
      "mood": "dramatic",
      "subtitle": "네 기둥"
    },
    {
      "type": "elements",
      "narration": "오행 장면 (2-3문장, 오행의 조화/불균형을 자연 비유로 표현)",
      "mood": "serene",
      "subtitle": "원소의 춤"
    },
    {
      "type": "guardian",
      "narration": "용신 장면 (2-3문장, 수호하는 기운을 인격화하여 묘사)",
      "mood": "intense",
      "subtitle": "수호자"
    },
    {
      "type": "fortune",
      "narration": "올해 운세 장면 (2-3문장, 올해의 흐름을 계절/자연 비유로)",
      "mood": "hopeful 또는 dramatic (운세에 따라)",
      "subtitle": "올해의 파도"
    },
    {
      "type": "message",
      "narration": "핵심 메시지 장면 (3-4문장, 성격/적성/조언을 따뜻하게 전달)",
      "mood": "warm",
      "subtitle": "운명의 메시지"
    },
    {
      "type": "epilogue",
      "narration": "에필로그 (1-2문장, 여운 있는 마무리)",
      "mood": "hopeful",
      "subtitle": "새로운 장"
    }
  ]
}

규칙:
1. 내레이션은 영화 내레이터가 읽는 것처럼 문학적이고 서정적으로 작성
2. 이름을 2인칭("당신")으로 자연스럽게 사용
3. 사주 데이터의 실제 값(천간, 지지, 오행, 용신 등)을 내레이션에 자연스럽게 녹여낼 것
4. 각 장면의 narration은 60-120자 이내
5. 전체적으로 희망적이고 따뜻한 톤을 유지하되, 주의점도 부드럽게 전달
6. 한자를 적절히 섞어 격조를 높일 것 (예: "庚金의 기운", "午火의 열정")
7. mood 값은 반드시 mystical, dramatic, warm, intense, serene, hopeful 중 하나
8. subtitle은 2-5글자의 장면 제목`

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { formData, saju, oheng, ilganStrength, yongsin, yearlyFortune, traditionalSummary } = body as {
    formData?: { name?: string; year?: number; month?: number; day?: number; gender?: string }
    saju?: unknown
    oheng?: unknown
    ilganStrength?: unknown
    yongsin?: unknown
    yearlyFortune?: unknown
    traditionalSummary?: string
  }

  if (!saju || !oheng) {
    return NextResponse.json({ error: 'saju and oheng are required' }, { status: 400 })
  }

  const userMessage = `다음 사주 데이터를 바탕으로 영화 시나리오를 작성하세요.

[인물 정보]
이름: ${formData?.name ?? '미상'}
생년월일: ${formData?.year ?? '?'}년 ${formData?.month ?? '?'}월 ${formData?.day ?? '?'}일
성별: ${formData?.gender === 'male' ? '남' : '여'}

[사주팔자]
${JSON.stringify(saju)}

[오행 분석]
${JSON.stringify(oheng)}

[일간 강약]
${JSON.stringify(ilganStrength)}

[용신]
${JSON.stringify(yongsin)}

[올해 운세]
${JSON.stringify(yearlyFortune)}

${traditionalSummary ? `[전통 해석 요약]\n${traditionalSummary}` : ''}`

  try {
    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.85,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    let scenario: MovieScenario

    try {
      scenario = JSON.parse(raw) as MovieScenario
    } catch {
      return NextResponse.json({ error: 'Failed to parse scenario' }, { status: 500 })
    }

    // Validate structure
    if (!scenario.scenes || !Array.isArray(scenario.scenes) || scenario.scenes.length < 6) {
      return NextResponse.json({ error: 'Invalid scenario structure' }, { status: 500 })
    }

    return NextResponse.json({ scenario })
  } catch (err) {
    console.error('Movie scenario error:', err)
    return NextResponse.json({ error: 'AI 시나리오 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

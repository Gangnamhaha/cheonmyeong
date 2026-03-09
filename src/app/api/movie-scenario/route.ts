import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { recordAnalysisEvent } from '@/lib/admin'
import { logTokenUsage, calculateCost } from '@/lib/ai-cost'

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

const SYSTEM_PROMPT = `당신은 사주팔자 데이터를 한 편의 인생 드라마 시나리오로 변환하는 드라마 작가입니다.
주어진 사주 분석 데이터를 기반으로, 이 사람이 주인공인 드라마를 8장면으로 작성하세요.
사주 데이터의 값들을 직접 설명하지 말고, 성격·상황·사건·감정으로 자연스럽게 녹여내세요.

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이 순수 JSON만):

{
  "title": "드라마 제목 (4-8글자, 운명적이고 드라마틱한 느낌)",
  "scenes": [
    {
      "type": "prologue",
      "narration": "주인공 소개 — 일간/십신의 성격을 행동과 상황으로 보여주는 첫 등장",
      "mood": "mystical",
      "subtitle": "2-5글자"
    },
    {
      "type": "birth",
      "narration": "어린 시절 에피소드 — 년주/월주에서 드러나는 가정환경과 성장 배경",
      "mood": "warm",
      "subtitle": "2-5글자"
    },
    {
      "type": "pillars",
      "narration": "운명의 구조가 드러나는 전환점 — 내면의 갈등이나 정체성의 충돌",
      "mood": "dramatic",
      "subtitle": "2-5글자"
    },
    {
      "type": "elements",
      "narration": "인생의 위기 — 오행 불균형이 만들어내는 구체적 시련과 갈등",
      "mood": "intense",
      "subtitle": "2-5글자"
    },
    {
      "type": "guardian",
      "narration": "운명적 만남 — 용신의 기운을 가진 인물/사건과의 결정적 조우",
      "mood": "warm",
      "subtitle": "2-5글자"
    },
    {
      "type": "fortune",
      "narration": "올해의 이야기 — 현재 운세가 만들어내는 상황과 도전",
      "mood": "dramatic",
      "subtitle": "2-5글자"
    },
    {
      "type": "message",
      "narration": "깨달음과 성장 — 시련을 통해 얻은 통찰, 클라이맥스",
      "mood": "hopeful",
      "subtitle": "2-5글자"
    },
    {
      "type": "epilogue",
      "narration": "희망찬 미래 — 대운의 흐름이 암시하는 새로운 시작",
      "mood": "hopeful",
      "subtitle": "2-5글자"
    }
  ]
}

규칙:
1. 주인공의 이름을 사용하여 3인칭 시점으로 서술 (소설처럼)
2. 사주 용어(천간, 지지, 오행 등)를 직접 언급하지 말 것 — 성격, 상황, 사건으로 은유적으로 표현
3. 구체적인 장소, 날씨, 감각(시각/청각/촉각) 묘사를 포함하여 생생하게
4. 각 장면에 대사를 1-2개 포함하여 생동감 부여 (따옴표 사용)
5. 8장면이 하나의 연결된 이야기가 되어야 함
6. 각 장면의 narration은 80-150자 이내
7. 드라마틱한 긴장감과 따뜻한 감동을 교차시킬 것
8. mood 값은 반드시 mystical, dramatic, warm, intense, serene, hopeful 중 하나
9. subtitle은 2-5글자의 장면 제목
10. 성별/나이에 맞는 현실적이고 공감 가능한 이야기를 작성`

const GENRE_INSTRUCTIONS: Record<string, string> = {
  classic:
    '현실적인 인생 드라마로 작성하세요. 일상의 아름다움과 인생의 무게를 담은 정통 드라마. 따뜻하면서도 깊이 있는 톤으로.',
  romance:
    '로맨스 드라마로 작성하세요. 용신의 기운을 가진 운명적 상대와의 사랑 이야기를 중심으로, 설레고 감성적인 톤으로. 만남과 이별, 재회의 드라마.',
  growth:
    '성장 드라마로 작성하세요. 시련과 좌절을 딛고 한 단계 성장하는 과정을 진정성 있게 그려주세요. 땀과 눈물, 그리고 결국 웃게 되는 이야기.',
  adventure:
    '모험 드라마로 작성하세요. 미지의 세계로 떠나는 영웅의 여정. 웅장하고 역동적인 대서사시. 세상을 바꾸거나, 자신을 찾는 여행.',
  fantasy:
    '판타지 드라마로 작성하세요. 오행을 원소 마법으로, 용신을 수호 정령으로 변환한 이계(異界) 모험 드라마. 신비롭고 몽환적인 세계관.',
  period:
    '사극 드라마로 작성하세요. 조선시대 배경, 천명(天命)에 맞서는 주인공의 이야기를 고풍스러운 문체로. 한자를 적절히 활용하세요.',
}

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

  const {
    formData,
    saju,
    oheng,
    ilganStrength,
    yongsin,
    yearlyFortune,
    traditionalSummary,
    genre = 'classic',
  } = body as {
    formData?: { name?: string; year?: number; month?: number; day?: number; gender?: string }
    saju?: unknown
    oheng?: unknown
    ilganStrength?: unknown
    yongsin?: unknown
    yearlyFortune?: unknown
    traditionalSummary?: string
    genre?: string
  }

  if (!saju || !oheng) {
    return NextResponse.json({ error: 'saju and oheng are required' }, { status: 400 })
  }

  const userMessage = `다음 사주 데이터를 바탕으로 드라마 시나리오를 작성하세요.

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

  const genreInstruction = GENRE_INSTRUCTIONS[genre as string] ?? GENRE_INSTRUCTIONS.classic
  const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n장르 지시: ${genreInstruction}`

  try {
    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.85,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: fullSystemPrompt },
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

    // Track credit consumption (fire-and-forget)
    recordAnalysisEvent().catch(() => {})

    // Log token usage
    if (completion.usage) {
      const cost = calculateCost('gpt-4o-mini', completion.usage.prompt_tokens, completion.usage.completion_tokens)
      logTokenUsage({
        model: 'gpt-4o-mini',
        inputTokens: completion.usage.prompt_tokens,
        outputTokens: completion.usage.completion_tokens,
        feature: 'movie',
        estimatedCost: cost,
      }).catch(() => {})
    }

    return NextResponse.json({ scenario })
  } catch (err) {
    console.error('Movie scenario error:', err)
    return NextResponse.json({ error: 'AI 시나리오 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

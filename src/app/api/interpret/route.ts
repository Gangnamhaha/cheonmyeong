import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Rate limiting: IP -> timestamps of requests
const RATE_LIMIT = new Map<string, number[]>()
const MAX_REQUESTS = 10
const WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = RATE_LIMIT.get(ip) ?? []
  const recentRequests = timestamps.filter((t) => now - t < WINDOW_MS)

  if (recentRequests.length >= MAX_REQUESTS) {
    return false
  }

  recentRequests.push(now)
  RATE_LIMIT.set(ip, recentRequests)
  return true
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.ip ?? '127.0.0.1'
}

type Category = '종합' | '성격' | '연애' | '직업' | '건강' | '재물'

function getSystemPrompt(category: Category): string {
  const basePrompt = `당신은 20년 경력의 한국 명리학 전문가입니다. 사주팔자, 오행, 십신, 용신, 대운 분석 데이터를 받아 자연스러운 한국어로 해석해 주세요.`

  const categoryPrompts: Record<Category, string> = {
    '종합': `${basePrompt}\n\n다음 내용을 포함하여 작성하세요:\n1. 사주 개요 (전체적인 사주의 특징)\n2. 성격과 기질 (타고난 성품)\n3. 재능과 적성 (잘 맞는 분야)\n4. 주의할 점 (보완해야 할 부분)\n5. 종합 조언 (삶의 방향)\n\n따뜻하고 공감적이되 구체적인 조언을 제공하세요. 800자 이내로 작성하세요.`,
    '성격': `${basePrompt}\n\n다음 내용을 포함하여 작성하세요:\n1. 성격과 기질\n2. 대인관계 스타일\n3. 감정 패턴\n\n600자 이내로 작성하세요.`,
    '연애': `${basePrompt}\n\n다음 내용을 포함하여 작성하세요:\n1. 연애 스타일\n2. 이상형\n3. 궁합 포인트\n4. 주의할 점\n\n600자 이내로 작성하세요.`,
    '직업': `${basePrompt}\n\n다음 내용을 포함하여 작성하세요:\n1. 적성\n2. 직업 추천\n3. 직장 스타일\n4. 재물운\n\n600자 이내로 작성하세요.`,
    '건강': `${basePrompt}\n\n다음 내용을 포함하여 작성하세요:\n1. 건강 취약점\n2. 주의 장기\n3. 건강 관리법\n\n600자 이내로 작성하세요.`,
    '재물': `${basePrompt}\n\n다음 내용을 포함하여 작성하세요:\n1. 재물운\n2. 투자 성향\n3. 돈 관리 조언\n\n600자 이내로 작성하세요.`,
  }

  return categoryPrompts[category]
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const clientIp = getClientIp(req)
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 429 }
    )
  }

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

  const {
    saju,
    oheng,
    sipsin,
    ilganStrength,
    yongsin,
    daeun,
    yearlyFortune,
    monthlyFortune,
    category = '종합',
    stream = true,
    followUp,
  } = body as {
    saju?: unknown
    oheng?: unknown
    sipsin?: unknown
    ilganStrength?: unknown
    yongsin?: unknown
    daeun?: unknown
    yearlyFortune?: unknown
    monthlyFortune?: unknown
    category?: Category
    stream?: boolean
    followUp?: string
  }

  if (!saju || !oheng) {
    return NextResponse.json(
      { error: '사주 데이터가 필요합니다. saju와 oheng 필드를 포함해 주세요.' },
      { status: 400 }
    )
  }

  // Validate category
  const validCategories: Category[] = ['종합', '성격', '연애', '직업', '건강', '재물']
  const selectedCategory: Category = validCategories.includes(category as Category)
    ? (category as Category)
    : '종합'

  // Build user message with all available data
  let userMessage = `다음 사주팔자를 해석해 주세요:\n\n사주팔자: ${JSON.stringify(saju)}\n\n오행 분석: ${JSON.stringify(oheng)}\n\n십신 분석: ${sipsin ? JSON.stringify(sipsin) : '없음'}\n\n일간 강약: ${ilganStrength ? JSON.stringify(ilganStrength) : '없음'}\n\n용신: ${yongsin ? JSON.stringify(yongsin) : '없음'}\n\n대운: ${daeun ? JSON.stringify(daeun) : '없음'}\n\n올해 세운: ${yearlyFortune ? JSON.stringify(yearlyFortune) : '없음'}\n\n이번 달 월운: ${monthlyFortune ? JSON.stringify(monthlyFortune) : '없음'}`

  // If follow-up question, append it
  if (followUp) {
    userMessage += `\n\n위 사주에 대해 추가 질문이 있습니다: ${followUp}\n간결하게 300자 이내로 답변해 주세요.`
  }

  // OpenAI 호출
  try {
    const openai = new OpenAI({ apiKey })

    const systemPrompt = getSystemPrompt(selectedCategory)

    // Streaming 모드
    if (stream) {
      const streamResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
        messages: [
          { role: 'system', content: followUp ? '당신은 20년 경력의 한국 명리학 전문가입니다. 사주 데이터를 바탕으로 추가 질문에 따뜻하고 구체적으로 답변해 주세요.' : systemPrompt },
          { role: 'user', content: userMessage },
        ],
      })

      return new Response(
        new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of streamResponse) {
                const text = chunk.choices[0]?.delta?.content ?? ''
                if (text) {
                  controller.enqueue(new TextEncoder().encode(text))
                }
              }
              controller.close()
            } catch (err) {
              console.error('Streaming error:', err)
              controller.error(err)
            }
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
          },
        }
      )
    }

    // Non-streaming fallback (backward compatibility)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: followUp ? '당신은 20년 경력의 한국 명리학 전문가입니다. 사주 데이터를 바탕으로 추가 질문에 따뜻하고 구체적으로 답변해 주세요.' : systemPrompt },
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

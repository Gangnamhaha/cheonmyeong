import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { logTokenUsage, calculateCost } from '@/lib/ai-cost'

// Rate limiting: IP -> timestamps
const RATE_LIMIT = new Map<string, number[]>()
const MAX_REQUESTS = 15
const WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = RATE_LIMIT.get(ip) ?? []
  const recent = timestamps.filter((t) => now - t < WINDOW_MS)

  if (recent.length >= MAX_REQUESTS) return false

  recent.push(now)
  RATE_LIMIT.set(ip, recent)
  return true
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.ip ?? '127.0.0.1'
}

const SYSTEM_PROMPT = `당신은 20년 경력의 한국 명리학(사주팔자) 전문가입니다.
사주, 오행, 음양, 십신, 용신, 대운, 궁합 등 명리학 전반에 대한 질문에 답변합니다.

규칙:
- 친절하고 따뜻한 말투로 답변하세요.
- 전문 용어는 쉽게 풀어서 설명하세요.
- 사주와 관련 없는 질문에는 "저는 사주/명리학 전문가라 해당 질문에는 답변이 어렵습니다. 사주에 관해 궁금한 점을 물어보세요!" 라고 안내하세요.
- 답변은 400자 이내로 간결하게 작성하세요.
- 마크다운 서식을 사용하지 마세요. 순수 텍스트로만 답변하세요.`

interface AskBody {
  messages?: { role: 'user' | 'assistant'; content: string }[]
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 429 },
    )
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI 서비스가 준비되지 않았습니다.' },
      { status: 500 },
    )
  }

  let body: AskBody
  try {
    body = (await req.json()) as AskBody
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const messages = body.messages
  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: '질문을 입력해주세요.' }, { status: 400 })
  }

  // Limit conversation length to prevent abuse
  const trimmedMessages = messages.slice(-10)

  try {
    const openai = new OpenAI({ apiKey })

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...trimmedMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    })

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            let totalInputTokens = 0
            let totalOutputTokens = 0
            
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content ?? ''
              if (text) {
                controller.enqueue(new TextEncoder().encode(text))
              }
              // Accumulate token usage from stream
              if (chunk.usage) {
                totalInputTokens = chunk.usage.prompt_tokens || 0
                totalOutputTokens = chunk.usage.completion_tokens || 0
              }
            }
            
            // Log token usage after stream completes
            if (totalInputTokens > 0 || totalOutputTokens > 0) {
              const cost = calculateCost('gpt-4o-mini', totalInputTokens, totalOutputTokens)
              logTokenUsage({
                model: 'gpt-4o-mini',
                inputTokens: totalInputTokens,
                outputTokens: totalOutputTokens,
                feature: 'ask',
                estimatedCost: cost,
              }).catch(() => {})
            }
            
            controller.close()
          } catch (err) {
            console.error('Ask streaming error:', err)
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
      },
    )
  } catch (err) {
    console.error('Ask API error:', err)
    return NextResponse.json(
      { error: 'AI 응답 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}

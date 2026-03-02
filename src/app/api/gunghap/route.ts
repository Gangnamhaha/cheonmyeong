import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const RATE_LIMIT = new Map<string, number[]>()
const MAX_REQUESTS = 10
const WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = RATE_LIMIT.get(ip) ?? []
  const recent = timestamps.filter(t => now - t < WINDOW_MS)
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

const SYSTEM_PROMPT = `당신은 20년 경력의 한국 명리학 궁합 전문가입니다. 두 사람의 사주팔자와 궁합 분석 데이터를 받아 자연스러운 한국어로 궁합을 해석해 주세요.

다음 내용을 포함하여 작성하세요:
1. 궁합 총평 (전체적인 두 사람의 조화)
2. 성격 궁합 (성격적으로 맞는 점과 주의할 점)
3. 연애/결혼 궁합 (연인이나 배우자로서의 궁합)
4. 직장/사업 궁합 (동료나 파트너로서의 궁합)
5. 조언 (관계를 더 좋게 만들기 위한 구체적인 조언)

따뜻하고 공감적이되 구체적인 조언을 제공하세요. 800자 이내로 작성하세요.`

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json({ error: '요청 한도를 초과했습니다.' }, { status: 429 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const { person1, person2, gunghap } = body as {
    person1?: unknown
    person2?: unknown
    gunghap?: unknown
  }

  if (!person1 || !person2 || !gunghap) {
    return NextResponse.json({ error: '두 사람의 사주 데이터와 궁합 결과가 필요합니다.' }, { status: 400 })
  }

  const userMessage = `다음 두 사람의 궁합을 해석해 주세요:

첫 번째 사람 사주: ${JSON.stringify(person1)}

두 번째 사람 사주: ${JSON.stringify(person2)}

궁합 분석 결과: ${JSON.stringify(gunghap)}`

  try {
    const openai = new OpenAI({ apiKey })

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1500,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
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
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    )
  } catch (err) {
    console.error('OpenAI API 오류:', err)
    return NextResponse.json({ error: 'AI 해석 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

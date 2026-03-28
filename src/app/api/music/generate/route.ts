import { NextRequest, NextResponse } from 'next/server'

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions'

interface GenerateBody {
  prompt?: string
  duration?: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function normalizeOutputUrl(output: unknown): string | null {
  if (typeof output === 'string') return output
  if (Array.isArray(output)) {
    const first = output.find((item) => typeof item === 'string')
    return typeof first === 'string' ? first : null
  }
  return null
}

export async function POST(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return NextResponse.json(
      {
        error:
          'AI 고품질 음악 생성 기능은 현재 준비 중입니다. 기본 사주 음악(실시간 Web Audio 버전)은 계속 이용하실 수 있습니다.',
      },
      { status: 503 },
    )
  }

  let body: GenerateBody
  try {
    body = (await req.json()) as GenerateBody
  } catch {
    return NextResponse.json({ error: '요청 본문이 올바른 JSON 형식이 아닙니다.' }, { status: 400 })
  }

  const prompt = (body.prompt ?? '').trim()
  if (!prompt) {
    return NextResponse.json({ error: 'prompt는 필수입니다.' }, { status: 400 })
  }

  const duration = Math.max(8, Math.min(30, Math.round(body.duration ?? 16)))

  try {
    const createResponse = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/musicgen',
        input: {
          prompt,
          duration,
        },
      }),
    })

    const createJson = (await createResponse.json()) as {
      id?: string
      status?: string
      output?: unknown
      urls?: { get?: string }
      detail?: string
      error?: string
    }

    if (!createResponse.ok || !createJson.urls?.get) {
      return NextResponse.json(
        { error: createJson.detail ?? createJson.error ?? 'Replicate 예측 요청에 실패했습니다.' },
        { status: 502 },
      )
    }

    const initialUrl = normalizeOutputUrl(createJson.output)
    if (createJson.status === 'succeeded' && initialUrl) {
      return NextResponse.json({ url: initialUrl })
    }

    for (let i = 0; i < 16; i += 1) {
      await sleep(1500)
      const pollResponse = await fetch(createJson.urls.get, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const pollJson = (await pollResponse.json()) as {
        status?: string
        output?: unknown
        error?: string
      }

      if (!pollResponse.ok) {
        return NextResponse.json(
          { error: pollJson.error ?? 'AI 음악 생성 상태를 확인하지 못했습니다.' },
          { status: 502 },
        )
      }

      if (pollJson.status === 'failed' || pollJson.status === 'canceled') {
        return NextResponse.json(
          { error: pollJson.error ?? 'AI 음악 생성이 중단되었습니다. 프롬프트를 바꿔 다시 시도해 주세요.' },
          { status: 502 },
        )
      }

      if (pollJson.status === 'succeeded') {
        const url = normalizeOutputUrl(pollJson.output)
        if (!url) {
          return NextResponse.json({ error: '생성은 완료되었지만 오디오 URL을 받지 못했습니다.' }, { status: 502 })
        }
        return NextResponse.json({ url })
      }
    }

    return NextResponse.json(
      { error: 'AI 음악 생성이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 504 },
    )
  } catch {
    return NextResponse.json(
      { error: 'AI 음악 생성 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 },
    )
  }
}

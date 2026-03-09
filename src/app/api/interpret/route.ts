import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { recordAnalysisEvent } from '@/lib/admin'
import { formatSajuForAI } from '@/lib/format-saju-ai'
import { logTokenUsage, calculateCost } from '@/lib/ai-cost'
import type { FullSajuResult } from '@/lib/saju'
import type { TraditionalInterpretation } from '@/lib/traditional-interpret'

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

type Category = '종합' | '성격' | '연애' | '직업' | '건강' | '재물' | '인생성장'

// ──────────────────────────────────────────
// 공통 시스템 프롬프트 (모든 카테고리 공유)
// 카테고리별 분기는 유저 메시지의 CATEGORY_FOCUS에서 처리
// ──────────────────────────────────────────
const SYSTEM_PROMPT = `당신은 20년 이상 임상 상담 경험을 가진 한국 명리학자입니다.
사용자가 제공한 "계산 결과"를 재계산하지 말고, 그 근거를 바탕으로 전통 명리학의 언어로 해석하되 현대 삶에 적용 가능한 조언으로 연결하세요.

■ 해석 원칙
- 과장된 단정, 공포 조장, 확정적 예언은 금지. "경향 + 선택지 + 관리 포인트"로 말하세요.
- 근거 없는 세부(특정 사건, 날짜, 금액, 병명)는 언급하지 마세요.
- 건강/재물은 참고 수준의 체질·습관 조언으로, 전문 진단이나 투자 확언처럼 쓰지 마세요.

■ 해석 절차 (반드시 이 순서로 내부 판단 후 서술)
1) 일간/월령 중심으로 체질(기본 기세) 파악 → 신강/신약과 오행 편중/결핍으로 "무엇이 과하고 무엇이 모자란지" 정리
2) 십신 분포로 성향/관계/일 처리 방식의 '반복 패턴'을 잡고, 강점 2개와 약점 2개를 근거와 함께 선택
3) 용신/희신을 "생활 운영 원칙"으로 번역 (환경, 사람, 일의 방식, 리듬), 기피 오행은 "피해야 할 과몰입"으로 설명
4) 대운 → 올해 → 이번달 순으로 타이밍을 읽되, 사건 예언이 아니라 "유리한 전략/주의점"으로 제시
5) 전통 문구는 그대로 베끼지 말고 의미를 살려 자연스럽게 1~2회만 섞어 신뢰감을 높이세요 (과도한 인용 금지)

■ 문체 규칙
- 첫 줄은 반드시 이 사주의 핵심 한줄 진단 (20자 내외)
- 둘째 줄은 키워드 4~6개 (예: "화기강 / 신약 / 식신주도 / 정인운")
- 이후 단락은 줄바꿈으로 구분 (마크다운 서식 금지, 순수 텍스트)
- 같은 말을 반복하지 마세요
- 사주 데이터의 실제 값(천간, 지지, 오행, 십신명)을 자연스럽게 녹여 근거 있는 해석을 하세요
- 사용자 입력의 [REQUEST] 블록에서 카테고리와 분량 지시를 확인하고 정확히 따르세요
- 따뜻하고 공감적이되 구체적이고 실용적인 조언을 제공하세요`

const FOLLOWUP_SYSTEM_PROMPT = `당신은 20년 이상 경험의 한국 명리학 전문가입니다.
사주 데이터와 이전 해석을 바탕으로 추가 질문에 답변합니다.
- 사주 데이터의 실제 값을 근거로 구체적으로 답변하세요
- 과장이나 확정적 예언 없이, 경향과 조언으로 답하세요
- 마크다운 서식 없이 순수 텍스트로 답변하세요
- 400자 이내로 간결하게 작성하세요`

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
    traditionalContext,
    traditionalResult,
    formData,
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
    traditionalContext?: string
    traditionalResult?: TraditionalInterpretation | null
    formData?: { name?: string; year?: number; month?: number; day?: number; gender?: string }
  }

  if (!saju || !oheng) {
    return NextResponse.json(
      { error: '사주 데이터가 필요합니다. saju와 oheng 필드를 포함해 주세요.' },
      { status: 400 }
    )
  }

  // Validate category
  const validCategories: Category[] = ['종합', '성격', '연애', '직업', '건강', '재물', '인생성장']
  const selectedCategory: Category = validCategories.includes(category as Category)
    ? (category as Category)
    : '종합'

  // ──────────────────────────────────────────
  // 유저 메시지 구성: formatSajuForAI 사용
  // ──────────────────────────────────────────
  let userMessage: string

  // 구조화된 포맷팅 (모든 필수 데이터가 있을 때)
  if (sipsin && ilganStrength && yongsin && daeun && yearlyFortune && monthlyFortune) {
    const fullResult: FullSajuResult = {
      saju: saju as FullSajuResult['saju'],
      oheng: oheng as FullSajuResult['oheng'],
      sipsin: sipsin as FullSajuResult['sipsin'],
      ilganStrength: ilganStrength as FullSajuResult['ilganStrength'],
      yongsin: yongsin as FullSajuResult['yongsin'],
      daeun: daeun as FullSajuResult['daeun'],
      yearlyFortune: yearlyFortune as FullSajuResult['yearlyFortune'],
      monthlyFortune: monthlyFortune as FullSajuResult['monthlyFortune'],
    }

    userMessage = formatSajuForAI(fullResult, selectedCategory, formData ?? undefined, traditionalResult)
  } else {
    // 기존 방식 폴백 (일부 데이터만 있을 때)
    userMessage = `다음 사주팔자를 해석해 주세요:\n\n사주팔자: ${JSON.stringify(saju)}\n\n오행 분석: ${JSON.stringify(oheng)}\n\n십신 분석: ${sipsin ? JSON.stringify(sipsin) : '없음'}\n\n일간 강약: ${ilganStrength ? JSON.stringify(ilganStrength) : '없음'}\n\n용신: ${yongsin ? JSON.stringify(yongsin) : '없음'}\n\n대운: ${daeun ? JSON.stringify(daeun) : '없음'}\n\n올해 세운: ${yearlyFortune ? JSON.stringify(yearlyFortune) : '없음'}\n\n이번 달 월운: ${monthlyFortune ? JSON.stringify(monthlyFortune) : '없음'}`

    if (traditionalContext) {
      userMessage += `\n\n전통 명리학 해설서 참고:\n${traditionalContext}`
    }
  }

  // 후속 질문
  if (followUp) {
    userMessage += `\n\n위 사주에 대해 추가 질문이 있습니다: ${followUp}\n간결하게 400자 이내로 답변해 주세요.`
  }

  // ──────────────────────────────────────────
  // OpenAI 호출 (파라미터 최적화)
  // ──────────────────────────────────────────
  const isComprehensive = selectedCategory === '종합' || selectedCategory === '인생성장'
  const modelParams = {
    temperature: followUp ? 0.5 : (isComprehensive ? 0.5 : 0.55),
    max_tokens: followUp ? 600 : (isComprehensive ? 2000 : 1200),
    presence_penalty: 0.2,
  }

  try {
    const openai = new OpenAI({ apiKey })
    const systemContent = followUp ? FOLLOWUP_SYSTEM_PROMPT : SYSTEM_PROMPT

    // Streaming 모드
    if (stream) {
      const streamResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        ...modelParams,
        stream: true,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userMessage },
        ],
      })

      // Record analysis event (fire-and-forget)
      recordAnalysisEvent().catch(() => {})

      return new Response(
        new ReadableStream({
          async start(controller) {
            try {
              let totalInputTokens = 0
              let totalOutputTokens = 0
              
              for await (const chunk of streamResponse) {
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
                  feature: 'interpret',
                  estimatedCost: cost,
                }).catch(() => {})
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
      ...modelParams,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userMessage },
      ],
    })

    const interpretation = completion.choices[0]?.message?.content ?? ''

    // Record analysis event (fire-and-forget)
    recordAnalysisEvent().catch(() => {})

    // Log token usage
    if (completion.usage) {
      const cost = calculateCost('gpt-4o-mini', completion.usage.prompt_tokens, completion.usage.completion_tokens)
      logTokenUsage({
        model: 'gpt-4o-mini',
        inputTokens: completion.usage.prompt_tokens,
        outputTokens: completion.usage.completion_tokens,
        feature: 'interpret',
        estimatedCost: cost,
      }).catch(() => {})
    }

    return NextResponse.json({ interpretation })
  } catch (err) {
    console.error('OpenAI API 오류:', err)
    return NextResponse.json(
      { error: 'AI 해석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    )
  }
}

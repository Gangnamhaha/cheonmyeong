import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabase } from '@/lib/db'
import { formatSajuForAI } from '@/lib/format-saju-ai'
import { verifyPortonePayment } from '@/lib/portone'
import type { FullSajuResult } from '@/lib/saju'

type Category = '종합' | '성격' | '연애' | '직업' | '건강' | '재물' | '인생성장'

const CATEGORIES: Category[] = ['종합', '성격', '연애', '직업', '건강', '재물', '인생성장']

const PREMIUM_SYSTEM_PROMPT = `당신은 20년 이상 임상 상담 경험을 가진 한국 명리학자입니다.
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

async function logAiUsage(params: {
  category: Category
  inputTokens: number
  outputTokens: number
}) {
  const supabase = getSupabase()
  if (!supabase) return

  const inputCost = (params.inputTokens / 1_000_000) * 5
  const outputCost = (params.outputTokens / 1_000_000) * 15
  const estimatedCost = Number((inputCost + outputCost).toFixed(6))

  await supabase.from('analytics_events').insert({
    event_type: 'ai_usage',
    metadata: {
      model: 'gpt-4o',
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      category: params.category,
      feature: 'premium_report',
      estimated_cost: estimatedCost,
    },
  })
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }, { status: 500 })
  }
  if (!apiKey.startsWith('sk-')) {
    return NextResponse.json({ error: 'OPENAI_API_KEY 형식이 올바르지 않습니다.' }, { status: 500 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'DB가 설정되지 않았습니다.' }, { status: 500 })
  }

  let body: {
    sajuData?: FullSajuResult
    formData?: Record<string, unknown>
    traditionalContext?: string
    paymentId?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  if (!body.sajuData || !body.formData || !body.paymentId) {
    return NextResponse.json({ error: 'sajuData, formData, paymentId는 필수입니다.' }, { status: 400 })
  }

  const payment = await verifyPortonePayment(body.paymentId)
  if (payment.status !== 'PAID') {
    return NextResponse.json({ error: '결제가 완료되지 않았습니다.' }, { status: 400 })
  }
  if (payment.amount.total !== 9900) {
    return NextResponse.json({ error: '결제 금액 검증에 실패했습니다.' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const sessionUserId = session?.user ? (session.user as Record<string, unknown>).id as string : null
  const userIdFromCustomData = (() => {
    if (!payment.customData) return null
    try {
      const parsed = JSON.parse(payment.customData) as { userId?: string }
      return typeof parsed.userId === 'string' ? parsed.userId : null
    } catch {
      return null
    }
  })()
  const userId = sessionUserId ?? userIdFromCustomData

  try {
    const openai = new OpenAI({ apiKey })
    const interpretations: Partial<Record<Category, string>> = {}

    for (const category of CATEGORIES) {
      let prompt = formatSajuForAI(body.sajuData, category, body.formData)
      if (body.traditionalContext?.trim()) {
        prompt += `\n\n[TRADITIONAL CONTEXT]\n${body.traditionalContext.trim()}`
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.5,
        max_tokens: 3000,
        messages: [
          { role: 'system', content: PREMIUM_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      })

      interpretations[category] = completion.choices[0]?.message?.content ?? ''

      await logAiUsage({
        category,
        inputTokens: completion.usage?.prompt_tokens ?? 0,
        outputTokens: completion.usage?.completion_tokens ?? 0,
      })
    }

    const { data, error } = await supabase
      .from('premium_reports')
      .insert({
        user_id: userId,
        payment_id: body.paymentId,
        saju_data: body.sajuData,
        form_data: body.formData,
        report_content: interpretations,
        status: 'completed',
        amount: 9900,
      })
      .select('id')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: '리포트 저장에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      reportId: data.id,
      downloadUrl: `/api/report/download/${data.id}`,
    })
  } catch (error) {
    console.error('Premium report generation error:', error)
    return NextResponse.json({ error: '프리미엄 리포트 생성에 실패했습니다.' }, { status: 500 })
  }
}

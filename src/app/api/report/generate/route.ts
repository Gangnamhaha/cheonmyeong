import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabase } from '@/lib/db'
import { formatSajuForAI } from '@/lib/format-saju-ai'
import { verifyPortonePayment } from '@/lib/portone'
import { calculateDaeun, type DaeunResult } from '@/lib/daeun'
import { calculateYearlyFortune, type FortuneResult } from '@/lib/fortune'
import type { FullSajuResult } from '@/lib/saju'

type Category = '종합' | '성격' | '연애' | '직업' | '건강' | '재물' | '인생성장'
type ProSection = '대운 분석' | '세운 전망 (2025-2027)' | '인생 통합 조언'
type SectionKey = Category | ProSection
type ReportTier = 'basic' | 'pro'

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
  section: SectionKey
  model: 'gpt-4o' | 'gpt-4o-mini'
  tier: ReportTier
  inputTokens: number
  outputTokens: number
}) {
  const supabase = getSupabase()
  if (!supabase) return

  const inputRate = params.model === 'gpt-4o' ? 5 : 0.15
  const outputRate = params.model === 'gpt-4o' ? 15 : 0.6
  const inputCost = (params.inputTokens / 1_000_000) * inputRate
  const outputCost = (params.outputTokens / 1_000_000) * outputRate
  const estimatedCost = Number((inputCost + outputCost).toFixed(6))

  await supabase.from('analytics_events').insert({
    event_type: 'ai_usage',
    metadata: {
      model: params.model,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      category: params.section,
      feature: 'premium_report',
      tier: params.tier,
      estimated_cost: estimatedCost,
    },
  })
}

function getGender(formData?: Record<string, unknown>): 'male' | 'female' {
  return formData?.gender === 'female' ? 'female' : 'male'
}

function getBirthYear(formData?: Record<string, unknown>): number {
  return typeof formData?.year === 'number' ? formData.year : new Date().getFullYear()
}

function formatDaeunPeriods(daeun: DaeunResult): string {
  return daeun.periods
    .map((period) => `${period.startAge}~${period.endAge}세: ${period.stem}${period.branch}(${period.stemHanja}${period.branchHanja}) / 오행 ${period.element}`)
    .join('\n')
}

function formatYearlyFortunes(fortunes: Array<{ year: number; fortune: FortuneResult }>): string {
  return fortunes
    .map(({ year, fortune }) => `${year}년: ${fortune.pillar} | 오행 ${fortune.element} | 십신 ${fortune.sipsin} | 등급 ${fortune.rating} | ${fortune.description}`)
    .join('\n')
}

async function createSection(params: {
  openai: OpenAI
  model: 'gpt-4o' | 'gpt-4o-mini'
  section: SectionKey
  prompt: string
  tier: ReportTier
}): Promise<string> {
  const completion = await params.openai.chat.completions.create({
    model: params.model,
    temperature: 0.5,
    max_tokens: 3000,
    messages: [
      { role: 'system', content: PREMIUM_SYSTEM_PROMPT },
      { role: 'user', content: params.prompt },
    ],
  })

  await logAiUsage({
    section: params.section,
    model: params.model,
    tier: params.tier,
    inputTokens: completion.usage?.prompt_tokens ?? 0,
    outputTokens: completion.usage?.completion_tokens ?? 0,
  })

  return completion.choices[0]?.message?.content ?? ''
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
    tier?: ReportTier
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  if (!body.sajuData || !body.formData || !body.paymentId) {
    return NextResponse.json({ error: 'sajuData, formData, paymentId는 필수입니다.' }, { status: 400 })
  }

  const sajuData = body.sajuData
  const formData = body.formData
  const paymentId = body.paymentId

  const tier: ReportTier = body.tier === 'pro' ? 'pro' : 'basic'
  const expectedAmount = tier === 'pro' ? 25000 : 9900

  const payment = await verifyPortonePayment(paymentId)
  if (payment.status !== 'PAID') {
    return NextResponse.json({ error: '결제가 완료되지 않았습니다.' }, { status: 400 })
  }
  if (payment.amount.total !== expectedAmount) {
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
    const interpretations: Partial<Record<SectionKey, string>> = {}
    const baseModel: 'gpt-4o' | 'gpt-4o-mini' = tier === 'pro' ? 'gpt-4o-mini' : 'gpt-4o'

    for (const category of CATEGORIES) {
      let prompt = formatSajuForAI(sajuData, category, formData)
      if (body.traditionalContext?.trim()) {
        prompt += `\n\n[TRADITIONAL CONTEXT]\n${body.traditionalContext.trim()}`
      }
      interpretations[category] = await createSection({
        openai,
        model: baseModel,
        section: category,
        prompt,
        tier,
      })
    }

    if (tier === 'pro') {
      const daeun = calculateDaeun(sajuData.saju, getGender(formData), getBirthYear(formData))
      const yearlyFortunes = [2025, 2026, 2027].map((year) => ({
        year,
        fortune: calculateYearlyFortune(sajuData.saju, year),
      }))

      const daeunPrompt = [
        '[REQUEST]',
        '카테고리: 대운 분석',
        '분량: 1800자 내외',
        '요구: 각 10년 대운 구간의 핵심 기회/주의점/실천전략을 구체적으로 제시',
        '',
        '[계산된 대운 결과]',
        `방향: ${daeun.direction}, 시작나이: ${daeun.startAge}세`,
        formatDaeunPeriods(daeun),
        '',
        '[참고 사주 데이터]',
        formatSajuForAI(sajuData, '종합', formData),
      ].join('\n')

      const seunPrompt = [
        '[REQUEST]',
        '카테고리: 세운 전망 (2025-2027)',
        '분량: 1200~1600자',
        '요구: 각 연도별 핵심 운세, 주의할 결정, 추천 행동을 연도별로 제시',
        '',
        '[계산된 세운 결과]',
        formatYearlyFortunes(yearlyFortunes),
        '',
        '[참고 사주 데이터]',
        formatSajuForAI(sajuData, '종합', formData),
      ].join('\n')

      const lifeAdvicePrompt = [
        '[REQUEST]',
        '카테고리: 인생 통합 조언',
        '분량: 1200~1600자',
        '요구: 성격/직업/관계/건강/재물/대운/세운 전체를 통합한 장기 로드맵 제시',
        '',
        '[기존 7개 카테고리 요약]',
        CATEGORIES.map((category) => `${category}:\n${interpretations[category] ?? ''}`).join('\n\n'),
        '',
        '[대운 분석 초안 참고]',
        interpretations['대운 분석'] ?? '아직 없음',
        '',
        '[세운 전망 초안 참고]',
        interpretations['세운 전망 (2025-2027)'] ?? '아직 없음',
      ].join('\n')

      interpretations['대운 분석'] = await createSection({
        openai,
        model: 'gpt-4o',
        section: '대운 분석',
        prompt: daeunPrompt,
        tier,
      })

      interpretations['세운 전망 (2025-2027)'] = await createSection({
        openai,
        model: 'gpt-4o',
        section: '세운 전망 (2025-2027)',
        prompt: seunPrompt,
        tier,
      })

      const combinedLifeAdvicePrompt = [
        lifeAdvicePrompt,
        '',
        '[확정 대운 분석]',
        interpretations['대운 분석'] ?? '',
        '',
        '[확정 세운 전망]',
        interpretations['세운 전망 (2025-2027)'] ?? '',
      ].join('\n')

      interpretations['인생 통합 조언'] = await createSection({
        openai,
        model: 'gpt-4o',
        section: '인생 통합 조언',
        prompt: combinedLifeAdvicePrompt,
        tier,
      })

      interpretations['대운 분석'] = [
        `대운 흐름: ${daeun.direction} / 시작 나이 ${daeun.startAge}세`,
        '',
        '[대운 타임라인]',
        formatDaeunPeriods(daeun),
        '',
        '[해석]',
        interpretations['대운 분석'] ?? '',
      ].join('\n')
    }

    const { data, error } = await supabase
      .from('premium_reports')
      .insert({
        user_id: userId,
        payment_id: paymentId,
        saju_data: sajuData,
        form_data: { ...formData, reportTier: tier },
        report_content: interpretations,
        status: 'completed',
        amount: expectedAmount,
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

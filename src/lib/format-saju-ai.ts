/**
 * AI 해석 품질 향상을 위한 데이터 포맷팅 모듈
 * - Raw JSON → 구조화된 텍스트 블록으로 변환
 * - 전통 문구 카테고리별 선별
 * - 카테고리별 포커스 블록 생성
 */
import type { FullSajuResult, SajuPillar } from './saju'
import type { SipsinName } from './sipsin'
import type { TraditionalInterpretation, TraditionalEntry } from './traditional-interpret'
import type { DaeunPeriod, DaeunResult } from './daeun'
import type { FortuneResult } from './fortune'

type AiCategory = '종합' | '성격' | '연애' | '직업' | '건강' | '재물' | '인생성장'

interface FormDataForAI {
  name?: string
  year?: number
  month?: number
  day?: number
  gender?: string
}

type PeriodScope = 'daeun' | 'seun' | 'wolun'

interface PeriodFormatBase {
  saju: FullSajuResult['saju']
  oheng: FullSajuResult['oheng']
  yongsin: FullSajuResult['yongsin']
}

interface DaeunFormatInput {
  scope: 'daeun'
  base: PeriodFormatBase
  daeun: DaeunResult
  periodIndex: number
  period: DaeunPeriod
}

interface SeunFormatInput {
  scope: 'seun'
  base: PeriodFormatBase
  targetYear: number
  fortune: FortuneResult
}

interface WolunFormatInput {
  scope: 'wolun'
  base: PeriodFormatBase
  targetYear: number
  targetMonth: number
  fortune: FortuneResult
}

type PeriodFormatInput = DaeunFormatInput | SeunFormatInput | WolunFormatInput

// 천간 오행 해석 키워드
const ELEMENT_TRAITS: Record<string, string> = {
  목: '성장·인자·추진',
  화: '열정·표현·확산',
  토: '안정·중재·포용',
  금: '결단·의지·정리',
  수: '지혜·유연·침착',
}

// 십신 그룹별 의미
const SIPSIN_GROUP_MEANING: Record<string, { names: SipsinName[]; meaning: string }> = {
  비겁: { names: ['비견', '겁재'], meaning: '자기력·독립·경쟁' },
  식상: { names: ['식신', '상관'], meaning: '표현·창의·성과' },
  재성: { names: ['편재', '정재'], meaning: '현실·재물·실행' },
  관성: { names: ['편관', '정관'], meaning: '조직·책임·사회적위치' },
  인성: { names: ['편인', '정인'], meaning: '학습·사고·보호' },
}

/**
 * 사주 데이터를 AI 해석용 구조화된 텍스트로 변환
 */
export function formatSajuForAI(
  result: FullSajuResult,
  category: AiCategory,
  formData?: FormDataForAI,
  traditionalResult?: TraditionalInterpretation | null,
): string {
  const { saju, oheng, sipsin, ilganStrength, yongsin, daeun, yearlyFortune, monthlyFortune } = result
  const dayElement = saju.dayPillar.element
  const dayHanja = saju.dayPillar.heavenlyStemHanja ?? ''

  const sections: string[] = []

  // [REQUEST]
  const categoryFocus = getCategoryFocus(category)
  sections.push(`[REQUEST]\n카테고리: ${category}\n${categoryFocus}`)

  // [CORE SUMMARY] — 모델이 가장 먼저 읽는 핵심 지표
  const coreSummary: string[] = []
  coreSummary.push(`일간: ${saju.dayPillar.heavenlyStem}${dayElement}(${dayHanja}${saju.dayPillar.earthlyBranchHanja ?? ''}) — ${ELEMENT_TRAITS[dayElement] ?? dayElement}`)
  coreSummary.push(`신강약: ${ilganStrength.strength}(${ilganStrength.score > 0 ? '+' : ''}${ilganStrength.score})  지지력 ${ilganStrength.details.support} vs 억제력 ${ilganStrength.details.opposition}  월령(${ilganStrength.details.monthBranchElement}) ${ilganStrength.details.monthBranchHelps ? '도움' : '비도움'}`)
  coreSummary.push(`오행: 목${oheng.counts.목} 화${oheng.counts.화} 토${oheng.counts.토} 금${oheng.counts.금} 수${oheng.counts.수}  (강: ${oheng.dominant} / 약: ${oheng.weak} / ${oheng.balance})`)
  coreSummary.push(`용신: ${yongsin.yongsin}  희신: ${yongsin.huisin}  | 유리: ${yongsin.favorable.join(',')}  | 기피: ${yongsin.unfavorable.join(',')}`)

  // 십신 상위 빈도
  const sipsinTop = getSipsinTopSummary(sipsin.summary)
  coreSummary.push(`십신 상위: ${sipsinTop}`)

  // 올해/이번달 운
  coreSummary.push(`올해 세운: ${yearlyFortune.pillar}(${yearlyFortune.element}) — ${yearlyFortune.sipsin}, ${yearlyFortune.rating}  ${yearlyFortune.description.slice(0, 60)}`)
  coreSummary.push(`이번달 월운: ${monthlyFortune.pillar}(${monthlyFortune.element}) — ${monthlyFortune.sipsin}, ${monthlyFortune.rating}  ${monthlyFortune.description.slice(0, 60)}`)

  sections.push(`[CORE SUMMARY]\n${coreSummary.map(l => `- ${l}`).join('\n')}`)

  // [FOUR PILLARS] — 원국 4주
  const pillars = [
    formatPillar('년주', saju.yearPillar, sipsin.yearStem, sipsin.yearBranch),
    formatPillar('월주', saju.monthPillar, sipsin.monthStem, sipsin.monthBranch),
    formatPillar('일주', saju.dayPillar, '본인', sipsin.dayBranch) + '  ← 일간',
    formatPillar('시주', saju.hourPillar, sipsin.hourStem, sipsin.hourBranch),
  ]
  sections.push(`[FOUR PILLARS]\n${pillars.map(l => `- ${l}`).join('\n')}`)

  // [DETAIL SIGNALS]
  const details: string[] = []

  // 오행 해석 메모
  const ohengMemo: string[] = []
  if (oheng.counts[oheng.dominant as keyof typeof oheng.counts] >= 3) {
    ohengMemo.push(`${oheng.dominant} 과다 → ${ELEMENT_TRAITS[oheng.dominant] ?? ''} 성향 강`)
  }
  if (oheng.counts[oheng.weak as keyof typeof oheng.counts] <= 1) {
    ohengMemo.push(`${oheng.weak} 부족 → ${ELEMENT_TRAITS[oheng.weak] ?? ''} 보완 필요`)
  }
  if (ohengMemo.length > 0) {
    details.push(`오행 메모: ${ohengMemo.join(' / ')}`)
  }

  // 십신 전체 분포
  const sipsinAll = Object.entries(sipsin.summary)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ')
  details.push(`십신 분포: ${sipsinAll}`)

  // 십신 그룹별 해석
  const groupSummary = getSipsinGroupSummary(sipsin.summary)
  details.push(`십신 그룹: ${groupSummary}`)

  // 용신 판단 근거
  details.push(`용신 근거: ${yongsin.reason}`)

  sections.push(`[DETAIL SIGNALS]\n${details.map(l => `- ${l}`).join('\n')}`)

  // [DAEUN]
  const currentAge = formData?.year ? new Date().getFullYear() - formData.year + 1 : null
  const daeunLines: string[] = []
  daeunLines.push(`${daeun.direction} / 시작나이 ${daeun.startAge}${currentAge ? ` / 현재 만나이 약 ${currentAge - 1}세` : ''}`)

  for (const p of daeun.periods) {
    const isCurrent = currentAge !== null && currentAge >= p.startAge && currentAge <= p.endAge
    const marker = isCurrent ? ' ◀ 현재' : ''
    daeunLines.push(`${p.startAge}~${p.endAge}세: ${p.stem}${p.branch}(${p.stemHanja}${p.branchHanja}) ${p.element}${marker}`)
  }
  sections.push(`[DAEUN]\n${daeunLines.map(l => `- ${l}`).join('\n')}`)

  // [TRADITIONAL CLUES - SELECTED]
  if (traditionalResult) {
    const clues = selectTraditionalClues(traditionalResult, category)
    if (clues.length > 0) {
      const clueLines = clues.map((c, i) => `${i + 1}) ${c.plain}`)
      sections.push(`[TRADITIONAL CLUES - SELECTED]\n${clueLines.join('\n')}`)
    }
  }

  return sections.join('\n\n')
}

/**
 * 기간별(대운/세운/월운) 해석용 프롬프트 생성
 */
export function formatPeriodForAI(input: PeriodFormatInput): string {
  const { saju, oheng, yongsin } = input.base
  const day = saju.dayPillar
  const dayHanja = `${day.heavenlyStemHanja ?? ''}${day.earthlyBranchHanja ?? ''}`

  const baseLines = [
    `일주: ${day.heavenlyStem}${day.earthlyBranch}(${dayHanja}) / 일간 오행: ${day.element}`,
    `오행 밸런스: 목${oheng.counts.목} 화${oheng.counts.화} 토${oheng.counts.토} 금${oheng.counts.금} 수${oheng.counts.수} (강: ${oheng.dominant}, 약: ${oheng.weak}, ${oheng.balance})`,
    `용신: ${yongsin.yongsin} / 희신: ${yongsin.huisin} / 유리: ${yongsin.favorable.join(',')} / 기피: ${yongsin.unfavorable.join(',')}`,
  ]

  const requestLines: string[] = []
  const periodLines: string[] = []

  if (input.scope === 'daeun') {
    requestLines.push('해당 대운 10년만 집중 해석하세요.')
    requestLines.push('이 대운의 오행이 일간/용신과 어떻게 상호작용하는지 핵심 근거를 포함하세요.')
    requestLines.push('직업, 관계, 건강, 재물의 10년 전략을 균형 있게 제시하세요.')
    requestLines.push('분량: 400~600자')

    periodLines.push(`대운 인덱스: ${input.periodIndex}`)
    periodLines.push(`대운: ${input.period.stem}${input.period.branch}(${input.period.stemHanja}${input.period.branchHanja}) / 오행: ${input.period.element}`)
    periodLines.push(`나이 구간: ${input.period.startAge}~${input.period.endAge}세 / 진행방향: ${input.daeun.direction}`)
  }

  if (input.scope === 'seun') {
    requestLines.push('해당 연도(세운)만 집중 해석하세요.')
    requestLines.push('연운의 기회 요인과 주의 요인을 구체적으로 제시하세요.')
    requestLines.push('분량: 300~500자')

    periodLines.push(`대상 연도: ${input.targetYear}년`)
    periodLines.push(`세운: ${input.fortune.pillar} / 오행: ${input.fortune.element}`)
    periodLines.push(`일간과의 십신: ${input.fortune.sipsin} / 평점: ${input.fortune.rating}`)
    periodLines.push(`기본 설명: ${input.fortune.description}`)
  }

  if (input.scope === 'wolun') {
    requestLines.push('해당 월(月運)만 집중 해석하세요.')
    requestLines.push('이번 달의 실행 포인트와 경계 포인트를 현실적으로 제시하세요.')
    requestLines.push('분량: 200~400자')

    periodLines.push(`대상 시점: ${input.targetYear}년 ${input.targetMonth}월`)
    periodLines.push(`월운: ${input.fortune.pillar} / 오행: ${input.fortune.element}`)
    periodLines.push(`일간과의 십신: ${input.fortune.sipsin} / 평점: ${input.fortune.rating}`)
    periodLines.push(`기본 설명: ${input.fortune.description}`)
  }

  const scopeLabel: Record<PeriodScope, string> = {
    daeun: '대운',
    seun: '세운',
    wolun: '월운',
  }

  return [
    `[REQUEST]\n범위: ${scopeLabel[input.scope]}\n${requestLines.map((line) => `- ${line}`).join('\n')}`,
    `[BASE SAJU]\n${baseLines.map((line) => `- ${line}`).join('\n')}`,
    `[PERIOD DATA]\n${periodLines.map((line) => `- ${line}`).join('\n')}`,
  ].join('\n\n')
}

/**
 * 카테고리별 포커스 지시문
 */
function getCategoryFocus(category: AiCategory): string {
  const focuses: Record<AiCategory, string> = {
    '종합': `사주 전체를 통합적으로 분석하세요.
출력 구조:
- 첫 줄: 핵심 한줄 진단 (20자 내외, 이 사람의 사주를 한마디로)
- 둘째 줄: 키워드 4~6개
- 이후 5단락 (줄바꿈 구분):
  1) 사주 개요 — 오행/신강약/용신 근거 2개로 전체 특징
  2) 성격과 기질 — 반복 패턴 + 장점/그늘
  3) 재능과 적성 — 맞는 역할/일 스타일/피할 환경
  4) 주의할 점 — 건강/관계/의사결정 관리 포인트 2~3개
  5) 운의 흐름과 종합 조언 — 현재 대운/올해/이번달을 전략으로 연결
분량: 1100~1500자`,

    '성격': `십신 분포와 오행 편중, 신강약을 중심으로 분석하세요.
- 핵심 한줄 + 키워드
- 성격·기질의 근본 패턴 (오행/십신 근거 명시)
- 감정 처리 방식과 스트레스 반응
- 대인관계 스타일 (친밀감/거리감/리더십/협력)
- 성장 포인트 (타고난 강점을 살리고 약점을 보완하는 방향)
분량: 700~1000자`,

    '연애': `일지(배우자궁) 성향, 재성/관성/식상 균형을 중심으로 분석하세요.
- 핵심 한줄 + 키워드
- 연애 스타일 (다가가는 방식, 사랑의 표현법)
- 끌리는 타입과 이유 (십신/오행 근거)
- 관계에서 반복되는 갈등 패턴과 대처법
- 올해/이번달 연애운 타이밍
분량: 700~1000자`,

    '직업': `식상(성과/표현)–관성(조직/책임)–재성(현실/수익) 축으로 분석하세요.
- 핵심 한줄 + 키워드
- 타고난 적성과 맞는 역할/환경
- 조직 속 스타일 vs 독립 성향
- 구체적 직업군/업종 3~5개 추천 (근거 포함)
- 대운/세운 기반 커리어 전략 타이밍
분량: 700~1000자`,

    '건강': `오행 과부족을 생활 리듬과 체질로 번역하세요.
- 핵심 한줄 + 키워드
- 오행별 취약 영역 (과다 오행 → 과열/과로 패턴, 부족 오행 → 관리 필요)
- 스트레스가 몸에 나타나는 패턴
- 계절별/시기별 건강 관리 포인트
- 생활 습관 제안 (수면/운동/식이 방향)
※ 특정 장기/병명 단정 금지, 참고 수준의 체질 조언
분량: 700~1000자`,

    '재물': `재성/식상 흐름과 기피 오행을 중심으로 분석하세요.
- 핵심 한줄 + 키워드
- 돈을 대하는 근본 성향 (벌기/쓰기/모으기 패턴)
- 재물이 들어오는 경로와 빠지는 경로
- 리스크 관리 성향 (과감/신중/충동)
- 올해/현재 대운 재물 전략
※ 특정 투자 상품/수익률 추천 금지, 습관·리스크 관리 중심
분량: 700~1000자`,

    '인생성장': `근묘화실(根苗花實) 이론에 따라 인생을 4단계로 나누어 해석하세요.
각 단계를 사주 기둥과 해당 시기의 대운 흐름을 결합하여 분석합니다.

출력 구조 (반드시 4단계 순서로):

🌱 1단계: 초년운 — 뿌리를 내리는 시기 (년주 / 0~20세)
- 년주 천간·지지의 오행과 십신으로 유년기 환경 해석
- 조상·가문의 기운, 어린 시절의 경제적·정서적 환경
- 타고난 기질과 본능적 성향
- 해당 시기 대운과의 상호작용

🌿 2단계: 청년운 — 사회적 기반을 닦는 시기 (월주 / 21~40세)
- 월주 천간·지지의 오행과 십신으로 청년기 해석
- 부모·형제의 영향, 학업과 사회 진출
- 직업적 방향성과 사회적 관계 형성
- 해당 시기 대운과의 상호작용

🌸 3단계: 중년운 — 꽃을 피우는 시기 (일주 / 41~60세)
- 일주 천간·지지의 오행과 십신으로 중년기 해석
- 자기 주체적 삶의 완성, 배우자와의 관계
- 경제적 성취의 정점, 건강 관리
- 해당 시기 대운과의 상호작용

🍎 4단계: 말년운 — 열매를 거두는 시기 (시주 / 61세 이후)
- 시주 천간·지지의 오행과 십신으로 말년기 해석
- 자녀운과 후세에 남기는 유산
- 노후의 경제적·신체적 안정
- 해당 시기 대운과의 상호작용

■ 해석 공식: (해당 기둥의 십신) + (해당 시기 대운 흐름) = 그 시기의 삶의 모습
■ 각 단계마다 구체적인 사주 데이터(천간, 지지, 십신명)를 근거로 제시하세요
■ 단계 간 연결성을 보여주세요 — 이전 단계가 다음 단계에 어떤 영향을 미치는지
분량: 1500~2000자`,
  }
  return focuses[category]
}

/**
 * 카테고리에 맞는 전통 문구 6~12개 선별
 */
export function selectTraditionalClues(
  traditional: TraditionalInterpretation,
  category: AiCategory,
): TraditionalEntry[] {
  // 카테고리별 우선순위와 최대 개수
  const priorityMap: Record<AiCategory, { key: keyof TraditionalInterpretation; max: number }[]> = {
    '종합': [
      { key: 'personality', max: 3 },
      { key: 'dayPillar', max: 2 },
      { key: 'fortune', max: 2 },
      { key: 'career', max: 1 },
      { key: 'health', max: 1 },
      { key: 'yongsinAdvice', max: 1 },
      { key: 'relationship', max: 1 },
      { key: 'general', max: 1 },
    ],
    '성격': [
      { key: 'personality', max: 5 },
      { key: 'dayPillar', max: 3 },
      { key: 'general', max: 2 },
    ],
    '연애': [
      { key: 'relationship', max: 4 },
      { key: 'personality', max: 2 },
      { key: 'dayPillar', max: 2 },
      { key: 'children', max: 1 },
      { key: 'general', max: 1 },
    ],
    '직업': [
      { key: 'career', max: 5 },
      { key: 'personality', max: 2 },
      { key: 'dayPillar', max: 1 },
      { key: 'general', max: 2 },
    ],
    '건강': [
      { key: 'health', max: 5 },
      { key: 'general', max: 2 },
      { key: 'dayPillar', max: 2 },
      { key: 'personality', max: 1 },
    ],
    '재물': [
      { key: 'career', max: 3 },
      { key: 'fortune', max: 3 },
      { key: 'general', max: 2 },
      { key: 'personality', max: 2 },
    ],
    '인생성장': [
      { key: 'personality', max: 2 },
      { key: 'dayPillar', max: 2 },
      { key: 'fortune', max: 2 },
      { key: 'career', max: 1 },
      { key: 'children', max: 1 },
      { key: 'relationship', max: 1 },
      { key: 'health', max: 1 },
      { key: 'general', max: 2 },
    ],
  }

  const priorities = priorityMap[category]
  const selected: TraditionalEntry[] = []
  const seen = new Set<string>()

  for (const { key, max } of priorities) {
    const entries = traditional[key] ?? []
    let count = 0
    for (const entry of entries) {
      if (count >= max) break
      if (seen.has(entry.plain)) continue
      // 너무 짧은 엔트리는 스킵 (의미 없는 단편)
      if (entry.plain.length < 8) continue
      seen.add(entry.plain)
      selected.push(entry)
      count++
    }
  }

  return selected
}

// ---- 내부 유틸리티 ----

function formatPillar(label: string, pillar: SajuPillar, stemSipsin: string, branchSipsin: string): string {
  const h = pillar.heavenlyStemHanja ?? ''
  const b = pillar.earthlyBranchHanja ?? ''
  return `${label}: ${pillar.heavenlyStem}${pillar.earthlyBranch}(${h}${b}) ${pillar.element}  [${stemSipsin}/${branchSipsin}]`
}

function getSipsinTopSummary(summary: Record<SipsinName, number>): string {
  return Object.entries(summary)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([k, v]) => `${k}${v}`)
    .join(' ')
}

function getSipsinGroupSummary(summary: Record<SipsinName, number>): string {
  const groups: string[] = []
  for (const [group, { names, meaning }] of Object.entries(SIPSIN_GROUP_MEANING)) {
    const count = names.reduce((sum, name) => sum + (summary[name] ?? 0), 0)
    if (count > 0) {
      groups.push(`${group}${count}(${meaning})`)
    }
  }
  return groups.join(' / ')
}

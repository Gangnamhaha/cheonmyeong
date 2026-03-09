export const MBTI_TYPES = [
  'ISTJ',
  'ISFJ',
  'INFJ',
  'INTJ',
  'ISTP',
  'ISFP',
  'INFP',
  'INTP',
  'ESTP',
  'ESFP',
  'ENFP',
  'ENTP',
  'ESTJ',
  'ESFJ',
  'ENFJ',
  'ENTJ',
] as const

export type MbtiType = (typeof MBTI_TYPES)[number]

export const MBTI_TIER_ORDER = ['최고궁합', '좋은궁합', '보통', '주의필요', '상극'] as const

export type MbtiCompatibilityTier = (typeof MBTI_TIER_ORDER)[number]

export interface MbtiTierProfile {
  label: MbtiCompatibilityTier
  emoji: string
  colorClass: string
  score: number
  stars: number
  summary: string
  strengths: string[]
  cautions: string[]
  advice: string
}

export interface MbtiPairResult {
  pairKey: string
  me: MbtiType
  partner: MbtiType
  tier: MbtiCompatibilityTier
  flavor: string
  profile: MbtiTierProfile
}

const MBTI_TYPE_TRAITS: Record<MbtiType, { core: string; romance: string }> = {
  ISTJ: { core: '현실 감각이 뛰어난 책임형', romance: '약속을 지키며 신뢰를 쌓는 스타일' },
  ISFJ: { core: '배려 깊고 안정적인 수호자형', romance: '상대의 감정을 세심하게 챙기는 스타일' },
  INFJ: { core: '통찰력이 깊은 이상주의형', romance: '진심 어린 대화로 유대를 만드는 스타일' },
  INTJ: { core: '전략적인 비전 설계형', romance: '관계를 장기 관점으로 설계하는 스타일' },
  ISTP: { core: '유연한 문제 해결형', romance: '필요할 때 확실히 행동으로 보여주는 스타일' },
  ISFP: { core: '감성적이고 따뜻한 예술가형', romance: '분위기와 감정을 섬세하게 읽는 스타일' },
  INFP: { core: '진정성을 중시하는 중재자형', romance: '마음의 결을 존중하며 천천히 가까워지는 스타일' },
  INTP: { core: '호기심 많은 분석가형', romance: '대화로 관계를 탐구하며 이해를 넓히는 스타일' },
  ESTP: { core: '순발력 있는 액션형', romance: '즉흥성과 에너지로 분위기를 살리는 스타일' },
  ESFP: { core: '사교적이고 밝은 엔터테이너형', romance: '함께 즐거운 추억을 만드는 스타일' },
  ENFP: { core: '열정적인 아이디어형', romance: '새로운 자극으로 관계를 성장시키는 스타일' },
  ENTP: { core: '재치 있는 도전자형', romance: '토론과 실험으로 관계에 활력을 더하는 스타일' },
  ESTJ: { core: '체계적인 리더형', romance: '명확한 기준으로 관계를 안정시키는 스타일' },
  ESFJ: { core: '정 많은 조율형', romance: '상호 배려와 공감으로 분위기를 지키는 스타일' },
  ENFJ: { core: '따뜻한 코치형', romance: '서로의 성장을 이끌며 동기를 주는 스타일' },
  ENTJ: { core: '결단력 있는 추진형', romance: '목표를 함께 세우고 성과를 만드는 스타일' },
}

const TIER_PROFILES: Record<MbtiCompatibilityTier, MbtiTierProfile> = {
  최고궁합: {
    label: '최고궁합',
    emoji: '💖',
    colorClass: 'text-rose-300',
    score: 95,
    stars: 5,
    summary: '서로의 강점을 빠르게 알아보고 시너지를 크게 내는 조합이에요.',
    strengths: [
      '각자의 장점이 자연스럽게 맞물려 관계 추진력이 큼',
      '대화와 행동의 템포가 잘 맞아 갈등 회복이 빠름',
      '함께 목표를 세우면 성취감이 크게 올라감',
    ],
    cautions: [
      '초반 몰입이 강해 생활 리듬이 무너질 수 있음',
      '서로 잘 맞는다는 확신 때문에 중요한 합의를 생략하기 쉬움',
    ],
    advice: '감정 표현과 현실 계획을 7:3 비율로 균형 있게 운영해 보세요.',
  },
  좋은궁합: {
    label: '좋은궁합',
    emoji: '✨',
    colorClass: 'text-amber-300',
    score: 82,
    stars: 4,
    summary: '편안함과 설렘이 균형을 이루는 안정적인 호감 조합이에요.',
    strengths: [
      '신뢰 기반이 빨리 형성되어 장기 관계로 발전하기 좋음',
      '서로의 다른 관점을 받아들이는 유연성이 높음',
      '생활 루틴을 함께 맞추기 쉬워 실속 있는 관계로 이어짐',
    ],
    cautions: [
      '익숙함이 쌓이면 표현이 줄어 권태를 느낄 수 있음',
      '배려가 많아도 핵심 요구를 직접 말하지 않으면 오해가 생김',
    ],
    advice: '매주 한 번은 짧게라도 감정 점검 대화를 해주세요.',
  },
  보통: {
    label: '보통',
    emoji: '🌗',
    colorClass: 'text-sky-300',
    score: 66,
    stars: 3,
    summary: '노력한 만큼 좋아지는 성장형 궁합으로, 운영 방식이 중요해요.',
    strengths: [
      '다른 성향 덕분에 서로의 시야를 넓히기 좋음',
      '문제를 함께 해결하면 관계 내구성이 높아짐',
      '적절한 거리 두기로 개별 성장과 관계 성장을 병행 가능',
    ],
    cautions: [
      '의사결정 속도 차이로 답답함이 생길 수 있음',
      '감정 표현 방식이 달라 한쪽이 소외감을 느낄 수 있음',
    ],
    advice: '갈등이 생기면 결론보다 의도 확인을 먼저 해보세요.',
  },
  주의필요: {
    label: '주의필요',
    emoji: '⚠️',
    colorClass: 'text-orange-300',
    score: 44,
    stars: 2,
    summary: '매력 포인트는 분명하지만 갈등 관리 규칙이 꼭 필요한 조합이에요.',
    strengths: [
      '서로에게 없는 능력을 보완하며 배울 점이 많음',
      '관계를 의식적으로 가꿀수록 성숙도가 빠르게 올라감',
      '적절한 역할 분담을 하면 의외의 안정감을 얻을 수 있음',
    ],
    cautions: [
      '감정 처리 속도와 표현 방식 차이가 커 충돌이 반복되기 쉬움',
      '사소한 약속 미이행이 신뢰 하락으로 이어질 가능성이 큼',
    ],
    advice: '문제 상황에서는 즉시 반응보다 10분 휴식 후 대화를 시작해 보세요.',
  },
  상극: {
    label: '상극',
    emoji: '🌪️',
    colorClass: 'text-red-300',
    score: 28,
    stars: 1,
    summary: '강한 끌림과 큰 마찰이 공존하는 극단형 조합이라 의식적인 합의가 필요해요.',
    strengths: [
      '서로의 세계를 넓혀주는 자극이 매우 큼',
      '고정관념을 깨고 성장하는 계기가 될 수 있음',
      '규칙을 세우면 예상보다 단단한 팀워크를 만들 수 있음',
    ],
    cautions: [
      '가치관 충돌 시 감정 소모가 빠르게 커질 수 있음',
      '주도권 다툼이 길어지면 관계 만족도가 급감할 수 있음',
    ],
    advice: '관계 유지의 최소 규칙 3가지를 문장으로 합의해 두세요.',
  },
}

function getLetterMatches(a: MbtiType, b: MbtiType): number {
  let matches = 0
  for (let i = 0; i < 4; i += 1) {
    if (a[i] === b[i]) matches += 1
  }
  return matches
}

function getMbtiTier(a: MbtiType, b: MbtiType): MbtiCompatibilityTier {
  const matches = getLetterMatches(a, b)
  const sameEnergyAxis = a[0] === b[0]
  const sameJudgingAxis = a[3] === b[3]

  if (a === b) return '좋은궁합'
  if (matches >= 3) return '최고궁합'
  if (matches === 2) return sameEnergyAxis && sameJudgingAxis ? '좋은궁합' : '보통'
  if (matches === 1) return sameEnergyAxis || sameJudgingAxis ? '주의필요' : '상극'
  return '상극'
}

function buildFlavorLine(me: MbtiType, partner: MbtiType, tier: MbtiCompatibilityTier): string {
  const meTrait = MBTI_TYPE_TRAITS[me]
  const partnerTrait = MBTI_TYPE_TRAITS[partner]
  const tone = {
    최고궁합: '두 성향이 자연스럽게 합을 이루며 관계 에너지를 끌어올립니다.',
    좋은궁합: '편안한 신뢰 위에서 설렘을 안정적으로 키워가기 좋습니다.',
    보통: '속도 조율만 잘하면 서로에게 오래 배우는 관계가 됩니다.',
    주의필요: '매력은 크지만 대화 규칙을 정하지 않으면 오해가 쌓일 수 있습니다.',
    상극: '강한 차이가 큰 자극이 되므로 의식적인 합의가 필수입니다.',
  } as const

  return `${me}의 ${meTrait.core} 기질과 ${partner}의 ${partnerTrait.romance}이(가) 만나요. ${tone[tier]}`
}

export const MBTI_TIER_MAP: Record<string, MbtiCompatibilityTier> = {}
export const MBTI_PAIR_FLAVOR: Record<string, string> = {}

for (const me of MBTI_TYPES) {
  for (const partner of MBTI_TYPES) {
    const pairKey = `${me}-${partner}`
    const tier = getMbtiTier(me, partner)
    MBTI_TIER_MAP[pairKey] = tier
    MBTI_PAIR_FLAVOR[pairKey] = buildFlavorLine(me, partner, tier)
  }
}

export function getMbtiCompatibility(me: MbtiType, partner: MbtiType): MbtiPairResult {
  const pairKey = `${me}-${partner}`
  const tier = MBTI_TIER_MAP[pairKey]
  const profile = TIER_PROFILES[tier]

  return {
    pairKey,
    me,
    partner,
    tier,
    flavor: MBTI_PAIR_FLAVOR[pairKey],
    profile,
  }
}

export const MBTI_TIER_PROFILES = TIER_PROFILES

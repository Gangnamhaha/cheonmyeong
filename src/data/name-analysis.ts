export type ElementType = '목' | '화' | '토' | '금' | '수'

export type FortuneRating = '대길' | '길' | '보통' | '흉' | '대흉'

export const STROKE_MEANINGS: Record<number, string> = {
  1: '시작의 기운이 강한 획수입니다. 혼자 길을 여는 힘이 좋아 초반 추진력이 뛰어납니다. 다만 성급함을 조절하면 더 안정적으로 성장합니다.',
  2: '유연한 협력운이 깃든 획수입니다. 주변과 호흡을 맞추는 능력이 좋아 팀워크에 강점이 있습니다. 결정 순간에는 자기 기준을 분명히 하면 좋습니다.',
  3: '창의와 발산의 기운이 강한 획수입니다. 아이디어가 많고 표현력이 좋아 사람을 끌어당깁니다. 산만해지지 않도록 우선순위를 세우면 운이 더 좋아집니다.',
  4: '질서와 구조를 잡는 힘이 담긴 획수입니다. 실무 감각이 좋고 꼼꼼하게 완성해 내는 재능이 있습니다. 완벽주의를 조금 내려놓으면 기회가 넓어집니다.',
  5: '균형과 중재의 에너지가 강한 획수입니다. 다양한 사람을 연결하고 조율하는 능력이 탁월합니다. 우유부단함만 경계하면 대인운이 크게 상승합니다.',
  6: '책임감과 성실함이 돋보이는 획수입니다. 장기전에서 신뢰를 얻고 꾸준히 성과를 쌓는 힘이 좋습니다. 감정 피로를 관리하면 운의 탄력이 커집니다.',
  7: '분석력과 통찰력이 강한 획수입니다. 문제의 본질을 빠르게 파악하고 전략을 세우는 능력이 뛰어납니다. 생각이 깊은 만큼 실행 타이밍을 놓치지 않는 것이 중요합니다.',
  8: '재물과 실행의 기운이 강한 획수입니다. 현실 감각과 성취 욕구가 높아 결과를 만들 가능성이 큽니다. 관계에서 부드러운 소통을 더하면 운의 폭이 넓어집니다.',
  9: '완성 직전의 확장 에너지를 담은 획수입니다. 목표를 크게 잡고 몰입할 때 강한 성과가 나옵니다. 무리한 욕심을 조절하면 장기적으로 더욱 길합니다.',
  10: '변화와 전환의 획수입니다. 인생의 흐름이 여러 번 바뀌며 새 판을 짜는 힘이 있습니다. 방향을 자주 점검하면 위기를 기회로 바꾸기 쉽습니다.',
  11: '성장과 명예운이 올라오는 획수입니다. 성실한 축적이 인정으로 이어질 가능성이 높습니다. 대인관계에서 과한 배려보다 명확한 경계를 세우면 좋습니다.',
  12: '내실을 다지는 획수입니다. 겉으로 느리게 보여도 기반을 탄탄히 만드는 힘이 큽니다. 체력과 멘탈 리듬을 지키면 후반 운이 강하게 열립니다.',
  13: '도전과 혁신 기운이 강한 획수입니다. 기존 틀을 깨고 새로운 시도를 할 때 운이 살아납니다. 충동적 결정만 줄이면 큰 성장을 기대할 수 있습니다.',
  14: '관계와 감수성이 깊은 획수입니다. 공감력이 높아 상담, 교육, 서비스 분야에서 강점이 있습니다. 타인 감정에 과몰입하지 않도록 중심을 잡는 것이 핵심입니다.',
  15: '안정과 복덕의 대표 획수입니다. 사람복, 기회복이 따라오며 꾸준한 상승 흐름을 만들기 좋습니다. 안주하지 않고 작은 개선을 이어가면 대길수로 작용합니다.',
  16: '권위와 리더십 기운이 강한 획수입니다. 책임 자리에서 실력을 드러낼 가능성이 높습니다. 독단적으로 보이지 않게 소통하면 더 큰 신뢰를 얻습니다.',
  17: '강한 추진과 승부운을 가진 획수입니다. 결단이 빠르고 경쟁 환경에서 두각을 보이기 쉽습니다. 무리한 승부보다 타이밍 조절이 운세의 핵심입니다.',
  18: '성과와 확장운이 함께 오는 획수입니다. 재능을 시장성과 연결하는 능력이 좋아 사업 감각이 살아납니다. 단기 성과에 치우치지 않으면 안정성도 확보됩니다.',
  19: '감성 지능과 직관이 발달한 획수입니다. 예술, 기획, 스토리텔링 영역에서 재능이 빛나기 좋습니다. 기복 관리와 루틴 유지가 운을 지키는 열쇠입니다.',
  20: '정리와 재정비의 획수입니다. 오래된 문제를 정돈하고 구조를 새롭게 만들 힘이 있습니다. 지나친 걱정을 줄이고 실행량을 늘리면 길하게 작동합니다.',
  21: '강한 자립성과 성공운이 드러나는 획수입니다. 주도적으로 목표를 밀어붙일 때 결과가 잘 나옵니다. 타인의 조언을 적절히 수용하면 리스크를 줄일 수 있습니다.',
  22: '변화 적응력이 뛰어난 획수입니다. 환경이 바뀌어도 빠르게 생존 전략을 세우는 힘이 있습니다. 초반 기복을 견디면 후반 안정운이 좋아집니다.',
  23: '리더형 성장수로 알려진 획수입니다. 명확한 비전과 추진력으로 조직을 이끄는 재능이 좋습니다. 관계 균형을 챙기면 장기적으로 명예운이 강화됩니다.',
  24: '재물복과 가정운이 조화를 이루는 획수입니다. 실속 있는 선택을 통해 생활 기반을 튼튼히 만들기 쉽습니다. 사람과 돈 사이의 균형 감각을 유지하면 매우 길합니다.',
  25: '완성도와 품격을 동시에 갖춘 획수입니다. 전문성을 쌓아 신뢰를 얻고 결과를 안정적으로 만드는 힘이 큽니다. 지나친 자기검열만 줄이면 대운을 타기 좋습니다.',
}

export const ELEMENT_MAP: Record<number, ElementType> = {
  0: '수',
  1: '목',
  2: '목',
  3: '화',
  4: '화',
  5: '토',
  6: '토',
  7: '금',
  8: '금',
  9: '수',
}

export const ELEMENT_DESCRIPTIONS: Record<
  ElementType,
  { personality: string; strengths: string[]; careerTendency: string; luckyColors: string[]; luckyNumbers: number[] }
> = {
  목: {
    personality: '성장 지향형으로 새로운 것에 도전하고 확장하는 에너지가 강합니다.',
    strengths: ['기획력과 학습 속도가 빠름', '관계에서 따뜻하고 유연한 소통', '새 프로젝트를 시작하는 추진력'],
    careerTendency: '교육, 기획, 콘텐츠, 브랜딩, 스타트업 분야에서 역량이 잘 드러납니다.',
    luckyColors: ['초록', '민트', '청록'],
    luckyNumbers: [1, 2, 11, 21],
  },
  화: {
    personality: '표현력과 열정이 강해 존재감이 뚜렷하고 사람을 이끄는 힘이 좋습니다.',
    strengths: ['발표와 설득 능력', '빠른 실행과 분위기 전환', '창의적 아이디어 발산'],
    careerTendency: '마케팅, 방송, 영업, 디자인, 퍼포먼스 중심 직무에 강점을 보입니다.',
    luckyColors: ['빨강', '코랄', '주황'],
    luckyNumbers: [3, 4, 13, 23],
  },
  토: {
    personality: '균형과 안정의 성향이 강해 조직 내 신뢰를 쌓고 중심을 잡는 타입입니다.',
    strengths: ['중재와 갈등 조율 능력', '책임감 있는 운영력', '현실적 판단과 꾸준함'],
    careerTendency: '운영, 인사, 재무, 공공, 부동산, 코칭 분야에서 안정적으로 성장합니다.',
    luckyColors: ['베이지', '황토', '머스타드'],
    luckyNumbers: [5, 6, 15, 24],
  },
  금: {
    personality: '원칙과 결단이 뚜렷해 목표 달성과 품질 관리에 강한 성향입니다.',
    strengths: ['분석력과 정확성', '리스크 관리', '규칙 설정과 실행력'],
    careerTendency: '법무, 엔지니어링, 데이터, 금융, 품질관리, 컨설팅 직무와 잘 맞습니다.',
    luckyColors: ['화이트', '실버', '골드'],
    luckyNumbers: [7, 8, 17, 27],
  },
  수: {
    personality: '직관과 흐름 감각이 뛰어나 상황 변화를 읽고 깊이 있게 사고하는 타입입니다.',
    strengths: ['통찰력과 연구력', '감정 공감 능력', '복잡한 문제를 구조화하는 능력'],
    careerTendency: '연구, 심리, 기획전략, IT, 글쓰기, 데이터 해석 분야에서 경쟁력이 높습니다.',
    luckyColors: ['네이비', '블랙', '블루'],
    luckyNumbers: [9, 10, 19, 29],
  },
}

export const ELEMENT_COMPATIBILITY: Record<
  ElementType,
  { compatible: ElementType[]; conflicting: ElementType[]; summary: string }
> = {
  목: {
    compatible: ['수', '화'],
    conflicting: ['금', '토'],
    summary: '목 기운은 수의 지원을 받으면 성장하고 화로 확장될 때 성과가 커집니다. 금이 강하면 제약을 크게 느끼고 토가 과하면 답답함이 생길 수 있습니다.',
  },
  화: {
    compatible: ['목', '토'],
    conflicting: ['수', '금'],
    summary: '화 기운은 목이 불씨를 주고 토로 안정될 때 가장 균형이 좋습니다. 수가 강하면 열정이 꺼지고 금이 강하면 표현이 막힐 수 있습니다.',
  },
  토: {
    compatible: ['화', '금'],
    conflicting: ['목', '수'],
    summary: '토 기운은 화로 따뜻해지고 금을 길러 실속이 생깁니다. 목이 강하면 소모되고 수가 과하면 중심이 흔들릴 수 있습니다.',
  },
  금: {
    compatible: ['토', '수'],
    conflicting: ['화', '목'],
    summary: '금 기운은 토의 기반 위에서 힘을 얻고 수로 흐를 때 지혜가 살아납니다. 화가 강하면 압박이 커지고 목과 충돌하면 결정 피로가 생길 수 있습니다.',
  },
  수: {
    compatible: ['금', '목'],
    conflicting: ['토', '화'],
    summary: '수 기운은 금으로 정제되고 목을 키울 때 큰 성장을 만듭니다. 토가 과하면 막히고 화가 강하면 기운 소모가 빨라질 수 있습니다.',
  },
}

export const TOTAL_STROKE_FORTUNE: Array<{
  min: number
  max: number
  rating: FortuneRating
  title: string
  description: string
  colorClass: string
}> = [
  {
    min: 1,
    max: 9,
    rating: '흉',
    title: '기초 다지기 구간',
    description: '초반 기복이 있는 수로 해석됩니다. 조급함을 줄이고 기반을 다지면 운이 안정됩니다.',
    colorClass: 'text-orange-300',
  },
  {
    min: 10,
    max: 15,
    rating: '보통',
    title: '성장 준비 구간',
    description: '노력 대비 성과가 서서히 쌓이는 흐름입니다. 루틴을 지키면 운세가 점점 좋아집니다.',
    colorClass: 'text-sky-300',
  },
  {
    min: 16,
    max: 23,
    rating: '길',
    title: '확장 상승 구간',
    description: '도전과 성취가 연결되기 좋은 길수입니다. 인간관계와 실행력을 함께 챙기면 상승폭이 큽니다.',
    colorClass: 'text-emerald-300',
  },
  {
    min: 24,
    max: 31,
    rating: '대길',
    title: '복덕 성취 구간',
    description: '재물운과 명예운이 함께 살아나는 대표 길수로 봅니다. 꾸준함을 유지하면 큰 결실을 만들 수 있습니다.',
    colorClass: 'text-amber-300',
  },
  {
    min: 32,
    max: 39,
    rating: '길',
    title: '완성 성장 구간',
    description: '실력과 평판이 함께 올라가기 좋은 구간입니다. 욕심 조절과 체력 관리가 운의 핵심입니다.',
    colorClass: 'text-emerald-300',
  },
  {
    min: 40,
    max: 49,
    rating: '보통',
    title: '변동 관리 구간',
    description: '운의 파동이 커질 수 있어 선택과 집중이 중요합니다. 방향만 분명하면 충분히 길하게 작용합니다.',
    colorClass: 'text-sky-300',
  },
  {
    min: 50,
    max: 59,
    rating: '흉',
    title: '소모 주의 구간',
    description: '체력과 감정 소모를 관리해야 하는 수로 봅니다. 과한 확장보다 안정 운영이 유리합니다.',
    colorClass: 'text-orange-300',
  },
  {
    min: 60,
    max: 99,
    rating: '대흉',
    title: '재정비 필요 구간',
    description: '과부하와 충돌 가능성이 있어 신중한 운영이 필요합니다. 우선순위를 줄여 핵심에 집중하면 개선됩니다.',
    colorClass: 'text-rose-300',
  },
]

export const COMMON_SURNAME_STROKES: Record<string, number> = {
  김: 8,
  이: 7,
  박: 6,
  최: 12,
  정: 16,
  강: 10,
  조: 10,
  윤: 16,
  장: 11,
  임: 6,
  한: 15,
  오: 4,
  서: 10,
  신: 13,
  권: 18,
  황: 12,
  안: 6,
  송: 7,
  류: 10,
  홍: 10,
}

export const COMMON_CHAR_STROKES: Record<string, number> = {
  가: 3, 강: 10, 건: 9, 경: 8, 고: 10, 관: 25, 광: 6, 구: 8, 국: 11, 군: 9, 규: 11, 균: 7, 근: 10, 기: 5,
  길: 6, 나: 4, 남: 9, 노: 7, 단: 9, 달: 4, 담: 7, 대: 3, 도: 12, 동: 8, 두: 7, 라: 8, 란: 17, 래: 13,
  려: 9, 련: 14, 령: 8, 로: 7, 록: 8, 룡: 16, 리: 7, 린: 16, 마: 10, 만: 11, 명: 8, 모: 9, 목: 4, 무: 8,
  문: 4, 미: 9, 민: 5, 박: 6, 반: 5, 방: 8, 배: 10, 범: 15, 법: 8, 벽: 16, 별: 9, 병: 10, 보: 9, 복: 12,
  본: 5, 봉: 9, 부: 4, 분: 4, 비: 12, 빛: 9, 사: 7, 산: 3, 상: 8, 새: 13, 샘: 9, 서: 10, 석: 5, 선: 9,
  설: 16, 섭: 13, 성: 7, 세: 5, 소: 4, 솔: 8, 송: 7, 수: 4, 숙: 11, 순: 12, 술: 13, 승: 12, 시: 7, 식: 9,
  신: 13, 심: 9, 아: 6, 안: 6, 애: 10, 양: 7, 어: 4, 언: 7, 엄: 9, 여: 6, 연: 11, 영: 9, 예: 11, 오: 4,
  옥: 5, 온: 13, 완: 11, 왕: 4, 요: 9, 용: 16, 우: 6, 원: 10, 월: 4, 위: 11, 유: 6, 윤: 16, 율: 9, 은: 10,
  을: 4, 음: 9, 의: 13, 이: 7, 익: 8, 인: 4, 일: 1, 임: 6, 자: 3, 작: 7, 재: 10, 전: 15, 정: 16, 제: 7,
  조: 10, 종: 11, 주: 8, 준: 12, 중: 4, 지: 6, 진: 10, 찬: 19, 창: 11, 채: 12, 천: 4, 철: 13, 초: 7,
  춘: 9, 충: 6, 치: 8, 태: 10, 탁: 12, 탄: 9, 토: 3, 통: 11, 파: 8, 판: 7, 표: 11, 푸: 17, 하: 3, 학: 16,
  한: 15, 해: 9, 향: 9, 허: 12, 헌: 16, 현: 15, 형: 7, 혜: 12, 호: 8, 홍: 10, 화: 4, 환: 13, 황: 12,
  회: 6, 효: 7, 훈: 10, 휘: 15, 희: 12,
  겸: 15, 격: 15, 견: 9, 곤: 8, 귀: 14, 금: 8, 내: 10, 농: 13, 뇌: 16, 누: 7, 능: 10, 니: 8, 님: 8,
  당: 13, 덕: 15, 던: 11, 둔: 12, 득: 11, 디: 11, 랑: 11, 력: 2, 렬: 17, 렴: 13, 론: 10,
  루: 8, 륜: 16, 르: 11, 름: 10, 매: 11, 맹: 8, 면: 9, 몽: 14, 묘: 8, 물: 8, 발: 6, 백: 6,
  불: 8, 빈: 13, 빙: 15, 와: 9, 슬: 13, 교: 10,
}

const ELEMENT_ORDER: ElementType[] = ['목', '화', '토', '금', '수']

function getElementByStroke(stroke: number): ElementType {
  const digit = Math.abs(stroke) % 10
  return ELEMENT_MAP[digit]
}

function getStrokeMeaning(stroke: number): string {
  const normalized = stroke % 25 === 0 ? 25 : stroke % 25
  return STROKE_MEANINGS[normalized]
}

function getFortuneByTotal(totalStrokes: number) {
  const matched = TOTAL_STROKE_FORTUNE.find((fortune) => totalStrokes >= fortune.min && totalStrokes <= fortune.max)
  return (
    matched ?? {
      min: 100,
      max: 200,
      rating: '보통' as const,
      title: '확장 해석 구간',
      description: '획수가 큰 이름은 세부 글자 구조와 사용 한자에 따라 해석이 달라집니다. 기본적으로 중립 운으로 해석합니다.',
      colorClass: 'text-sky-300',
    }
  )
}

export interface NameCharacterStroke {
  char: string
  stroke: number | null
  source: 'surname' | 'common' | 'manual' | 'unknown'
  element: ElementType | null
}

export interface NameAnalysisResult {
  fullName: string
  totalStrokes: number
  fortune: {
    rating: FortuneRating
    title: string
    description: string
    colorClass: string
  }
  characterBreakdown: NameCharacterStroke[]
  missingCharacters: string[]
  elementDistribution: Record<ElementType, number>
  dominantElement: ElementType
  dominantElementDescription: {
    personality: string
    strengths: string[]
    careerTendency: string
  }
  lucky: {
    numbers: number[]
    colors: string[]
  }
  compatibility: {
    compatible: ElementType[]
    conflicting: ElementType[]
    summary: string
  }
  strokeMeaning: string
  detailedInterpretation: string
}

export function analyzeName(
  surname: string,
  givenName: string,
  manualStrokes?: Record<string, number>,
): NameAnalysisResult {
  const normalizedSurname = surname.trim()
  const normalizedGivenName = givenName.trim().replace(/\s+/g, '')
  const fullName = `${normalizedSurname}${normalizedGivenName}`
  const chars = fullName.split('')

  const characterBreakdown: NameCharacterStroke[] = chars.map((char, index) => {
    const manual = manualStrokes?.[`${index}`] ?? manualStrokes?.[char]
    if (typeof manual === 'number' && Number.isFinite(manual) && manual > 0) {
      return { char, stroke: Math.round(manual), source: 'manual', element: getElementByStroke(Math.round(manual)) }
    }

    if (index === 0 && normalizedSurname.length === 1 && COMMON_SURNAME_STROKES[normalizedSurname]) {
      const stroke = COMMON_SURNAME_STROKES[normalizedSurname]
      return { char, stroke, source: 'surname', element: getElementByStroke(stroke) }
    }

    if (COMMON_CHAR_STROKES[char]) {
      const stroke = COMMON_CHAR_STROKES[char]
      return { char, stroke, source: 'common', element: getElementByStroke(stroke) }
    }

    return { char, stroke: null, source: 'unknown', element: null }
  })

  const missingCharacters = characterBreakdown.filter((item) => item.stroke === null).map((item) => item.char)
  const totalStrokes = characterBreakdown.reduce((sum, item) => sum + (item.stroke ?? 0), 0)
  const fortune = getFortuneByTotal(totalStrokes)

  const elementDistribution = ELEMENT_ORDER.reduce<Record<ElementType, number>>(
    (acc, element) => ({ ...acc, [element]: 0 }),
    { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 },
  )

  for (const item of characterBreakdown) {
    if (item.element) {
      elementDistribution[item.element] += 1
    }
  }

  const dominantElement = ELEMENT_ORDER.reduce((best, current) =>
    elementDistribution[current] > elementDistribution[best] ? current : best,
  '목')

  const dominantElementDescription = {
    personality: ELEMENT_DESCRIPTIONS[dominantElement].personality,
    strengths: ELEMENT_DESCRIPTIONS[dominantElement].strengths,
    careerTendency: ELEMENT_DESCRIPTIONS[dominantElement].careerTendency,
  }

  const compatibility = ELEMENT_COMPATIBILITY[dominantElement]
  const lucky = {
    numbers: ELEMENT_DESCRIPTIONS[dominantElement].luckyNumbers,
    colors: ELEMENT_DESCRIPTIONS[dominantElement].luckyColors,
  }

  const strokeMeaning = getStrokeMeaning(totalStrokes || 1)

  const detailedInterpretation = `${fullName || '이름'}의 총 획수는 ${totalStrokes}획으로 ${fortune.rating}(${fortune.title}) 흐름에 해당합니다. ` +
    `오행 분포는 목 ${elementDistribution.목}, 화 ${elementDistribution.화}, 토 ${elementDistribution.토}, 금 ${elementDistribution.금}, 수 ${elementDistribution.수}이며 ` +
    `주도 기운은 ${dominantElement}입니다. ${dominantElementDescription.personality} ${fortune.description} ${compatibility.summary}`

  return {
    fullName,
    totalStrokes,
    fortune: {
      rating: fortune.rating,
      title: fortune.title,
      description: fortune.description,
      colorClass: fortune.colorClass,
    },
    characterBreakdown,
    missingCharacters,
    elementDistribution,
    dominantElement,
    dominantElementDescription,
    lucky,
    compatibility,
    strokeMeaning,
    detailedInterpretation,
  }
}

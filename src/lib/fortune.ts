/**
 * 세운(歲運) / 월운(月運) 계산 모듈
 * 특정 연도/월의 운세를 사주와 비교하여 분석합니다.
 */
import { getGapja } from '@fullstackfamily/manseryeok'
import type { SajuResult } from './saju'

/** 운세 결과 */
export interface FortuneResult {
  /** 해당 기간의 천간지지 */
  pillar: string
  /** 천간 한글 */
  stem: string
  /** 지지 한글 */
  branch: string
  /** 오행 */
  element: string
  /** 일간과의 십신 관계 */
  sipsin: string
  /** 길흉 판단 */
  rating: '길' | '평' | '흉'
  /** 설명 */
  description: string
}

// 천간 오행
const STEM_ELEMENT: Record<string, string> = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토',
  기: '토', 경: '금', 신: '금', 임: '수', 계: '수',
}

// 천간 음양
const STEM_YINYANG: Record<string, '양' | '음'> = {
  갑: '양', 을: '음', 병: '양', 정: '음', 무: '양',
  기: '음', 경: '양', 신: '음', 임: '양', 계: '음',
}

// 상생
const GENERATES: Record<string, string> = {
  목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
}
// 상극
const CONTROLS: Record<string, string> = {
  목: '토', 토: '수', 수: '화', 화: '금', 금: '목',
}

// 십신 판별 (간략)
function getSipsinLabel(dayElement: string, dayYY: '양' | '음', targetElement: string, targetYY: '양' | '음'): string {
  const same = dayYY === targetYY
  if (dayElement === targetElement) return same ? '비견' : '겁재'
  if (GENERATES[dayElement] === targetElement) return same ? '식신' : '상관'
  if (CONTROLS[dayElement] === targetElement) return same ? '편재' : '정재'
  if (CONTROLS[targetElement] === dayElement) return same ? '편관' : '정관'
  if (GENERATES[targetElement] === dayElement) return same ? '편인' : '정인'
  return '비견'
}

// 십신별 길흉
const SIPSIN_RATING: Record<string, '길' | '평' | '흉'> = {
  비견: '평', 겁재: '평',
  식신: '길', 상관: '흉',
  편재: '길', 정재: '길',
  편관: '흉', 정관: '길',
  편인: '평', 정인: '길',
}

// 십신별 설명
const SIPSIN_DESC: Record<string, string> = {
  비견: '경쟁과 협력의 시기입니다. 동료와의 관계가 중요합니다.',
  겁재: '예기치 않은 지출이나 경쟁에 주의하세요.',
  식신: '창의력과 표현력이 빛나는 좋은 시기입니다.',
  상관: '말과 행동에 주의하세요. 갈등이 생길 수 있습니다.',
  편재: '예상치 못한 재물운이 있습니다. 투자에 유리합니다.',
  정재: '안정적인 수입과 재물 관리에 좋은 시기입니다.',
  편관: '예상치 못한 변화와 압박이 있을 수 있습니다.',
  정관: '승진, 합격 등 사회적 인정을 받을 수 있는 시기입니다.',
  편인: '학습과 자기계발에 좋으나 외로울 수 있습니다.',
  정인: '학업, 자격증, 지원자의 도움이 있는 좋은 시기입니다.',
}

/**
 * 해당 연도의 세운(歲運)을 계산합니다.
 * @param saju 사주 결과
 * @param targetYear 대상 연도
 * @returns 세운 결과
 */
export function calculateYearlyFortune(saju: SajuResult, targetYear: number): FortuneResult {
  const gapja = getGapja(targetYear, 6, 15) // 연도의 갑자를 구하기 위해 중간 날짜 사용
  const pillar = gapja.yearPillar // '갑자' 형태
  const stem = pillar[0] ?? ''
  const branch = pillar[1] ?? ''

  const dayElement = STEM_ELEMENT[saju.dayPillar.heavenlyStem] ?? '목'
  const dayYY = STEM_YINYANG[saju.dayPillar.heavenlyStem] ?? '양'
  const targetElement = STEM_ELEMENT[stem] ?? '목'
  const targetYY = STEM_YINYANG[stem] ?? '양'

  const sipsin = getSipsinLabel(dayElement, dayYY, targetElement, targetYY)
  const rating = SIPSIN_RATING[sipsin] ?? '평'
  const description = SIPSIN_DESC[sipsin] ?? ''

  return {
    pillar,
    stem,
    branch,
    element: targetElement,
    sipsin,
    rating,
    description,
  }
}

/**
 * 해당 월의 월운(月運)을 계산합니다.
 * @param saju 사주 결과
 * @param targetYear 대상 연도
 * @param targetMonth 대상 월 (1~12)
 * @returns 월운 결과
 */
export function calculateMonthlyFortune(
  saju: SajuResult,
  targetYear: number,
  targetMonth: number,
): FortuneResult {
  const gapja = getGapja(targetYear, targetMonth, 15) // 해당 월 중순의 갑자
  const pillar = gapja.monthPillar // 월주
  const stem = pillar[0] ?? ''
  const branch = pillar[1] ?? ''

  const dayElement = STEM_ELEMENT[saju.dayPillar.heavenlyStem] ?? '목'
  const dayYY = STEM_YINYANG[saju.dayPillar.heavenlyStem] ?? '양'
  const targetElement = STEM_ELEMENT[stem] ?? '목'
  const targetYY = STEM_YINYANG[stem] ?? '양'

  const sipsin = getSipsinLabel(dayElement, dayYY, targetElement, targetYY)
  const rating = SIPSIN_RATING[sipsin] ?? '평'
  const description = SIPSIN_DESC[sipsin] ?? ''

  return {
    pillar,
    stem,
    branch,
    element: targetElement,
    sipsin,
    rating,
    description,
  }
}

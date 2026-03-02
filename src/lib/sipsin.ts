/**
 * 십신(十神) 분석 모듈
 * 일간(日干)과 다른 7글자의 관계를 분석합니다.
 */
import type { SajuResult } from './saju'

/** 십신 이름 */
export type SipsinName =
  | '비견' | '겁재'   // 비겁 (같은 오행)
  | '식신' | '상관'   // 식상 (내가 생하는 오행)
  | '편재' | '정재'   // 재성 (내가 극하는 오행)
  | '편관' | '정관'   // 관성 (나를 극하는 오행)
  | '편인' | '정인'   // 인성 (나를 생하는 오행)

/** 각 위치별 십신 */
export interface SipsinResult {
  /** 년간 십신 */
  yearStem: SipsinName
  /** 년지 십신 */
  yearBranch: SipsinName
  /** 월간 십신 */
  monthStem: SipsinName
  /** 월지 십신 */
  monthBranch: SipsinName
  /** 일간 (본인) */
  dayStem: '본인'
  /** 일지 십신 */
  dayBranch: SipsinName
  /** 시간 십신 */
  hourStem: SipsinName
  /** 시지 십신 */
  hourBranch: SipsinName
  /** 십신 카운트 요약 */
  summary: Record<SipsinName, number>
}

// 천간 음양: 갑병무경임 = 양, 을정기신계 = 음
const STEM_YINYANG: Record<string, '양' | '음'> = {
  갑: '양', 을: '음', 병: '양', 정: '음', 무: '양',
  기: '음', 경: '양', 신: '음', 임: '양', 계: '음',
}

// 지지 음양
const BRANCH_YINYANG: Record<string, '양' | '음'> = {
  자: '양', 축: '음', 인: '양', 묘: '음', 진: '양', 사: '음',
  오: '양', 미: '음', 신: '양', 유: '음', 술: '양', 해: '음',
}

// 천간 오행
const STEM_ELEMENT: Record<string, string> = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토',
  기: '토', 경: '금', 신: '금', 임: '수', 계: '수',
}

// 지지 오행
const BRANCH_ELEMENT: Record<string, string> = {
  인: '목', 묘: '목', 사: '화', 오: '화',
  진: '토', 술: '토', 축: '토', 미: '토',
  신: '금', 유: '금', 해: '수', 자: '수',
}

// 상생 관계: key가 생하는 오행 = value
const GENERATES: Record<string, string> = {
  목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
}

// 상극 관계: key가 극하는 오행 = value
const CONTROLS: Record<string, string> = {
  목: '토', 토: '수', 수: '화', 화: '금', 금: '목',
}

/**
 * 일간 오행과 대상 오행+음양을 비교하여 십신을 결정
 */
function getSipsin(
  dayElement: string,
  dayYinYang: '양' | '음',
  targetElement: string,
  targetYinYang: '양' | '음',
): SipsinName {
  const samePolarity = dayYinYang === targetYinYang

  if (dayElement === targetElement) {
    // 비겁: 같은 오행
    return samePolarity ? '비견' : '겁재'
  }
  if (GENERATES[dayElement] === targetElement) {
    // 식상: 내가 생하는 오행
    return samePolarity ? '식신' : '상관'
  }
  if (CONTROLS[dayElement] === targetElement) {
    // 재성: 내가 극하는 오행
    return samePolarity ? '편재' : '정재'
  }
  if (CONTROLS[targetElement] === dayElement) {
    // 관성: 나를 극하는 오행
    return samePolarity ? '편관' : '정관'
  }
  if (GENERATES[targetElement] === dayElement) {
    // 인성: 나를 생하는 오행
    return samePolarity ? '편인' : '정인'
  }

  return '비견' // fallback (shouldn't happen)
}

/**
 * 사주팔자의 십신을 분석합니다.
 * @param saju 사주 결과
 * @returns 각 위치별 십신과 요약
 */
export function analyzeSipsin(saju: SajuResult): SipsinResult {
  const dayStem = saju.dayPillar.heavenlyStem
  const dayElement = STEM_ELEMENT[dayStem] ?? '목'
  const dayYY = STEM_YINYANG[dayStem] ?? '양'

  function stemSipsin(stem: string): SipsinName {
    return getSipsin(dayElement, dayYY, STEM_ELEMENT[stem] ?? '목', STEM_YINYANG[stem] ?? '양')
  }

  function branchSipsin(branch: string): SipsinName {
    return getSipsin(dayElement, dayYY, BRANCH_ELEMENT[branch] ?? '목', BRANCH_YINYANG[branch] ?? '양')
  }

  const yearStem = stemSipsin(saju.yearPillar.heavenlyStem)
  const yearBranch = branchSipsin(saju.yearPillar.earthlyBranch)
  const monthStem = stemSipsin(saju.monthPillar.heavenlyStem)
  const monthBranch = branchSipsin(saju.monthPillar.earthlyBranch)
  const dayBranch = branchSipsin(saju.dayPillar.earthlyBranch)
  const hourStem = stemSipsin(saju.hourPillar.heavenlyStem)
  const hourBranch = branchSipsin(saju.hourPillar.earthlyBranch)

  // 카운트 집계
  const all: SipsinName[] = [yearStem, yearBranch, monthStem, monthBranch, dayBranch, hourStem, hourBranch]
  const summary = {} as Record<SipsinName, number>
  const names: SipsinName[] = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인']
  for (const n of names) summary[n] = 0
  for (const s of all) summary[s]++

  return {
    yearStem, yearBranch,
    monthStem, monthBranch,
    dayStem: '본인',
    dayBranch,
    hourStem, hourBranch,
    summary,
  }
}

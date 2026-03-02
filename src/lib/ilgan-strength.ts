/**
 * 일간 강약(身强/身弱) 판단 모듈
 * 일간(日干)이 강한지 약한지 분석합니다.
 */
import type { SajuResult } from './saju'

/** 일간 강약 결과 */
export interface IlganStrength {
  /** 신강 또는 신약 */
  strength: '신강' | '신약'
  /** 점수 (양수=신강, 음수=신약) */
  score: number
  /** 세부 내역 */
  details: {
    /** 나를 도와주는 힘 (비겁 + 인성) */
    support: number
    /** 나를 억제하는 힘 (식상 + 재성 + 관성) */
    opposition: number
    /** 월령(월지) 오행 */
    monthBranchElement: string
    /** 월령 도움 여부 */
    monthBranchHelps: boolean
  }
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

// 상생: key를 생하는 오행 (key의 인성)
const GENERATED_BY: Record<string, string> = {
  목: '수', 화: '목', 토: '화', 금: '토', 수: '금',
}

/**
 * 주어진 오행이 일간을 도와주는지 판단
 * 비겁(같은 오행) 또는 인성(나를 생하는 오행)이면 도움
 */
function isSupporting(dayElement: string, targetElement: string): boolean {
  return targetElement === dayElement || targetElement === GENERATED_BY[dayElement]
}

/**
 * 일간의 강약을 분석합니다.
 * @param saju 사주 결과
 * @returns 신강/신약 판단과 상세 점수
 */
export function analyzeIlganStrength(saju: SajuResult): IlganStrength {
  const dayElement = STEM_ELEMENT[saju.dayPillar.heavenlyStem] ?? '목'

  let support = 0
  let opposition = 0

  // 8글자(4천간 + 4지지) 순회, 일간 자신은 제외
  const positions = [
    { element: STEM_ELEMENT[saju.yearPillar.heavenlyStem], weight: 1 },
    { element: BRANCH_ELEMENT[saju.yearPillar.earthlyBranch], weight: 1 },
    { element: STEM_ELEMENT[saju.monthPillar.heavenlyStem], weight: 1.2 },
    { element: BRANCH_ELEMENT[saju.monthPillar.earthlyBranch], weight: 2 }, // 월령 = 가장 큰 가중치
    // 일간은 제외, 일지만 포함
    { element: BRANCH_ELEMENT[saju.dayPillar.earthlyBranch], weight: 1.5 },
    { element: STEM_ELEMENT[saju.hourPillar.heavenlyStem], weight: 0.8 },
    { element: BRANCH_ELEMENT[saju.hourPillar.earthlyBranch], weight: 0.8 },
  ]

  for (const pos of positions) {
    if (!pos.element) continue
    if (isSupporting(dayElement, pos.element)) {
      support += pos.weight
    } else {
      opposition += pos.weight
    }
  }

  // 월령(월지)이 일간을 도와주는지
  const monthBranchElement = BRANCH_ELEMENT[saju.monthPillar.earthlyBranch] ?? ''
  const monthBranchHelps = isSupporting(dayElement, monthBranchElement)

  const score = Math.round((support - opposition) * 10) / 10
  const strength: '신강' | '신약' = score >= 0 ? '신강' : '신약'

  return {
    strength,
    score,
    details: {
      support: Math.round(support * 10) / 10,
      opposition: Math.round(opposition * 10) / 10,
      monthBranchElement,
      monthBranchHelps,
    },
  }
}

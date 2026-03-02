/**
 * 용신(用神) 판단 모듈
 * 사주의 균형을 맞추는 데 필요한 오행을 결정합니다.
 */
import type { OhengResult } from './oheng'
import type { IlganStrength } from './ilgan-strength'
import type { SajuResult } from './saju'

/** 용신 결과 */
export interface YongsinResult {
  /** 용신 오행 */
  yongsin: string
  /** 희신 (용신을 도와주는 오행) */
  huisin: string
  /** 판단 근거 */
  reason: string
  /** 유리한 오행 */
  favorable: string[]
  /** 불리한 오행 */
  unfavorable: string[]
}

// 천간 오행
const STEM_ELEMENT: Record<string, string> = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토',
  기: '토', 경: '금', 신: '금', 임: '수', 계: '수',
}

// 상생: key가 생하는 오행
const GENERATES: Record<string, string> = {
  목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
}

// 상극: key가 극하는 오행
const CONTROLS: Record<string, string> = {
  목: '토', 토: '수', 수: '화', 화: '금', 금: '목',
}

// 역상생: key를 생하는 오행
const GENERATED_BY: Record<string, string> = {
  목: '수', 화: '목', 토: '화', 금: '토', 수: '금',
}

// 역상극: key를 극하는 오행
const CONTROLLED_BY: Record<string, string> = {
  목: '금', 화: '수', 토: '목', 금: '화', 수: '토',
}

/**
 * 용신을 판단합니다.
 * @param saju 사주 결과
 * @param oheng 오행 분석 결과
 * @param strength 일간 강약 결과
 * @returns 용신과 희신
 */
export function determineYongsin(
  saju: SajuResult,
  oheng: OhengResult,
  strength: IlganStrength,
): YongsinResult {
  const dayElement = STEM_ELEMENT[saju.dayPillar.heavenlyStem] ?? '목'

  if (strength.strength === '신강') {
    // 신강: 일간이 강하므로 설기(泄氣) 또는 극제(剋制)가 필요
    // 우선순위: 식상(내가 생하는 오행) > 재성(내가 극하는 오행) > 관성(나를 극하는 오행)
    const sikSang = GENERATES[dayElement] ?? ''  // 식상
    const jae = CONTROLS[dayElement] ?? ''        // 재성
    const gwan = CONTROLLED_BY[dayElement] ?? ''  // 관성

    // 오행 분포에서 가장 부족한 것을 용신으로
    const candidates = [
      { element: sikSang, count: oheng.counts[sikSang as keyof typeof oheng.counts] ?? 0, label: '식상' },
      { element: jae, count: oheng.counts[jae as keyof typeof oheng.counts] ?? 0, label: '재성' },
      { element: gwan, count: oheng.counts[gwan as keyof typeof oheng.counts] ?? 0, label: '관성' },
    ].sort((a, b) => a.count - b.count)

    const yongsin = candidates[0].element
    const huisin = candidates[1].element

    return {
      yongsin,
      huisin,
      reason: `신강 사주이므로 ${candidates[0].label}(${yongsin})으로 기운을 조절합니다.`,
      favorable: [yongsin, huisin],
      unfavorable: [dayElement, GENERATED_BY[dayElement] ?? ''],
    }
  } else {
    // 신약: 일간이 약하므로 생조(生助)가 필요
    // 우선순위: 인성(나를 생하는 오행) > 비겁(같은 오행)
    const inSung = GENERATED_BY[dayElement] ?? ''  // 인성
    const biGyeop = dayElement                      // 비겁

    const inCount = oheng.counts[inSung as keyof typeof oheng.counts] ?? 0
    const biCount = oheng.counts[biGyeop as keyof typeof oheng.counts] ?? 0

    const yongsin = inCount <= biCount ? inSung : biGyeop
    const huisin = yongsin === inSung ? biGyeop : inSung

    return {
      yongsin,
      huisin,
      reason: `신약 사주이므로 인성(${inSung})과 비겁(${biGyeop})으로 기운을 보충합니다.`,
      favorable: [yongsin, huisin],
      unfavorable: [CONTROLS[dayElement] ?? '', GENERATES[dayElement] ?? ''],
    }
  }
}

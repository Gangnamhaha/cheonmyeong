/**
 * 대운(大運) 계산 모듈
 * 10년 단위의 운의 흐름을 계산합니다.
 */
import type { SajuResult } from './saju'

/** 단일 대운 정보 */
export interface DaeunPeriod {
  /** 대운 천간 */
  stem: string
  /** 대운 지지 */
  branch: string
  /** 천간 한자 */
  stemHanja: string
  /** 지지 한자 */
  branchHanja: string
  /** 대운 오행 */
  element: string
  /** 시작 나이 */
  startAge: number
  /** 종료 나이 */
  endAge: number
}

/** 대운 결과 */
export interface DaeunResult {
  /** 대운 목록 (8~10개) */
  periods: DaeunPeriod[]
  /** 순행/역행 */
  direction: '순행' | '역행'
  /** 대운 시작 나이 */
  startAge: number
}

// 천간 순서
const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const
const STEM_HANJA: Record<string, string> = {
  갑: '甲', 을: '乙', 병: '丙', 정: '丁', 무: '戊',
  기: '己', 경: '庚', 신: '辛', 임: '壬', 계: '癸',
}

// 지지 순서
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const
const BRANCH_HANJA: Record<string, string> = {
  자: '子', 축: '丑', 인: '寅', 묘: '卯', 진: '辰', 사: '巳',
  오: '午', 미: '未', 신: '申', 유: '酉', 술: '戌', 해: '亥',
}

// 천간 오행
const STEM_ELEMENT: Record<string, string> = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토',
  기: '토', 경: '금', 신: '금', 임: '수', 계: '수',
}

// 천간 음양: 양간 = 갑병무경임
const YANG_STEMS = new Set(['갑', '병', '무', '경', '임'])

/**
 * 대운을 계산합니다.
 * @param saju 사주 결과
 * @param gender 성별
 * @param birthYear 출생 연도 (대운 시작 나이 계산용, 간략 버전: 기본 3세)
 * @returns 대운 목록
 */
export function calculateDaeun(
  saju: SajuResult,
  gender: 'male' | 'female',
  birthYear: number,
): DaeunResult {
  const yearStem = saju.yearPillar.heavenlyStem
  const isYangStem = YANG_STEMS.has(yearStem)

  // 양남음녀 = 순행, 음남양녀 = 역행
  const isForward =
    (gender === 'male' && isYangStem) || (gender === 'female' && !isYangStem)
  const direction: '순행' | '역행' = isForward ? '순행' : '역행'

  // 월주를 기준으로 60갑자 이동
  const monthStem = saju.monthPillar.heavenlyStem
  const monthBranch = saju.monthPillar.earthlyBranch
  const stemIdx = STEMS.indexOf(monthStem as typeof STEMS[number])
  const branchIdx = BRANCHES.indexOf(monthBranch as typeof BRANCHES[number])

  // 대운 시작 나이: 간략 계산 (정밀 계산은 절기 경계까지의 일수/3이지만, 여기서는 근사값)
  // birthYear의 마지막 자릿수로 간략 추정 (통상 1~9세 사이)
  const yearDigit = birthYear % 10
  const roughStartAge = isForward
    ? ((10 - yearDigit) % 10) || 1
    : yearDigit || 1
  const startAge = Math.min(Math.max(roughStartAge, 1), 9)

  const periods: DaeunPeriod[] = []
  const step = isForward ? 1 : -1

  for (let i = 1; i <= 10; i++) {
    const si = ((stemIdx + i * step) % 10 + 10) % 10
    const bi = ((branchIdx + i * step) % 12 + 12) % 12
    const stem = STEMS[si]
    const branch = BRANCHES[bi]

    periods.push({
      stem,
      branch,
      stemHanja: STEM_HANJA[stem] ?? '',
      branchHanja: BRANCH_HANJA[branch] ?? '',
      element: STEM_ELEMENT[stem] ?? '',
      startAge: startAge + (i - 1) * 10,
      endAge: startAge + i * 10 - 1,
    })
  }

  return { periods, direction, startAge }
}

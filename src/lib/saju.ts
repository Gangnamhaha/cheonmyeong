import { calculateSaju } from '@fullstackfamily/manseryeok'

export interface SajuPillar {
  heavenlyStem: string       // 천간 한글 (갑, 을, 병...)
  earthlyBranch: string      // 지지 한글 (자, 축, 인...)
  heavenlyStemHanja: string  // 천간 한자 (甲, 乙, 丙...)
  earthlyBranchHanja: string // 지지 한자 (子, 丑, 寅...)
  element: string            // 오행 (목, 화, 토, 금, 수)
}

export interface SajuResult {
  yearPillar: SajuPillar
  monthPillar: SajuPillar
  dayPillar: SajuPillar
  hourPillar: SajuPillar
  rawText: string // "경오년 신사월 경진일 계미시"
}

// 천간 한글 → 한자 매핑
const STEM_HANJA: Record<string, string> = {
  갑: '甲', 을: '乙', 병: '丙', 정: '丁', 무: '戊',
  기: '己', 경: '庚', 신: '辛', 임: '壬', 계: '癸',
}

// 지지 한글 → 한자 매핑
const BRANCH_HANJA: Record<string, string> = {
  자: '子', 축: '丑', 인: '寅', 묘: '卯', 진: '辰', 사: '巳',
  오: '午', 미: '未', 신: '申', 유: '酉', 술: '戌', 해: '亥',
}

// 천간 오행 매핑
const STEM_ELEMENT: Record<string, string> = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토',
  기: '토', 경: '금', 신: '금', 임: '수', 계: '수',
}

/**
 * manseryeok의 '경오' 형태 2글자 문자열을 SajuPillar로 변환
 * yearPillar = '경오' → stem='경', branch='오'
 */
function parsePillar(pillarHangul: string, pillarHanja: string): SajuPillar {
  const stem = pillarHangul[0] ?? ''
  const branch = pillarHangul[1] ?? ''
  const stemHanja = pillarHanja[0] ?? STEM_HANJA[stem] ?? stem
  const branchHanja = pillarHanja[1] ?? BRANCH_HANJA[branch] ?? branch
  const element = STEM_ELEMENT[stem] ?? '?'

  return {
    heavenlyStem: stem,
    earthlyBranch: branch,
    heavenlyStemHanja: stemHanja,
    earthlyBranchHanja: branchHanja,
    element,
  }
}

/**
 * 양력 생년월일시로 사주팔자를 계산합니다.
 * @param year  양력 연도 (1900~2050)
 * @param month 양력 월 (1~12)
 * @param day   양력 일 (1~31)
 * @param hour  시 (0~23)
 * @param minute 분 (0~59, 기본값 0)
 */
export function calculateSajuFromBirth(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number = 0,
): SajuResult {
  if (year < 1900 || year > 2050) {
    throw new Error(`지원하지 않는 연도입니다: ${year}. 1900~2050년만 지원합니다.`)
  }
  if (month < 1 || month > 12) {
    throw new Error(`잘못된 월입니다: ${month}. 1~12 사이여야 합니다.`)
  }
  if (day < 1 || day > 31) {
    throw new Error(`잘못된 일입니다: ${day}. 1~31 사이여야 합니다.`)
  }
  if (hour < 0 || hour > 23) {
    throw new Error(`잘못된 시입니다: ${hour}. 0~23 사이여야 합니다.`)
  }

  // manseryeok calculateSaju 호출 (서울 경도 127도, 진태양시 보정 적용)
  const raw = calculateSaju(year, month, day, hour, minute, {
    longitude: 127,
    applyTimeCorrection: true,
  })

  // raw.yearPillar = '경오', raw.yearPillarHanja = '庚午'
  const yearPillar = parsePillar(
    raw.yearPillar as string,
    raw.yearPillarHanja as string,
  )
  const monthPillar = parsePillar(
    raw.monthPillar as string,
    raw.monthPillarHanja as string,
  )
  const dayPillar = parsePillar(
    raw.dayPillar as string,
    raw.dayPillarHanja as string,
  )
  const hourPillar = parsePillar(
    raw.hourPillar as string,
    raw.hourPillarHanja as string,
  )

  const rawText = `${raw.yearPillar}년 ${raw.monthPillar}월 ${raw.dayPillar}일 ${raw.hourPillar}시`

  return { yearPillar, monthPillar, dayPillar, hourPillar, rawText }
}

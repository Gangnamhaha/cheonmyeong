/**
 * 궁합(合) 분석 모듈
 * 두 사람의 사주를 비교하여 궁합 점수를 산출합니다.
 */
import type { FullSajuResult } from './saju'

export interface GunghapCategory {
  score: number
  description: string
}

export interface GunghapResult {
  score: number
  categories: {
    personality: GunghapCategory
    love: GunghapCategory
    work: GunghapCategory
    health: GunghapCategory
    overall: string
  }
  ohengBalance: string
}

// 천간 오행
const STEM_ELEMENT: Record<string, string> = {
  갑: '목', 을: '목', 병: '화', 정: '화', 무: '토',
  기: '토', 경: '금', 신: '금', 임: '수', 계: '수',
}

// 상생
const GENERATES: Record<string, string> = {
  목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
}

// 상극
const CONTROLS: Record<string, string> = {
  목: '토', 토: '수', 수: '화', 화: '금', 금: '목',
}

// 역상생 (나를 생하는)
const GENERATED_BY: Record<string, string> = {
  목: '수', 화: '목', 토: '화', 금: '토', 수: '금',
}

const OHENG_NAMES = ['목', '화', '토', '금', '수'] as const

/**
 * 두 오행의 관계를 판별
 */
function getRelation(el1: string, el2: string): 'same' | 'generate' | 'generated_by' | 'control' | 'controlled_by' {
  if (el1 === el2) return 'same'
  if (GENERATES[el1] === el2) return 'generate'
  if (GENERATED_BY[el1] === el2) return 'generated_by'
  if (CONTROLS[el1] === el2) return 'control'
  return 'controlled_by'
}

/**
 * 일간 관계 점수 (40점 만점)
 */
function calcDayStemScore(el1: string, el2: string): { score: number; desc: string } {
  const rel = getRelation(el1, el2)
  switch (rel) {
    case 'generate':
      return { score: 38, desc: `${el1}이(가) ${el2}을(를) 생하는 상생 관계로, 자연스러운 조화를 이룹니다.` }
    case 'generated_by':
      return { score: 36, desc: `${el2}이(가) ${el1}을(를) 생하는 상생 관계로, 상대가 든든한 지원군입니다.` }
    case 'same':
      return { score: 28, desc: `같은 ${el1} 오행으로 성격이 비슷하지만, 충돌도 있을 수 있습니다.` }
    case 'control':
      return { score: 15, desc: `${el1}이(가) ${el2}을(를) 극하는 관계로, 갈등에 주의가 필요합니다.` }
    case 'controlled_by':
      return { score: 18, desc: `${el2}이(가) ${el1}을(를) 극하는 관계로, 상대의 기운이 강하게 작용합니다.` }
  }
}

/**
 * 오행 보완 점수 (30점 만점)
 */
function calcOhengBalance(r1: FullSajuResult, r2: FullSajuResult): { score: number; desc: string } {
  let complementScore = 0
  const complementDetails: string[] = []

  for (const el of OHENG_NAMES) {
    const c1 = r1.oheng.counts[el]
    const c2 = r2.oheng.counts[el]

    // 한쪽이 부족하고 다른 쪽이 많으면 보완
    if (c1 === 0 && c2 >= 2) {
      complementScore += 8
      complementDetails.push(`${el}: 상대가 보완`)
    } else if (c2 === 0 && c1 >= 2) {
      complementScore += 8
      complementDetails.push(`${el}: 내가 보완`)
    } else if (c1 <= 1 && c2 >= 2) {
      complementScore += 4
    } else if (c2 <= 1 && c1 >= 2) {
      complementScore += 4
    }
  }

  const score = Math.min(complementScore, 30)
  const desc = complementDetails.length > 0
    ? `서로의 부족한 오행을 보완합니다: ${complementDetails.join(', ')}`
    : '오행 보완 관계가 크지 않습니다.'

  return { score, desc }
}

/**
 * 십신 조화 점수 (20점 만점)
 */
function calcSipsinHarmony(r1: FullSajuResult, r2: FullSajuResult): number {
  let score = 0
  const s1 = r1.sipsin.summary
  const s2 = r2.sipsin.summary

  // 식신-정재 조합 (안정적 관계)
  if ((s1['식신'] ?? 0) > 0 && (s2['정재'] ?? 0) > 0) score += 5
  if ((s2['식신'] ?? 0) > 0 && (s1['정재'] ?? 0) > 0) score += 5

  // 정관-정인 조합 (신뢰 관계)
  if ((s1['정관'] ?? 0) > 0 && (s2['정인'] ?? 0) > 0) score += 5
  if ((s2['정관'] ?? 0) > 0 && (s1['정인'] ?? 0) > 0) score += 5

  // 상관-편관 충돌 (갈등 요소)
  if ((s1['상관'] ?? 0) > 0 && (s2['편관'] ?? 0) > 0) score -= 3
  if ((s2['상관'] ?? 0) > 0 && (s1['편관'] ?? 0) > 0) score -= 3

  return Math.max(0, Math.min(score, 20))
}

/**
 * 용신 호환 점수 (10점 만점)
 */
function calcYongsinCompat(r1: FullSajuResult, r2: FullSajuResult): number {
  let score = 0

  // 내 용신이 상대 오행에 있으면 +점수
  const y1 = r1.yongsin.yongsin
  const y2 = r2.yongsin.yongsin

  if (r2.oheng.counts[y1 as keyof typeof r2.oheng.counts] >= 2) score += 5
  if (r1.oheng.counts[y2 as keyof typeof r1.oheng.counts] >= 2) score += 5

  return Math.min(score, 10)
}

/**
 * 궁합을 분석합니다.
 */
export function analyzeGunghap(person1: FullSajuResult, person2: FullSajuResult): GunghapResult {
  const el1 = STEM_ELEMENT[person1.saju.dayPillar.heavenlyStem] ?? '목'
  const el2 = STEM_ELEMENT[person2.saju.dayPillar.heavenlyStem] ?? '목'

  const dayStem = calcDayStemScore(el1, el2)
  const oheng = calcOhengBalance(person1, person2)
  const sipsin = calcSipsinHarmony(person1, person2)
  const yongsin = calcYongsinCompat(person1, person2)

  const totalScore = dayStem.score + oheng.score + sipsin + yongsin

  // 카테고리별 점수 분배
  const personalityScore = Math.round(dayStem.score / 40 * 100)
  const loveScore = Math.round((dayStem.score * 0.4 + oheng.score * 0.6) / 34 * 100)
  const workScore = Math.round((sipsin + yongsin) / 30 * 100)
  const healthScore = Math.round(oheng.score / 30 * 100)

  const overallLabel =
    totalScore >= 80 ? '천생연분! 매우 좋은 궁합입니다.' :
    totalScore >= 65 ? '서로 잘 맞는 좋은 궁합입니다.' :
    totalScore >= 50 ? '보통 궁합이지만 노력으로 극복할 수 있습니다.' :
    totalScore >= 35 ? '주의가 필요한 궁합입니다. 서로 이해하는 노력이 중요합니다.' :
    '쉽지 않은 궁합이지만, 불가능은 없습니다.'

  return {
    score: totalScore,
    categories: {
      personality: {
        score: Math.min(personalityScore, 100),
        description: dayStem.desc,
      },
      love: {
        score: Math.min(loveScore, 100),
        description: `연애 궁합: 일간 관계와 오행 보완을 종합하면 ${loveScore >= 70 ? '매력적인 조합' : loveScore >= 50 ? '무난한 관계' : '노력이 필요한 관계'}입니다.`,
      },
      work: {
        score: Math.min(workScore, 100),
        description: `직장 궁합: 십신과 용신 호환을 고려하면 ${workScore >= 70 ? '시너지가 좋은 파트너' : workScore >= 50 ? '안정적인 동료 관계' : '역할 분담이 중요한 관계'}입니다.`,
      },
      health: {
        score: Math.min(healthScore, 100),
        description: `건강 궁합: 오행 보완 관계로 볼 때 ${healthScore >= 70 ? '서로의 부족한 기운을 잘 채워줍니다' : '각자 건강 관리에 신경쓰면 좋겠습니다'}.`,
      },
      overall: overallLabel,
    },
    ohengBalance: oheng.desc,
  }
}

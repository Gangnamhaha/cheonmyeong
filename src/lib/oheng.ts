// src/lib/oheng.ts

// SajuPillar 타입 (saju.ts에서 import하거나 여기서 재정의)
// Task 2와 병렬 실행 중이므로 saju.ts가 없을 수 있음 → 로컬 타입 정의
interface SajuPillar {
  heavenlyStem: string
  earthlyBranch: string
  heavenlyStemHanja?: string
  earthlyBranchHanja?: string
  element: string
}

interface SajuResult {
  yearPillar: SajuPillar
  monthPillar: SajuPillar
  dayPillar: SajuPillar
  hourPillar: SajuPillar
  rawText?: string
}

export interface OhengResult {
  counts: { 목: number; 화: number; 토: number; 금: number; 수: number }
  dominant: string  // 가장 강한 오행
  weak: string      // 가장 약한 오행
  balance: '균형' | '편중' | '결핍'
}

// 오방색 (전통 한국 색상)
export const OHENG_COLORS: Record<string, string> = {
  목: '#22C55E',  // 초록 (동방, 봄)
  화: '#EF4444',  // 빨강 (남방, 여름)
  토: '#EAB308',  // 노랑 (중앙, 환절기)
  금: '#F8FAFC',  // 흰색/은색 (서방, 가을)
  수: '#3B82F6',  // 파랑/검정 (북방, 겨울)
}

// 천간 오행 매핑
const STEM_ELEMENT: Record<string, string> = {
  갑: '목', 을: '목',
  병: '화', 정: '화',
  무: '토', 기: '토',
  경: '금', 신: '금',
  임: '수', 계: '수',
}

// 지지 오행 매핑
const BRANCH_ELEMENT: Record<string, string> = {
  인: '목', 묘: '목',
  사: '화', 오: '화',
  진: '토', 술: '토', 축: '토', 미: '토',
  신: '금', 유: '금',
  해: '수', 자: '수',
}

export function analyzeOheng(saju: SajuResult): OhengResult {
  const counts: OhengResult['counts'] = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }
  
  const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar]
  
  for (const pillar of pillars) {
    // 천간 오행
    const stemEl = pillar.element || STEM_ELEMENT[pillar.heavenlyStem]
    if (stemEl && stemEl in counts) {
      counts[stemEl as keyof typeof counts]++
    }
    // 지지 오행
    const branchEl = BRANCH_ELEMENT[pillar.earthlyBranch]
    if (branchEl && branchEl in counts) {
      counts[branchEl as keyof typeof counts]++
    }
  }
  
  const entries = Object.entries(counts) as [string, number][]
  const sorted = [...entries].sort((a, b) => b[1] - a[1])
  const dominant = sorted[0][0]
  const weak = sorted[sorted.length - 1][0]
  
  const max = sorted[0][1]
  const min = sorted[sorted.length - 1][1]
  const balance: OhengResult['balance'] = 
    min === 0 ? '결핍' : max - min >= 3 ? '편중' : '균형'
  
  return { counts, dominant, weak, balance }
}

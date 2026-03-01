import { describe, it, expect } from 'vitest'
import { analyzeOheng, OHENG_COLORS, OhengResult } from '../oheng'

// 테스트용 사주 데이터 (경오년 신사월 경진일 계미시)
const mockSaju = {
  yearPillar:  { heavenlyStem: '경', earthlyBranch: '오', element: '금' },
  monthPillar: { heavenlyStem: '신', earthlyBranch: '사', element: '금' },
  dayPillar:   { heavenlyStem: '경', earthlyBranch: '진', element: '금' },
  hourPillar:  { heavenlyStem: '계', earthlyBranch: '미', element: '수' },
}

describe('analyzeOheng', () => {
  it('오행 카운트 합계가 8이어야 함 (천간4 + 지지4)', () => {
    const result = analyzeOheng(mockSaju)
    const total = Object.values(result.counts).reduce((a, b) => a + b, 0)
    expect(total).toBe(8)
  })

  it('dominant과 weak 오행이 반환됨', () => {
    const result = analyzeOheng(mockSaju)
    expect(result.dominant).toBeTruthy()
    expect(result.weak).toBeTruthy()
    expect(['목', '화', '토', '금', '수']).toContain(result.dominant)
    expect(['목', '화', '토', '금', '수']).toContain(result.weak)
  })

  it('balance가 균형|편중|결핍 중 하나', () => {
    const result = analyzeOheng(mockSaju)
    expect(['균형', '편중', '결핍']).toContain(result.balance)
  })

  it('오행이 0인 경우 결핍 처리', () => {
    // 목이 없는 사주
    const noWoodSaju = {
      yearPillar:  { heavenlyStem: '경', earthlyBranch: '오', element: '금' },
      monthPillar: { heavenlyStem: '신', earthlyBranch: '사', element: '금' },
      dayPillar:   { heavenlyStem: '경', earthlyBranch: '진', element: '금' },
      hourPillar:  { heavenlyStem: '계', earthlyBranch: '자', element: '수' },
    }
    const result = analyzeOheng(noWoodSaju)
    expect(result.counts.목).toBe(0)
    expect(result.balance).toBe('결핍')
  })

  it('OHENG_COLORS에 5가지 오행 색상 모두 존재', () => {
    expect(OHENG_COLORS.목).toBeTruthy()
    expect(OHENG_COLORS.화).toBeTruthy()
    expect(OHENG_COLORS.토).toBeTruthy()
    expect(OHENG_COLORS.금).toBeTruthy()
    expect(OHENG_COLORS.수).toBeTruthy()
  })
})

import { describe, it, expect } from 'vitest'
import { calculateSajuFromBirth } from '../saju'

describe('calculateSajuFromBirth', () => {
  it('1990년 5월 15일 14시 30분 → 사주 반환', () => {
    const result = calculateSajuFromBirth(1990, 5, 15, 14, 30)
    expect(result).toBeDefined()
    expect(result.yearPillar).toBeDefined()
    expect(result.monthPillar).toBeDefined()
    expect(result.dayPillar).toBeDefined()
    expect(result.hourPillar).toBeDefined()
    // 각 기둥에 천간+지지 존재
    expect(result.yearPillar.heavenlyStem).toBeTruthy()
    expect(result.yearPillar.earthlyBranch).toBeTruthy()
    expect(result.yearPillar.heavenlyStemHanja).toBeTruthy()
    expect(result.yearPillar.earthlyBranchHanja).toBeTruthy()
    expect(result.yearPillar.element).toBeTruthy()
  })

  it('1990년 5월 15일 → 경오년 신사월 경진일 계미시', () => {
    const result = calculateSajuFromBirth(1990, 5, 15, 14, 30)
    // manseryeok README 예시 검증
    expect(result.yearPillar.heavenlyStem).toBe('경')
    expect(result.yearPillar.earthlyBranch).toBe('오')
    expect(result.monthPillar.heavenlyStem).toBe('신')
    expect(result.monthPillar.earthlyBranch).toBe('사')
    expect(result.dayPillar.heavenlyStem).toBe('경')
    expect(result.dayPillar.earthlyBranch).toBe('진')
    expect(result.hourPillar.heavenlyStem).toBe('계')
    expect(result.hourPillar.earthlyBranch).toBe('미')
  })

  it('각 기둥에 한글과 한자 모두 포함', () => {
    const result = calculateSajuFromBirth(1990, 5, 15, 14, 30)
    const pillars = [result.yearPillar, result.monthPillar, result.dayPillar, result.hourPillar]
    pillars.forEach(p => {
      expect(p.heavenlyStem).toBeTruthy()
      expect(p.earthlyBranch).toBeTruthy()
      expect(p.heavenlyStemHanja).toBeTruthy()
      expect(p.earthlyBranchHanja).toBeTruthy()
      expect(p.element).toBeTruthy()
    })
  })

  it('2000년 1월 1일 0시 → 사주 반환', () => {
    const result = calculateSajuFromBirth(2000, 1, 1, 0, 0)
    expect(result.yearPillar).toBeDefined()
    expect(result.rawText).toBeTruthy()
    expect(typeof result.rawText).toBe('string')
  })

  it('rawText가 "X년 X월 X일 X시" 형식', () => {
    const result = calculateSajuFromBirth(1990, 5, 15, 14, 30)
    expect(result.rawText).toMatch(/년.*월.*일.*시/)
  })

  it('1900년 1월 1일 → 경계값 처리 (에러 없음)', () => {
    expect(() => calculateSajuFromBirth(1900, 1, 1, 0, 0)).not.toThrow()
  })

  it('2050년 12월 31일 → 경계값 처리 (에러 없음)', () => {
    expect(() => calculateSajuFromBirth(2050, 12, 31, 23, 59)).not.toThrow()
  })

  it('1899년 → 범위 외 에러', () => {
    expect(() => calculateSajuFromBirth(1899, 1, 1, 0, 0)).toThrow()
  })

  it('2051년 → 범위 외 에러', () => {
    expect(() => calculateSajuFromBirth(2051, 1, 1, 0, 0)).toThrow()
  })
})

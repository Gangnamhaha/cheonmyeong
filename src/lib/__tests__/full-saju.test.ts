import { describe, it, expect } from 'vitest'
import { calculateFullSaju, type FullSajuResult } from '../saju'

function assertFullResult(result: FullSajuResult, label: string) {
  // saju 기본
  expect(result.saju, `${label}: saju`).toBeDefined()
  expect(result.saju.yearPillar.heavenlyStem, `${label}: 년간`).toBeTruthy()
  expect(result.saju.dayPillar.heavenlyStem, `${label}: 일간`).toBeTruthy()

  // oheng
  expect(result.oheng, `${label}: oheng`).toBeDefined()
  expect(result.oheng.counts, `${label}: oheng.counts`).toBeDefined()
  const total = Object.values(result.oheng.counts).reduce((a, b) => a + b, 0)
  expect(total, `${label}: oheng 합계 8`).toBe(8)

  // sipsin
  expect(result.sipsin, `${label}: sipsin`).toBeDefined()
  expect(result.sipsin.dayStem, `${label}: sipsin.dayStem`).toBe('본인')
  expect(result.sipsin.summary, `${label}: sipsin.summary`).toBeDefined()

  // ilganStrength
  expect(result.ilganStrength, `${label}: ilganStrength`).toBeDefined()
  expect(['강', '약', '중', '신강', '신약', '중화']).toContain(result.ilganStrength.strength)
  expect(result.ilganStrength.score).toBeTypeOf('number')

  // yongsin
  expect(result.yongsin, `${label}: yongsin`).toBeDefined()
  expect(['목', '화', '토', '금', '수']).toContain(result.yongsin.yongsin)
  expect(['목', '화', '토', '금', '수']).toContain(result.yongsin.huisin)
  expect(result.yongsin.reason, `${label}: yongsin.reason`).toBeTruthy()
  expect(result.yongsin.favorable.length, `${label}: favorable`).toBeGreaterThan(0)
  expect(result.yongsin.unfavorable.length, `${label}: unfavorable`).toBeGreaterThan(0)

  // daeun
  expect(result.daeun, `${label}: daeun`).toBeDefined()
  expect(result.daeun.periods.length, `${label}: daeun periods`).toBeGreaterThanOrEqual(6)
  expect(['순행', '역행']).toContain(result.daeun.direction)
  result.daeun.periods.forEach((p, i) => {
    expect(p.stem, `${label}: daeun[${i}].stem`).toBeTruthy()
    expect(p.branch, `${label}: daeun[${i}].branch`).toBeTruthy()
    expect(p.element, `${label}: daeun[${i}].element`).toBeTruthy()
    expect(p.startAge, `${label}: daeun[${i}].startAge`).toBeTypeOf('number')
    expect(p.endAge).toBeGreaterThan(p.startAge)
  })

  // yearlyFortune
  expect(result.yearlyFortune, `${label}: yearlyFortune`).toBeDefined()
  expect(result.yearlyFortune.stem, `${label}: yearlyFortune.stem`).toBeTruthy()
  expect(['길', '평', '흉']).toContain(result.yearlyFortune.rating)

  // monthlyFortune
  expect(result.monthlyFortune, `${label}: monthlyFortune`).toBeDefined()
  expect(result.monthlyFortune.stem, `${label}: monthlyFortune.stem`).toBeTruthy()
  expect(['길', '평', '흉']).toContain(result.monthlyFortune.rating)
}

describe('calculateFullSaju 통합 테스트', () => {
  it('1990.5.15 남자 양력 전체 분석', () => {
    const result = calculateFullSaju(1990, 5, 15, 14, 30, 'solar', false, 'male')
    assertFullResult(result, '1990남')
  })

  it('1992.8.20 여자 양력 전체 분석', () => {
    const result = calculateFullSaju(1992, 8, 20, 10, 0, 'solar', false, 'female')
    assertFullResult(result, '1992여')
  })

  it('2000.1.1 양력 경계값', () => {
    const result = calculateFullSaju(2000, 1, 1, 0, 0, 'solar', false, 'male')
    assertFullResult(result, '2000경계')
  })

  it('1950.12.25 오래된 날짜', () => {
    const result = calculateFullSaju(1950, 12, 25, 18, 0, 'solar', false, 'female')
    assertFullResult(result, '1950')
  })

  it('음력 입력', () => {
    const result = calculateFullSaju(1990, 3, 15, 12, 0, 'lunar', false, 'male')
    assertFullResult(result, '음력1990')
  })

  it('대운 순행/역행이 성별과 연간 음양에 따라 결정', () => {
    const male = calculateFullSaju(1990, 5, 15, 14, 0, 'solar', false, 'male')
    const female = calculateFullSaju(1990, 5, 15, 14, 0, 'solar', false, 'female')
    // 같은 날 남녀는 대운 방향이 반대
    expect(male.daeun.direction).not.toBe(female.daeun.direction)
  })

  it('sipsin summary 합계가 7 (일간 제외 7자리)', () => {
    const result = calculateFullSaju(1990, 5, 15, 14, 30, 'solar', false, 'male')
    const sumSipsin = Object.values(result.sipsin.summary).reduce((a, b) => a + b, 0)
    expect(sumSipsin).toBe(7)
  })

  it('yongsin의 favorable/unfavorable이 겹치지 않음', () => {
    const result = calculateFullSaju(1990, 5, 15, 14, 30, 'solar', false, 'male')
    const overlap = result.yongsin.favorable.filter(f => result.yongsin.unfavorable.includes(f))
    expect(overlap.length, 'favorable과 unfavorable 겹침').toBe(0)
  })

  it('다양한 시간대에서 에러 없음', () => {
    for (let h = 0; h < 24; h += 3) {
      expect(() => calculateFullSaju(1990, 5, 15, h, 0, 'solar', false, 'male')).not.toThrow()
    }
  })
})

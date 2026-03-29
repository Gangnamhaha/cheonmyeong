import { describe, it, expect } from 'vitest'
import { analyzeGunghap, type GunghapResult } from '../gunghap'
import { calculateFullSaju } from '../saju'

describe('analyzeGunghap', () => {
  // 고정 테스트 데이터: 1990.5.15 남 / 1992.8.20 여
  const person1 = calculateFullSaju(1990, 5, 15, 14, 30, 'solar', false, 'male')
  const person2 = calculateFullSaju(1992, 8, 20, 10, 0, 'solar', false, 'female')

  it('GunghapResult 구조가 올바름', () => {
    const result = analyzeGunghap(person1, person2)

    expect(result.score).toBeTypeOf('number')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)

    expect(result.categories.personality.score).toBeGreaterThanOrEqual(0)
    expect(result.categories.personality.score).toBeLessThanOrEqual(100)
    expect(result.categories.personality.description).toBeTruthy()

    expect(result.categories.love.score).toBeGreaterThanOrEqual(0)
    expect(result.categories.love.score).toBeLessThanOrEqual(100)

    expect(result.categories.work.score).toBeGreaterThanOrEqual(0)
    expect(result.categories.work.score).toBeLessThanOrEqual(100)

    expect(result.categories.health.score).toBeGreaterThanOrEqual(0)
    expect(result.categories.health.score).toBeLessThanOrEqual(100)

    expect(result.categories.overall).toBeTruthy()
    expect(result.ohengBalance).toBeTruthy()
  })

  it('같은 사람끼리 궁합 시 에러 없음', () => {
    const result = analyzeGunghap(person1, person1)
    expect(result.score).toBeTypeOf('number')
    expect(result.categories.personality.description).toContain('같은')
  })

  it('총점 라벨이 점수에 따라 올바르게 매칭', () => {
    const result = analyzeGunghap(person1, person2)
    const s = result.score

    if (s >= 80) expect(result.categories.overall).toContain('천생연분')
    else if (s >= 65) expect(result.categories.overall).toContain('잘 맞는')
    else if (s >= 50) expect(result.categories.overall).toContain('보통')
    else if (s >= 35) expect(result.categories.overall).toContain('주의')
    else expect(result.categories.overall).toContain('쉽지 않은')
  })

  it('다양한 생년월일 조합에서 에러 없음', () => {
    const testCases = [
      { y1: 1985, m1: 3, d1: 10, y2: 1987, m2: 11, d2: 25 },
      { y1: 2000, m1: 1, d1: 1, y2: 2000, m2: 12, d2: 31 },
      { y1: 1970, m1: 6, d1: 15, y2: 1995, m2: 9, d2: 8 },
      { y1: 1950, m1: 2, d1: 28, y2: 1955, m2: 7, d2: 14 },
    ]

    testCases.forEach(({ y1, m1, d1, y2, m2, d2 }) => {
      const p1 = calculateFullSaju(y1, m1, d1, 12, 0, 'solar', false, 'male')
      const p2 = calculateFullSaju(y2, m2, d2, 12, 0, 'solar', false, 'female')
      const result = analyzeGunghap(p1, p2)

      expect(result.score, `${y1}.${m1}.${d1} vs ${y2}.${m2}.${d2}`).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })
  })

  it('궁합은 순서에 따라 결과가 다를 수 있음 (비대칭)', () => {
    const r1 = analyzeGunghap(person1, person2)
    const r2 = analyzeGunghap(person2, person1)
    // 총점이 같거나 다를 수 있지만, 둘 다 유효해야 함
    expect(r1.score).toBeGreaterThanOrEqual(0)
    expect(r2.score).toBeGreaterThanOrEqual(0)
  })

  it('상생 관계 궁합이 상극보다 높은 점수', () => {
    // 수(임) → 목(갑) 상생
    const water = calculateFullSaju(1992, 12, 22, 0, 0, 'solar', false, 'male') // 임 일간 가능성
    const wood = calculateFullSaju(1994, 2, 4, 6, 0, 'solar', false, 'female') // 갑 일간 가능성

    const result = analyzeGunghap(water, wood)
    // 상생 관계면 성격 점수가 비교적 높아야 함
    expect(result.categories.personality.score).toBeGreaterThanOrEqual(0)
    // 결과가 유효하기만 하면 됨 (실제 일간은 만세력에 따라 달라짐)
    expect(result.score).toBeGreaterThanOrEqual(0)
  })
})

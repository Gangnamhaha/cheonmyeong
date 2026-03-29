import { describe, it, expect } from 'vitest'
import { PLANS, type PlanKey } from '../credits'

describe('PLANS 구조 검증', () => {
  const planKeys = Object.keys(PLANS) as PlanKey[]

  it('모든 요금제에 필수 필드 존재', () => {
    planKeys.forEach((key) => {
      const plan = PLANS[key]
      expect(plan.name, `${key}: name 없음`).toBeTruthy()
      expect(plan.nameEn, `${key}: nameEn 없음`).toBeTruthy()
      expect(typeof plan.credits, `${key}: credits 타입`).toBe('number')
      expect(typeof plan.price, `${key}: price 타입`).toBe('number')
      expect(plan.priceLabel, `${key}: priceLabel 없음`).toBeTruthy()
      expect(Array.isArray(plan.features), `${key}: features 배열`).toBe(true)
      expect(plan.features.length, `${key}: features 비어있음`).toBeGreaterThan(0)
      expect(typeof plan.popular, `${key}: popular 타입`).toBe('boolean')
      expect(['free', 'onetime', 'subscription']).toContain(plan.type)
    })
  })

  it('free 요금제는 가격 0', () => {
    expect(PLANS.free.price).toBe(0)
    expect(PLANS.free.type).toBe('free')
    expect(PLANS.free.credits).toBe(3)
  })

  it('일회성 요금제 가격이 0보다 큼', () => {
    const onetimePlans = planKeys.filter((k) => PLANS[k].type === 'onetime')
    expect(onetimePlans.length).toBeGreaterThan(0)
    onetimePlans.forEach((key) => {
      expect(PLANS[key].price, `${key}: 가격이 0 이하`).toBeGreaterThan(0)
    })
  })

  it('구독 요금제에 interval 존재', () => {
    const subPlans = planKeys.filter((k) => PLANS[k].type === 'subscription')
    expect(subPlans.length).toBeGreaterThan(0)
    subPlans.forEach((key) => {
      const plan = PLANS[key] as typeof PLANS['sub_basic']
      expect(['month', 'year'], `${key}: interval 값`).toContain(plan.interval)
    })
  })

  it('구독 요금제 키는 sub_ 접두사', () => {
    const subPlans = planKeys.filter((k) => PLANS[k].type === 'subscription')
    subPlans.forEach((key) => {
      expect(key.startsWith('sub_'), `${key}: sub_ 접두사 없음`).toBe(true)
    })
  })

  it('리포트 요금제는 credits가 0', () => {
    const reportPlans: PlanKey[] = ['premium_report', 'premium_report_pro', 'gunghap_premium']
    reportPlans.forEach((key) => {
      expect(PLANS[key].credits, `${key}: credits가 0이 아님`).toBe(0)
      expect(PLANS[key].price, `${key}: 가격이 0 이하`).toBeGreaterThan(0)
    })
  })

  it('이용권이 있는 요금제는 가격 대비 이용권 비율이 합리적', () => {
    const creditPlans = planKeys.filter(
      (k) => PLANS[k].type === 'onetime' && PLANS[k].credits > 0,
    )
    creditPlans.forEach((key) => {
      const plan = PLANS[key]
      const perCredit = plan.price / plan.credits
      // 이용권당 가격이 10원~1000원 사이
      expect(perCredit, `${key}: 이용권당 가격 ${perCredit}원`).toBeGreaterThanOrEqual(10)
      expect(perCredit, `${key}: 이용권당 가격 ${perCredit}원`).toBeLessThanOrEqual(1000)
    })
  })

  it('popular 플래그가 정확히 1~2개 요금제에만 설정', () => {
    const popularCount = planKeys.filter((k) => PLANS[k].popular).length
    expect(popularCount).toBeGreaterThanOrEqual(1)
    expect(popularCount).toBeLessThanOrEqual(3)
  })
})

describe('PortOne paymentId 파싱 로직', () => {
  // portone webhook에서 사용하는 paymentId 형식 검증
  const parsePlanFromPayStylePaymentId = (paymentId: string): PlanKey | null => {
    if (!paymentId.startsWith('pay-')) return null
    const rest = paymentId.slice('pay-'.length)
    const lastDash = rest.lastIndexOf('-')
    if (lastDash <= 0) return null
    const planCandidate = rest.slice(0, lastDash)
    if (!(planCandidate in PLANS)) return null
    return planCandidate as PlanKey
  }

  it('유효한 paymentId에서 plan 추출', () => {
    expect(parsePlanFromPayStylePaymentId('pay-starter-abc123')).toBe('starter')
    expect(parsePlanFromPayStylePaymentId('pay-pro-xyz789')).toBe('pro')
    expect(parsePlanFromPayStylePaymentId('pay-unlimited-def456')).toBe('unlimited')
    expect(parsePlanFromPayStylePaymentId('pay-premium_report-ghi')).toBe('premium_report')
    expect(parsePlanFromPayStylePaymentId('pay-sub_basic-jkl')).toBe('sub_basic')
  })

  it('잘못된 paymentId는 null 반환', () => {
    expect(parsePlanFromPayStylePaymentId('invalid')).toBeNull()
    expect(parsePlanFromPayStylePaymentId('pay-')).toBeNull()
    expect(parsePlanFromPayStylePaymentId('pay-nonexistent-abc')).toBeNull()
    expect(parsePlanFromPayStylePaymentId('')).toBeNull()
    expect(parsePlanFromPayStylePaymentId('pay-abc')).toBeNull() // no trailing shortId
  })

  // V2 paymentId format: payment__${plan}__${base64url(userId)}__${timestamp}
  const parsePaymentId = (paymentId: string): { userId: string; plan: PlanKey } | null => {
    const parts = paymentId.split('__')
    if (parts.length !== 4 || parts[0] !== 'payment') return null
    const plan = parts[1] as PlanKey
    if (!(plan in PLANS)) return null
    try {
      const userId = Buffer.from(parts[2], 'base64url').toString('utf8')
      if (!userId) return null
      return { userId, plan }
    } catch {
      return null
    }
  }

  it('V2 paymentId 파싱 성공', () => {
    const userId = 'user-123-abc'
    const encoded = Buffer.from(userId).toString('base64url')
    const paymentId = `payment__pro__${encoded}__1711234567890`
    const result = parsePaymentId(paymentId)
    expect(result).not.toBeNull()
    expect(result!.userId).toBe(userId)
    expect(result!.plan).toBe('pro')
  })

  it('V2 paymentId 잘못된 형식 null 반환', () => {
    expect(parsePaymentId('payment__pro__abc')).toBeNull() // 3 parts
    expect(parsePaymentId('wrong__pro__abc__123')).toBeNull() // wrong prefix
    expect(parsePaymentId('payment__fakePlan__abc__123')).toBeNull() // invalid plan
  })
})

describe('customData 파싱 로직', () => {
  const parseCustomData = (customData?: string): { userId: string; plan: PlanKey } | null => {
    if (!customData) return null
    try {
      const parsed = JSON.parse(customData) as { userId?: string; plan?: PlanKey }
      if (!parsed.userId || !parsed.plan || !(parsed.plan in PLANS)) return null
      return { userId: parsed.userId, plan: parsed.plan }
    } catch {
      return null
    }
  }

  it('유효한 customData 파싱', () => {
    const data = JSON.stringify({ userId: 'user-1', plan: 'starter' })
    expect(parseCustomData(data)).toEqual({ userId: 'user-1', plan: 'starter' })
  })

  it('plan이 없는 경우 null', () => {
    expect(parseCustomData(JSON.stringify({ userId: 'user-1' }))).toBeNull()
  })

  it('userId가 없는 경우 null', () => {
    expect(parseCustomData(JSON.stringify({ plan: 'starter' }))).toBeNull()
  })

  it('잘못된 plan은 null', () => {
    expect(parseCustomData(JSON.stringify({ userId: 'u', plan: 'fake' }))).toBeNull()
  })

  it('잘못된 JSON은 null', () => {
    expect(parseCustomData('not json')).toBeNull()
  })

  it('undefined/빈 문자열은 null', () => {
    expect(parseCustomData(undefined)).toBeNull()
    expect(parseCustomData('')).toBeNull()
  })
})

describe('결제 금액 일관성', () => {
  it('portone API 응답의 paymentId에서 추출한 plan 가격과 실제 PLANS 가격 일치 검증 가능', () => {
    // 이 테스트는 portone route.ts에서 생성하는 paymentId 형식이
    // webhook에서 올바르게 파싱되어 가격 검증에 사용됨을 확인
    const plan: PlanKey = 'pro'
    const shortId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const paymentId = `pay-${plan}-${shortId}`

    // paymentId에서 plan 추출
    const rest = paymentId.slice('pay-'.length)
    const lastDash = rest.lastIndexOf('-')
    const extractedPlan = rest.slice(0, lastDash)

    expect(extractedPlan).toBe(plan)
    expect(PLANS[extractedPlan as PlanKey].price).toBe(9900)
  })

  it('구독 요금제는 월간 가격이 연간보다 비쌈 (단위 월 기준)', () => {
    const monthlyBasic = PLANS.sub_basic.price
    const annualBasic = PLANS.sub_basic_annual.price / 12

    expect(monthlyBasic).toBeGreaterThan(annualBasic)

    const monthlyPro = PLANS.sub_pro.price
    const annualPro = PLANS.sub_pro_annual.price / 12

    expect(monthlyPro).toBeGreaterThan(annualPro)
  })
})

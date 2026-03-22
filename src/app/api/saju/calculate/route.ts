import { NextRequest, NextResponse } from 'next/server'
import { calculateFullSaju } from '@/lib/saju'

// Simple in-memory rate limit (per instance)
const RATE_LIMIT = new Map<string, number[]>()
const MAX_REQUESTS = 30
const WINDOW_MS = 60_000

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? '127.0.0.1'
  return req.ip ?? '127.0.0.1'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = RATE_LIMIT.get(ip) ?? []
  const recent = timestamps.filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_REQUESTS) return false
  recent.push(now)
  RATE_LIMIT.set(ip, recent)
  return true
}

type RequestBody = {
  year?: unknown
  month?: unknown
  day?: unknown
  hour?: unknown
  minute?: unknown
  calendarType?: unknown
  isLeapMonth?: unknown
  gender?: unknown
}

function isInt(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n)
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 429 },
    )
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const { year, month, day, hour, minute, calendarType, isLeapMonth, gender } = body

  if (!isInt(year) || !isInt(month) || !isInt(day) || !isInt(hour)) {
    return NextResponse.json(
      { error: 'year, month, day, hour는 정수여야 합니다.' },
      { status: 400 },
    )
  }

  if (minute !== undefined && !isInt(minute)) {
    return NextResponse.json(
      { error: 'minute는 정수여야 합니다.' },
      { status: 400 },
    )
  }

  const calendar = calendarType === 'lunar' ? 'lunar' : 'solar'
  const leap = typeof isLeapMonth === 'boolean' ? isLeapMonth : false
  const g: 'male' | 'female' = gender === 'female' ? 'female' : 'male'

  try {
    const result = calculateFullSaju(
      year,
      month,
      day,
      hour,
      minute ?? 0,
      calendar,
      leap,
      g,
    )
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '사주 계산 중 오류가 발생했습니다.' },
      { status: 400 },
    )
  }
}

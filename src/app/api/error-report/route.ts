import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory error log (in production, send to external service)
const errorLog: Array<{
  message: string
  stack?: string
  url?: string
  timestamp: string
}> = []

const MAX_ERRORS = 100

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, stack, url, timestamp } = body as {
      message?: string
      stack?: string
      url?: string
      timestamp?: string
    }

    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 })
    }

    // Log to server console
    console.error(`[ERROR REPORT] ${timestamp ?? new Date().toISOString()} | ${url ?? 'unknown'} | ${message}`)

    // Store in memory (rotate old entries)
    errorLog.push({
      message: message ?? '',
      stack,
      url,
      timestamp: timestamp ?? new Date().toISOString(),
    })
    if (errorLog.length > MAX_ERRORS) {
      errorLog.splice(0, errorLog.length - MAX_ERRORS)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 })
  }
}

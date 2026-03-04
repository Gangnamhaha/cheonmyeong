import { NextResponse } from 'next/server'

interface GuestBody {
  email?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as GuestBody
  const email = body.email?.toLowerCase().trim()

  if (!email) {
    return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 })
  }

  const guestUserId = `email_${email}`

  const res = NextResponse.json({ success: true, guestUserId })
  res.cookies.set('guest_user_id', guestUserId, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return res
}

// DELETE /api/auth/guest — 비회원 로그아웃 (쿠키 삭제)
export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('guest_user_id', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}

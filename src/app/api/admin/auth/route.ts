import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminCredentials, createAdminToken, verifyAdminToken } from '@/lib/admin'

/** POST: 아이디/비밀번호로 관리자 로그인 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const username = String(body?.username ?? '').trim()
    const password = String(body?.password ?? '')

    if (!username || !password) {
      return NextResponse.json({ error: '아이디와 비밀번호를 입력해 주세요.' }, { status: 400 })
    }

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
    }

    const token = createAdminToken()
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24시간
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: '요청 처리에 실패했습니다.' }, { status: 500 })
  }
}

/** GET: 현재 관리자 세션 확인 */
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}

/** DELETE: 관리자 로그아웃 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return res
}

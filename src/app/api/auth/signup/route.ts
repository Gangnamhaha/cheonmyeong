import { NextResponse } from 'next/server'
import { createUser } from '@/lib/user'

interface SignupBody {
  email?: string
  password?: string
  name?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody
    const { email, password, name } = body

    // ─── Validation ──────────────────────────────────────────────
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '이름, 이메일, 비밀번호를 모두 입력해주세요.' },
        { status: 400 },
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    // Email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 },
      )
    }

    // Name length
    if (trimmedName.length < 1 || trimmedName.length > 20) {
      return NextResponse.json(
        { error: '이름은 1~20자로 입력해주세요.' },
        { status: 400 },
      )
    }

    // Password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 },
      )
    }

    if (password.length > 100) {
      return NextResponse.json(
        { error: '비밀번호가 너무 깁니다.' },
        { status: 400 },
      )
    }

    // ─── Create user ─────────────────────────────────────────────
    await createUser(trimmedEmail, password, trimmedName)

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다.' },
      { status: 201 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.'

    // Duplicate email
    if (message === '이미 가입된 이메일입니다.') {
      return NextResponse.json({ error: message }, { status: 409 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

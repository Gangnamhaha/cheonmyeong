import { NextRequest, NextResponse } from 'next/server'
import { createInquiry, listInquiriesByEmail } from '@/lib/inquiry'

// POST /api/inquiry — 문의 작성
export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string; subject?: string; content?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const email = body.email?.trim()
  const name = body.name?.trim()
  const subject = body.subject?.trim()
  const content = body.content?.trim()

  if (!email || !name || !subject || !content) {
    return NextResponse.json({ error: '모든 항목을 입력해주세요.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 })
  }

  if (subject.length > 100) {
    return NextResponse.json({ error: '제목은 100자 이내로 입력해주세요.' }, { status: 400 })
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: '내용은 2000자 이내로 입력해주세요.' }, { status: 400 })
  }

  try {
    const inquiry = await createInquiry(email, name, subject, content)
    return NextResponse.json({ success: true, inquiry })
  } catch (err) {
    console.error('Inquiry creation error:', err)
    return NextResponse.json({ error: '문의 등록에 실패했습니다.' }, { status: 500 })
  }
}

// GET /api/inquiry?email=xxx — 내 문의 조회
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.trim()

  if (!email) {
    return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 })
  }

  try {
    const inquiries = await listInquiriesByEmail(email)
    return NextResponse.json({ inquiries })
  } catch (err) {
    console.error('Inquiry list error:', err)
    return NextResponse.json({ error: '문의 목록을 불러오지 못했습니다.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/admin-auth'
import { listAllInquiries, replyToInquiry } from '@/lib/inquiry'

// GET /api/admin/inquiries — 전체 문의 목록 (관리자)
export async function GET() {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 })
  }

  try {
    const inquiries = await listAllInquiries()
    return NextResponse.json({ inquiries, total: inquiries.length })
  } catch (err) {
    console.error('Admin inquiries list error:', err)
    return NextResponse.json({ error: '문의 목록을 불러오지 못했습니다.' }, { status: 500 })
  }
}

// POST /api/admin/inquiries — 문의에 답변 (관리자)
export async function POST(req: NextRequest) {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 })
  }

  let body: { id?: string; reply?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { id, reply } = body
  if (!id || !reply?.trim()) {
    return NextResponse.json({ error: '문의 ID와 답변 내용이 필요합니다.' }, { status: 400 })
  }

  try {
    const updated = await replyToInquiry(id, reply)
    if (!updated) {
      return NextResponse.json({ error: '해당 문의를 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ success: true, inquiry: updated })
  } catch (err) {
    console.error('Admin inquiry reply error:', err)
    return NextResponse.json({ error: '답변 등록에 실패했습니다.' }, { status: 500 })
  }
}

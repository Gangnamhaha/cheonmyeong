import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  type AdminAnnouncement,
  getAnnouncements,
  isAdminEmail,
  saveAnnouncements,
} from '@/lib/admin'

async function assertAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return { ok: false as const, response: NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 }) }
  }

  if (!isAdminEmail(session.user.email)) {
    return { ok: false as const, response: NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 }) }
  }

  return { ok: true as const }
}

export async function GET() {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return adminCheck.response

  const announcements = await getAnnouncements()
  return NextResponse.json({ announcements })
}

export async function POST(req: NextRequest) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return adminCheck.response

  const body = await req.json()
  const title = String(body?.title ?? '').trim()
  const content = String(body?.content ?? '').trim()
  const active = body?.active !== false

  if (!title || !content) {
    return NextResponse.json({ error: '제목과 내용을 입력해 주세요.' }, { status: 400 })
  }

  const announcements = await getAnnouncements()
  const next: AdminAnnouncement = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: new Date().toISOString(),
    active,
  }

  const updated = [next, ...announcements]
  await saveAnnouncements(updated)

  return NextResponse.json({ success: true, announcements: updated })
}

export async function DELETE(req: NextRequest) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return adminCheck.response

  const body = await req.json()
  const id = String(body?.id ?? '').trim()

  if (!id) {
    return NextResponse.json({ error: '삭제할 공지 id가 필요합니다.' }, { status: 400 })
  }

  const announcements = await getAnnouncements()
  const updated = announcements.filter((item) => item.id !== id)
  await saveAnnouncements(updated)

  return NextResponse.json({ success: true, announcements: updated })
}

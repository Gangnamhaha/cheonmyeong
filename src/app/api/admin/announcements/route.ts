import { NextRequest, NextResponse } from 'next/server'
import {
  type AdminAnnouncement,
  getAnnouncements,
  saveAnnouncements,
} from '@/lib/admin'
import { checkAdminAuth } from '@/lib/admin-auth'

export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const announcements = await getAnnouncements()
  return NextResponse.json({ announcements })
}

export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

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
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

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

export async function PATCH(req: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

  const body = await req.json()
  const id = String(body?.id ?? '').trim()

  if (!id) {
    return NextResponse.json({ error: '토글할 공지 id가 필요합니다.' }, { status: 400 })
  }

  const announcements = await getAnnouncements()
  const idx = announcements.findIndex((item) => item.id === id)

  if (idx === -1) {
    return NextResponse.json({ error: '해당 공지를 찾을 수 없습니다.' }, { status: 404 })
  }

  announcements[idx] = { ...announcements[idx], active: !announcements[idx].active }
  await saveAnnouncements(announcements)

  return NextResponse.json({ success: true, announcements })
}

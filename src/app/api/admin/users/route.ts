import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllUsers, isAdminEmail } from '@/lib/admin'
import { getUserCredits } from '@/lib/credits'
import { getSubscription } from '@/lib/subscription'

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

export async function GET(req: NextRequest) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return adminCheck.response

  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') ?? '1')
  const limit = Number(searchParams.get('limit') ?? '20')

  const pageData = await getAllUsers(page, limit)
  const users = await Promise.all(
    pageData.users.map(async (user) => {
      const credits = await getUserCredits(user.userId)
      const subscription = await getSubscription(user.userId)

      return {
        ...user,
        credits,
        remainingCredits: credits.total - credits.used,
        subscriptionStatus: subscription?.status ?? 'none',
        subscriptionPlan: subscription?.plan ?? null,
      }
    })
  )

  return NextResponse.json({
    ...pageData,
    users,
  })
}

export async function POST(req: NextRequest) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return adminCheck.response

  const body = await req.json()
  const query = String(body?.query ?? '').trim().toLowerCase()

  if (!query) {
    return NextResponse.json({ error: '검색어를 입력해 주세요.' }, { status: 400 })
  }

  const allUsers = await getAllUsers(1, 1000)
  const matched = allUsers.users.filter((user) => (
    user.userId.toLowerCase().includes(query)
    || user.email.toLowerCase().includes(query)
    || user.name.toLowerCase().includes(query)
  ))

  const users = await Promise.all(
    matched.map(async (user) => {
      const credits = await getUserCredits(user.userId)
      const subscription = await getSubscription(user.userId)

      return {
        ...user,
        credits,
        remainingCredits: credits.total - credits.used,
        subscriptionStatus: subscription?.status ?? 'none',
        subscriptionPlan: subscription?.plan ?? null,
      }
    })
  )

  return NextResponse.json({ users, total: users.length })
}

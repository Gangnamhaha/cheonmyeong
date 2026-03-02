import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers } from '@/lib/admin'
import { checkAdminAuth } from '@/lib/admin-auth'
import { getUserCredits } from '@/lib/credits'
import { getSubscription } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

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
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
  }

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

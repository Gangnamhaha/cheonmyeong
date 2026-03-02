import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import AdminDashboardClient from '@/app/admin/AdminDashboardClient'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center">
          <h1 className="text-2xl font-bold text-amber-400">접근 권한이 없습니다</h1>
          <p className="mt-3 text-sm text-slate-300">관리자 계정으로 로그인한 뒤 다시 시도해 주세요.</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    )
  }

  return <AdminDashboardClient />
}

'use client'

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

type TabKey = 'dashboard' | 'users' | 'revenue' | 'credits' | 'announcements' | 'settings'

interface DashboardStats {
  totalUsers: number
  totalAnalyses: number
  todayAnalyses: number
  activeSubscriptions: number
}

interface UserCredits {
  total: number
  used: number
  plan: string
  lastRefill: string
}

interface AdminUser {
  userId: string
  email: string
  name: string
  createdAt: string
  lastLoginAt: string
  credits: UserCredits
  remainingCredits: number
  subscriptionStatus: string
  subscriptionPlan: string | null
}

interface UsersResponse {
  users: AdminUser[]
  total: number
  page?: number
  limit?: number
  totalPages?: number
}

interface AdminAnnouncement {
  id: string
  title: string
  content: string
  createdAt: string
  active: boolean
}

interface CreditAdjustment {
  id: string
  userId: string
  amount: number
  reason: string
  createdAt: string
}

interface PlanItem {
  key: string
  name: string
  type: string
  credits: number
  price: number
  priceLabel: string
}

interface SettingsResponse {
  plans: PlanItem[]
  envStatus: Record<string, string>
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'users', label: '사용자 관리' },
  { key: 'revenue', label: '매출/결제' },
  { key: 'credits', label: '크레딧 관리' },
  { key: 'announcements', label: '공지사항' },
  { key: 'settings', label: '시스템 설정' },
]

const EMPTY_STATS: DashboardStats = {
  totalUsers: 0,
  totalAnalyses: 0,
  todayAnalyses: 0,
  activeSubscriptions: 0,
}

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')

  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [usersTotalPages, setUsersTotalPages] = useState(1)
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [usersSearch, setUsersSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const [creditSearch, setCreditSearch] = useState('')
  const [creditTarget, setCreditTarget] = useState<AdminUser | null>(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [creditLoading, setCreditLoading] = useState(false)
  const [creditError, setCreditError] = useState<string | null>(null)
  const [creditHistory, setCreditHistory] = useState<CreditAdjustment[]>([])

  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([])
  const [announcementsLoading, setAnnouncementsLoading] = useState(false)
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newActive, setNewActive] = useState(true)

  const [settings, setSettings] = useState<SettingsResponse | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      const res = await fetch('/api/admin')
      const data = await res.json()
      if (!res.ok) {
        setStatsError(data.error ?? '대시보드 데이터를 불러오지 못했습니다.')
        return
      }
      setStats(data)
    } catch {
      setStatsError('대시보드 데이터를 불러오지 못했습니다.')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async (page = 1) => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=20`)
      const data = (await res.json()) as UsersResponse | { error?: string }
      if (!res.ok || !('users' in data)) {
        setUsersError('error' in data ? (data.error ?? '사용자 목록을 불러오지 못했습니다.') : '사용자 목록을 불러오지 못했습니다.')
        return
      }

      setUsers(data.users)
      setUsersTotal(data.total)
      setUsersPage(data.page ?? page)
      setUsersTotalPages(data.totalPages ?? 1)
    } catch {
      setUsersError('사용자 목록을 불러오지 못했습니다.')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const fetchAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true)
    setAnnouncementsError(null)
    try {
      const res = await fetch('/api/admin/announcements')
      const data = await res.json()
      if (!res.ok) {
        setAnnouncementsError(data.error ?? '공지사항을 불러오지 못했습니다.')
        return
      }
      setAnnouncements(data.announcements ?? [])
    } catch {
      setAnnouncementsError('공지사항을 불러오지 못했습니다.')
    } finally {
      setAnnouncementsLoading(false)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true)
    setSettingsError(null)
    try {
      const res = await fetch('/api/admin/settings')
      const data = (await res.json()) as SettingsResponse | { error?: string }
      if (!res.ok || !('plans' in data)) {
        setSettingsError('error' in data ? (data.error ?? '설정 정보를 불러오지 못했습니다.') : '설정 정보를 불러오지 못했습니다.')
        return
      }
      setSettings(data)
    } catch {
      setSettingsError('설정 정보를 불러오지 못했습니다.')
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchUsers(1)
    fetchAnnouncements()
    fetchSettings()
  }, [fetchAnnouncements, fetchSettings, fetchStats, fetchUsers])

  useEffect(() => {
    const timer = setInterval(() => {
      fetchStats()
    }, 30000)

    return () => clearInterval(timer)
  }, [fetchStats])

  const selectedUser = useMemo(
    () => users.find((item) => item.userId === selectedUserId) ?? null,
    [users, selectedUserId]
  )

  async function searchUsers(query: string) {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (!res.ok) {
        setUsersError(data.error ?? '검색에 실패했습니다.')
        return
      }

      setUsers(data.users ?? [])
      setUsersTotal(data.total ?? 0)
      setUsersPage(1)
      setUsersTotalPages(1)
      setSelectedUserId(null)
    } catch {
      setUsersError('검색에 실패했습니다.')
    } finally {
      setUsersLoading(false)
    }
  }

  async function handleCreditUserSearch() {
    setCreditError(null)
    setCreditTarget(null)
    setCreditHistory([])

    if (!creditSearch.trim()) {
      setCreditError('검색어를 입력해 주세요.')
      return
    }

    setCreditLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: creditSearch }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreditError(data.error ?? '사용자 검색에 실패했습니다.')
        return
      }

      const first = (data.users ?? [])[0] as AdminUser | undefined
      if (!first) {
        setCreditError('사용자를 찾을 수 없습니다.')
        return
      }

      setCreditTarget(first)
    } catch {
      setCreditError('사용자 검색에 실패했습니다.')
    } finally {
      setCreditLoading(false)
    }
  }

  async function handleCreditAdjust(e: FormEvent) {
    e.preventDefault()
    setCreditError(null)

    if (!creditTarget) {
      setCreditError('먼저 사용자를 검색해 주세요.')
      return
    }

    const amount = Number(creditAmount)
    if (!Number.isFinite(amount) || amount === 0) {
      setCreditError('조정 수량은 0이 아닌 숫자여야 합니다.')
      return
    }

    if (!creditReason.trim()) {
      setCreditError('조정 사유를 입력해 주세요.')
      return
    }

    setCreditLoading(true)
    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: creditTarget.userId,
          amount,
          reason: creditReason.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreditError(data.error ?? '크레딧 조정에 실패했습니다.')
        return
      }

      const nextTarget: AdminUser = {
        ...creditTarget,
        credits: data.credits,
        remainingCredits: data.remainingCredits,
      }
      setCreditTarget(nextTarget)
      setCreditHistory(data.history ?? [])
      setCreditAmount('')
      setCreditReason('')
      fetchUsers(usersPage)
      fetchStats()
    } catch {
      setCreditError('크레딧 조정에 실패했습니다.')
    } finally {
      setCreditLoading(false)
    }
  }

  async function handleCreateAnnouncement(e: FormEvent) {
    e.preventDefault()
    setAnnouncementsError(null)

    if (!newTitle.trim() || !newContent.trim()) {
      setAnnouncementsError('제목과 내용을 입력해 주세요.')
      return
    }

    setAnnouncementsLoading(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          active: newActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAnnouncementsError(data.error ?? '공지 등록에 실패했습니다.')
        return
      }

      setAnnouncements(data.announcements ?? [])
      setNewTitle('')
      setNewContent('')
      setNewActive(true)
    } catch {
      setAnnouncementsError('공지 등록에 실패했습니다.')
    } finally {
      setAnnouncementsLoading(false)
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    setAnnouncementsError(null)
    setAnnouncementsLoading(true)

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAnnouncementsError(data.error ?? '공지 삭제에 실패했습니다.')
        return
      }

      setAnnouncements(data.announcements ?? [])
    } catch {
      setAnnouncementsError('공지 삭제에 실패했습니다.')
    } finally {
      setAnnouncementsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-amber-400 sm:text-3xl">관리자 대시보드</h1>
            <p className="mt-1 text-sm text-slate-400">천명(天命) 운영 현황과 데이터 관리</p>
          </div>
          <a
            href="/"
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
          >
            홈으로 이동
          </a>
        </div>

        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-700 bg-slate-800 p-1">
          <div className="flex min-w-max gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <section className="space-y-4">
            {statsError && <p className="rounded-lg border border-red-500/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">{statsError}</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: '총 사용자', value: stats.totalUsers },
                { label: '오늘 분석 수', value: stats.todayAnalyses },
                { label: '총 분석 수', value: stats.totalAnalyses },
                { label: '활성 구독 수', value: stats.activeSubscriptions },
              ].map((card) => (
                <div key={card.label} className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                  <p className="text-xs text-slate-400">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-amber-400">
                    {statsLoading ? '...' : card.value.toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">30초마다 자동 갱신됩니다.</p>
          </section>
        )}

        {activeTab === 'users' && (
          <section className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="이메일 또는 사용자 ID 검색"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => searchUsers(usersSearch)}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
                  >
                    검색
                  </button>
                  <button
                    onClick={() => {
                      setUsersSearch('')
                      fetchUsers(1)
                    }}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  >
                    초기화
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">총 {usersTotal.toLocaleString('ko-KR')}명</p>
            </div>

            {usersError && <p className="rounded-lg border border-red-500/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">{usersError}</p>}

            <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-700 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left">이메일</th>
                    <th className="px-4 py-3 text-left">플랜</th>
                    <th className="px-4 py-3 text-left">잔여 크레딧</th>
                    <th className="px-4 py-3 text-left">구독 상태</th>
                    <th className="px-4 py-3 text-left">가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading && (
                    <tr>
                      <td className="px-4 py-6 text-slate-400" colSpan={5}>로딩 중...</td>
                    </tr>
                  )}

                  {!usersLoading && users.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-slate-400" colSpan={5}>사용자가 없습니다.</td>
                    </tr>
                  )}

                  {!usersLoading && users.map((user) => (
                    <tr
                      key={user.userId}
                      onClick={() => setSelectedUserId((prev) => (prev === user.userId ? null : user.userId))}
                      className="cursor-pointer border-b border-slate-700/70 hover:bg-slate-700/30"
                    >
                      <td className="px-4 py-3">{user.email || user.userId}</td>
                      <td className="px-4 py-3">{user.credits.plan}</td>
                      <td className="px-4 py-3 text-amber-400">{user.remainingCredits}</td>
                      <td className="px-4 py-3">{user.subscriptionStatus}</td>
                      <td className="px-4 py-3 text-slate-400">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => fetchUsers(Math.max(1, usersPage - 1))}
                disabled={usersPage <= 1 || usersLoading}
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-300 disabled:opacity-40"
              >
                이전
              </button>
              <p className="text-slate-400">{usersPage} / {usersTotalPages}</p>
              <button
                onClick={() => fetchUsers(Math.min(usersTotalPages, usersPage + 1))}
                disabled={usersPage >= usersTotalPages || usersLoading}
                className="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-300 disabled:opacity-40"
              >
                다음
              </button>
            </div>

            {selectedUser && (
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <h3 className="text-base font-semibold text-amber-400">사용자 상세</h3>
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <p><span className="text-slate-400">이름:</span> {selectedUser.name || '-'}</p>
                  <p><span className="text-slate-400">이메일:</span> {selectedUser.email || '-'}</p>
                  <p><span className="text-slate-400">사용자 ID:</span> {selectedUser.userId}</p>
                  <p><span className="text-slate-400">플랜:</span> {selectedUser.credits.plan}</p>
                  <p><span className="text-slate-400">총 크레딧:</span> {selectedUser.credits.total}</p>
                  <p><span className="text-slate-400">사용 크레딧:</span> {selectedUser.credits.used}</p>
                  <p><span className="text-slate-400">마지막 로그인:</span> {new Date(selectedUser.lastLoginAt).toLocaleString('ko-KR')}</p>
                  <p><span className="text-slate-400">구독:</span> {selectedUser.subscriptionStatus}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'revenue' && (
          <section className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h2 className="text-lg font-semibold text-amber-400">Stripe 운영</h2>
              <p className="mt-2 text-sm text-slate-300">결제 상세 분석 및 정산 데이터는 Stripe Dashboard에서 확인합니다.</p>
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
              >
                Stripe Dashboard 열기
              </a>
              <p className="mt-3 text-sm text-slate-400">현재 활성 구독 수: <span className="text-amber-400">{stats.activeSubscriptions}</span></p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-base font-semibold">요금제 가격표</h3>
              {settingsLoading && <p className="mt-2 text-sm text-slate-400">로딩 중...</p>}
              {settingsError && <p className="mt-2 text-sm text-red-300">{settingsError}</p>}
              {!settingsLoading && settings && (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-3 py-2">플랜</th>
                        <th className="px-3 py-2">타입</th>
                        <th className="px-3 py-2">크레딧</th>
                        <th className="px-3 py-2">가격</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.plans.map((plan) => (
                        <tr key={plan.key} className="border-t border-slate-700/70">
                          <td className="px-3 py-2">{plan.name}</td>
                          <td className="px-3 py-2">{plan.type}</td>
                          <td className="px-3 py-2">{plan.credits}</td>
                          <td className="px-3 py-2 text-amber-400">{plan.priceLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'credits' && (
          <section className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h2 className="text-lg font-semibold text-amber-400">크레딧 조정</h2>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={creditSearch}
                  onChange={(e) => setCreditSearch(e.target.value)}
                  placeholder="이메일 또는 사용자 ID"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleCreditUserSearch}
                  disabled={creditLoading}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                >
                  사용자 조회
                </button>
              </div>

              {creditTarget && (
                <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm">
                  <p className="text-slate-300">대상: {creditTarget.email || creditTarget.userId}</p>
                  <p className="mt-1 text-amber-400">현재 잔여 크레딧: {creditTarget.remainingCredits}</p>
                </div>
              )}

              <form onSubmit={handleCreditAdjust} className="mt-4 space-y-2">
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="조정 수량 (예: 10 또는 -5)"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
                <input
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="조정 사유"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={creditLoading}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                >
                  {creditLoading ? '처리 중...' : '크레딧 조정 실행'}
                </button>
              </form>

              {creditError && <p className="mt-3 text-sm text-red-300">{creditError}</p>}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-base font-semibold">조정 이력</h3>
              {creditHistory.length === 0 && (
                <p className="mt-2 text-sm text-slate-400">표시할 이력이 없습니다. 조정 후 이력이 표시됩니다.</p>
              )}
              <ul className="mt-3 space-y-2">
                {creditHistory.map((item) => (
                  <li key={item.id} className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm">
                    <p className="text-amber-400">{item.amount > 0 ? `+${item.amount}` : item.amount} 크레딧</p>
                    <p className="mt-1 text-slate-300">{item.reason}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString('ko-KR')}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {activeTab === 'announcements' && (
          <section className="space-y-4">
            <form onSubmit={handleCreateAnnouncement} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h2 className="text-lg font-semibold text-amber-400">공지 작성</h2>
              <div className="mt-3 space-y-2">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="제목"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="내용"
                  rows={4}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={newActive}
                    onChange={(e) => setNewActive(e.target.checked)}
                    className="h-4 w-4 accent-amber-500"
                  />
                  활성 공지로 등록
                </label>
              </div>
              <button
                type="submit"
                disabled={announcementsLoading}
                className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
              >
                {announcementsLoading ? '등록 중...' : '공지 등록'}
              </button>
              {announcementsError && <p className="mt-3 text-sm text-red-300">{announcementsError}</p>}
            </form>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-base font-semibold">공지 목록</h3>
              {announcementsLoading && <p className="mt-2 text-sm text-slate-400">로딩 중...</p>}
              {!announcementsLoading && announcements.length === 0 && (
                <p className="mt-2 text-sm text-slate-400">등록된 공지가 없습니다.</p>
              )}
              <ul className="mt-3 space-y-3">
                {announcements.map((item) => (
                  <li key={item.id} className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-slate-100">{item.title}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${item.active ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'}`}>
                        {item.active ? '활성' : '비활성'}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{item.content}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(item.createdAt).toLocaleString('ko-KR')}</span>
                      <button
                        onClick={() => handleDeleteAnnouncement(item.id)}
                        className="rounded border border-red-500/40 px-2 py-1 text-red-300 hover:bg-red-900/30"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h2 className="text-lg font-semibold text-amber-400">플랜 설정 (읽기 전용)</h2>
              {settingsLoading && <p className="mt-2 text-sm text-slate-400">로딩 중...</p>}
              {settingsError && <p className="mt-2 text-sm text-red-300">{settingsError}</p>}
              {!settingsLoading && settings && (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-3 py-2">키</th>
                        <th className="px-3 py-2">이름</th>
                        <th className="px-3 py-2">타입</th>
                        <th className="px-3 py-2">크레딧</th>
                        <th className="px-3 py-2">가격</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.plans.map((plan) => (
                        <tr key={plan.key} className="border-t border-slate-700/70">
                          <td className="px-3 py-2 text-slate-400">{plan.key}</td>
                          <td className="px-3 py-2">{plan.name}</td>
                          <td className="px-3 py-2">{plan.type}</td>
                          <td className="px-3 py-2">{plan.credits}</td>
                          <td className="px-3 py-2 text-amber-400">{plan.priceLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-base font-semibold">환경 변수 상태 (읽기 전용)</h3>
              {settingsLoading && <p className="mt-2 text-sm text-slate-400">로딩 중...</p>}
              {!settingsLoading && settings && (
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Object.entries(settings.envStatus).map(([key, value]) => (
                    <li key={key} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">
                      <span className="text-slate-300">{key}</span>
                      <span className={value === '설정됨' ? 'text-amber-300' : 'text-slate-500'}>{value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

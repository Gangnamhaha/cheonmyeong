'use client'

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

type TabKey = 'dashboard' | 'users' | 'revenue' | 'credits' | 'push-campaigns' | 'referrals' | 'announcements' | 'inquiries' | 'settings' | 'ai-costs'

interface DashboardStats {
  totalUsers: number
  totalAnalyses: number
  todayAnalyses: number
  activeSubscriptions: number
  totalCheckins: number
  todayCheckins: number
  activeStreakUsers: number
  rewardCreditsGiven: number
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

interface AdminInquiry {
  id: string
  email: string
  name: string
  subject: string
  content: string
  status: 'pending' | 'replied'
  createdAt: string
  reply?: string
  repliedAt?: string
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

interface AdminPushCampaign {
  id: string
  title: string
  body: string
  url: string | null
  segment_filter: {
    tiers?: string[]
    minCredits?: number
    maxCredits?: number
    inactiveDays?: number
  }
  status: string
  sent_at: string | null
  total_targets: number
  success_count: number
  failure_count: number
  created_at: string
}

interface AICostData {
  monthlyUsage: {
    totalCost: number
    byFeature: Record<string, number>
    byDay: Array<{ date: string; cost: number }>
  }
  recentCalls: Array<{
    timestamp: string
    feature: string
    model: string
    inputTokens: number
    outputTokens: number
    cost: number
  }>
  budget: {
    withinBudget: boolean
    monthlySpend: number
    monthlyBudget: number
  }
}

interface AdminReferralStats {
  totalReferrals: number
  topReferrers: Array<{
    referrerId: string
    count: number
    creditsEarned: number
  }>
  recentReferrals: Array<{
    id: number
    referrerId: string
    referredId: string
    referralCode: string
    creditsAwardedReferrer: number
    creditsAwardedReferred: number
    createdAt: string
  }>
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: '대시보드' },
  { key: 'users', label: '사용자 관리' },
  { key: 'revenue', label: '매출/결제' },
  { key: 'credits', label: '이용권 관리' },
  { key: 'push-campaigns', label: '푸시 캠페인' },
  { key: 'referrals', label: '레퍼럴' },
  { key: 'ai-costs', label: 'AI 비용' },
  { key: 'announcements', label: '공지사항' },
  { key: 'inquiries', label: '고객문의' },
  { key: 'settings', label: '시스템 설정' },
]

const EMPTY_STATS: DashboardStats = {
  totalUsers: 0,
  totalAnalyses: 0,
  todayAnalyses: 0,
  activeSubscriptions: 0,
  totalCheckins: 0,
  todayCheckins: 0,
  activeStreakUsers: 0,
  rewardCreditsGiven: 0,
}

const PUSH_TIER_OPTIONS = [
  { value: 'free', label: 'free' },
  { value: 'sub_basic', label: 'sub_basic' },
  { value: 'sub_pro', label: 'sub_pro' },
  { value: 'sub_premium', label: 'sub_premium' },
]

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

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

  const [pushCampaigns, setPushCampaigns] = useState<AdminPushCampaign[]>([])
  const [pushCampaignsLoading, setPushCampaignsLoading] = useState(false)
  const [pushCampaignsError, setPushCampaignsError] = useState<string | null>(null)
  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [pushUrl, setPushUrl] = useState('')
  const [pushSegmentTiers, setPushSegmentTiers] = useState<string[]>([])
  const [pushMinCredits, setPushMinCredits] = useState('')
  const [pushInactiveDays, setPushInactiveDays] = useState('')
  const [pushSending, setPushSending] = useState(false)

  const [settings, setSettings] = useState<SettingsResponse | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  const [adminInquiries, setAdminInquiries] = useState<AdminInquiry[]>([])
  const [inquiriesLoading, setInquiriesLoading] = useState(false)
  const [inquiriesError, setInquiriesError] = useState<string | null>(null)
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)

  const [aiCosts, setAICosts] = useState<AICostData | null>(null)
  const [aiCostsLoading, setAICostsLoading] = useState(false)
  const [aiCostsError, setAICostsError] = useState<string | null>(null)

  const [referralStats, setReferralStats] = useState<AdminReferralStats>({
    totalReferrals: 0,
    topReferrers: [],
    recentReferrals: [],
  })
  const [referralLoading, setReferralLoading] = useState(false)
  const [referralError, setReferralError] = useState<string | null>(null)

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

  const fetchInquiries = useCallback(async () => {
    setInquiriesLoading(true)
    setInquiriesError(null)
    try {
      const res = await fetch('/api/admin/inquiries')
      const data = await res.json()
      if (!res.ok) {
        setInquiriesError(data.error ?? '문의 목록을 불러오지 못했습니다.')
        return
      }
      setAdminInquiries(data.inquiries ?? [])
    } catch {
      setInquiriesError('문의 목록을 불러오지 못했습니다.')
    } finally {
      setInquiriesLoading(false)
    }
  }, [])

  const fetchPushCampaigns = useCallback(async () => {
    setPushCampaignsLoading(true)
    setPushCampaignsError(null)
    try {
      const res = await fetch('/api/admin/push/campaigns')
      const data = await res.json()
      if (!res.ok) {
        setPushCampaignsError(data.error ?? '푸시 캠페인 목록을 불러오지 못했습니다.')
        return
      }
      setPushCampaigns(data.campaigns ?? [])
    } catch {
      setPushCampaignsError('푸시 캠페인 목록을 불러오지 못했습니다.')
    } finally {
      setPushCampaignsLoading(false)
    }
  }, [])

  const fetchAICosts = useCallback(async () => {
    setAICostsLoading(true)
    setAICostsError(null)
    try {
      const res = await fetch('/api/admin/ai-costs')
      const data = (await res.json()) as AICostData | { error?: string }
      if (!res.ok || !('monthlyUsage' in data)) {
        setAICostsError('error' in data ? (data.error ?? 'AI 비용 데이터를 불러오지 못했습니다.') : 'AI 비용 데이터를 불러오지 못했습니다.')
        return
      }
      setAICosts(data)
    } catch {
      setAICostsError('AI 비용 데이터를 불러오지 못했습니다.')
    } finally {
      setAICostsLoading(false)
    }
  }, [])

  const fetchReferralStats = useCallback(async () => {
    setReferralLoading(true)
    setReferralError(null)
    try {
      const res = await fetch('/api/admin/referrals')
      const data = (await res.json()) as AdminReferralStats | { error?: string }
      if (!res.ok || !('totalReferrals' in data)) {
        setReferralError('error' in data ? (data.error ?? '레퍼럴 통계를 불러오지 못했습니다.') : '레퍼럴 통계를 불러오지 못했습니다.')
        return
      }
      setReferralStats(data)
    } catch {
      setReferralError('레퍼럴 통계를 불러오지 못했습니다.')
    } finally {
      setReferralLoading(false)
    }
  }, [])

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth')
        if (res.ok) {
          setIsAuthenticated(true)
          fetchStats()
          fetchUsers(1)
            fetchAnnouncements()
            fetchPushCampaigns()
            fetchInquiries()
            fetchSettings()
            fetchAICosts()
            fetchReferralStats()
        }
      } catch {
        // not authenticated
      } finally {
        setAuthChecking(false)
      }
    }
    checkAuth()
  }, [fetchAnnouncements, fetchPushCampaigns, fetchInquiries, fetchSettings, fetchStats, fetchUsers, fetchAICosts, fetchReferralStats])

  useEffect(() => {
    if (!isAuthenticated) return
    const timer = setInterval(() => {
      fetchStats()
    }, 30000)
    return () => clearInterval(timer)
  }, [fetchStats, isAuthenticated])

  const selectedUser = useMemo(
    () => users.find((item) => item.userId === selectedUserId) ?? null,
    [users, selectedUserId]
  )

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error ?? '로그인에 실패했습니다.')
        return
      }
      setIsAuthenticated(true)
      setLoginUsername('')
      setLoginPassword('')
      fetchStats()
      fetchUsers(1)
      fetchAnnouncements()
      fetchPushCampaigns()
      fetchInquiries()
      fetchSettings()
      fetchAICosts()
      fetchReferralStats()
    } catch {
      setLoginError('서버 연결에 실패했습니다.')
    } finally {
      setLoginLoading(false)
    }
  }

  function handleTogglePushTier(tier: string) {
    setPushSegmentTiers((prev) => (prev.includes(tier)
      ? prev.filter((item) => item !== tier)
      : [...prev, tier]))
  }

  async function handleCreatePushCampaign(e: FormEvent) {
    e.preventDefault()
    setPushCampaignsError(null)

    if (!pushTitle.trim() || !pushBody.trim()) {
      setPushCampaignsError('제목과 내용을 입력해 주세요.')
      return
    }

    const confirmed = window.confirm('푸시 캠페인을 즉시 발송하시겠습니까?')
    if (!confirmed) return

    setPushSending(true)
    try {
      const segment: {
        tiers?: string[]
        minCredits?: number
        inactiveDays?: number
      } = {}

      if (pushSegmentTiers.length > 0) {
        segment.tiers = pushSegmentTiers
      }

      const parsedMinCredits = Number(pushMinCredits)
      if (pushMinCredits.trim() !== '' && Number.isFinite(parsedMinCredits)) {
        segment.minCredits = parsedMinCredits
      }

      const parsedInactiveDays = Number(pushInactiveDays)
      if (pushInactiveDays.trim() !== '' && Number.isFinite(parsedInactiveDays) && parsedInactiveDays > 0) {
        segment.inactiveDays = parsedInactiveDays
      }

      const res = await fetch('/api/admin/push/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pushTitle.trim(),
          body: pushBody.trim(),
          url: pushUrl.trim() || undefined,
          segment,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPushCampaignsError(data.error ?? '푸시 캠페인 발송에 실패했습니다.')
        return
      }

      setPushTitle('')
      setPushBody('')
      setPushUrl('')
      setPushSegmentTiers([])
      setPushMinCredits('')
      setPushInactiveDays('')
      fetchPushCampaigns()
    } catch {
      setPushCampaignsError('푸시 캠페인 발송에 실패했습니다.')
    } finally {
      setPushSending(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
    } catch {
      // ignore
    }
    setIsAuthenticated(false)
  }

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
        setCreditError(data.error ?? '이용권 조정에 실패했습니다.')
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
      setCreditError('이용권 조정에 실패했습니다.')
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

  async function handleToggleAnnouncement(id: string) {
    setAnnouncementsError(null)
    setAnnouncementsLoading(true)

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAnnouncementsError(data.error ?? '공지 상태 변경에 실패했습니다.')
        return
      }

      setAnnouncements(data.announcements ?? [])
    } catch {
      setAnnouncementsError('공지 상태 변경에 실패했습니다.')
    } finally {
      setAnnouncementsLoading(false)
    }
  }

  // 로딩 중
  if (authChecking) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">인증 확인 중...</p>
      </main>
    )
  }

  // 로그인 폼
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8">
            <h1 className="text-center text-2xl font-bold text-amber-400">관리자 로그인</h1>
            <p className="mt-2 text-center text-sm text-slate-400">사주해 관리자 페이지</p>
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label htmlFor="admin-username" className="block text-sm font-medium text-slate-300">아이디</label>
                <input
                  id="admin-username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="관리자 아이디"
                  autoComplete="username"
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-slate-300">비밀번호</label>
                <input
                  id="admin-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="비밀번호"
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              {loginError && (
                <p className="rounded-lg border border-red-500/50 bg-red-900/20 px-3 py-2 text-sm text-red-300">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {loginLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <a href="/" className="text-xs text-slate-500 hover:text-slate-300">홈으로 돌아가기</a>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 대시보드
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-amber-400 sm:text-3xl">관리자 대시보드</h1>
            <p className="mt-1 text-sm text-slate-400">사주해 운영 현황과 데이터 관리</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              홈으로 이동
            </a>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-500/40 bg-slate-800 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-900/30"
            >
              로그아웃
            </button>
          </div>
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
                { label: '오늘 출석 수', value: stats.todayCheckins },
                { label: '총 출석 수', value: stats.totalCheckins },
                { label: '연속 사용자(어제)', value: stats.activeStreakUsers },
                { label: '출석 보상 크레딧', value: stats.rewardCreditsGiven },
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
              <h2 className="text-lg font-semibold text-amber-400">이용권 조정</h2>
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
                  <p className="mt-1 text-amber-400">현재 잔여 이용권: {creditTarget.remainingCredits}</p>
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
                  {creditLoading ? '처리 중...' : '이용권 조정 실행'}
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

        {activeTab === 'push-campaigns' && (
          <section className="space-y-4">
            <form onSubmit={handleCreatePushCampaign} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h2 className="text-lg font-semibold text-amber-400">푸시 캠페인 발송</h2>
              <div className="mt-3 space-y-2">
                <input
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  placeholder="푸시 제목"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
                <textarea
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  placeholder="푸시 내용"
                  rows={4}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
                <input
                  value={pushUrl}
                  onChange={(e) => setPushUrl(e.target.value)}
                  placeholder="클릭 이동 URL (선택)"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900 p-3">
                <p className="text-sm font-medium text-slate-200">타겟 세그먼트</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs text-slate-400">구독 티어</p>
                    <div className="space-y-1">
                      {PUSH_TIER_OPTIONS.map((tier) => (
                        <label key={tier.value} className="inline-flex items-center gap-2 text-sm text-slate-300 mr-4">
                          <input
                            type="checkbox"
                            checked={pushSegmentTiers.includes(tier.value)}
                            onChange={() => handleTogglePushTier(tier.value)}
                            className="h-4 w-4 accent-amber-500"
                          />
                          {tier.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">최소 크레딧</label>
                      <input
                        type="number"
                        value={pushMinCredits}
                        onChange={(e) => setPushMinCredits(e.target.value)}
                        placeholder="예: 10"
                        className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">비활성 일수</label>
                      <input
                        type="number"
                        value={pushInactiveDays}
                        onChange={(e) => setPushInactiveDays(e.target.value)}
                        placeholder="예: 7"
                        className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">필터를 비워두면 푸시 수신 토큰이 있는 전체 사용자에게 발송됩니다.</p>
              </div>

              <button
                type="submit"
                disabled={pushSending}
                className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
              >
                {pushSending ? '발송 중...' : '캠페인 발송'}
              </button>
              {pushCampaignsError && <p className="mt-3 text-sm text-red-300">{pushCampaignsError}</p>}
            </form>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">캠페인 이력</h3>
                <button
                  onClick={fetchPushCampaigns}
                  disabled={pushCampaignsLoading}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  새로고침
                </button>
              </div>

              {pushCampaignsLoading && <p className="mt-2 text-sm text-slate-400">로딩 중...</p>}
              {!pushCampaignsLoading && pushCampaigns.length === 0 && (
                <p className="mt-2 text-sm text-slate-400">등록된 캠페인이 없습니다.</p>
              )}

              {!pushCampaignsLoading && pushCampaigns.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-3 py-2">제목</th>
                        <th className="px-3 py-2">발송 시각</th>
                        <th className="px-3 py-2">타겟 수</th>
                        <th className="px-3 py-2">성공 수</th>
                        <th className="px-3 py-2">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pushCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-t border-slate-700/70">
                          <td className="px-3 py-2 text-slate-100">{campaign.title}</td>
                          <td className="px-3 py-2 text-slate-400">
                            {campaign.sent_at ? new Date(campaign.sent_at).toLocaleString('ko-KR') : '-'}
                          </td>
                          <td className="px-3 py-2 text-slate-300">{campaign.total_targets.toLocaleString('ko-KR')}</td>
                          <td className="px-3 py-2 text-amber-400">{campaign.success_count.toLocaleString('ko-KR')}</td>
                          <td className="px-3 py-2 text-slate-300">{campaign.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                    <div className="mt-3 flex items-center justify-end gap-2 text-xs">
                      <span className="mr-auto text-slate-500">{new Date(item.createdAt).toLocaleString('ko-KR')}</span>
                      <button
                        onClick={() => handleToggleAnnouncement(item.id)}
                        className={`rounded border px-2 py-1 ${item.active ? 'border-slate-500 text-slate-300 hover:bg-slate-700' : 'border-amber-500/40 text-amber-300 hover:bg-amber-900/30'}`}
                      >
                        {item.active ? '비활성화' : '활성화'}
                      </button>
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

        {activeTab === 'inquiries' && (
          <section className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-amber-400">고객 문의 관리</h2>
                <button onClick={fetchInquiries} className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700">새로고침</button>
              </div>
              {inquiriesLoading && <p className="text-sm text-slate-400">로딩 중...</p>}
              {inquiriesError && <p className="text-sm text-red-300">{inquiriesError}</p>}
              {!inquiriesLoading && adminInquiries.length === 0 && <p className="text-sm text-slate-500">등록된 문의가 없습니다.</p>}
              <div className="space-y-3">
                {adminInquiries.map((inq) => (
                  <div key={inq.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-100">{inq.subject}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{inq.name} &middot; {inq.email}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${inq.status === 'replied' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                        {inq.status === 'replied' ? '답변 완료' : '대기 중'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{inq.content}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{new Date(inq.createdAt).toLocaleString('ko-KR')}</p>

                    {inq.reply && (
                      <div className="mt-3 rounded-lg border border-slate-700 bg-slate-800 p-3">
                        <p className="text-[10px] font-bold text-amber-400 mb-1">관리자 답변</p>
                        <p className="text-xs text-slate-200 whitespace-pre-wrap">{inq.reply}</p>
                        {inq.repliedAt && <p className="text-[10px] text-slate-500 mt-1">{new Date(inq.repliedAt).toLocaleString('ko-KR')}</p>}
                      </div>
                    )}

                    {replyingId === inq.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="답변을 입력하세요..."
                          rows={3}
                          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            disabled={replyLoading || !replyText.trim()}
                            onClick={async () => {
                              setReplyLoading(true)
                              try {
                                const res = await fetch('/api/admin/inquiries', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: inq.id, reply: replyText }),
                                })
                                if (res.ok) {
                                  setReplyingId(null)
                                  setReplyText('')
                                  fetchInquiries()
                                }
                              } finally {
                                setReplyLoading(false)
                              }
                            }}
                            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                          >
                            {replyLoading ? '전송 중...' : '답변 전송'}
                          </button>
                          <button
                            onClick={() => { setReplyingId(null); setReplyText('') }}
                            className="rounded-lg border border-slate-600 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setReplyingId(inq.id); setReplyText(inq.reply ?? '') }}
                        className="mt-2 rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-900/20"
                      >
                        {inq.reply ? '답변 수정' : '답변하기'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'referrals' && (
          <section className="space-y-4">
            {referralError && <p className="rounded-lg border border-red-500/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">{referralError}</p>}

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
              <p className="text-xs text-slate-400">총 레퍼럴</p>
              <p className="mt-2 text-3xl font-semibold text-amber-400">
                {referralLoading ? '...' : referralStats.totalReferrals.toLocaleString('ko-KR')}
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-amber-400">상위 추천인</h2>
                <button
                  onClick={fetchReferralStats}
                  disabled={referralLoading}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  새로고침
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-3 py-2">추천인 ID</th>
                      <th className="px-3 py-2">추천 수</th>
                      <th className="px-3 py-2">보너스 크레딧</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralStats.topReferrers.length === 0 && (
                      <tr>
                        <td className="px-3 py-3 text-slate-500" colSpan={3}>레퍼럴 데이터가 없습니다.</td>
                      </tr>
                    )}
                    {referralStats.topReferrers.map((item) => (
                      <tr key={item.referrerId} className="border-t border-slate-700/70">
                        <td className="px-3 py-2">{item.referrerId}</td>
                        <td className="px-3 py-2">{item.count}</td>
                        <td className="px-3 py-2 text-amber-400">{item.creditsEarned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <h3 className="text-base font-semibold">최근 레퍼럴</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-3 py-2">일시</th>
                      <th className="px-3 py-2">추천인</th>
                      <th className="px-3 py-2">가입자</th>
                      <th className="px-3 py-2">코드</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralStats.recentReferrals.length === 0 && (
                      <tr>
                        <td className="px-3 py-3 text-slate-500" colSpan={4}>최근 레퍼럴이 없습니다.</td>
                      </tr>
                    )}
                    {referralStats.recentReferrals.map((item) => (
                      <tr key={item.id} className="border-t border-slate-700/70">
                        <td className="px-3 py-2 text-slate-400">{new Date(item.createdAt).toLocaleString('ko-KR')}</td>
                        <td className="px-3 py-2">{item.referrerId}</td>
                        <td className="px-3 py-2">{item.referredId}</td>
                        <td className="px-3 py-2 text-amber-400">{item.referralCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'ai-costs' && (
          <section className="space-y-4">
            {/* Budget Status */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-amber-400">AI 비용 모니터링</h2>
                <button onClick={fetchAICosts} className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700">새로고침</button>
              </div>
              {aiCostsLoading && <p className="text-sm text-slate-400">로딩 중...</p>}
              {aiCostsError && <p className="text-sm text-red-300">{aiCostsError}</p>}
              {!aiCostsLoading && aiCosts && (
                <div className="space-y-4">
                  {/* Monthly Budget */}
                  <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-300">이번 달 총 비용</span>
                      <span className={`text-lg font-bold ${aiCosts.budget.withinBudget ? 'text-green-400' : 'text-red-400'}`}>
                        ${aiCosts.budget.monthlySpend.toFixed(2)} / ${aiCosts.budget.monthlyBudget.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${aiCosts.budget.withinBudget ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min((aiCosts.budget.monthlySpend / aiCosts.budget.monthlyBudget) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {aiCosts.budget.withinBudget ? '✓ 예산 범위 내' : '⚠ 예산 초과'}
                    </p>
                  </div>

                  {/* Daily Costs Chart */}
                  {aiCosts.monthlyUsage.byDay.length > 0 && (
                    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                      <h3 className="text-sm font-semibold text-slate-200 mb-3">일별 비용</h3>
                      <div className="flex items-end gap-1 h-32">
                        {aiCosts.monthlyUsage.byDay.map((day) => {
                          const maxCost = Math.max(...aiCosts.monthlyUsage.byDay.map(d => d.cost), 1)
                          const height = (day.cost / maxCost) * 100
                          return (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full bg-amber-500/60 rounded-t hover:bg-amber-400 transition-colors"
                                style={{ height: `${height}%`, minHeight: '4px' }}
                                title={`${day.date}: $${day.cost.toFixed(2)}`}
                              />
                              <span className="text-[10px] text-slate-500">{day.date.slice(5)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Feature Breakdown */}
                  {Object.keys(aiCosts.monthlyUsage.byFeature).length > 0 && (
                    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                      <h3 className="text-sm font-semibold text-slate-200 mb-3">기능별 비용</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
                            <tr>
                              <th className="px-3 py-2">기능</th>
                              <th className="px-3 py-2 text-right">비용</th>
                              <th className="px-3 py-2 text-right">비율</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(aiCosts.monthlyUsage.byFeature).map(([feature, cost]) => {
                              const percentage = (cost / aiCosts.monthlyUsage.totalCost) * 100
                              return (
                                <tr key={feature} className="border-t border-slate-700/70">
                                  <td className="px-3 py-2 text-slate-300">{feature}</td>
                                  <td className="px-3 py-2 text-right text-amber-400">${cost.toFixed(4)}</td>
                                  <td className="px-3 py-2 text-right text-slate-400">{percentage.toFixed(1)}%</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Recent API Calls */}
                  {aiCosts.recentCalls.length > 0 && (
                    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
                      <h3 className="text-sm font-semibold text-slate-200 mb-3">최근 API 호출 (상위 20개)</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead className="text-left uppercase tracking-wider text-slate-400">
                            <tr>
                              <th className="px-3 py-2">시간</th>
                              <th className="px-3 py-2">기능</th>
                              <th className="px-3 py-2">모델</th>
                              <th className="px-3 py-2 text-right">입력</th>
                              <th className="px-3 py-2 text-right">출력</th>
                              <th className="px-3 py-2 text-right">비용</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aiCosts.recentCalls.map((call, idx) => (
                              <tr key={idx} className="border-t border-slate-700/70">
                                <td className="px-3 py-2 text-slate-400">{new Date(call.timestamp).toLocaleTimeString('ko-KR')}</td>
                                <td className="px-3 py-2 text-slate-300">{call.feature}</td>
                                <td className="px-3 py-2 text-slate-400">{call.model}</td>
                                <td className="px-3 py-2 text-right text-slate-400">{call.inputTokens}</td>
                                <td className="px-3 py-2 text-right text-slate-400">{call.outputTokens}</td>
                                <td className="px-3 py-2 text-right text-amber-400">${call.cost.toFixed(4)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
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

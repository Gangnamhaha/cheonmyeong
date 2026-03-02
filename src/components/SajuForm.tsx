'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTheme } from './ThemeProvider'
import UserMenu from './UserMenu'

interface SajuFormData {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  calendarType: 'solar' | 'lunar'
  isLeapMonth: boolean
  gender: 'male' | 'female'
}

interface SajuFormProps {
  onSubmit: (data: SajuFormData) => void
  loading?: boolean
}

interface HistoryEntry {
  year: number
  month: number
  day: number
  hour: number
  gender: 'male' | 'female'
  date: string
  dayPillar?: string
}

// ─── Constants ───
const YEARS = Array.from({ length: 151 }, (_, i) => 1900 + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

// ─── Starfield ───
function generateStars(count: number) {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: (i * 7919 + 13) % 100,
      y: (i * 6271 + 37) % 100,
      size: (i % 7 === 0 ? 'large' : 'small') as 'small' | 'large',
      duration: 2 + (i % 5) * 0.8,
      delay: (i % 8) * 0.5,
    })
  }
  return stars
}
const STARS = generateStars(60)

// ─── Greeting by time ───
function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 9) return '상쾌한 아침, 오늘의 운명을 살펴볼까요?'
  if (h >= 9 && h < 12) return '좋은 오전이에요. 천명이 기다리고 있어요.'
  if (h >= 12 && h < 14) return '점심 시간, 잠깐 운세를 들여다볼까요?'
  if (h >= 14 && h < 18) return '오후의 여유, 사주로 내일을 준비하세요.'
  if (h >= 18 && h < 21) return '해 질 녘, 별빛 아래 운명을 읽어봅니다.'
  return '고요한 밤, 별이 당신의 사주를 비추고 있어요.'
}

// ─── Daily quote (D1) ───
const QUOTES = [
  { text: '命은 하늘이 주고, 運은 내가 만든다.', hanja: '天命人運' },
  { text: '음양이 조화로우면 만사형통이라.', hanja: '陰陽調和' },
  { text: '오행의 균형이 곧 삶의 균형이니라.', hanja: '五行均衡' },
  { text: '사주를 알면 때를 알고, 때를 알면 길이 보인다.', hanja: '知時見路' },
  { text: '용신을 얻으면 흉이 길로 변하나니.', hanja: '得用化吉' },
  { text: '대운이 바뀌면 인생도 바뀌느니라.', hanja: '運轉乾坤' },
  { text: '천간은 하늘의 뜻, 지지는 땅의 이치라.', hanja: '天意地理' },
  { text: '십신의 조화 속에 인연의 비밀이 있느니라.', hanja: '十神秘緣' },
  { text: '재물은 오행의 흐름을 따라 온다.', hanja: '財隨行流' },
  { text: '신강하면 나아가고, 신약하면 기다려라.', hanja: '强進弱待' },
  { text: '희신이 도우면 어려움도 기회가 되리라.', hanja: '喜助轉機' },
  { text: '궁합은 서로의 부족함을 채우는 것이니라.', hanja: '合補不足' },
]

function getDailyQuote() {
  const day = Math.floor(Date.now() / (24 * 60 * 60 * 1000))
  return QUOTES[day % QUOTES.length]
}

// ─── Feature cards (A3) ───
const FEATURES = [
  { icon: '🏛️', title: '사주팔자', desc: '생년월일시 기반 정밀 분석' },
  { icon: '🔮', title: 'AI 해석', desc: 'GPT 기반 맞춤 사주 풀이' },
  { icon: '📊', title: '오행·십신', desc: '오행 분포와 십신 관계도' },
  { icon: '💑', title: '궁합 분석', desc: '두 사람의 사주 궁합 비교' },
]

// ─── Taegeuk SVG (B1) ───
function TaegeukSvg({ size = 280 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="hero-taegeuk animate-rotateSlow">
      <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M100,5 A95,95 0 0,1 100,195 A47.5,47.5 0 0,1 100,100 A47.5,47.5 0 0,0 100,5" fill="currentColor" opacity="0.15" />
      <path d="M100,195 A95,95 0 0,1 100,5 A47.5,47.5 0 0,1 100,100 A47.5,47.5 0 0,0 100,195" fill="currentColor" opacity="0.06" />
      <circle cx="100" cy="52.5" r="12" fill="currentColor" opacity="0.08" />
      <circle cx="100" cy="147.5" r="12" fill="currentColor" opacity="0.18" />
    </svg>
  )
}

// ─── LocalStorage helpers ───
function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('cheonmyeong-history')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistory(entry: HistoryEntry) {
  try {
    const existing = getHistory()
    const updated = [entry, ...existing.filter(e =>
      !(e.year === entry.year && e.month === entry.month && e.day === entry.day && e.hour === entry.hour)
    )].slice(0, 5)
    localStorage.setItem('cheonmyeong-history', JSON.stringify(updated))
  } catch { /* ignore */ }
}

function getAnalysisCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    return parseInt(localStorage.getItem('cheonmyeong-count') || '0', 10)
  } catch { return 0 }
}

function incrementAnalysisCount() {
  try {
    const count = getAnalysisCount() + 1
    localStorage.setItem('cheonmyeong-count', String(count))
  } catch { /* ignore */ }
}

// ─── Component ───
export default function SajuForm({ onSubmit, loading = false }: SajuFormProps) {
  const { theme, toggleTheme, cycleFontSize, fontSizeLabel } = useTheme()
  const [year, setYear] = useState(1990)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [hour, setHour] = useState(12)
  const [minute, setMinute] = useState(0)
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [unknownTime, setUnknownTime] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const daysInMonth = getDaysInMonth(year, month)
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth])

  const greeting = useMemo(() => getGreeting(), [])
  const dailyQuote = useMemo(() => getDailyQuote(), [])

  useEffect(() => {
    setHistory(getHistory())
    setTotalCount(getAnalysisCount())
    // Auto-show form after hero delay
    const timer = setTimeout(() => setShowForm(true), 200)
    return () => clearTimeout(timer)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const h = unknownTime ? 0 : hour
    const m = unknownTime ? 0 : minute
    saveHistory({ year, month, day, hour: h, gender, date: new Date().toISOString().slice(0, 10) })
    incrementAnalysisCount()
    onSubmit({ year, month, day, hour: h, minute: m, calendarType, isLeapMonth, gender })
  }

  function handleHistoryClick(entry: HistoryEntry) {
    setYear(entry.year)
    setMonth(entry.month)
    setDay(entry.day)
    setHour(entry.hour)
    setGender(entry.gender)
    setShowForm(true)
    // Scroll to form
    document.getElementById('saju-form-card')?.scrollIntoView({ behavior: 'smooth' })
  }

  const selectClass =
    'w-full rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 transition-colors theme-transition text-sm'
      + ' bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]'
      + ' focus:border-[var(--accent)] focus:ring-[var(--accent)]'

  const toggleBtnClass = (active: boolean) =>
    `flex-1 py-2 text-sm font-medium transition-all ${
      active
        ? 'bg-[var(--accent)] text-[var(--accent-text)]'
        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
    }`

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Starfield Background */}
      <div className="starfield">
        {STARS.map((star, i) => (
          <div
            key={i}
            className={`star ${star.size === 'large' ? 'large' : ''}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              '--duration': `${star.duration}s`,
              '--delay': `${star.delay}s`,
              color: theme === 'dark' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(180, 83, 9, 0.3)',
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ═══ HERO SECTION (A1, B1, B2, D2, D3) ═══ */}
      <section className="hero-bg min-h-[85vh] flex flex-col items-center justify-center px-4 relative">
        {/* Taegeuk Background */}
        <TaegeukSvg size={320} />

        {/* Top bar: theme toggle + user menu */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <UserMenu />
          <button
            onClick={cycleFontSize}
            className="p-2.5 rounded-full hover-scale theme-transition text-xs font-bold"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
            aria-label="글씨 크기 조절"
            title="글씨 크기 조절"
          >
            {fontSizeLabel}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover-scale theme-transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            aria-label="테마 전환"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Main Title (B4 - serif font) */}
        <div className="text-center relative z-10 animate-fadeInScale">
          <h1
            className="font-serif-kr text-6xl font-black mb-2 tracking-tight"
            style={{ color: 'var(--text-accent)' }}
          >
            천명
          </h1>
          <p
            className="font-serif-kr text-2xl tracking-[0.3em] mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            天命
          </p>

          {/* D2: Time-based greeting */}
          <p className="text-sm mt-3 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {greeting}
          </p>
        </div>

        {/* D1: Daily quote */}
        <div
          className="mt-8 text-center relative z-10 max-w-sm mx-auto"
          style={{ opacity: 0, animation: 'fadeIn 0.6s ease-out 0.4s forwards' }}
        >
          <div
            className="rounded-xl px-6 py-4 theme-transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <p className="font-serif-kr text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              &ldquo;{dailyQuote.text}&rdquo;
            </p>
            <p className="font-serif-kr text-xs mt-2 tracking-widest" style={{ color: 'var(--text-muted)' }}>
              — {dailyQuote.hanja}
            </p>
          </div>
        </div>

        {/* C4: Usage stats */}
        {totalCount > 0 && (
          <div
            className="mt-6 text-center relative z-10"
            style={{ opacity: 0, animation: 'fadeIn 0.5s ease-out 0.7s forwards' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              지금까지{' '}
              <span className="stat-number font-bold text-sm">{totalCount.toLocaleString()}</span>
              회 분석 완료
            </p>
          </div>
        )}

        {/* Scroll Arrow */}
        <div className="scroll-arrow text-2xl" style={{ color: 'var(--text-muted)' }}>
          ↓
        </div>
      </section>

      {/* ═══ FEATURES SECTION (A3) ═══ */}
      <section className="px-4 py-12 max-w-md mx-auto relative z-10">
        <h2
          className="font-serif-kr text-center text-lg font-bold mb-6"
          style={{ color: 'var(--text-accent)', opacity: 0, animation: 'fadeIn 0.5s ease-out 0.5s forwards' }}
        >
          이런 걸 알 수 있어요
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feature-card rounded-xl p-4 text-center hover-lift theme-transition"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HISTORY SECTION (C2) ═══ */}
      {history.length > 0 && (
        <section className="px-4 pb-8 max-w-md mx-auto relative z-10">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
            📋 최근 분석 기록
          </h3>
          <div className="space-y-2">
            {history.map((entry, i) => (
              <button
                key={i}
                className="history-card w-full text-left flex items-center justify-between"
                onClick={() => handleHistoryClick(entry)}
              >
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {entry.year}.{String(entry.month).padStart(2, '0')}.{String(entry.day).padStart(2, '0')}
                  </span>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                    {entry.hour}시 · {entry.gender === 'male' ? '남' : '여'}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {entry.date}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ═══ FORM SECTION (B3, C5) ═══ */}
      {showForm && (
        <section className="px-4 pb-8 max-w-md mx-auto relative z-10" id="saju-form-card">
          <div
            className="rounded-2xl p-6 shadow-2xl form-section theme-transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <p className="text-sm mb-5 text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
              생년월일시를 입력해 주세요
            </p>

            {/* 양력/음력 토글 */}
            <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)] mb-4 form-section">
              <button type="button" onClick={() => { setCalendarType('solar'); setIsLeapMonth(false) }} className={toggleBtnClass(calendarType === 'solar')}>
                양력 (陽曆)
              </button>
              <button type="button" onClick={() => setCalendarType('lunar')} className={toggleBtnClass(calendarType === 'lunar')}>
                음력 (陰曆)
              </button>
            </div>

            {calendarType === 'lunar' && (
              <label className="flex items-center gap-2 mb-4 cursor-pointer form-section">
                <input type="checkbox" checked={isLeapMonth} onChange={e => setIsLeapMonth(e.target.checked)}
                  className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent)' }} disabled={loading} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>윤달 (閏月)</span>
              </label>
            )}

            {/* 성별 선택 */}
            <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)] mb-4 form-section">
              <button type="button" onClick={() => setGender('male')} className={toggleBtnClass(gender === 'male')}>
                남성 (男)
              </button>
              <button type="button" onClick={() => setGender('female')} className={toggleBtnClass(gender === 'female')}>
                여성 (女)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 연도 */}
              <div className="form-section">
                <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>연도 (年)</label>
                <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClass} disabled={loading}>
                  {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                </select>
              </div>

              {/* 월 / 일 */}
              <div className="grid grid-cols-2 gap-3 form-section">
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>월 (月)</label>
                  <select value={month} onChange={e => {
                    const m = Number(e.target.value); setMonth(m);
                    const maxDay = getDaysInMonth(year, m); if (day > maxDay) setDay(maxDay);
                  }} className={selectClass} disabled={loading}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}월</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>일 (日)</label>
                  <select value={day} onChange={e => setDay(Number(e.target.value))} className={selectClass} disabled={loading}>
                    {days.map(d => <option key={d} value={d}>{d}일</option>)}
                  </select>
                </div>
              </div>

              {/* C5: 시간 모름 옵션 */}
              <div className="form-section">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={unknownTime} onChange={e => setUnknownTime(e.target.checked)}
                    className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent)' }} disabled={loading} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>태어난 시간을 모릅니다</span>
                </label>
                {unknownTime && (
                  <p className="text-xs px-2 py-1.5 rounded-lg mb-1" style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
                    💡 시간 미상 시 자시(子時, 0시) 기준으로 분석합니다
                  </p>
                )}
              </div>

              {/* 시 / 분 (시간 모름이 아닐 때만) */}
              {!unknownTime && (
                <div className="grid grid-cols-2 gap-3 form-section">
                  <div>
                    <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>시 (時)</label>
                    <select value={hour} onChange={e => setHour(Number(e.target.value))} className={selectClass} disabled={loading}>
                      {HOURS.map(h => <option key={h} value={h}>{h}시</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>분 (分)</label>
                    <select value={minute} onChange={e => setMinute(Number(e.target.value))} className={selectClass} disabled={loading}>
                      {MINUTES.map(m => <option key={m} value={m}>{m}분</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* 제출 버튼 */}
              <div className="form-section">
                <button type="submit" disabled={loading}
                  className="w-full mt-2 font-bold py-3.5 px-6 rounded-xl transition-all text-base tracking-wide hover-scale disabled:cursor-not-allowed"
                  style={{
                    background: loading ? 'var(--bg-secondary)' : 'var(--accent)',
                    color: loading ? 'var(--text-muted)' : 'var(--accent-text)',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="yin-yang" style={{ width: '24px', height: '24px' }} />
                      분석 중...
                    </span>
                  ) : (
                    '✨ 사주 풀이 보기'
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ═══ GUNGHAP PROMO (C3) ═══ */}
      <section className="px-4 pb-12 max-w-md mx-auto relative z-10">
        <a
          href="/gunghap"
          className="block rounded-xl p-5 text-center hover-lift promo-glow theme-transition"
          style={{
            background: theme === 'dark' ? 'rgba(236,72,153,0.08)' : 'rgba(236,72,153,0.05)',
            border: '1px solid rgba(244,114,182,0.25)',
          }}
        >
          <div className="text-3xl mb-2">💑</div>
          <div className="text-base font-bold mb-1" style={{ color: '#f472b6' }}>궁합 분석</div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            두 사람의 사주를 비교하고 AI가 궁합을 풀어드려요
          </p>
        </a>
      </section>
    </div>
  )
}

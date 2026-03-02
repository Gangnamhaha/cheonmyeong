'use client'

import { useState, useMemo } from 'react'
import { useTheme } from './ThemeProvider'

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

// 연도 범위 생성 (1900~2050)
const YEARS = Array.from({ length: 151 }, (_, i) => 1900 + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

// Generate starfield positions deterministically
function generateStars(count: number): { x: number; y: number; size: 'small' | 'large'; duration: number; delay: number }[] {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: (i * 7919 + 13) % 100, // pseudo-random x
      y: (i * 6271 + 37) % 100, // pseudo-random y
      size: (i % 7 === 0 ? 'large' : 'small') as 'small' | 'large',
      duration: 2 + (i % 5) * 0.8,
      delay: (i % 8) * 0.5,
    })
  }
  return stars
}

const STARS = generateStars(60)

export default function SajuForm({ onSubmit, loading = false }: SajuFormProps) {
  const { theme, toggleTheme } = useTheme()
  const [year, setYear] = useState(1990)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [hour, setHour] = useState(12)
  const [minute, setMinute] = useState(0)
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [gender, setGender] = useState<'male' | 'female'>('male')

  const daysInMonth = getDaysInMonth(year, month)
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ year, month, day, hour, minute, calendarType, isLeapMonth, gender })
  }

  const selectClass =
    'w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-1 transition-colors theme-transition'
      + ' bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]'
      + ' focus:border-[var(--accent)] focus:ring-[var(--accent)]'

  const toggleBtnClass = (active: boolean) =>
    `flex-1 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-[var(--accent)] text-[var(--accent-text)]'
        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
    }`

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--bg-primary)' }}>
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

      <div className="w-full max-w-md relative z-10">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover-scale theme-transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            aria-label="테마 전환"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* 헤더 */}
        <div className="text-center mb-8 form-section">
          <h1 className="text-4xl font-bold mb-1" style={{ color: 'var(--text-accent)' }}>천명</h1>
          <p className="text-lg tracking-widest" style={{ color: 'var(--text-secondary)' }}>天命</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>나의 사주팔자 풀이</p>
        </div>

        {/* 폼 카드 */}
        <div className="rounded-2xl p-6 shadow-2xl form-section theme-transition" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <p className="text-sm mb-5 text-center" style={{ color: 'var(--text-secondary)' }}>
            생년월일시를 입력해 주세요
          </p>

          {/* 양력/음력 토글 */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)] mb-4 form-section">
            <button
              type="button"
              onClick={() => { setCalendarType('solar'); setIsLeapMonth(false) }}
              className={toggleBtnClass(calendarType === 'solar')}
            >
              양력 (陽曆)
            </button>
            <button
              type="button"
              onClick={() => setCalendarType('lunar')}
              className={toggleBtnClass(calendarType === 'lunar')}
            >
              음력 (陰曆)
            </button>
          </div>

          {/* 윤달 체크박스 (음력일 때만 표시) */}
          {calendarType === 'lunar' && (
            <label className="flex items-center gap-2 mb-4 cursor-pointer form-section">
              <input
                type="checkbox"
                checked={isLeapMonth}
                onChange={e => setIsLeapMonth(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--accent)' }}
                disabled={loading}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>윤달 (閏月)</span>
            </label>
          )}

          {/* 성별 선택 */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)] mb-4 form-section">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={toggleBtnClass(gender === 'male')}
            >
              남성 (男)
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={toggleBtnClass(gender === 'female')}
            >
              여성 (女)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 연도 */}
            <div className="form-section">
              <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                연도 (年)
              </label>
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className={selectClass}
                disabled={loading}
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
            </div>

            {/* 월 / 일 */}
            <div className="grid grid-cols-2 gap-3 form-section">
              <div>
                <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  월 (月)
                </label>
                <select
                  value={month}
                  onChange={e => {
                    const m = Number(e.target.value)
                    setMonth(m)
                    const maxDay = getDaysInMonth(year, m)
                    if (day > maxDay) setDay(maxDay)
                  }}
                  className={selectClass}
                  disabled={loading}
                >
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{m}월</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  일 (日)
                </label>
                <select
                  value={day}
                  onChange={e => setDay(Number(e.target.value))}
                  className={selectClass}
                  disabled={loading}
                >
                  {days.map(d => (
                    <option key={d} value={d}>{d}일</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 시 / 분 */}
            <div className="grid grid-cols-2 gap-3 form-section">
              <div>
                <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  시 (時)
                </label>
                <select
                  value={hour}
                  onChange={e => setHour(Number(e.target.value))}
                  className={selectClass}
                  disabled={loading}
                >
                  {HOURS.map(h => (
                    <option key={h} value={h}>{h}시</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  분 (分)
                </label>
                <select
                  value={minute}
                  onChange={e => setMinute(Number(e.target.value))}
                  className={selectClass}
                  disabled={loading}
                >
                  {MINUTES.map(m => (
                    <option key={m} value={m}>{m}분</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="form-section">
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 font-bold py-3 px-6 rounded-lg transition-colors text-base tracking-wide hover-scale disabled:cursor-not-allowed"
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
                  '사주 풀이 보기'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

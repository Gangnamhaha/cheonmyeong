import type { FormEvent, ReactNode } from 'react'

interface QuickFormProps {
  year: number
  month: number
  day: number
  gender: 'male' | 'female'
  setYear: (y: number) => void
  setMonth: (m: number) => void
  setDay: (d: number) => void
  setGender: (g: 'male' | 'female') => void
  onSubmit: (e: FormEvent) => void
  loading: boolean
  yearOptions: ReactNode
  monthOptions: ReactNode
  dayOptions: ReactNode
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export default function QuickForm({
  year,
  month,
  day,
  gender,
  setYear,
  setMonth,
  setDay,
  setGender,
  onSubmit,
  loading,
  yearOptions,
  monthOptions,
  dayOptions,
}: QuickFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-3 animate-fadeIn">
        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          생년월일과 성별만 입력하면 바로 사주를 분석해 드려요
        </p>
        <div className="flex gap-2 items-center justify-center flex-wrap">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="rounded-lg px-2 py-2 text-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            disabled={loading}
          >
            {yearOptions}
          </select>
          <span style={{ color: 'var(--text-muted)' }}>년</span>
          <select
            value={month}
            onChange={e => {
              const m = Number(e.target.value)
              setMonth(m)
              const maxDay = getDaysInMonth(year, m)
              if (day > maxDay) setDay(maxDay)
            }}
            className="rounded-lg px-2 py-2 text-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            disabled={loading}
          >
            {monthOptions}
          </select>
          <span style={{ color: 'var(--text-muted)' }}>월</span>
          <select
            value={day}
            onChange={e => setDay(Number(e.target.value))}
            className="rounded-lg px-2 py-2 text-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            disabled={loading}
          >
            {dayOptions}
          </select>
          <span style={{ color: 'var(--text-muted)' }}>일</span>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => setGender('male')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: gender === 'male' ? 'var(--accent)' : 'var(--bg-secondary)',
              color: gender === 'male' ? 'var(--accent-text)' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            👨 남성
          </button>
          <button
            type="button"
            onClick={() => setGender('female')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: gender === 'female' ? 'var(--accent)' : 'var(--bg-secondary)',
              color: gender === 'female' ? 'var(--accent-text)' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            👩 여성
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
          style={{
            background: loading ? 'var(--bg-secondary)' : 'var(--accent)',
            color: loading ? 'var(--text-muted)' : 'var(--accent-text)',
          }}
        >
          {loading ? '분석 중...' : '⚡ 바로 분석하기'}
        </button>
        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          * 시간 미입력 시 12시 기준으로 분석됩니다
        </p>
      </div>
    </form>
  )
}

import type { FormEvent, ReactNode } from 'react'

interface DetailFormProps {
  name: string
  setName: (name: string) => void
  year: number
  month: number
  day: number
  hour: number
  minute: number
  calendarType: 'solar' | 'lunar'
  isLeapMonth: boolean
  gender: 'male' | 'female'
  unknownTime: boolean
  setYear: (year: number) => void
  setMonth: (month: number) => void
  setDay: (day: number) => void
  setHour: (hour: number) => void
  setMinute: (minute: number) => void
  setCalendarType: (type: 'solar' | 'lunar') => void
  setIsLeapMonth: (isLeapMonth: boolean) => void
  setGender: (gender: 'male' | 'female') => void
  setUnknownTime: (unknown: boolean) => void
  onSubmit: (e: FormEvent) => void
  loading: boolean
  isNameListening: boolean
  isNameSpeechSupported: boolean
  onNameMicToggle: () => void
  yearOptions: ReactNode
  monthOptions: ReactNode
  dayOptions: ReactNode
  hourOptions: ReactNode
  minuteOptions: ReactNode
  selectClass: string
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export default function DetailForm({
  name,
  setName,
  year,
  month,
  day,
  hour,
  minute,
  calendarType,
  isLeapMonth,
  gender,
  unknownTime,
  setYear,
  setMonth,
  setDay,
  setHour,
  setMinute,
  setCalendarType,
  setIsLeapMonth,
  setGender,
  setUnknownTime,
  onSubmit,
  loading,
  isNameListening,
  isNameSpeechSupported,
  onNameMicToggle,
  yearOptions,
  monthOptions,
  dayOptions,
  hourOptions,
  minuteOptions,
  selectClass,
}: DetailFormProps) {
  const toggleBtnClass = (active: boolean) =>
    `flex-1 py-2 text-sm font-medium transition-all ${
      active
        ? 'bg-[var(--accent)] text-[var(--accent-text)]'
        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
    }`

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

      <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)] mb-4 form-section">
        <button type="button" onClick={() => setGender('male')} className={toggleBtnClass(gender === 'male')}>
          남성 (男)
        </button>
        <button type="button" onClick={() => setGender('female')} className={toggleBtnClass(gender === 'female')}>
          여성 (女)
        </button>
      </div>

      <div className="mb-4 form-section">
        <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>이름</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="이름을 입력해 주세요 (선택)"
            className={selectClass}
            disabled={loading}
            maxLength={20}
          />
          {isNameSpeechSupported && (
            <button
              type="button"
              onClick={onNameMicToggle}
              disabled={loading}
              className={`h-10 w-10 rounded-lg text-sm transition-all theme-transition ${isNameListening ? 'animate-pulse' : 'hover-scale'} disabled:opacity-40 disabled:cursor-not-allowed`}
              style={{
                background: isNameListening ? 'rgba(239, 68, 68, 0.18)' : 'var(--bg-secondary)',
                border: `1px solid ${isNameListening ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)'}`,
                color: isNameListening ? '#ef4444' : 'var(--text-muted)',
              }}
              aria-label={isNameListening ? '이름 음성 입력 중지' : '이름 음성 입력'}
              title={isNameListening ? '음성 입력 중지' : '음성으로 이름 입력'}
            >
              🎤
            </button>
          )}
        </div>
      </div>

      <div className="form-section">
        <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>연도 (年)</label>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClass} disabled={loading}>
          {yearOptions}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 form-section">
        <div>
          <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>월 (月)</label>
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
            {monthOptions}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>일 (日)</label>
          <select value={day} onChange={e => setDay(Number(e.target.value))} className={selectClass} disabled={loading}>
            {dayOptions}
          </select>
        </div>
      </div>

      <div className="form-section">
        <label className="flex items-center gap-2 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={unknownTime}
            onChange={e => setUnknownTime(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: 'var(--accent)' }}
            disabled={loading}
          />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>태어난 시간을 모릅니다</span>
        </label>
        {unknownTime && (
          <p className="text-xs px-2 py-1.5 rounded-lg mb-1" style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
            💡 시간 미상 시 자시(子時, 0시) 기준으로 분석합니다
          </p>
        )}
      </div>

      {!unknownTime && (
        <div className="grid grid-cols-2 gap-3 form-section">
          <div>
            <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>시 (時)</label>
            <select value={hour} onChange={e => setHour(Number(e.target.value))} className={selectClass} disabled={loading}>
              {hourOptions}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>분 (分)</label>
            <select value={minute} onChange={e => setMinute(Number(e.target.value))} className={selectClass} disabled={loading}>
              {minuteOptions}
            </select>
          </div>
        </div>
      )}

      <div className="form-section">
        <button
          type="submit"
          disabled={loading}
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
  )
}

'use client'

import { useState } from 'react'

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

export default function SajuForm({ onSubmit, loading = false }: SajuFormProps) {
  const [year, setYear] = useState(1990)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [hour, setHour] = useState(12)
  const [minute, setMinute] = useState(0)
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [gender, setGender] = useState<'male' | 'female'>('male')

  const daysInMonth = getDaysInMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ year, month, day, hour, minute, calendarType, isLeapMonth, gender })
  }

  const selectClass =
    'w-full bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors'

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-400 mb-1">천명</h1>
          <p className="text-slate-400 text-lg tracking-widest">天命</p>
          <p className="text-slate-500 text-sm mt-2">나의 사주팔자 풀이</p>
        </div>

        {/* 폼 카드 */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
          <p className="text-slate-300 text-sm mb-5 text-center">
            생년월일시를 입력해 주세요
          </p>

          {/* 양력/음력 토글 */}
          <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-4">
            <button
              type="button"
              onClick={() => { setCalendarType('solar'); setIsLeapMonth(false) }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                calendarType === 'solar'
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              양력 (陽曆)
            </button>
            <button
              type="button"
              onClick={() => setCalendarType('lunar')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                calendarType === 'lunar'
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              음력 (陰曆)
            </button>
          </div>

          {/* 윤달 체크박스 (음력일 때만 표시) */}
          {calendarType === 'lunar' && (
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isLeapMonth}
                onChange={e => setIsLeapMonth(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
                disabled={loading}
              />
              <span className="text-slate-400 text-sm">윤달 (閏月)</span>
            </label>
          )}

          {/* 성별 선택 */}
          <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-4">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                gender === 'male'
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              남성 (男)
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                gender === 'female'
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              여성 (女)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 연도 */}
            <div>
              <label className="block text-slate-400 text-xs mb-1 font-medium">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-medium">
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
                <label className="block text-slate-400 text-xs mb-1 font-medium">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-medium">
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
                <label className="block text-slate-400 text-xs mb-1 font-medium">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold py-3 px-6 rounded-lg transition-colors text-base tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  분석 중...
                </span>
              ) : (
                '사주 풀이 보기'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

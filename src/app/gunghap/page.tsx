'use client'

import { useState, useRef } from 'react'
import { calculateFullSaju, FullSajuResult } from '@/lib/saju'
import { analyzeGunghap, GunghapResult } from '@/lib/gunghap'
import { shareGunghapResult } from '@/lib/kakao'
import { trackShare } from '@/lib/analytics'

const YEARS = Array.from({ length: 151 }, (_, i) => 1900 + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

interface PersonInput {
  name: string
  year: number
  month: number
  day: number
  hour: number
  minute: number
  calendarType: 'solar' | 'lunar'
  isLeapMonth: boolean
  gender: 'male' | 'female'
}

const defaultPerson = (): PersonInput => ({
  name: '', year: 1990, month: 1, day: 1, hour: 12, minute: 0,
  calendarType: 'solar', isLeapMonth: false, gender: 'male',
})

const selectClass = 'w-full bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors'

function PersonForm({ label, person, onChange, disabled }: {
  label: string
  person: PersonInput
  onChange: (p: PersonInput) => void
  disabled: boolean
}) {
  const days = Array.from({ length: getDaysInMonth(person.year, person.month) }, (_, i) => i + 1)

  const inputClass = 'w-full bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors placeholder:text-slate-600'

  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-center text-sm font-bold text-amber-400 mb-3">{label}</h3>

      {/* 이름 */}
      <input type="text" value={person.name} placeholder="이름 (선택)"
        onChange={e => onChange({ ...person, name: e.target.value })}
        className={inputClass + ' mb-2'} disabled={disabled} maxLength={10} />

      {/* 성별 */}
      <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-2">
        <button type="button" onClick={() => onChange({ ...person, gender: 'male' })}
          className={`flex-1 py-1.5 text-xs font-medium transition-colors ${person.gender === 'male' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`} disabled={disabled}>
          남
        </button>
        <button type="button" onClick={() => onChange({ ...person, gender: 'female' })}
          className={`flex-1 py-1.5 text-xs font-medium transition-colors ${person.gender === 'female' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`} disabled={disabled}>
          여
        </button>
      </div>

      {/* 양력/음력 */}
      <div className="flex rounded-lg overflow-hidden border border-slate-600 mb-2">
        <button type="button" onClick={() => onChange({ ...person, calendarType: 'solar', isLeapMonth: false })}
          className={`flex-1 py-1.5 text-xs font-medium transition-colors ${person.calendarType === 'solar' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`} disabled={disabled}>
          양력
        </button>
        <button type="button" onClick={() => onChange({ ...person, calendarType: 'lunar' })}
          className={`flex-1 py-1.5 text-xs font-medium transition-colors ${person.calendarType === 'lunar' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`} disabled={disabled}>
          음력
        </button>
      </div>

      {person.calendarType === 'lunar' && (
        <label className="flex items-center gap-1 mb-2 cursor-pointer">
          <input type="checkbox" checked={person.isLeapMonth}
            onChange={e => onChange({ ...person, isLeapMonth: e.target.checked })}
            className="w-3 h-3 rounded border-slate-600 bg-slate-800 text-amber-500" disabled={disabled} />
          <span className="text-slate-400 text-xs">윤달</span>
        </label>
      )}

      {/* 연도 */}
      <select value={person.year} onChange={e => onChange({ ...person, year: Number(e.target.value) })}
        className={selectClass} disabled={disabled}>
        {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
      </select>

      {/* 월/일 */}
      <div className="grid grid-cols-2 gap-1 mt-1">
        <select value={person.month} onChange={e => {
          const m = Number(e.target.value)
          const maxDay = getDaysInMonth(person.year, m)
          onChange({ ...person, month: m, day: Math.min(person.day, maxDay) })
        }} className={selectClass} disabled={disabled}>
          {MONTHS.map(m => <option key={m} value={m}>{m}월</option>)}
        </select>
        <select value={person.day} onChange={e => onChange({ ...person, day: Number(e.target.value) })}
          className={selectClass} disabled={disabled}>
          {days.map(d => <option key={d} value={d}>{d}일</option>)}
        </select>
      </div>

      {/* 시/분 */}
      <div className="grid grid-cols-2 gap-1 mt-1">
        <select value={person.hour} onChange={e => onChange({ ...person, hour: Number(e.target.value) })}
          className={selectClass} disabled={disabled}>
          {HOURS.map(h => <option key={h} value={h}>{h}시</option>)}
        </select>
        <select value={person.minute} onChange={e => onChange({ ...person, minute: Number(e.target.value) })}
          className={selectClass} disabled={disabled}>
          {MINUTES.map(m => <option key={m} value={m}>{m}분</option>)}
        </select>
      </div>
    </div>
  )
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171'
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" stroke="#334155" strokeWidth="8" fill="none" />
        <circle cx="60" cy="60" r="54" stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-500">/ 100점</span>
      </div>
    </div>
  )
}

function CategoryBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? 'bg-green-400' : score >= 60 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-12 text-right shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-slate-300 w-8">{score}%</span>
    </div>
  )
}

export default function GunghapPage() {
  const [person1, setPerson1] = useState<PersonInput>(defaultPerson())
  const [person2, setPerson2] = useState<PersonInput>({ ...defaultPerson(), gender: 'female' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ p1: FullSajuResult; p2: FullSajuResult; gunghap: GunghapResult } | null>(null)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  async function fetchAiGunghap(p1: FullSajuResult, p2: FullSajuResult, g: GunghapResult, name1: string, name2: string) {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setAiLoading(true)
    setAiText(null)

    try {
      const res = await fetch('/api/gunghap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person1: p1, person2: p2, gunghap: g, name1: name1 || undefined, name2: name2 || undefined }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        setAiText(data.error ?? 'AI 해석 오류')
        return
      }

      const reader = res.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setAiText(acc)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setAiText('네트워크 오류가 발생했습니다.')
    } finally {
      setAiLoading(false)
    }
  }

  function handleSubmit() {
    setLoading(true)
    setError(null)
    setResult(null)
    setAiText(null)

    try {
      const p1 = calculateFullSaju(person1.year, person1.month, person1.day, person1.hour, person1.minute,
        person1.calendarType, person1.isLeapMonth, person1.gender)
      const p2 = calculateFullSaju(person2.year, person2.month, person2.day, person2.hour, person2.minute,
        person2.calendarType, person2.isLeapMonth, person2.gender)
      const gunghap = analyzeGunghap(p1, p2)
      setResult({ p1, p2, gunghap })
      fetchAiGunghap(p1, p2, gunghap, person1.name.trim(), person2.name.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : '궁합 계산 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    abortRef.current?.abort()
    setResult(null)
    setAiText(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-pink-400">궁합</h1>
          <p className="text-slate-500 text-sm tracking-widest">宮合</p>
          <p className="text-slate-400 text-xs mt-1">두 사람의 사주로 궁합을 확인하세요</p>
        </div>

        {!result ? (
          <>
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              {/* 두 사람 입력 */}
              <div className="flex gap-4">
                <PersonForm label="나" person={person1} onChange={setPerson1} disabled={loading} />
                <div className="w-px bg-slate-700 shrink-0" />
                <PersonForm label="상대방" person={person2} onChange={setPerson2} disabled={loading} />
              </div>

              {error && (
                <div className="mt-3 bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-xs text-center">
                  {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full mt-4 bg-pink-500 hover:bg-pink-400 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors">
                {loading ? '분석 중...' : '궁합 보기'}
              </button>
            </div>

            <a href="/" className="block text-center text-slate-500 hover:text-amber-400 text-sm mt-4 transition-colors">
              🔮 개인 사주 보러 가기
            </a>
          </>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* 총점 */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <ScoreCircle score={result.gunghap.score} />
              <p className="text-center text-slate-300 text-sm mt-3">{result.gunghap.categories.overall}</p>
            </div>

            {/* 카테고리 점수 */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 mb-3">상세 궁합</h3>
              <CategoryBar label="성격" score={result.gunghap.categories.personality.score} />
              <CategoryBar label="연애" score={result.gunghap.categories.love.score} />
              <CategoryBar label="직장" score={result.gunghap.categories.work.score} />
              <CategoryBar label="건강" score={result.gunghap.categories.health.score} />
            </div>

            {/* 카테고리 설명 */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 space-y-3">
              {[
                { label: '성격', cat: result.gunghap.categories.personality },
                { label: '연애', cat: result.gunghap.categories.love },
                { label: '직장', cat: result.gunghap.categories.work },
                { label: '건강', cat: result.gunghap.categories.health },
              ].map(({ label, cat }) => (
                <div key={label}>
                  <span className="text-xs text-amber-400 font-bold">{label}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                </div>
              ))}
              <div>
                <span className="text-xs text-amber-400 font-bold">오행 보완</span>
                <p className="text-xs text-slate-400 mt-0.5">{result.gunghap.ohengBalance}</p>
              </div>
            </div>

            {/* AI 해석 */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
              <h3 className="text-center text-sm font-bold text-pink-400 mb-3">AI 궁합 해석</h3>
              {aiLoading && !aiText && (
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                  <svg className="animate-spin h-5 w-5 text-pink-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  궁합을 해석하고 있습니다...
                </div>
              )}
              {aiText && (
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{aiText}</div>
              )}
            </div>

            {/* 카카오톡 공유 */}
            <button
              onClick={() => {
                if (result) {
                  shareGunghapResult({
                    person1: person1.name || '나',
                    person2: person2.name || '상대방',
                    score: result.gunghap.score,
                  })
                  trackShare('kakao', 'gunghap')
                }
              }}
              className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 mb-3"
              style={{ background: '#FEE500', color: '#191919' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1C4.58 1 1 3.87 1 7.35c0 2.14 1.39 4.03 3.5 5.12l-.9 3.28c-.08.28.25.5.48.33l3.84-2.54c.35.04.71.06 1.08.06 4.42 0 8-2.87 8-6.25S13.42 1 9 1z" fill="#191919"/>
              </svg>
              카카오톡으로 공유하기
            </button>

            <div className="flex gap-3">
              <button onClick={handleReset}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-lg transition-colors text-sm">
                다시 하기
              </button>
              <a href="/"
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-lg transition-colors text-sm text-center border border-slate-700">
                개인 사주 보기
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

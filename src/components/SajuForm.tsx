'use client'

import { useState, useEffect, useMemo, type CSSProperties, type FormEvent } from 'react'
import { useTheme } from './ThemeProvider'
import SajuChat from './SajuChat'
import SearchModal from './SearchModal'
import AnimationShowcase from './AnimationShowcase'
import HeroSection from './HeroSection'
import QuickForm from './QuickForm'
import DetailForm from './DetailForm'
import HistoryPanel, { type HistoryEntry } from './HistoryPanel'
import {
  YEARS,
  MONTHS,
  HOURS,
  MINUTES,
  QUOTES,
  FEATURES,
  STARS,
  getDaysInMonth,
  parseBirthDateTime,
  getGreeting,
  getDailyQuote,
  getHistory,
  saveHistory,
  getAnalysisCount,
  incrementAnalysisCount,
} from './sajuFormUtils'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

interface SajuFormData {
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

interface SajuFormProps {
  onSubmit: (data: SajuFormData) => void
  loading?: boolean
}

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
  const [showForm, setShowForm] = useState(true)
  const [quickMode, setQuickMode] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [name, setName] = useState('')

  const {
    isListening: isNameListening,
    transcript: nameTranscript,
    interimTranscript: nameInterimTranscript,
    isSupported: isNameSpeechSupported,
    startListening: startNameListening,
    stopListening: stopNameListening,
    resetTranscript: resetNameTranscript,
  } = useSpeechRecognition()

  const {
    isListening: isDateListening,
    transcript: dateTranscript,
    interimTranscript: dateInterimTranscript,
    isSupported: isDateSpeechSupported,
    startListening: startDateListening,
    stopListening: stopDateListening,
    resetTranscript: resetDateTranscript,
  } = useSpeechRecognition()

  const daysInMonth = getDaysInMonth(year, month)
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth])
  const quickYearOptions = YEARS.map(y => <option key={y} value={y}>{y}</option>)
  const quickMonthOptions = MONTHS.map(m => <option key={m} value={m}>{m}</option>)
  const quickDayOptions = days.map(d => <option key={d} value={d}>{d}</option>)
  const detailYearOptions = YEARS.map(y => <option key={y} value={y}>{y}년</option>)
  const detailMonthOptions = MONTHS.map(m => <option key={m} value={m}>{m}월</option>)
  const detailDayOptions = days.map(d => <option key={d} value={d}>{d}일</option>)
  const hourOptions = HOURS.map(h => <option key={h} value={h}>{h}시</option>)
  const minuteOptions = MINUTES.map(m => <option key={m} value={m}>{m}분</option>)

  const [greeting, setGreeting] = useState('사주팔자로 당신의 운명을 알아보세요')
  const [dailyQuote, setDailyQuote] = useState(QUOTES[0])

  useEffect(() => {
    setGreeting(getGreeting())
    setDailyQuote(getDailyQuote())
    setHistory(getHistory())
    setTotalCount(getAnalysisCount())
    const timer = setTimeout(() => setShowForm(true), 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    function handleOpenSearchShortcut(e: KeyboardEvent) {
      const isCommandOrCtrl = e.metaKey || e.ctrlKey
      if (!isCommandOrCtrl || e.key.toLowerCase() !== 'k') return
      e.preventDefault()
      setShowSearchModal(true)
    }

    window.addEventListener('keydown', handleOpenSearchShortcut)
    return () => window.removeEventListener('keydown', handleOpenSearchShortcut)
  }, [])

  useEffect(() => {
    const recognizedName = `${nameTranscript} ${nameInterimTranscript}`.trim()
    if (recognizedName) {
      setName(recognizedName.slice(0, 20))
    }
  }, [nameInterimTranscript, nameTranscript])

  useEffect(() => {
    const text = `${dateTranscript} ${dateInterimTranscript}`.trim()
    if (!text) return

    const parsed = parseBirthDateTime(text)
    if (parsed.year !== undefined) setYear(parsed.year)
    if (parsed.month !== undefined) setMonth(parsed.month)
    if (parsed.day !== undefined) setDay(parsed.day)
    if (parsed.hour !== undefined) {
      setHour(parsed.hour)
      setUnknownTime(false)
    }
    if (parsed.minute !== undefined) setMinute(parsed.minute)
    if (parsed.gender) setGender(parsed.gender)
    if (parsed.calendarType) {
      setCalendarType(parsed.calendarType)
      if (parsed.calendarType === 'solar') setIsLeapMonth(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateTranscript, dateInterimTranscript])

  useEffect(() => {
    const maxDay = getDaysInMonth(year, month)
    if (day > maxDay) setDay(maxDay)
  }, [year, month, day])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const useQuickDefaults = quickMode
    const submitUnknownTime = useQuickDefaults ? false : unknownTime
    const submitHour = useQuickDefaults ? 12 : hour
    const submitMinute = useQuickDefaults ? 0 : minute
    const submitCalendarType: 'solar' | 'lunar' = useQuickDefaults ? 'solar' : calendarType
    const submitIsLeapMonth = useQuickDefaults ? false : isLeapMonth
    const h = submitUnknownTime ? 0 : submitHour
    const m = submitUnknownTime ? 0 : submitMinute

    if (useQuickDefaults) {
      setUnknownTime(false)
      setHour(12)
      setMinute(0)
      setCalendarType('solar')
      setIsLeapMonth(false)
    }

    saveHistory({ year, month, day, hour: h, gender, date: new Date().toISOString().slice(0, 10) })
    incrementAnalysisCount()
    onSubmit({
      name: useQuickDefaults ? '' : name,
      year,
      month,
      day,
      hour: h,
      minute: m,
      calendarType: submitCalendarType,
      isLeapMonth: submitIsLeapMonth,
      gender,
    })
  }

  function handleHistoryClick(entry: HistoryEntry) {
    setYear(entry.year)
    setMonth(entry.month)
    setDay(entry.day)
    setHour(entry.hour)
    setGender(entry.gender)
    setShowForm(true)
    document.getElementById('saju-form-card')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleScrollDown() {
    document.getElementById('saju-form-card')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleNameMicToggle() {
    if (isNameListening) {
      stopNameListening()
      return
    }
    if (isDateListening) stopDateListening()
    resetNameTranscript()
    startNameListening()
  }

  function handleDateMicToggle() {
    if (isDateListening) {
      stopDateListening()
      return
    }
    if (isNameListening) stopNameListening()
    resetDateTranscript()
    startDateListening()
  }

  const selectClass =
    'w-full rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 transition-colors theme-transition text-sm' +
    ' bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]' +
    ' focus:border-[var(--accent)] focus:ring-[var(--accent)]'

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-primary)' }}>
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
            } as CSSProperties}
          />
        ))}
      </div>

      <HeroSection greeting={greeting} theme={theme} onScrollDown={handleScrollDown} totalCount={totalCount}>
          <AnimationShowcase />
          <SajuChat />
      </HeroSection>

      <section className="px-4 py-6 max-w-md mx-auto relative z-10">
        <div className="grid grid-cols-3 gap-2">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feature-card rounded-xl py-3 px-2 text-center hover-lift theme-transition"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                opacity: 0,
                animation: `fadeIn 0.3s ease-out ${0.2 + i * 0.06}s forwards`,
              }}
            >
              <span className="text-xl">{f.icon}</span>
              <p className="text-xs font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
            </div>
          ))}
        </div>
      </section>

      {showForm && (
        <section className="px-4 pb-8 max-w-md mx-auto relative z-10" id="saju-form-card">
          <div
            className="rounded-2xl p-6 shadow-2xl form-section theme-transition"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setQuickMode(false)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: !quickMode ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: !quickMode ? 'var(--accent-text)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                📋 상세입력
              </button>
              <button
                type="button"
                onClick={() => setQuickMode(true)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: quickMode ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: quickMode ? 'var(--accent-text)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                ⚡ 간편이용
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {quickMode ? '생년월일을 입력해 주세요' : '생년월일시를 입력해 주세요'}
              </p>
              {isDateSpeechSupported && !quickMode && (
                <button
                  type="button"
                  onClick={handleDateMicToggle}
                  disabled={loading}
                  className={`h-7 px-2.5 rounded-lg text-xs transition-all theme-transition flex items-center gap-1 ${isDateListening ? 'animate-pulse' : 'hover-scale'} disabled:opacity-40 disabled:cursor-not-allowed`}
                  style={{
                    background: isDateListening ? 'rgba(239, 68, 68, 0.18)' : 'var(--bg-secondary)',
                    border: `1px solid ${isDateListening ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)'}`,
                    color: isDateListening ? '#ef4444' : 'var(--text-muted)',
                  }}
                  aria-label={isDateListening ? '생년월일 음성 입력 중지' : '생년월일 음성 입력'}
                  title={isDateListening ? '음성 입력 중지' : '음성으로 입력 (예: 1990년 3월 15일 14시)'}
                >
                  🎤 {isDateListening ? '듣는 중...' : '음성'}
                </button>
              )}
            </div>

            {!quickMode && (dateTranscript || dateInterimTranscript) && (
              <div
                className="text-xs text-center mb-4 px-3 py-2 rounded-lg"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
              >
                🎤 {dateTranscript}{dateInterimTranscript ? ` ${dateInterimTranscript}` : ''}
              </div>
            )}

            {quickMode ? (
              <QuickForm
                year={year}
                month={month}
                day={day}
                gender={gender}
                setYear={setYear}
                setMonth={setMonth}
                setDay={setDay}
                setGender={setGender}
                onSubmit={handleSubmit}
                loading={loading}
                yearOptions={quickYearOptions}
                monthOptions={quickMonthOptions}
                dayOptions={quickDayOptions}
              />
            ) : (
              <DetailForm
                name={name}
                setName={setName}
                year={year}
                month={month}
                day={day}
                hour={hour}
                minute={minute}
                calendarType={calendarType}
                isLeapMonth={isLeapMonth}
                gender={gender}
                unknownTime={unknownTime}
                setYear={setYear}
                setMonth={setMonth}
                setDay={setDay}
                setHour={setHour}
                setMinute={setMinute}
                setCalendarType={setCalendarType}
                setIsLeapMonth={setIsLeapMonth}
                setGender={setGender}
                setUnknownTime={setUnknownTime}
                onSubmit={handleSubmit}
                loading={loading}
                isNameListening={isNameListening}
                isNameSpeechSupported={isNameSpeechSupported}
                onNameMicToggle={handleNameMicToggle}
                yearOptions={detailYearOptions}
                monthOptions={detailMonthOptions}
                dayOptions={detailDayOptions}
                hourOptions={hourOptions}
                minuteOptions={minuteOptions}
                selectClass={selectClass}
              />
            )}
          </div>
        </section>
      )}

      <section className="px-4 pb-8 max-w-md mx-auto relative z-10">
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

      <HistoryPanel history={history} onLoadHistory={handleHistoryClick} />

      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </div>
  )
}

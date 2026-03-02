'use client'

import { useState, useCallback, useRef } from 'react'
import SajuForm from '@/components/SajuForm'
import SajuResultCard from '@/components/SajuResult'
import OhengChart from '@/components/OhengChart'
import AiInterpretation from '@/components/AiInterpretation'
import SipsinChart from '@/components/SipsinChart'
import IlganStrengthBadge from '@/components/IlganStrengthBadge'
import YongsinCard from '@/components/YongsinCard'
import DaeunTimeline from '@/components/DaeunTimeline'
import FortuneCard from '@/components/FortuneCard'
import { useTheme } from '@/components/ThemeProvider'
import { calculateFullSaju, FullSajuResult } from '@/lib/saju'

type AppState = 'form' | 'result'
type ResultTab = '사주' | '분석' | '운세' | 'AI'
type ViewMode = 'summary' | 'detail'

const RESULT_TABS: { key: ResultTab; label: string; icon: string }[] = [
  { key: '사주', label: '사주', icon: '🏛️' },
  { key: '분석', label: '분석', icon: '🔍' },
  { key: '운세', label: '운세', icon: '🌟' },
  { key: 'AI', label: 'AI', icon: '🤖' },
]

type AiCategory = '종합' | '성격' | '연애' | '직업' | '건강' | '재물'
const AI_CATEGORIES: { key: AiCategory; label: string; icon: string }[] = [
  { key: '종합', label: '종합', icon: '🔮' },
  { key: '성격', label: '성격', icon: '🧠' },
  { key: '연애', label: '연애', icon: '💕' },
  { key: '직업', label: '직업', icon: '💼' },
  { key: '건강', label: '건강', icon: '🏥' },
  { key: '재물', label: '재물', icon: '💰' },
]

interface FormData {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  calendarType: 'solar' | 'lunar'
  isLeapMonth: boolean
  gender: 'male' | 'female'
}

export default function Home() {
  const { theme, toggleTheme } = useTheme()
  const [appState, setAppState] = useState<AppState>('form')
  const [loading, setLoading] = useState(false)
  const [fullResult, setFullResult] = useState<FullSajuResult | null>(null)
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<AiCategory>('종합')
  const [categoryCache, setCategoryCache] = useState<Partial<Record<AiCategory, string>>>({})
  const abortRef = useRef<AbortController | null>(null)
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [shareToast, setShareToast] = useState(false)
  const [saveImageLoading, setSaveImageLoading] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  // New state for tabs and view mode
  const [activeTab, setActiveTab] = useState<ResultTab>('사주')
  const [viewMode, setViewMode] = useState<ViewMode>('detail')

  const fetchInterpretation = useCallback(async (result: FullSajuResult, category: AiCategory) => {
    // Check cache first
    if (categoryCache[category]) {
      setAiInterpretation(categoryCache[category] ?? null)
      return
    }

    // Check credits before making request
    try {
      const creditRes = await fetch('/api/credits', { method: 'POST' })
      if (!creditRes.ok) {
        const creditData = await creditRes.json()
        setAiError(creditData.error ?? '크레딧이 부족합니다.')
        return
      }
    } catch {
      // Credit check failed, proceed anyway (graceful degradation)
    }

    // Abort previous request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setAiLoading(true)
    setAiError(null)
    setAiInterpretation(null)

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saju: result.saju,
          oheng: result.oheng,
          sipsin: result.sipsin,
          ilganStrength: result.ilganStrength,
          yongsin: result.yongsin,
          daeun: result.daeun,
          yearlyFortune: result.yearlyFortune,
          monthlyFortune: result.monthlyFortune,
          category,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        setAiError(data.error ?? 'AI 해석 중 오류가 발생했습니다.')
        return
      }

      // Handle streaming response
      const reader = res.body?.getReader()
      if (!reader) {
        setAiError('스트리밍을 지원하지 않는 환경입니다.')
        return
      }

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        accumulated += text
        setAiInterpretation(accumulated)
      }

      // Cache result
      setCategoryCache(prev => ({ ...prev, [category]: accumulated }))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setAiError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setAiLoading(false)
    }
  }, [categoryCache])

  function handleCategoryChange(category: AiCategory) {
    setActiveCategory(category)
    if (fullResult) {
      fetchInterpretation(fullResult, category)
    }
  }

  async function handleFormSubmit(data: FormData) {
    setLoading(true)
    setCalcError(null)
    setAiInterpretation(null)
    setAiError(null)
    setActiveCategory('종합')
    setCategoryCache({})
    setActiveTab('사주')
    setViewMode('detail')

    try {
      const result = calculateFullSaju(
        data.year, data.month, data.day, data.hour, data.minute,
        data.calendarType, data.isLeapMonth, data.gender,
      )

      setFullResult(result)
      setAppState('result')

      fetchInterpretation(result, '종합')
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : '사주 계산 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleFollowUp() {
    if (!followUpQuestion.trim() || !fullResult || followUpLoading) return
    const question = followUpQuestion.trim()
    setFollowUpQuestion('')
    setChatHistory(prev => [...prev, { role: 'user', content: question }])
    setFollowUpLoading(true)

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saju: fullResult.saju,
          oheng: fullResult.oheng,
          sipsin: fullResult.sipsin,
          ilganStrength: fullResult.ilganStrength,
          yongsin: fullResult.yongsin,
          daeun: fullResult.daeun,
          yearlyFortune: fullResult.yearlyFortune,
          monthlyFortune: fullResult.monthlyFortune,
          category: '종합',
          followUp: question,
          stream: false,
        }),
      })
      const data = await res.json()
      if (res.ok && data.interpretation) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.interpretation }])
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.error ?? 'AI 응답 중 오류가 발생했습니다.' }])
      }
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: '네트워크 오류가 발생했습니다.' }])
    } finally {
      setFollowUpLoading(false)
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2000)
    })
  }

  async function handleSaveImage() {
    if (!resultRef.current || saveImageLoading) return
    setSaveImageLoading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: theme === 'dark' ? '#0f172a' : '#f5f0e8',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `천명_사주결과_${new Date().toISOString().slice(0, 10)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      alert('이미지 저장 중 오류가 발생했습니다.')
    } finally {
      setSaveImageLoading(false)
    }
  }

  function handleReset() {
    abortRef.current?.abort()
    setAppState('form')
    setFullResult(null)
    setAiInterpretation(null)
    setAiError(null)
    setCalcError(null)
    setActiveCategory('종합')
    setCategoryCache({})
    setChatHistory([])
    setFollowUpQuestion('')
    setActiveTab('사주')
    setViewMode('detail')
  }

  // Summary view helper
  function renderSummary() {
    if (!fullResult) return null
    const ratingEmoji = fullResult.yearlyFortune.rating === '길' ? '🟢' : fullResult.yearlyFortune.rating === '흉' ? '🔴' : '🟡'
    const aiPreview = aiInterpretation ? aiInterpretation.slice(0, 100) + (aiInterpretation.length > 100 ? '...' : '') : null

    return (
      <div className="summary-card animate-fadeIn space-y-4">
        <div className="text-center">
          <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>간략 요약</div>
        </div>

        {/* 일간 */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>일간 (日干)</span>
          <span className="text-xl font-bold" style={{ color: 'var(--text-accent)' }}>
            {fullResult.saju.dayPillar.heavenlyStemHanja} {fullResult.saju.dayPillar.heavenlyStem}
          </span>
        </div>

        {/* 신강/신약 */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>강약</span>
          <span
            className="text-lg font-bold px-3 py-0.5 rounded-full"
            style={{
              color: fullResult.ilganStrength.strength === '신강' ? '#3b82f6' : '#f97316',
              background: fullResult.ilganStrength.strength === '신강' ? 'rgba(59,130,246,0.15)' : 'rgba(249,115,22,0.15)',
            }}
          >
            {fullResult.ilganStrength.strength}
          </span>
        </div>

        {/* 용신 */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>용신 (用神)</span>
          <span className="text-lg font-bold" style={{ color: 'var(--text-accent)' }}>
            {fullResult.yongsin.yongsin}
          </span>
        </div>

        {/* 올해 운세 */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date().getFullYear()}년 운세</span>
          <span className="text-lg font-bold">
            {ratingEmoji} {fullResult.yearlyFortune.rating}
          </span>
        </div>

        {/* AI 한줄 요약 */}
        {aiPreview && (
          <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {aiPreview}
            </p>
          </div>
        )}

        <button
          onClick={() => setViewMode('detail')}
          className="w-full text-sm font-medium py-2 rounded-lg hover-scale"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          상세 보기 →
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto">
        {appState === 'form' && (
          <>
            <SajuForm onSubmit={handleFormSubmit} loading={loading} />
            {calcError && (
              <div className="mx-4 mb-8 bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm text-center">
                {calcError}
              </div>
            )}
          </>
        )}

        {appState === 'result' && fullResult && (
          <div className="animate-fadeIn py-8 px-4" ref={resultRef}>
            {/* 헤더 */}
            <div className="text-center mb-4">
              <div className="flex justify-between items-center mb-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover-scale theme-transition"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                  aria-label="테마 전환"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <div>
                  <h1 className="font-serif-kr text-3xl font-bold" style={{ color: 'var(--text-accent)' }}>천명</h1>
                  <p className="font-serif-kr text-sm tracking-widest" style={{ color: 'var(--text-muted)' }}>天命</p>
                </div>
                {/* View Mode Toggle */}
                <button
                  onClick={() => setViewMode(viewMode === 'detail' ? 'summary' : 'detail')}
                  className="px-3 py-1.5 rounded-full text-xs font-medium hover-scale theme-transition"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  {viewMode === 'detail' ? '간략' : '상세'}
                </button>
              </div>
            </div>

            {viewMode === 'summary' ? renderSummary() : (
              <>
                {/* Tab Bar */}
                <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  {RESULT_TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all hover-scale ${
                        activeTab === tab.key ? 'tab-active-pulse' : ''
                      }`}
                      style={{
                        background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
                        color: activeTab === tab.key ? 'var(--accent-text)' : 'var(--text-secondary)',
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-8 tab-panel" key={activeTab}>
                  {activeTab === '사주' && (
                    <>
                      <SajuResultCard result={fullResult.saju} />
                      <OhengChart result={fullResult.oheng} />
                    </>
                  )}

                  {activeTab === '분석' && (
                    <>
                      <SipsinChart result={fullResult.sipsin} />
                      <IlganStrengthBadge result={fullResult.ilganStrength} />
                      <YongsinCard result={fullResult.yongsin} />
                    </>
                  )}

                  {activeTab === '운세' && (
                    <>
                      <DaeunTimeline result={fullResult.daeun} />
                      <FortuneCard yearlyFortune={fullResult.yearlyFortune} monthlyFortune={fullResult.monthlyFortune} />
                    </>
                  )}

                  {activeTab === 'AI' && (
                    <>
                      {/* 카테고리 탭 */}
                      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                        {AI_CATEGORIES.map(cat => (
                          <button
                            key={cat.key}
                            onClick={() => handleCategoryChange(cat.key)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover-scale"
                            style={{
                              background: activeCategory === cat.key ? 'var(--accent)' : 'var(--bg-secondary)',
                              color: activeCategory === cat.key ? 'var(--accent-text)' : 'var(--text-secondary)',
                              border: activeCategory === cat.key ? 'none' : '1px solid var(--border-color)',
                            }}
                          >
                            {cat.icon} {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* AI 해석 */}
                      <AiInterpretation
                        interpretation={aiInterpretation}
                        loading={aiLoading}
                        error={aiError}
                        onRetry={() => fetchInterpretation(fullResult, activeCategory)}
                      />

                      {/* 후속 질문 */}
                      {chatHistory.length > 0 && (
                        <div className="space-y-3">
                          {chatHistory.map((msg, i) => (
                            <div
                              key={i}
                              className={`text-sm p-3 rounded-lg ${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}
                              style={{
                                background: msg.role === 'user'
                                  ? 'rgba(245,158,11,0.1)'
                                  : 'var(--bg-card)',
                                border: `1px solid ${msg.role === 'user' ? 'rgba(245,158,11,0.2)' : 'var(--border-color)'}`,
                                color: msg.role === 'user' ? 'var(--text-accent)' : 'var(--text-secondary)',
                              }}
                            >
                              <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                                {msg.role === 'user' ? '나' : 'AI 명리사'}
                              </span>
                              <div className="whitespace-pre-line">{msg.content}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 후속 질문 입력 */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={followUpQuestion}
                          onChange={e => setFollowUpQuestion(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleFollowUp() }}
                          placeholder="추가 질문을 입력하세요..."
                          className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors"
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                          }}
                          disabled={followUpLoading}
                        />
                        <button
                          onClick={handleFollowUp}
                          disabled={followUpLoading || !followUpQuestion.trim()}
                          className="font-bold px-4 py-2 rounded-lg transition-colors text-sm hover-scale disabled:cursor-not-allowed"
                          style={{
                            background: followUpLoading || !followUpQuestion.trim() ? 'var(--bg-secondary)' : 'var(--accent)',
                            color: followUpLoading || !followUpQuestion.trim() ? 'var(--text-muted)' : 'var(--accent-text)',
                          }}
                        >
                          {followUpLoading ? '...' : '물어보기'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* 궁합 링크 */}
            <a
              href="/gunghap"
              className="block w-full text-center font-medium py-3 px-6 rounded-lg transition-colors text-sm mt-8 hover-lift"
              style={{
                background: 'rgba(236,72,153,0.1)',
                color: '#f472b6',
                border: '1px solid rgba(236,72,153,0.3)',
              }}
            >
              💑 궁합 보기
            </a>

            {/* 공유 + 다시보기 버튼 */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSaveImage}
                disabled={saveImageLoading}
                className="flex-1 font-medium py-3 px-6 rounded-lg transition-colors text-sm hover-lift disabled:cursor-not-allowed"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {saveImageLoading ? '저장 중...' : '이미지 저장'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 font-medium py-3 px-6 rounded-lg transition-colors text-sm hover-lift"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                링크 복사
              </button>
              <button
                onClick={handleReset}
                className="flex-1 font-medium py-3 px-6 rounded-lg transition-colors text-sm hover-lift"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                다시 보기
              </button>
            </div>

            {/* 토스트 */}
            {shareToast && (
              <div
                className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-fadeIn"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                링크가 복사되었습니다!
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

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
import { calculateFullSaju, FullSajuResult } from '@/lib/saju'

type AppState = 'form' | 'result'

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

  const fetchInterpretation = useCallback(async (result: FullSajuResult, category: AiCategory) => {
    // Check cache first
    if (categoryCache[category]) {
      setAiInterpretation(categoryCache[category] ?? null)
      return
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
        backgroundColor: '#0f172a',
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
  }

  return (
    <main className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        {appState === 'form' && (
          <>
            <SajuForm onSubmit={handleFormSubmit} loading={loading} />
            {calcError && (
              <div className="mt-4 bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm text-center">
                {calcError}
              </div>
            )}
            <a href="/gunghap" className="block text-center text-slate-500 hover:text-pink-400 text-sm mt-4 transition-colors">
              💑 궁합 비교하러 가기
            </a>
          </>
        )}

        {appState === 'result' && fullResult && (
          <div className="space-y-8 animate-fadeIn" ref={resultRef}>
            {/* 헤더 */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-amber-400">천명</h1>
              <p className="text-slate-500 text-sm tracking-widest">天命</p>
            </div>

            {/* 사주팔자 */}
            <SajuResultCard result={fullResult.saju} />

            {/* 오행 차트 */}
            <OhengChart result={fullResult.oheng} />

            {/* 십신 분석 */}
            <SipsinChart result={fullResult.sipsin} />

            {/* 일간 강약 */}
            <IlganStrengthBadge result={fullResult.ilganStrength} />

            {/* 용신 */}
            <YongsinCard result={fullResult.yongsin} />

            {/* 대운 */}
            <DaeunTimeline result={fullResult.daeun} />

            {/* 세운/월운 */}
            <FortuneCard yearlyFortune={fullResult.yearlyFortune} monthlyFortune={fullResult.monthlyFortune} />

            {/* 카테고리 탭 */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {AI_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === cat.key
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                  }`}
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
                  <div key={i} className={`text-sm p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200 ml-8'
                      : 'bg-slate-800/50 border border-slate-700 text-slate-300 mr-8'
                  }`}>
                    <span className="text-xs text-slate-500 block mb-1">{msg.role === 'user' ? '나' : 'AI 명리사'}</span>
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
                className="flex-1 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                disabled={followUpLoading}
              />
              <button
                onClick={handleFollowUp}
                disabled={followUpLoading || !followUpQuestion.trim()}
                className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold px-4 py-2 rounded-lg transition-colors text-sm"
              >
                {followUpLoading ? '...' : '물어보기'}
              </button>
            </div>

            {/* 궁합 링크 */}
            <a href="/gunghap" className="block w-full text-center bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 font-medium py-3 px-6 rounded-lg transition-colors text-sm border border-pink-500/30">
              💑 궁합 보기
            </a>

            {/* 공유 + 다시보기 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveImage}
                disabled={saveImageLoading}
                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-600 text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors text-sm border border-slate-700"
              >
                {saveImageLoading ? '저장 중...' : '이미지 저장'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors text-sm border border-slate-700"
              >
                링크 복사
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors text-sm"
              >
                다시 보기
              </button>
            </div>

            {/* 토스트 */}
            {shareToast && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-fadeIn">
                링크가 복사되었습니다!
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

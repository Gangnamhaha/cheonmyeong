'use client'

import { useState, useCallback } from 'react'
import SajuForm from '@/components/SajuForm'
import SajuResultCard from '@/components/SajuResult'
import OhengChart from '@/components/OhengChart'
import AiInterpretation from '@/components/AiInterpretation'
import { calculateSajuFromBirth, SajuResult } from '@/lib/saju'
import { analyzeOheng, OhengResult } from '@/lib/oheng'

type AppState = 'form' | 'result'

interface FormData {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('form')
  const [loading, setLoading] = useState(false)
  const [sajuResult, setSajuResult] = useState<SajuResult | null>(null)
  const [ohengResult, setOhengResult] = useState<OhengResult | null>(null)
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [calcError, setCalcError] = useState<string | null>(null)

  const fetchInterpretation = useCallback(async (saju: SajuResult, oheng: OhengResult) => {
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saju, oheng }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAiError(data.error ?? 'AI 해석 중 오류가 발생했습니다.')
      } else {
        setAiInterpretation(data.interpretation)
      }
    } catch {
      setAiError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setAiLoading(false)
    }
  }, [])

  async function handleFormSubmit(data: FormData) {
    setLoading(true)
    setCalcError(null)
    setAiInterpretation(null)
    setAiError(null)

    try {
      const saju = calculateSajuFromBirth(data.year, data.month, data.day, data.hour, data.minute)
      const oheng = analyzeOheng(saju)

      setSajuResult(saju)
      setOhengResult(oheng)
      setAppState('result')

      fetchInterpretation(saju, oheng)
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : '사주 계산 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setAppState('form')
    setSajuResult(null)
    setOhengResult(null)
    setAiInterpretation(null)
    setAiError(null)
    setCalcError(null)
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
          </>
        )}

        {appState === 'result' && sajuResult && ohengResult && (
          <div className="space-y-8">
            {/* 헤더 */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-amber-400">천명</h1>
              <p className="text-slate-500 text-sm tracking-widest">天命</p>
            </div>

            {/* 사주팔자 */}
            <SajuResultCard result={sajuResult} />

            {/* 오행 차트 */}
            <OhengChart result={ohengResult} />

            {/* AI 해석 */}
            <AiInterpretation
              interpretation={aiInterpretation}
              loading={aiLoading}
              error={aiError}
              onRetry={() => fetchInterpretation(sajuResult, ohengResult)}
            />

            {/* 다시 보기 버튼 */}
            <button
              onClick={handleReset}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors text-sm"
            >
              다시 보기
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

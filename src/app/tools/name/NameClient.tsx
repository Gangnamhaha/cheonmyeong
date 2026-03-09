'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { trackShare } from '@/lib/analytics'
import { shareGunghapResult } from '@/lib/kakao'
import {
  ELEMENT_DESCRIPTIONS,
  type ElementType,
  analyzeName,
  type NameAnalysisResult,
} from '@/data/name-analysis'

const ELEMENT_LABELS: Record<ElementType, string> = {
  목: '목(木)',
  화: '화(火)',
  토: '토(土)',
  금: '금(金)',
  수: '수(水)',
}

const ELEMENT_COLORS: Record<ElementType, string> = {
  목: 'bg-emerald-400',
  화: 'bg-rose-400',
  토: 'bg-amber-400',
  금: 'bg-slate-300',
  수: 'bg-sky-400',
}

export default function NameClient() {
  const [surname, setSurname] = useState('')
  const [givenName, setGivenName] = useState('')
  const [manualInputs, setManualInputs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<NameAnalysisResult | null>(null)
  const [attempted, setAttempted] = useState(false)

  const parsedManualStrokes = useMemo(() => {
    const parsed: Record<string, number> = {}
    for (const [key, value] of Object.entries(manualInputs)) {
      const num = Number(value)
      if (Number.isFinite(num) && num > 0) {
        parsed[key] = Math.round(num)
      }
    }
    return parsed
  }, [manualInputs])

  const hasName = surname.trim().length > 0 && givenName.trim().length > 0

  function runAnalysis() {
    if (!hasName) return
    const analyzed = analyzeName(surname, givenName, parsedManualStrokes)
    setResult(analyzed)
    setAttempted(true)
  }

  const maxElementCount = result ? Math.max(...Object.values(result.elementDistribution), 1) : 1

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-200">이름 획수 오행 분석기</h2>
        <button
          type="button"
          onClick={() => {
            setSurname('')
            setGivenName('')
            setManualInputs({})
            setResult(null)
            setAttempted(false)
          }}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
        >
          다시 분석하기
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-200">성(姓)</span>
          <input
            value={surname}
            onChange={(event) => setSurname(event.target.value.replace(/\s+/g, '').slice(0, 2))}
            placeholder="예: 김"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-200">이름(名)</span>
          <input
            value={givenName}
            onChange={(event) => setGivenName(event.target.value.replace(/\s+/g, '').slice(0, 3))}
            placeholder="예: 서준"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={runAnalysis}
        className="mt-4 w-full rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-sm font-bold text-amber-200 transition-colors hover:bg-amber-500/25"
      >
        분석하기
      </button>

      {!hasName && attempted ? (
        <p className="mt-4 rounded-lg border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-xs text-rose-200">
          성과 이름을 모두 입력해주세요.
        </p>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-4 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-4 animate-in fade-in-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-300">
              분석 이름: <span className="font-bold text-amber-200">{result.fullName}</span>
            </p>
            <p className={`text-sm font-bold ${result.fortune.colorClass}`}>
              총 {result.totalStrokes}획 · {result.fortune.rating}
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3 text-sm text-slate-200">
            <p className="font-semibold text-amber-200">{result.fortune.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">{result.fortune.description}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{result.strokeMeaning}</p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-300">글자별 획수</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {result.characterBreakdown.map((item, index) => (
                <div key={`${item.char}-${index}`} className="rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                  <span className="font-semibold text-slate-100">{item.char}</span>
                  {' · '}
                  {item.stroke === null ? '미확인' : `${item.stroke}획`}
                  {item.element ? ` · ${ELEMENT_LABELS[item.element]}` : ''}
                </div>
              ))}
            </div>

            {result.missingCharacters.length > 0 ? (
              <div className="mt-3 space-y-2 rounded-lg border border-orange-900/40 bg-orange-950/20 p-3">
                <p className="text-xs text-orange-200">이 글자의 획수를 직접 입력해주세요</p>
                {result.characterBreakdown.map((item, index) => {
                  if (item.stroke !== null) return null
                  return (
                    <label key={`manual-${item.char}-${index}`} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-10 rounded bg-slate-800 px-2 py-1 text-center font-semibold text-slate-100">{item.char}</span>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={manualInputs[`${index}`] ?? ''}
                        onChange={(event) => setManualInputs((prev) => ({ ...prev, [`${index}`]: event.target.value }))}
                        className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus:border-amber-400 focus:outline-none"
                      />
                      <span>획</span>
                    </label>
                  )
                })}
                <button
                  type="button"
                  onClick={runAnalysis}
                  className="rounded-lg border border-orange-700/50 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200"
                >
                  입력값으로 다시 분석
                </button>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <p className="mb-3 text-xs font-semibold text-slate-300">오행 분포</p>
            <div className="space-y-2">
              {(Object.keys(result.elementDistribution) as ElementType[]).map((element) => {
                const count = result.elementDistribution[element]
                const width = Math.max((count / maxElementCount) * 100, count > 0 ? 18 : 8)
                return (
                  <div key={element} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{ELEMENT_LABELS[element]}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div className={`h-2 rounded-full ${ELEMENT_COLORS[element]}`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3">
              <p className="mb-1 text-xs font-semibold text-emerald-300">
                주도 오행: {ELEMENT_LABELS[result.dominantElement]}
              </p>
              <p className="text-xs leading-relaxed text-slate-300">{result.dominantElementDescription.personality}</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {result.dominantElementDescription.strengths.map((strength) => (
                  <li key={strength}>• {strength}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-emerald-100">직업 성향: {result.dominantElementDescription.careerTendency}</p>
            </div>
            <div className="rounded-lg border border-sky-900/40 bg-sky-950/20 p-3 text-xs text-slate-300">
              <p className="mb-1 font-semibold text-sky-300">궁합 오행 참고</p>
              <p>잘 맞는 오행: {result.compatibility.compatible.map((e) => ELEMENT_LABELS[e]).join(', ')}</p>
              <p className="mt-1">충돌 주의 오행: {result.compatibility.conflicting.map((e) => ELEMENT_LABELS[e]).join(', ')}</p>
              <p className="mt-2 leading-relaxed text-slate-400">{result.compatibility.summary}</p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-xs leading-relaxed text-amber-100">
            <span className="font-semibold text-amber-300">행운 포인트:</span>{' '}
            숫자 {result.lucky.numbers.join(', ')} · 컬러 {result.lucky.colors.join(', ')}
          </div>

          <p className="text-xs leading-relaxed text-slate-400">{result.detailedInterpretation}</p>

          <div className="grid gap-2 pt-1 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                shareGunghapResult({ person1: result.fullName, person2: '이름풀이 결과', score: result.totalStrokes })
                trackShare('kakao', 'name-analysis')
              }}
              className="w-full rounded-lg py-3 text-sm font-bold transition-transform duration-200 hover:scale-[1.01]"
              style={{ background: '#FEE500', color: '#191919' }}
            >
              카카오톡으로 공유하기
            </button>
            <Link
              href="/saju/free"
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-500/20"
            >
              내 사주로 더 정확한 분석 받기 →
            </Link>
          </div>
        </div>
      ) : null}

      <p className="mt-4 text-center text-xs text-slate-500">
        이름 오행 분석은 전통 획수 이론 기반의 참고 콘텐츠이며 법적/의학적 효력을 갖지 않습니다.
      </p>
    </section>
  )
}

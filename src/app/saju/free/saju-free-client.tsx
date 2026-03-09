'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SajuForm from '@/components/SajuForm'

type SajuFormData = {
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

export default function SajuFreeClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleSubmit(_: SajuFormData) {
    setLoading(true)
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-5xl px-4 pb-8 pt-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h1 className="font-serif-kr text-3xl font-black text-amber-400">무료 AI 사주팔자 풀이</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            천명은 전통 명리학 구조를 바탕으로 오행, 십신, 용신의 핵심을 쉽게 해석해 드립니다.
            무료로 시작해 내 성향, 연애 흐름, 일과 재물의 방향을 빠르게 확인해 보세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
              메인 분석 바로가기
            </Link>
            <Link href="/fortune/today" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              오늘의 운세 보기
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              요금제 확인
            </Link>
          </div>
        </div>
      </section>

      <section>
        <SajuForm onSubmit={handleSubmit} loading={loading} />
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">자주 묻는 질문</h2>
          <div className="mt-5 space-y-5 text-sm leading-relaxed text-slate-300">
            <div>
              <h3 className="mb-1 font-semibold text-slate-100">사주팔자란?</h3>
              <p>
                사주팔자는 태어난 연, 월, 일, 시의 천간과 지지를 통해 기질과 흐름을 해석하는 전통 체계입니다.
                내게 강한 오행과 약한 오행을 파악하면 선택의 기준이 선명해집니다.
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-slate-100">어떤 정보가 필요한가요?</h3>
              <p>
                생년월일, 태어난 시간, 성별, 양력/음력 정보가 있으면 가장 정확합니다. 시간이 불분명해도 기본 분석은
                가능하며, 결과 해석에서 변동 가능성을 함께 안내합니다.
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-slate-100">AI 해석은 정확한가요?</h3>
              <p>
                천명 AI는 명리학 계산 로직과 해석 프레임을 결합해 일관성 있게 설명합니다. 최종 판단은 본인의 상황과
                함께 보되, 방향성과 우선순위를 잡는 데 실질적인 도움을 받을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

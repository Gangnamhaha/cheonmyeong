'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']
const STEM_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCH_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const STEM_ELEMENTS = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수']

const ELEMENT_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  목: { bg: 'rgba(34,197,94,0.18)', text: '#4ade80', border: 'rgba(34,197,94,0.4)' },
  화: { bg: 'rgba(249,115,22,0.2)', text: '#fb923c', border: 'rgba(249,115,22,0.45)' },
  토: { bg: 'rgba(245,158,11,0.2)', text: '#fbbf24', border: 'rgba(245,158,11,0.45)' },
  금: { bg: 'rgba(148,163,184,0.26)', text: '#e2e8f0', border: 'rgba(148,163,184,0.5)' },
  수: { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa', border: 'rgba(59,130,246,0.45)' },
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function getDayPillar(year: number, month: number, day: number) {
  const ref = new Date(2000, 0, 7)
  const target = new Date(year, month - 1, day)
  const diff = Math.floor((target.getTime() - ref.getTime()) / 86400000)
  const idx = ((diff % 60) + 60) % 60
  const stemIdx = idx % 10
  const branchIdx = idx % 12

  return {
    stem: STEMS[stemIdx],
    branch: BRANCHES[branchIdx],
    stemHanja: STEM_HANJA[stemIdx],
    branchHanja: BRANCH_HANJA[branchIdx],
    element: STEM_ELEMENTS[stemIdx],
  }
}

function formatMonthLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
}

export default function SajuCalendarClient() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const today = useMemo(() => new Date(), [])

  const monthGrid = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const startWeekday = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: Array<{ date: Date | null }> = []

    for (let i = 0; i < startWeekday; i += 1) {
      cells.push({ date: null })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(year, month, day) })
    }

    while (cells.length % 7 !== 0) {
      cells.push({ date: null })
    }

    return cells
  }, [currentMonth])

  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: '사주 달력 - 일별 오행 흐름',
      description:
        '사주 달력으로 매일의 천간지지와 오행 흐름을 확인하고 오늘의 기운을 해석할 수 있습니다. 월 단위로 일진의 변화를 한눈에 보여줍니다.',
      inLanguage: 'ko-KR',
      isPartOf: {
        '@type': 'WebSite',
        name: '사주해',
        url: 'https://sajuhae.vercel.app',
      },
      url: 'https://sajuhae.vercel.app/saju/calendar',
    }),
    []
  )

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="mx-auto w-full max-w-6xl">
        <header className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 20% 25%, rgba(34,197,94,0.25), transparent 45%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.2), transparent 40%), radial-gradient(circle at 50% 80%, rgba(245,158,11,0.18), transparent 40%)' }} />
          <div className="relative">
            <p className="text-xs tracking-[0.2em] text-emerald-300">DAILY SEXAGENARY CYCLE</p>
            <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-300 sm:text-4xl">사주 달력</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
              매일 바뀌는 천간과 지지를 달력으로 확인하고, 해당 날짜의 오행 기운이 어떤 결을 가지는지 빠르게 읽어보세요.
              일진의 흐름은 단순한 날짜 정보가 아니라, 내 원국의 리듬과 만나면서 실제 체감 운으로 드러납니다.
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
            >
              ← 이전 달
            </button>
            <h2 className="font-serif-kr text-xl font-bold text-amber-200 sm:text-2xl">{formatMonthLabel(currentMonth)}</h2>
            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
            >
              다음 달 →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {WEEKDAYS.map(day => (
              <div key={day} className="rounded-lg bg-slate-800 py-2 text-xs font-bold text-slate-300 sm:text-sm">
                {day}
              </div>
            ))}

            {monthGrid.map((cell, index) => {
              if (!cell.date) {
                return <div key={`empty-${index}`} className="h-24 rounded-xl border border-dashed border-slate-800/80 bg-slate-900/40 sm:h-28" />
              }

              const day = cell.date.getDate()
              const pillar = getDayPillar(cell.date.getFullYear(), cell.date.getMonth() + 1, day)
              const style = ELEMENT_STYLE[pillar.element]
              const isToday =
                cell.date.getFullYear() === today.getFullYear() &&
                cell.date.getMonth() === today.getMonth() &&
                day === today.getDate()

              return (
                <div
                  key={cell.date.toISOString()}
                  className="flex h-24 flex-col justify-between rounded-xl border p-2 text-left sm:h-28"
                  style={{
                    background: style.bg,
                    color: style.text,
                    borderColor: isToday ? 'var(--accent)' : style.border,
                    boxShadow: isToday ? '0 0 0 1px var(--accent), 0 8px 24px rgba(251,191,36,0.2)' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 sm:text-sm">{day}</span>
                    {isToday && <span className="rounded-full bg-amber-300/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">TODAY</span>}
                  </div>
                  <div>
                    <p className="font-serif-kr text-lg font-bold leading-none sm:text-xl">{pillar.stemHanja}{pillar.branchHanja}</p>
                    <p className="mt-1 text-[11px] text-slate-200 sm:text-xs">{pillar.stem}{pillar.branch} · {pillar.element}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">사주 달력 해석 가이드</h2>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            사주 달력은 단순히 날짜를 보여주는 기능이 아니라, 오늘 하루에 흐르는 기운의 결을 빠르게 읽고 행동의 우선순위를 조정할 수 있도록 만든 실전형 도구입니다.
            천간은 표면으로 드러나는 에너지와 의사결정의 방향성을 나타내고, 지지는 그 에너지가 실제 생활 환경에서 어떻게 작동하는지 보여줍니다.
            예를 들어 같은 화(火) 기운이라도, 어떤 날은 추진력과 표현력이 살아나고 어떤 날은 과열로 인해 갈등이 생기기 쉬운 방식으로 나타납니다.
            그래서 달력에서 확인한 일진은 반드시 내 원국의 강약, 용신, 그리고 현재 대운 흐름과 함께 읽어야 정확도가 높아집니다.
            목(木) 기운이 강한 날은 새 계획을 시작하거나 관계를 확장하기에 좋고, 금(金) 기운이 강한 날은 정리, 계약, 점검처럼 기준을 세우는 작업에 유리합니다.
            토(土) 기운은 균형과 조율, 수(水) 기운은 학습과 회복, 화(火) 기운은 표현과 실행에서 힘을 발휘하는 경향이 큽니다.
            다만 일진 해석은 절대적인 예언이 아니라 선택의 질을 높이는 참고 지도입니다.
            오늘 기운이 나와 충돌하는 날이라면 중요한 결정을 미루기보다, 소통 방식을 바꾸거나 실행 강도를 조절하는 방식으로 리스크를 줄일 수 있습니다.
            반대로 조화로운 날에는 평소보다 한 단계 큰 액션을 취해 성과를 끌어올릴 수 있습니다.
            이 페이지는 월 단위로 흐름을 한눈에 확인하도록 설계했으니, 개인 분석 결과와 함께 보면 일상에서 바로 쓰는 운세 전략 도구로 활용할 수 있습니다.
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <h3 className="font-serif-kr text-xl font-bold text-emerald-300">무료 사주 분석으로 정확도 높이기</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              달력의 일진은 공통 흐름입니다. 생년월일시를 입력해 나만의 원국·오행·용신을 함께 보면 같은 날짜도 전혀 다르게 해석됩니다.
            </p>
            <Link
              href="/saju/free"
              className="mt-4 inline-flex rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-black text-slate-900 transition hover:bg-emerald-300"
            >
              무료 사주 분석 시작하기 →
            </Link>
          </div>
        </section>

        <section className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/fortune/today" className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
            오늘의 운세 보기
          </Link>
          <Link href="/guide/oheng" className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
            오행 기초 가이드
          </Link>
          <Link href="/guide/saju-basics" className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
            사주 입문 가이드
          </Link>
          <Link href="/gunghap" className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
            무료 궁합 보기
          </Link>
        </section>
      </div>
    </main>
  )
}

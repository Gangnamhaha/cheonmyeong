import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MONTH_SLUGS, getMonthlyFortune } from '@/data/monthly-fortune'

type Params = {
  params: {
    month: string
  }
}

function getSeasonPath(month: number) {
  if (month === 12 || month <= 2) {
    return '/fortune/2026/winter'
  }
  if (month <= 5) {
    return '/fortune/2026/spring'
  }
  if (month <= 8) {
    return '/fortune/2026/summer'
  }
  return '/fortune/2026/fall'
}

function getSeasonLabel(month: number) {
  if (month === 12 || month <= 2) {
    return '겨울 운세'
  }
  if (month <= 5) {
    return '봄 운세'
  }
  if (month <= 8) {
    return '여름 운세'
  }
  return '가을 운세'
}

export function generateStaticParams() {
  return MONTH_SLUGS.map(month => ({ month }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const monthNumber = Number(params.month)
  const monthlyData = getMonthlyFortune(monthNumber)

  if (!monthlyData) {
    return {
      title: '2026년 월별 운세 | 사주해',
      description: '2026년 병오년 월별 띠별 운세를 확인하세요.',
    }
  }

  const title = `2026년 ${monthlyData.monthName} 운세 - 병오년 ${monthlyData.monthName} 띠별 운세 | 사주해`
  const description = `2026년 병오년 ${monthlyData.monthName} 띠별 운세 총정리. ${monthlyData.overview}`

  return {
    title,
    description,
    keywords: [
      `2026년 ${monthlyData.monthName} 운세`,
      `병오년 ${monthlyData.monthName}`,
      `${monthlyData.monthName} 운세`,
      `${monthlyData.monthName} 띠별 운세`,
      `2026 ${monthlyData.monthName} 사주`,
      '사주해',
    ],
    alternates: {
      canonical: `/fortune/2026/month/${monthlyData.month}`,
    },
  }
}

export default function Fortune2026MonthPage({ params }: Params) {
  const monthNumber = Number(params.month)
  const monthlyData = getMonthlyFortune(monthNumber)

  if (!monthlyData) {
    notFound()
  }

  const previousMonth = monthNumber === 1 ? 12 : monthNumber - 1
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1
  const seasonPath = getSeasonPath(monthNumber)
  const seasonLabel = getSeasonLabel(monthNumber)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `2026년 ${monthlyData.monthName} 운세 - 병오년 ${monthlyData.monthName} 띠별 운세`,
    description: monthlyData.overview,
    datePublished: `2026-${String(monthNumber).padStart(2, '0')}-01`,
    dateModified: `2026-${String(monthNumber).padStart(2, '0')}-01`,
    author: {
      '@type': 'Organization',
      name: '사주해',
    },
    publisher: {
      '@type': 'Organization',
      name: '사주해',
    },
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="mx-auto max-w-5xl">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <p className="text-xs text-slate-400">월간 특집</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">🗓️ 2026년 {monthlyData.monthName} 운세</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{monthlyData.overview}</p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {monthlyData.zodiacFortunes.map(item => (
            <article key={item.animal} className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5">
              <h2 className="font-serif-kr text-xl font-bold text-amber-300">
                {item.icon} {item.animal}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.p1}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.p2}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">이 달의 운세 팁</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{monthlyData.monthlyTip}</p>
        </section>

        <section className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">개인 사주로 {monthlyData.monthName} 운세를 정밀 분석하세요</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            월별 띠 운세는 공통 흐름을 보여주고, 실제 타이밍은 개인 사주 원국과 대운의 조합에서 달라집니다. 무료 분석으로 지금 내게 유리한
            선택을 구체적으로 확인해 보세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
              무료 사주 분석 시작하기 →
            </Link>
            <Link href="/fortune/2026" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              2026년 연간 운세
            </Link>
            <Link href="/fortune/today" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              오늘의 운세 보기
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              프리미엄 해석 보기
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">함께 보면 좋은 운세 페이지</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/fortune/2026/month/${previousMonth}`}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
            >
              이전 달 ({previousMonth}월) 운세
            </Link>
            <Link
              href={`/fortune/2026/month/${nextMonth}`}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
            >
              다음 달 ({nextMonth}월) 운세
            </Link>
            <Link href={seasonPath} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              2026년 {seasonLabel}
            </Link>
            <Link href="/fortune/2026" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              2026년 연간 운세
            </Link>
            <Link href="/blog" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              운세 칼럼 보러 가기
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

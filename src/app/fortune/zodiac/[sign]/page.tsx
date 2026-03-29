import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WESTERN_ZODIAC, getZodiacBySlug } from '@/data/western-zodiac'
import { SITE_URL } from '@/lib/constants'

type Params = {
  params: {
    sign: string
  }
}

export const revalidate = 3600

export function generateStaticParams() {
  return WESTERN_ZODIAC.map((zodiac) => ({ sign: zodiac.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const zodiac = getZodiacBySlug(params.sign)

  if (!zodiac) {
    return {
      title: '별자리 운세 | 사주해',
      description: '사주해에서 2026년 별자리 운세를 확인해 보세요.',
    }
  }

  const title = `${zodiac.korean} 운세 2026 - ${zodiac.korean} 성격 재물운 연애운 | 사주해`
  const description = `2026년 병오년 ${zodiac.korean}(${zodiac.english}) 운세 총정리. 성격, 연애운, 직업운, 재물운, 건강운과 궁합 좋은 별자리까지 한눈에 확인하세요.`

  return {
    title,
    description,
    keywords: [`${zodiac.korean} 운세`, `${zodiac.korean} 2026`, `${zodiac.korean} 성격`, `${zodiac.korean} 궁합`, '별자리 운세', '사주해'],
    alternates: {
      canonical: `/fortune/zodiac/${zodiac.slug}`,
    },
  }
}

export default function ZodiacSignPage({ params }: Params) {
  const zodiac = getZodiacBySlug(params.sign)

  if (!zodiac) {
    notFound()
  }

  const currentIndex = WESTERN_ZODIAC.findIndex((item) => item.slug === zodiac.slug)
  const previousSign = WESTERN_ZODIAC[(currentIndex - 1 + WESTERN_ZODIAC.length) % WESTERN_ZODIAC.length]
  const nextSign = WESTERN_ZODIAC[(currentIndex + 1) % WESTERN_ZODIAC.length]
  const compatibleSigns = zodiac.compatibleSigns
    .map((slug) => getZodiacBySlug(slug))
    .filter((item): item is (typeof WESTERN_ZODIAC)[number] => Boolean(item))

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${zodiac.korean} 운세 2026 - ${zodiac.korean} 성격 재물운 연애운`,
    description: zodiac.overview,
    datePublished: '2026-01-01',
    dateModified: '2026-01-01',
    author: {
      '@type': 'Organization',
      name: '사주해',
    },
    publisher: {
      '@type': 'Organization',
      name: '사주해',
    },
    mainEntityOfPage: `${SITE_URL}/fortune/zodiac/${zodiac.slug}`,
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <p className="text-xs text-slate-400">2026 병오년 서양 별자리 운세</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">
            {zodiac.icon} {zodiac.korean} ({zodiac.english}) 운세 2026
          </h1>
          <p className="mt-2 text-xs text-slate-400">생일 구간: {zodiac.dateRange} · 원소: {zodiac.element}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{zodiac.overview}</p>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">{zodiac.korean} 성격과 2026 핵심 흐름</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{zodiac.fortune2026.overall}</p>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">2026 세부 운세 카드</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 lg:col-span-2">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">전체운</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{zodiac.fortune2026.overall}</p>
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">연애운</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{zodiac.fortune2026.love}</p>
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">직업운</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{zodiac.fortune2026.career}</p>
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">재물운</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{zodiac.fortune2026.money}</p>
            </article>
            <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">건강운</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{zodiac.fortune2026.health}</p>
            </article>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="font-serif-kr text-xl font-bold text-amber-300">행운 포인트</h2>
            <p className="mt-3 text-sm text-slate-300">행운의 색상: {zodiac.luckyColor}</p>
            <p className="mt-1 text-sm text-slate-300">행운의 숫자: {zodiac.luckyNumber}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="font-serif-kr text-xl font-bold text-amber-300">궁합 좋은 별자리</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {compatibleSigns.map((item) => (
                <Link
                  key={item.slug}
                  href={`/fortune/zodiac/${item.slug}`}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
                >
                  {item.icon} {item.korean}
                </Link>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">다음 별자리도 이어서 보기</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/fortune/zodiac/${previousSign.slug}`}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
            >
              이전 별자리: {previousSign.icon} {previousSign.korean}
            </Link>
            <Link
              href={`/fortune/zodiac/${nextSign.slug}`}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
            >
              다음 별자리: {nextSign.icon} {nextSign.korean}
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">함께 보면 좋은 운세와 도구</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/fortune/2026/month/3" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              3월 운세
            </Link>
            <Link href="/fortune/2026/month/6" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              6월 운세
            </Link>
            <Link href="/fortune/2026/month/9" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              9월 운세
            </Link>
            <Link href="/fortune/2026/month/12" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              12월 운세
            </Link>
            <Link href="/blog" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              운세 블로그
            </Link>
            <Link href="/tools/mbti" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              MBTI 궁합
            </Link>
            <Link href="/tools/bloodtype" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              혈액형 궁합
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">무료 사주로 내 2026 운세 타이밍 확인하기</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            별자리 운세는 공통 흐름을 보여주고, 실제 결과는 생년월일시 기반 사주에서 더 정밀하게 달라집니다. 병오년의 기회를 놓치지 않도록
            지금 내 사주로 연애, 재물, 커리어 타이밍을 자세히 확인해 보세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/saju/free" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 transition hover:bg-amber-400">
              무료 사주 분석 시작하기
            </Link>
            <Link href="/fortune/2026" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              2026년 연간 운세 보기
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

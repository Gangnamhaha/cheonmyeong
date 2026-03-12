import type { Metadata } from 'next'
import Link from 'next/link'
import { BLOG_ARTICLES } from '@/data/blog-articles'

export const metadata: Metadata = {
  title: '사주 운세 블로그 - 명리학 가이드 | 사주해',
  description: '사주, 궁합, 삼재, 오행, 대운까지 검색 수요가 높은 핵심 주제를 깊이 있게 다루는 사주해 블로그입니다.',
  keywords: ['사주 블로그', '운세 블로그', '명리학 가이드', '사주 보는법', '궁합 보는법'],
}

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto w-full max-w-6xl">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <p className="text-xs text-slate-400">Cheonmyeong Insight</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">사주 운세 블로그</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            사주 기초부터 궁합, 대운, 2026년 흐름까지 검색량이 높은 핵심 질문을 실전적으로 정리했습니다.
          </p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {BLOG_ARTICLES.map(article => (
            <article key={article.slug} className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-amber-400/60">
              <p className="text-xs text-slate-400">{article.date}</p>
              <h2 className="font-serif-kr mt-2 text-xl font-bold text-amber-300 transition group-hover:text-amber-200">{article.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">{article.description}</p>
              <div className="mt-5">
                <Link href={`/blog/${article.slug}`} className="text-sm font-semibold text-amber-300 transition hover:text-amber-200">
                  글 읽기 →
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

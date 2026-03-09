import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BLOG_ARTICLES, BLOG_ARTICLE_SLUGS, getBlogArticleBySlug } from '@/data/blog-articles'

type Params = { params: { slug: string } }

export function generateStaticParams() {
  return BLOG_ARTICLE_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const article = getBlogArticleBySlug(params.slug)

  if (!article) {
    return {
      title: '블로그 | 천명',
      description: '사주와 운세를 쉽게 풀어낸 천명 블로그입니다.',
    }
  }

  return {
    title: `${article.title} | 천명 블로그`,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
  }
}

function buildFaqSchema(slug: string) {
  const article = getBlogArticleBySlug(slug)
  if (!article) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

export default function BlogArticlePage({ params }: Params) {
  const article = getBlogArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = BLOG_ARTICLES.filter(item => item.slug !== article.slug).slice(0, 3)
  const faqSchema = buildFaqSchema(article.slug)
  const contentParagraphs = article.content.split('\n\n').filter(Boolean)

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      {faqSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /> : null}

      <article className="mx-auto w-full max-w-4xl">
        <nav className="mb-5 text-xs text-slate-400">
          <Link href="/" className="hover:text-amber-300">
            홈
          </Link>{' '}
          &gt;{' '}
          <Link href="/blog" className="hover:text-amber-300">
            블로그
          </Link>{' '}
          &gt; <span className="text-slate-300">{article.title}</span>
        </nav>

        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <p className="text-xs text-slate-400">{article.date}</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">{article.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{article.description}</p>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <div className="space-y-4 text-sm leading-7 text-slate-200">
            {contentParagraphs.map((paragraph, index) => (
              <p key={`${article.slug}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">자주 묻는 질문</h2>
          <div className="mt-4 space-y-4">
            {article.faqs.map((faq, index) => (
              <div key={`${article.slug}-faq-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-sm font-semibold text-amber-200">Q. {faq.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">A. {faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">천명 서비스 바로가기</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/saju/free" className="rounded-lg border border-slate-700 px-4 py-2 hover:border-amber-400 hover:text-amber-300">
              무료 사주풀이
            </Link>
            <Link href="/gunghap/free" className="rounded-lg border border-slate-700 px-4 py-2 hover:border-amber-400 hover:text-amber-300">
              무료 궁합 보기
            </Link>
            <Link href="/fortune/today" className="rounded-lg border border-slate-700 px-4 py-2 hover:border-amber-400 hover:text-amber-300">
              오늘의 운세
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">관련 글</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {relatedArticles.map(item => (
              <Link key={item.slug} href={`/blog/${item.slug}`} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-amber-400/60">
                <p className="text-xs text-slate-400">{item.date}</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{item.title}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm">
          <Link href="/" className="font-bold text-amber-300 hover:text-amber-200">
            내 사주 무료로 분석하기 →
          </Link>
        </section>
      </article>
    </main>
  )
}

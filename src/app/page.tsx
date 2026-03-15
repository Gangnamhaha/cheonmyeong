import type { Metadata } from 'next'
import Link from 'next/link'
import HomeClient from './HomeClient'
import SocialProof from '@/components/SocialProof'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '사주팔자란 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '사주팔자는 태어난 연월일시를 바탕으로 음양오행의 흐름을 읽어 성향, 강점, 인간관계, 진로, 재물운을 해석하는 전통 명리학 체계입니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'AI 사주 해석은 정확한가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '사주해는 전통 명리학 규칙으로 계산한 사주 원국 데이터를 기반으로 AI가 구조화된 설명을 제공해 일관성과 가독성을 높였습니다. 개인의 선택과 환경에 따라 결과는 달라질 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '무료로 사주를 볼 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '네. 기본 사주 분석, 오행 분포, 십신 해석, 올해 운세와 같은 핵심 기능은 무료로 이용할 수 있으며 필요에 따라 유료 리포트를 선택할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '궁합 분석도 가능한가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '가능합니다. 궁합 분석 페이지에서 두 사람의 생년월일시를 입력하면 오행 균형, 관계 궁합 포인트, 보완 방향을 함께 확인할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '사주 해석 비용은 얼마인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '기본 해석은 무료이며, 심화 리포트는 요금제에 따라 선택할 수 있습니다. 최신 가격과 제공 범위는 요금제 페이지에서 확인할 수 있습니다.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: '사주해 - AI 사주팔자 무료 풀이 | 사주 운세 궁합',
  description:
    '무료 사주팔자 분석, AI 맞춤 운세 해석, 궁합 분석, 오행·십신·대운 진단까지 한 번에 확인하는 사주해 사주 서비스.',
  keywords: [
    '사주',
    '사주팔자',
    '무료 사주',
    '운세',
    'AI 사주',
    '궁합',
    '오행',
    '십신',
    '대운',
    '명리학',
  ],
}

export default function Home() {
  return (
    <>
      <section style={{ background: 'var(--bg-secondary)' }} className="px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
            AI 사주팔자 무료 풀이
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            생년월일시를 입력하면 오행 균형, 십신 구조, 일간 강약, 용신 방향을 분석하고 AI가 맞춤 해석을 제공합니다.
          </p>

          <div className="grid grid-cols-4 gap-2">
            <Link href="/" className="rounded-lg px-3 py-2 text-xs text-center font-medium transition-all hover:scale-[1.02]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--accent)' }}>
              무료 사주
            </Link>
            <Link href="/gunghap" className="rounded-lg px-3 py-2 text-xs text-center font-medium transition-all hover:scale-[1.02]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--accent)' }}>
              궁합 분석
            </Link>
            <Link href="/fortune/today" className="rounded-lg px-3 py-2 text-xs text-center font-medium transition-all hover:scale-[1.02]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--accent)' }}>
              오늘의 운세
            </Link>
            <Link href="/pricing" className="rounded-lg px-3 py-2 text-xs text-center font-medium transition-all hover:scale-[1.02]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--accent)' }}>
              요금제
            </Link>
          </div>

          <SocialProof />

          {/* SEO content — visually compact, crawlable */}
          <details className="group">
            <summary className="text-xs font-medium cursor-pointer list-none flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <span className="group-open:rotate-90 transition-transform">▶</span> 자주 묻는 질문
            </summary>
            <div className="mt-2 rounded-xl p-3 space-y-1.5 text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <p><strong style={{ color: 'var(--text-primary)' }}>사주팔자란?</strong> 태어난 연월일시의 천간·지지 8자로 성향과 운세를 읽는 전통 명리학입니다.</p>
              <p><strong style={{ color: 'var(--text-primary)' }}>AI 해석이 정확한가요?</strong> 전통 규칙 기반 계산 + AI 구조화 해석으로 일관된 결과를 제공합니다.</p>
              <p><strong style={{ color: 'var(--text-primary)' }}>무료인가요?</strong> 기본 분석은 무료, 심화 리포트는 요금제에서 선택할 수 있습니다.</p>
              <p><strong style={{ color: 'var(--text-primary)' }}>궁합도 되나요?</strong> 두 사람의 생년월일시를 입력하면 오행 궁합과 보완 방향을 분석합니다.</p>
            </div>
          </details>

          {/* Hidden SEO text for crawlers — visually collapsed */}
          <div className="sr-only" aria-hidden="true">
            <p>사주해는 전통 명리학 계산 로직과 AI 해석 엔진을 결합해 누구나 쉽게 이해할 수 있는 사주 분석을 제공합니다. 단순한 길흉 판정보다 실생활에 도움이 되는 해석에 집중해 연애와 인간관계, 직업과 재물, 건강과 생활 루틴까지 연결해 안내합니다. 대운과 세운의 흐름을 참고해 시기별 의사결정에 필요한 인사이트를 제공하며, 궁합 분석을 통해 두 사람의 에너지 궁합과 보완 지점을 함께 살펴볼 수 있습니다.</p>
          </div>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        </div>
      </section>

      <HomeClient />
    </>
  )
}

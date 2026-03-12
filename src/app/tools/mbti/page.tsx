import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import MbtiClient from './MbtiClient'

export function generateMetadata(): Metadata {
  return {
    title: 'MBTI 궁합 테스트 - 16가지 성격유형 궁합 분석 | 사주해',
    description:
      'MBTI 16가지 성격유형 궁합을 쉽고 재미있게 확인하세요. 나의 MBTI와 상대 MBTI를 선택하면 궁합 점수, 강점, 주의 포인트, 현실적인 관계 조언까지 한 번에 확인할 수 있습니다.',
    keywords: [
      'MBTI 궁합',
      'MBTI 궁합 테스트',
      '16가지 성격유형',
      '연애 궁합',
      '성격 궁합',
      '무료 궁합 테스트',
      'ISTJ 궁합',
      'ENFP 궁합',
    ],
  }
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'MBTI 궁합은 정말 정확한가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MBTI 궁합은 관계의 성향과 소통 스타일을 빠르게 파악하는 참고 도구입니다. 절대적인 정답보다는 서로의 차이를 이해하고 대화 방식을 조정하는 데 활용할 때 가장 유용합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '같은 MBTI면 무조건 잘 맞나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '같은 MBTI는 공감대가 빠르게 형성되는 장점이 있지만, 비슷한 약점이 겹칠 수도 있습니다. 궁합은 유형보다도 실제 소통 습관과 갈등 해결 방식에 따라 크게 달라집니다.',
      },
    },
    {
      '@type': 'Question',
      name: 'MBTI 궁합 결과를 연애에 어떻게 활용하면 좋나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '강점 항목은 관계의 장점으로 키우고, 주의 항목은 갈등 예방 규칙으로 활용하면 좋습니다. 예를 들어 연락 빈도, 대화 타이밍, 감정 표현 방식을 합의하면 체감 궁합이 크게 좋아집니다.',
      },
    },
    {
      '@type': 'Question',
      name: '더 정확한 궁합 분석은 어디서 볼 수 있나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MBTI 궁합으로 관계의 성향을 가볍게 확인한 뒤, 생년월일시 기반 사주 궁합에서 더 정밀한 흐름과 보완 포인트를 확인하는 것을 추천합니다.',
      },
    },
  ],
}

const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '사주해 MBTI 궁합 테스트',
  description:
    '두 사람의 MBTI를 선택하면 궁합 점수, 성향 매치 분석, 관계 강점과 주의 포인트를 확인할 수 있는 무료 도구',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  inLanguage: 'ko-KR',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  url: 'https://sajuhae.vercel.app/tools/mbti',
}

const RELATED_LINKS = [
  { href: '/tools/bloodtype', title: '혈액형 궁합 테스트', description: 'A/B/O/AB 조합으로 관계 케미를 가볍게 확인해보세요.' },
  { href: '/gunghap', title: '사주 궁합 정밀 분석', description: 'MBTI 이후 생년월일 기반 궁합으로 깊게 확장해보세요.' },
  { href: '/saju/free', title: '무료 사주풀이', description: '내 기질과 운 흐름을 무료로 확인해보세요.' },
  { href: '/blog', title: '궁합/운세 블로그', description: '관계와 운세 해석법을 실전 글로 읽어보세요.' },
]

export default function MbtiToolPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '무료 도구' }, { label: 'MBTI 궁합' }]} />
      </div>

      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-300">FREE VIRAL TOOL</p>
          <h1 className="text-3xl font-bold tracking-tight text-amber-200 md:text-4xl">MBTI 궁합 테스트</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            16가지 성격유형을 바탕으로 두 사람의 대화 방식, 감정 온도, 갈등 포인트를 빠르게 확인해보세요.
            가볍게 즐기면서도 관계 운영에 바로 써먹을 수 있는 실전형 MBTI 궁합 도구입니다.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-3 text-xl font-semibold text-amber-200">MBTI 궁합, 왜 이렇게 많이 볼까요?</h2>
          <div className="space-y-4 text-sm leading-7 text-slate-300 md:text-base">
            <p>
              MBTI 궁합은 복잡한 연애 심리를 아주 빠르게 대화 가능한 언어로 바꿔준다는 점에서 큰 인기를 얻고 있습니다. 같은
              사건을 겪어도 어떤 사람은 먼저 감정을 말하고, 어떤 사람은 생각을 정리한 뒤 대화하려고 합니다. 또 어떤 사람은
              계획을 세워야 마음이 편하고, 어떤 사람은 유연하게 흐름을 타야 스트레스가 줄어듭니다. MBTI는 이런 차이를 선악이
              아니라 성향 차이로 이해하도록 도와주기 때문에, 관계 초반의 오해를 줄이고 서로 맞춰가는 힌트를 찾는 데 유용합니다.
            </p>
            <p>
              특히 연애에서 중요한 것은 취향 일치보다 소통 방식의 합입니다. 같은 MBTI라고 해서 무조건 잘 맞는 것도 아니고,
              정반대 유형이라고 해서 반드시 힘든 것도 아닙니다. 잘 맞는 커플은 다툼이 없어서가 아니라, 다툰 뒤 회복하는 방식이
              건강합니다. 그래서 궁합을 볼 때는 점수 자체보다 강점과 주의 포인트를 함께 확인하는 것이 중요합니다. 예를 들어 둘 다
              실행력이 빠른 조합은 즐거운 추억을 많이 만들 수 있지만, 감정 점검을 건너뛰기 쉽습니다. 반대로 신중한 조합은 안정감이
              크지만 표현이 줄어들면 권태가 올 수 있죠. 관계는 성향 + 운영 방식의 합이라는 점을 기억하면 MBTI 궁합 결과가 훨씬
              현실적으로 다가옵니다.
            </p>
            <p>
              사주해의 MBTI 궁합 도구는 이런 실전 감각에 맞춰 설계되었습니다. 두 유형을 선택하면 궁합 티어와 점수, 관계 강점,
              충돌 가능 지점, 바로 적용 가능한 조언까지 한눈에 볼 수 있습니다. 친구와 장난처럼 돌려봐도 재미있고, 연인과 함께
              보면 우리 관계의 패턴을 대화하기 쉬워집니다. 더 깊은 분석이 필요하다면 MBTI로 성향을 확인한 뒤 사주 궁합으로
              시기와 에너지 흐름까지 확장해 보는 방법도 좋습니다.
            </p>
          </div>

          <div className="mt-6 grid gap-2 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-5">
            <Link href="/gunghap" className="rounded-lg border border-amber-500/40 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              정밀 궁합 보기
            </Link>
            <Link href="/saju/free" className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              무료 사주
            </Link>
            <Link href="/fortune/today" className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              오늘의 운세
            </Link>
            <Link href="/tools/bloodtype" className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              혈액형 궁합
            </Link>
            <Link href="/blog" className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              궁합/운세 블로그
            </Link>
          </div>
        </section>

        <MbtiClient />

        <RelatedContent links={RELATED_LINKS} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </div>
    </main>
  )
}

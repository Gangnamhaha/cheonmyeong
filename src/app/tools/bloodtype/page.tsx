import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import BloodTypeClient from './BloodTypeClient'

export function generateMetadata(): Metadata {
  return {
    title: '혈액형 궁합 - A B O AB형 궁합 테스트 | 사주해',
    description:
      'A형, B형, O형, AB형 궁합을 무료로 확인해보세요. 혈액형 성격론 기반 궁합 점수, 관계 강점, 갈등 포인트, 연애 조언까지 한 번에 제공하는 재미있는 궁합 테스트.',
    keywords: [
      '혈액형 궁합',
      'A형 B형 O형 AB형 궁합',
      '혈액형 성격',
      '연애 궁합 테스트',
      '혈액형 궁합표',
      '무료 궁합',
      '혈액형별 성격',
    ],
  }
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '혈액형 궁합은 과학적으로 검증된 내용인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '혈액형 궁합은 과학적 진단 도구라기보다 성향을 가볍게 이야기하기 좋은 문화적 콘텐츠입니다. 재미 요소로 활용하면서도 실제 관계에서는 대화와 행동 패턴을 함께 보는 것이 좋습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '혈액형 궁합은 왜 한국에서 특히 인기인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '한국에서는 혈액형 성격론이 오랫동안 대중문화 콘텐츠로 소비되며 공감 언어로 자리 잡았습니다. 소개팅, 연애 대화, 친구 관계에서 아이스브레이킹 소재로 활용하기 쉬워 지금도 인기가 높습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '혈액형 궁합 결과를 어떻게 보면 좋을까요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '점수만 보기보다 강점과 잠재 갈등 포인트를 함께 보는 것이 좋습니다. 관계에서 반복되는 패턴을 확인하고 소통 방식이나 약속 규칙을 조정하는 힌트로 활용해 보세요.',
      },
    },
    {
      '@type': 'Question',
      name: '더 정밀한 궁합을 보고 싶다면?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '혈액형 궁합으로 가볍게 성향을 확인한 뒤 생년월일시 기반 사주 궁합으로 확장하면 더 입체적인 분석이 가능합니다. 특히 관계 시기 흐름과 보완 방향이 궁금할 때 유용합니다.',
      },
    },
  ],
}

const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '사주해 혈액형 궁합 테스트',
  description:
    'A형 B형 O형 AB형 조합별 궁합 점수와 성격 매치, 갈등 포인트, 실전 조언을 제공하는 무료 궁합 도구',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  inLanguage: 'ko-KR',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  url: 'https://sajuhae.vercel.app/tools/bloodtype',
}

const RELATED_LINKS = [
  { href: '/tools/mbti', title: 'MBTI 궁합 테스트', description: '16가지 성향 조합으로 소통 패턴을 빠르게 확인해보세요.' },
  { href: '/gunghap', title: '사주 궁합 정밀 분석', description: '혈액형 궁합 이후 더 깊은 관계 흐름을 확인해보세요.' },
  { href: '/saju/free', title: '무료 사주풀이', description: '생년월일 기반으로 내 연애/관계 성향을 분석하세요.' },
  { href: '/blog', title: '궁합/운세 블로그', description: '궁합 해석 팁과 실제 적용법을 글로 확인해보세요.' },
]

export default function BloodTypeToolPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '무료 도구' }, { label: '혈액형 궁합' }]} />
      </div>

      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-300">FREE VIRAL TOOL</p>
          <h1 className="text-3xl font-bold tracking-tight text-amber-200 md:text-4xl">혈액형 궁합 테스트</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            A형, B형, O형, AB형 조합으로 관계 케미를 빠르게 확인해보세요. 소개팅 대화, 친구끼리 놀이, 연애 궁합 토크에
            바로 써먹기 좋은 가볍고 재미있는 무료 도구입니다.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-3 text-xl font-semibold text-amber-200">혈액형 궁합, 왜 아직도 재밌을까요?</h2>
          <div className="space-y-4 text-sm leading-7 text-slate-300 md:text-base">
            <p>
              혈액형 성격론은 엄밀한 심리 검사라기보다 한국과 일본 문화권에서 오래 사랑받아온 관계 대화 도구입니다. 상대를
              빠르게 이해하고 싶은 순간, 사람들은 복잡한 이론보다 짧고 직관적인 언어를 찾습니다. 그때 혈액형 궁합은 아주 유용한
              아이스브레이커가 됩니다. A형은 섬세하다, B형은 자유롭다, O형은 대범하다, AB형은 이성적이다 같은 익숙한 프레임은
              실제 성격을 완벽하게 설명하지는 않지만 대화를 열어주는 출발점이 되어 줍니다.
            </p>
            <p>
              연애와 인간관계에서 중요한 건 절대적 맞고 틀림보다 상호작용 패턴입니다. 예를 들어 한 사람은 즉시 이야기해야 안심하고,
              다른 사람은 생각을 정리한 뒤 말해야 편안할 수 있습니다. 이런 차이를 성격 결함으로 보면 갈등이 커지고, 스타일 차이로
              보면 해결책이 생깁니다. 혈액형 궁합 콘텐츠가 오래 살아남은 이유도 여기에 있습니다. 점수 하나로 관계를 판정하려는
              것이 아니라, 서로의 리듬 차이를 재미있게 인식하게 만드는 힘이 있기 때문입니다.
            </p>
            <p>
              사주해의 혈액형 궁합 도구는 4가지 혈액형의 모든 조합을 개별 분석해 보여줍니다. 단순한 한 줄 결과가 아니라 성향 매치,
              강점, 잠재 갈등, 실전 조언을 함께 제공해 실제 대화에 바로 활용할 수 있습니다. 친구와 함께 돌려보며 웃고 넘겨도 좋고,
              연인과 함께 보면 서로 서운했던 지점을 부드럽게 풀어내는 계기가 됩니다. 그리고 더 깊은 관계 분석이 필요하다면 혈액형
              궁합으로 가볍게 시작한 뒤 사주 기반 정밀 궁합으로 확장해 시기와 에너지 흐름까지 확인해 보세요.
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
            <Link href="/tools/mbti" className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              MBTI 궁합
            </Link>
            <Link href="/blog" className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              궁합/운세 블로그
            </Link>
          </div>
        </section>

        <BloodTypeClient />

        <RelatedContent links={RELATED_LINKS} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </div>
    </main>
  )
}

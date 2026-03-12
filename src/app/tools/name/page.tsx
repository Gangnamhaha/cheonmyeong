import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import NameClient from './NameClient'

export function generateMetadata(): Metadata {
  return {
    title: '이름풀이 - 이름 획수 오행 분석 | 사주해',
    description:
      '이름 획수와 오행을 바탕으로 성향, 강점, 궁합 오행, 행운 숫자/컬러를 무료로 확인하는 이름풀이 도구입니다. 전통 작명학 해석을 가볍고 직관적으로 제공해요.',
    keywords: ['이름풀이', '이름 획수', '이름 오행', '작명', '이름운세', '무료 이름 분석'],
  }
}

const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '사주해 이름풀이',
  description: '이름 획수와 오행 분포를 기반으로 성향, 운세 등급, 행운 포인트를 제공하는 무료 이름 분석 도구',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  inLanguage: 'ko-KR',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  url: 'https://sajuhae.vercel.app/tools/name',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '이름풀이의 획수 계산은 어떻게 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이 도구는 성과 이름 각 글자의 획수를 합산해 총획을 계산하고, 끝자리 수를 기반으로 오행을 배정합니다. 데이터에 없는 글자는 사용자가 직접 획수를 입력해 보완할 수 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '이름 오행 분석은 어떤 점을 알려주나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '목화토금수 분포를 시각화해 주도 오행을 찾고, 해당 오행의 성향, 강점, 어울리는 커리어 경향, 궁합 오행을 함께 제공합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '작명할 때 이름풀이 결과를 그대로 따라도 되나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이름풀이는 참고 도구로 활용하는 것이 좋습니다. 실제 작명에서는 생년월일시, 발음, 한자 의미, 가족 돌림자 등 여러 요소를 함께 검토하는 것을 권장합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '획수가 좋지 않게 나오면 이름을 반드시 바꿔야 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '반드시 바꿔야 하는 것은 아닙니다. 이름은 상징과 방향성을 보는 요소 중 하나이며 실제 운세는 생활 습관, 선택, 인간관계에 따라 크게 달라집니다.',
      },
    },
    {
      '@type': 'Question',
      name: '더 정확한 분석을 원하면 무엇을 함께 보면 좋나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '이름풀이로 기본 성향을 확인한 뒤 생년월일시 기반 사주풀이를 함께 보면 기질과 시기 흐름을 더 입체적으로 파악할 수 있습니다.',
      },
    },
  ],
}

const RELATED_LINKS = [
  { href: '/tools/mbti', title: 'MBTI 궁합 테스트', description: '성격 유형 기반 관계 케미를 빠르게 확인하세요.' },
  { href: '/tools/bloodtype', title: '혈액형 궁합 테스트', description: 'A/B/O/AB 조합으로 가볍게 보는 궁합 도구입니다.' },
  { href: '/gunghap', title: '사주 궁합 정밀 분석', description: '생년월일 기반으로 더 깊은 궁합 흐름을 확인해보세요.' },
  { href: '/saju/free', title: '무료 사주풀이', description: '내 사주 기질과 운의 흐름을 무료로 분석하세요.' },
  { href: '/blog', title: '사주/운세 블로그', description: '작명, 오행, 궁합 해석 팁을 읽어보세요.' },
]

export default function NameToolPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '무료 도구' }, { label: '이름풀이' }]} />
      </div>

      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-300">FREE VIRAL TOOL</p>
          <h1 className="text-3xl font-bold tracking-tight text-amber-200 md:text-4xl">이름풀이 - 이름 획수 오행 분석</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            성과 이름의 획수, 오행 분포를 바탕으로 이름의 기본 성향과 운의 흐름을 빠르게 확인해보세요. 로그인 없이 무료로
            이용할 수 있는 전통 작명학 기반 이름 분석 도구입니다.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-3 text-xl font-semibold text-amber-200">이름풀이란 무엇이고, 왜 아직도 많이 볼까요?</h2>
          <div className="space-y-4 text-sm leading-7 text-slate-300 md:text-base">
            <p>
              이름풀이는 단순히 이름이 예쁜지 아닌지를 보는 것이 아니라, 이름에 들어간 글자 획수와 오행의 흐름을 함께 해석해
              성향과 운의 방향을 읽는 전통 작명학의 한 갈래입니다. 한국에서는 오랫동안 작명소 문화와 함께 이름 획수 해석이
              이어져 왔고, 요즘은 출생 작명뿐 아니라 개명, 브랜드 네이밍, 닉네임 선택에서도 참고 자료로 자주 활용됩니다. 특히
              이름은 매일 반복해 부르고 듣는 상징 언어이기 때문에 많은 사람들이 이름에 담긴 의미와 리듬을 중요하게 생각합니다.
            </p>
            <p>
              획수 해석에서 핵심은 총획과 각 글자 균형입니다. 총획은 큰 흐름의 운세 경향을 보고, 글자별 획수는 성격의 결이나
              대인관계 스타일을 보완적으로 읽습니다. 물론 같은 총획이라도 어떤 글자 조합으로 만들어졌는지에 따라 체감 해석은
              달라질 수 있습니다. 그래서 최근에는 단순 점수보다 글자별 획수 분해, 오행 분포, 강점과 보완 포인트를 함께 확인하는
              방식이 더 실용적으로 받아들여집니다. 이 도구도 그 흐름에 맞춰 결과를 카드형으로 한눈에 볼 수 있게 구성했습니다.
            </p>
            <p>
              오행(목화토금수)은 이름 해석에서 에너지의 성질을 파악하는 기본 틀입니다. 목은 성장, 화는 표현, 토는 안정, 금은
              결단, 수는 지혜와 흐름을 상징합니다. 이름의 획수 끝자리를 오행에 매핑하면 어떤 기운이 상대적으로 강한지 볼 수 있고,
              이를 바탕으로 성향, 잘 맞는 환경, 관계에서의 궁합 포인트를 참고할 수 있습니다. 다만 이름풀이 결과는 절대적 판정이
              아니라 방향성 해석입니다. 전통 작명학 관점에서는 이름과 함께 사주, 발음, 한자 의미를 종합해 보는 것이 가장 균형
              있는 접근이며, 이름풀이는 그 출발점으로 매우 유용합니다.
            </p>
          </div>

          <div className="mt-6 grid gap-2 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-5">
            <Link href="/tools/mbti" className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              MBTI 궁합
            </Link>
            <Link href="/tools/bloodtype" className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              혈액형 궁합
            </Link>
            <Link href="/gunghap" className="rounded-lg border border-amber-500/40 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              정밀 궁합 보기
            </Link>
            <Link href="/saju/free" className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              무료 사주풀이
            </Link>
            <Link href="/blog" className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 hover:text-amber-200">
              사주/운세 블로그
            </Link>
          </div>
        </section>

        <NameClient />

        <RelatedContent links={RELATED_LINKS} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </div>
    </main>
  )
}

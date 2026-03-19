import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const HomeClient = dynamic(() => import('./HomeClient'), { ssr: false })

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
      {/* SEO — hidden from view, visible to crawlers */}
      <h1 className="sr-only">AI 사주팔자 무료 풀이 - 사주해</h1>
      <div className="sr-only">
        <p>사주해는 전통 명리학 계산 로직과 AI 해석 엔진을 결합해 누구나 쉽게 이해할 수 있는 사주 분석을 제공합니다. 생년월일시를 입력하면 오행 균형, 십신 구조, 일간 강약, 용신 방향을 분석하고 AI가 맞춤 해석을 제공합니다. 무료 사주부터 프리미엄 리포트, 궁합 분석까지 한 번에 이용할 수 있습니다.</p>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <HomeClient />
    </>
  )
}

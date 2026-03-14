import type { Metadata } from 'next'
import SajuMusicClient from './saju-music-client'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '나의 사주 음악 - 오행과 인생 흐름으로 듣는 맞춤 사운드 | 사주해',
    description:
      '사주팔자 오행 분석, 용신 방향, 인생성장 흐름을 4악장 음악으로 변환해 듣는 사주해의 나의 사주 음악 기능입니다. 내 사주의 기운을 소리로 경험해 보세요.',
    keywords: ['사주 음악', '오행 음악', '사주팔자', '인생성장', '용신', '사주해'],
    openGraph: {
      title: '나의 사주 음악 | 사주해',
      description:
        '초년·청년·중년·말년 흐름을 4악장으로 듣는 맞춤형 사주 음악. 오행 균형과 용신을 사운드로 체험하세요.',
      url: 'https://sajuhae.vercel.app/saju/music',
      type: 'website',
      locale: 'ko_KR',
      siteName: '사주해',
    },
    twitter: {
      card: 'summary_large_image',
      title: '나의 사주 음악 | 사주해',
      description: '사주팔자를 음악으로 듣는 4악장 맞춤형 사운드 경험',
    },
  }
}

const musicJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '나의 사주 음악',
  description: '사주 오행 분석과 인생 흐름을 4악장으로 변환해 재생하는 사주해 음악 페이지',
  inLanguage: 'ko-KR',
  isPartOf: {
    '@type': 'WebSite',
    name: '사주해',
    url: 'https://sajuhae.vercel.app',
  },
  url: 'https://sajuhae.vercel.app/saju/music',
  about: {
    '@type': 'Thing',
    name: '사주팔자 음악 해석',
  },
}

export default function SajuMusicPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(musicJsonLd) }}
      />
      <SajuMusicClient />
    </>
  )
}

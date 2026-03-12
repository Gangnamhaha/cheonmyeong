import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '사주해 - 궁합 비교',
  description: '두 사람의 사주팔자를 비교하여 궁합을 분석합니다. AI가 성격, 연애, 직장, 건강 궁합을 해석합니다.',
  openGraph: {
    title: '사주해 - 궁합 비교',
    description: '두 사람의 사주팔자를 비교하여 궁합을 분석합니다.',
  },
}

export default function GunghapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

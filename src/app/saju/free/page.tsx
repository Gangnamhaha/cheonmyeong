import type { Metadata } from 'next'
import SajuFreeClient from './saju-free-client'

export const metadata: Metadata = {
  title: '무료 AI 사주풀이 - 사주팔자 오행 분석 | 사주해',
  description: '무료 사주, 사주풀이, 사주팔자 무료 분석을 한 번에. 생년월일시 입력으로 오행, 십신, 용신까지 AI가 이해하기 쉽게 풀어드립니다.',
  keywords: ['무료 사주', '사주풀이', '사주팔자 무료', '무료 사주팔자', 'AI 사주'],
}

export default function FreeSajuPage() {
  return <SajuFreeClient />
}

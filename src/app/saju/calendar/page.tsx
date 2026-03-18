import type { Metadata } from 'next'
import SajuCalendarClient from './saju-calendar-client'

export const metadata: Metadata = {
  title: '사주 달력 - 일별 오행 흐름 | 사주해',
  description:
    '매일의 천간·지지와 오행 흐름을 달력에서 확인하세요. 당신의 사주와 오늘의 기운이 어떻게 어울리는지 한눈에 파악할 수 있습니다.',
}

export default function SajuCalendarPage() {
  return <SajuCalendarClient />
}

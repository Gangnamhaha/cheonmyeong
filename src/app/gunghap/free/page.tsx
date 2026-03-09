import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '무료 궁합 테스트 - AI 사주 궁합 분석 | 천명',
  description: '무료 궁합 테스트로 두 사람의 성향 합, 감정 흐름, 관계 밸런스를 빠르게 확인하세요. 사주 기반 AI 궁합 분석으로 핵심 포인트를 쉽게 파악할 수 있습니다.',
  keywords: ['무료 궁합', '사주 궁합', '궁합 테스트', 'AI 궁합', '궁합 보는 법'],
}

export default function FreeGunghapPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <h1 className="font-serif-kr text-3xl font-black text-pink-400">무료 궁합 테스트</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            천명의 궁합 분석은 두 사람의 사주 구조를 비교해 관계의 강점과 충돌 지점을 읽어냅니다.
            연애, 결혼, 동업, 장기 파트너십처럼 관계의 목적에 따라 해석 관점을 달리 제공합니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/gunghap" className="rounded-lg bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-400">
              무료 궁합 시작하기
            </Link>
            <Link href="/" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              내 사주 먼저 보기
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              프리미엄 안내
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">자주 묻는 질문</h2>
          <div className="mt-5 space-y-5 text-sm leading-relaxed text-slate-300">
            <div>
              <h3 className="mb-1 font-semibold text-slate-100">궁합이란?</h3>
              <p>
                궁합은 두 사람의 사주 에너지 흐름이 서로를 보완하는지, 혹은 긴장을 만드는지를 보는 해석입니다.
                단순히 좋고 나쁨을 가르기보다 관계를 건강하게 운영하는 전략을 찾는 데 의미가 있습니다.
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-slate-100">사주 궁합 보는 법</h3>
              <p>
                양쪽의 생년월일시를 입력하면 오행 분포, 일간 관계, 주요 충합 요소를 종합해 점수와 해설을 제공합니다.
                점수보다 중요한 것은 어떤 상황에서 갈등이 생기고 어떻게 풀 수 있는지입니다.
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-slate-100">AI 궁합의 정확도</h3>
              <p>
                AI는 계산된 명리 데이터 위에서 일관된 기준으로 해석합니다. 관계의 실제 맥락을 함께 고려할 때
                더욱 실용적인 인사이트가 되며, 반복 비교로 관계 패턴을 선명하게 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6 text-sm text-slate-300">
          <p>
            궁합 해석 후에는 각자 사주를 함께 확인해 보세요. 개인 기질과 운의 타이밍을 같이 보면 관계의 해석이
            훨씬 정확해집니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/guide/saju-basics" className="text-amber-300 underline underline-offset-4">
              사주팔자 기초 먼저 보기
            </Link>
            <Link href="/fortune/today" className="text-amber-300 underline underline-offset-4">
              오늘의 운세 확인하기
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

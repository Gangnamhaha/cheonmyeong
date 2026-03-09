import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'

export const metadata: Metadata = {
  title: '삼재띠 2026 - 병오년 삼재 해당 띠와 대비법 | 천명',
  description: '2026년 삼재띠를 확인하세요. 들삼재, 눌삼재, 날삼재의 뜻과 각 삼재띠별 주의사항, 대비법을 상세히 설명합니다.',
  keywords: ['삼재', '삼재띠 2026', '삼재 뜻', '삼재 대비법', '들삼재', '눌삼재', '날삼재', '병오년 삼재'],
}

const RELATED_LINKS = [
  { href: '/fortune/2026/tojeongbigyeol', title: '2026 토정비결', description: '삼재 시기의 월별 흐름을 토정비결 관점으로 보세요.' },
  { href: '/fortune/2026/daebak', title: '2026 대박띠', description: '올해 상승 기운이 강한 띠와 비교해 전략을 세워보세요.' },
  { href: '/fortune/2026', title: '2026 띠별 운세', description: '삼재 외에도 전체 띠 흐름을 함께 확인하면 더 정확합니다.' },
  { href: '/fortune/2026/month/6', title: '6월 운세', description: '삼재 구간의 중반 흐름을 월별로 세밀하게 점검하세요.' },
]

export default function SamjaePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '2026년 운세', href: '/fortune/2026' }, { label: '삼재' }]} />

        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <p className="text-xs text-slate-400">운세 가이드</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">2026년 삼재띠 총정리</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            2026년 병오년의 삼재띠가 무엇인지, 각 삼재띠별 주의사항과 대비법을 상세히 알려드립니다.
            삼재의 영향을 최소화하고 운을 지키는 방법을 확인하세요.
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">삼재란 무엇인가?</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            삼재(三災)는 동양 운학에서 말하는 3년간 지속되는 재앙이나 어려움을 의미합니다. 
            모든 사람이 12년 주기로 삼재를 만나게 되며, 이는 피할 수 없는 자연의 흐름입니다. 
            삼재는 단순한 불운이 아니라 성장과 변화의 과정으로 보며, 올바른 대비와 마음가짐으로 극복할 수 있습니다.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            삼재는 3가지 종류로 나뉘는데, 각각 다른 특성과 영향을 미칩니다. 
            자신의 삼재 종류를 파악하고 그에 맞는 대비법을 실천하면 어려움을 최소화할 수 있습니다.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">삼재의 3가지 종류</h2>
          
          <div className="mt-6 space-y-5">
            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">들삼재 (入三災)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                들삼재는 삼재의 시작 단계로, 새로운 변화와 도전이 시작되는 시기입니다. 
                예상치 못한 상황이 발생하거나 기존의 안정이 흔들릴 수 있습니다. 
                이 시기에는 신중함과 준비가 중요하며, 큰 결정이나 변화를 피하는 것이 좋습니다. 
                건강 관리와 안전에 특히 주의해야 하며, 새로운 시작보다는 기존 것을 정리하는 데 집중하세요.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">눌삼재 (眼三災)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                눌삼재는 삼재의 중간 단계로, 어려움이 가장 심한 시기입니다. 
                재정적 손실, 건강 악화, 인간관계 문제 등 다양한 어려움이 동시에 나타날 수 있습니다. 
                이 시기에는 보수적인 태도가 필요하며, 투자나 큰 지출을 피해야 합니다. 
                건강 검진을 정기적으로 받고, 스트레스 관리에 신경 써야 하며, 주변 사람들과의 관계를 소중히 여기세요.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">날삼재 (出三災)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                날삼재는 삼재의 마지막 단계로, 어려움이 서서히 해소되는 시기입니다. 
                지난 2년간의 어려움이 정리되고 새로운 시작을 준비할 수 있는 시기입니다. 
                이 시기에는 긍정적인 마음가짐이 중요하며, 새로운 계획을 세우고 준비하는 것이 좋습니다. 
                건강도 회복되기 시작하고, 인간관계도 개선되는 경향을 보입니다.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">2026년 병오년 삼재띠</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            2026년 병오년의 삼재는 사해묘미(巳亥卯未) 삼재입니다. 
            이는 뱀띠, 돼지띠, 토끼띠, 양띠가 해당하며, 각각 다른 단계의 삼재를 경험합니다.
          </p>
          
          <div className="mt-6 space-y-5">
            <article className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐑 양띠 - 들삼재 (2026년)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                양띠는 2026년에 들삼재를 맞이합니다. 이는 삼재의 시작 단계로, 새로운 변화가 시작되는 시기입니다.
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p><span className="font-bold text-amber-300">주의사항:</span> 예상치 못한 상황 발생, 기존 안정의 흔들림, 건강 악화 가능성</p>
                <p><span className="font-bold text-amber-300">대비법:</span> 신중한 결정, 큰 변화 피하기, 건강 관리 강화, 안전 주의</p>
                <p><span className="font-bold text-amber-300">행운 색상:</span> 빨강, 주황색 (화기 강화)</p>
                <p><span className="font-bold text-amber-300">행운 방향:</span> 남쪽 (화기 방향)</p>
              </div>
            </article>

            <article className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐰 토끼띠 - 눌삼재 (2026년)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                토끼띠는 2026년에 눌삼재를 맞이합니다. 이는 삼재의 중간 단계로, 어려움이 가장 심한 시기입니다.
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p><span className="font-bold text-amber-300">주의사항:</span> 재정적 손실 위험, 건강 악화, 인간관계 문제, 사고 위험</p>
                <p><span className="font-bold text-amber-300">대비법:</span> 보수적 태도, 투자 및 큰 지출 피하기, 정기 건강검진, 스트레스 관리</p>
                <p><span className="font-bold text-amber-300">행운 색상:</span> 검정색, 파란색 (수기 강화)</p>
                <p><span className="font-bold text-amber-300">행운 방향:</span> 북쪽 (수기 방향)</p>
              </div>
            </article>

            <article className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐷 돼지띠 - 날삼재 (2026년)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                돼지띠는 2026년에 날삼재를 맞이합니다. 이는 삼재의 마지막 단계로, 어려움이 해소되는 시기입니다.
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p><span className="font-bold text-amber-300">주의사항:</span> 지난 2년의 어려움 정리, 새로운 시작 준비, 긍정적 마음가짐 필요</p>
                <p><span className="font-bold text-amber-300">대비법:</span> 긍정적 태도 유지, 새로운 계획 수립, 건강 회복 관리, 인간관계 개선</p>
                <p><span className="font-bold text-amber-300">행운 색상:</span> 노란색, 갈색 (토기 강화)</p>
                <p><span className="font-bold text-amber-300">행운 방향:</span> 중앙, 남서쪽 (토기 방향)</p>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">삼재 극복 방법</h2>
          
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">1. 마음가짐</h3>
              <p className="mt-2">
                삼재는 피할 수 없는 자연의 흐름입니다. 부정적으로 생각하기보다는 성장의 기회로 받아들이세요. 
                긍정적인 마음가짐이 어려움을 극복하는 가장 강력한 힘입니다.
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">2. 건강 관리</h3>
              <p className="mt-2">
                정기적인 건강검진, 규칙적인 운동, 충분한 수면이 중요합니다. 
                면역력을 강화하고 신체 건강을 유지하면 정신적 안정도 함께 따라옵니다.
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">3. 재정 관리</h3>
              <p className="mt-2">
                삼재 기간에는 보수적인 재정 관리가 필요합니다. 
                불필요한 지출을 줄이고, 투자나 큰 구매를 피하며, 저축으로 안정성을 확보하세요.
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">4. 인간관계</h3>
              <p className="mt-2">
                주변 사람들과의 관계를 소중히 여기세요. 
                신뢰할 수 있는 사람들과의 연결이 어려움을 극복하는 데 큰 도움이 됩니다.
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">5. 전통적 방법</h3>
              <p className="mt-2">
                부적 착용, 행운 색상 활용, 길한 방향 활용 등 전통적 방법들이 심리적 안정을 도와줍니다. 
                이러한 방법들은 과학적 근거보다는 심리적 위안을 제공합니다.
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">6. 자기계발</h3>
              <p className="mt-2">
                삼재 기간을 자기계발의 기회로 삼으세요. 
                새로운 기술 습득, 자격증 취득, 독서 등을 통해 내적 성장을 이루면 
                삼재 이후 더 큰 성공을 맞이할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">삼재 극복을 위한 월별 가이드</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
            <p><span className="font-bold text-amber-300">1월-3월:</span> 새해 계획 수립, 건강검진, 기초 정리 (들삼재 대비)</p>
            <p><span className="font-bold text-amber-300">4월-6월:</span> 보수적 재정 관리, 스트레스 관리, 인간관계 강화 (눌삼재 극복)</p>
            <p><span className="font-bold text-amber-300">7월-9월:</span> 자기계발, 새로운 학습, 긍정적 마음가짐 (날삼재 준비)</p>
            <p><span className="font-bold text-amber-300">10월-12월:</span> 한 해 정리, 내년 계획 수립, 감사의 마음 (삼재 극복 완성)</p>
          </div>
        </section>

        <RelatedContent links={RELATED_LINKS} />

        <section className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">내 사주로 삼재 영향을 분석하세요</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            삼재는 띠별로 공통적으로 나타나지만, 개인의 사주에 따라 영향의 정도가 다릅니다. 
            원국과 대운의 조합을 분석하면 삼재의 구체적인 영향과 극복 방법을 더 정확히 파악할 수 있습니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
              내 사주로 삼재 영향 분석하기 →
            </Link>
            <Link href="/fortune/2026" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              2026년 띠별 운세
            </Link>
            <Link href="/fortune/today" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              오늘의 운세
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              프리미엄 분석
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

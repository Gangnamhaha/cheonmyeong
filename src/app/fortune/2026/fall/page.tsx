import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '2026년 가을 운세 - 병오년 가을철 사주 운세 | 천명',
  description: '2026년 가을(9월-11월) 띠별 운세를 확인하세요. 수확, 안정, 정리의 가을철 운세를 전통 원리에 맞춰 정리한 계절 운세 가이드입니다.',
  keywords: ['2026년 가을 운세', '병오년 가을', '가을철 운세', '9월 운세', '사주 운세'],
}

const ANIMAL_FORTUNE = [
  {
    animal: '쥐띠',
    icon: '🐭',
    p1: '가을은 쥐띠에게 여름의 성과를 정리하고 안정화하는 시기입니다. 변수들이 정리되면서 명확한 방향성이 확립되고 신뢰도가 높아집니다.',
    p2: '가을 내내 기초를 탄탄히 다지는 것이 중요합니다. 불필요한 것들을 정리하고 핵심에 집중하면 연말로 갈수록 안정적인 성과가 쌓입니다.',
  },
  {
    animal: '소띠',
    icon: '🐮',
    p1: '소띠는 가을에 수확의 기운을 맞이합니다. 봄부터 준비한 프로젝트들이 완성되고 성과가 눈에 띄게 나타나는 시기입니다.',
    p2: '성과에 만족하지 말고 다음 단계를 준비하는 것이 중요합니다. 가을 내내 기초를 다지고 겨울을 대비하면 내년의 성장이 더욱 탄탄해집니다.',
  },
  {
    animal: '호랑이띠',
    icon: '🐯',
    p1: '호랑이띠는 가을에 리더십이 더욱 빛나는 시기입니다. 여름의 성과를 바탕으로 더욱 큰 책임과 역할을 맡기 쉬우며 신뢰도가 높아집니다.',
    p2: '강한 위치에 있을수록 겸손함이 필요합니다. 팀원들의 성장을 돕고 함께 성공하는 구조를 만들면 가을의 성과가 장기 신뢰로 전환됩니다.',
  },
  {
    animal: '토끼띠',
    icon: '🐰',
    p1: '토끼띠는 가을에 관계의 질이 정리되는 시기입니다. 여름에 맺은 인연들 중 진정한 신뢰 관계가 확립되고 불필요한 관계는 자연스럽게 정리됩니다.',
    p2: '선택과 집중이 더욱 중요한 시기입니다. 핵심 인맥에 집중하고 깊이 있는 관계를 만들면 가을 내내 안정적인 운을 유지할 수 있습니다.',
  },
  {
    animal: '용띠',
    icon: '🐲',
    p1: '용띠는 가을에 확장운이 정리되고 안정화되는 시기입니다. 여름의 성과를 바탕으로 더욱 견고한 기반을 만들기에 좋은 운입니다.',
    p2: '성장의 속도를 조절하고 기초를 탄탄히 다지는 것이 중요합니다. 가을 내내 현재 상황을 점검하고 개선하면 겨울을 안정적으로 맞이할 수 있습니다.',
  },
  {
    animal: '뱀띠',
    icon: '🐍',
    p1: '뱀띠는 가을에 통찰력이 더욱 깊어지는 시기입니다. 여름의 경험들을 정리하고 더욱 정교한 전략을 수립하기에 좋은 운입니다.',
    p2: '건강운은 계절 변화에 따른 관리가 중요합니다. 가을 내내 규칙적인 생활과 충분한 휴식을 취하면 겨울까지 건강을 유지할 수 있습니다.',
  },
  {
    animal: '말띠',
    icon: '🐴',
    p1: '말띠는 가을에 에너지가 정리되고 안정화되는 시기입니다. 여름의 활동을 정리하고 다음 단계를 준비하기에 좋은 운입니다.',
    p2: '속도를 조절하고 현재 상황을 점검하는 것이 중요합니다. 가을 내내 의도적으로 휴식을 취하고 회복하면 겨울을 건강하게 맞이할 수 있습니다.',
  },
  {
    animal: '양띠',
    icon: '🐑',
    p1: '양띠는 가을에 관계 운이 더욱 깊어지는 시기입니다. 봄부터 맺은 인연들이 더욱 돈독해지고 협력의 성과가 눈에 띄게 나타납니다.',
    p2: '신뢰 관계를 더욱 단단히 다지는 것이 중요합니다. 가을 내내 팀과 함께 성장하는 구조를 만들면 겨울의 안정적인 성과로 이어집니다.',
  },
  {
    animal: '원숭이띠',
    icon: '🐵',
    p1: '원숭이띠는 가을에 아이디어 실행이 정리되는 시기입니다. 여름의 성과를 바탕으로 더욱 정교한 전략을 수립하기에 좋은 운입니다.',
    p2: '현재까지의 성과를 점검하고 개선하는 것이 중요합니다. 가을 내내 신중함을 유지하면 겨울의 안정적인 성장으로 이어집니다.',
  },
  {
    animal: '닭띠',
    icon: '🐔',
    p1: '닭띠는 가을에 완성도가 더욱 빛나는 시기입니다. 여름에 완성한 프로젝트들이 평가받고 인정이 따라오는 시기입니다.',
    p2: '성과에 만족하지 말고 다음 단계를 준비하는 것이 중요합니다. 가을 내내 기초를 다지고 개선하면 겨울의 새로운 도전으로 이어집니다.',
  },
  {
    animal: '개띠',
    icon: '🐶',
    p1: '개띠는 가을에 책임감과 신뢰도가 더욱 높아지는 시기입니다. 맡은 역할에서 성과를 내고 주변의 신뢰를 얻기 쉬운 운입니다.',
    p2: '책임감이 강할수록 자신의 한계를 인정하는 것이 중요합니다. 가을 내내 우선순위를 명확히 하고 불필요한 부담을 덜면 겨울을 안정적으로 맞이할 수 있습니다.',
  },
  {
    animal: '돼지띠',
    icon: '🐷',
    p1: '돼지띠는 가을에 감각과 직관이 정리되는 시기입니다. 여름에 얻은 경험들을 정리하고 더욱 정교한 판단을 내리기에 좋은 운입니다.',
    p2: '현실 검증을 통해 경험을 지혜로 전환하는 것이 중요합니다. 가을 내내 신중함을 유지하면 겨울의 큰 기회로 연결될 가능성이 높습니다.',
  },
]

export default function FortuneFallPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <p className="text-xs text-slate-400">계절 특집</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">🍂 2026년 가을 운세 (9월-11월)</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            2026년 가을은 수확과 안정의 기운이 강한 시기입니다. 봄과 여름의 성과를 정리하고 겨울을 대비하는 시기로,
            정리와 정돈의 흐름이 활발합니다. 띠별 가을철 운세를 확인하고 이 시기의 기회를 최대한 활용하세요.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {ANIMAL_FORTUNE.map(item => (
            <article key={item.animal} className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5">
              <h2 className="font-serif-kr text-xl font-bold text-amber-300">
                {item.icon} {item.animal}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.p1}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.p2}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">개인 사주로 가을 운세를 정밀 분석하세요</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            띠 운세는 공통 기운을 보여주고, 실제 결과는 원국과 대운의 조합에서 갈립니다. 같은 띠라도 직업, 연애,
            재물의 강약이 다르게 나타나므로 개인 맞춤 해석이 가장 정확합니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
              내 사주로 가을 운세 보기 →
            </Link>
            <Link href="/fortune/2026" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              연간 운세 함께 보기
            </Link>
            <Link href="/fortune/today" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              오늘의 운세 확인
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              프리미엄 해석 확인
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

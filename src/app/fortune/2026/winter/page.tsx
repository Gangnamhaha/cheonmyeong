import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '2026년 겨울 운세 - 병오년 겨울철 사주 운세 | 천명',
  description: '2026년 겨울(12월-2월) 띠별 운세를 확인하세요. 성찰, 준비, 지혜의 겨울철 운세를 전통 원리에 맞춰 정리한 계절 운세 가이드입니다.',
  keywords: ['2026년 겨울 운세', '병오년 겨울', '겨울철 운세', '12월 운세', '사주 운세'],
}

const ANIMAL_FORTUNE = [
  {
    animal: '쥐띠',
    icon: '🐭',
    p1: '겨울은 쥐띠에게 한 해를 정리하고 내년을 준비하는 시기입니다. 가을의 안정화된 기반 위에서 더욱 깊은 성찰과 계획이 가능합니다.',
    p2: '겨울 내내 충분한 휴식과 성찰의 시간을 가지세요. 올해의 경험을 정리하고 내년의 목표를 명확히 하면 새해를 더욱 강하게 시작할 수 있습니다.',
  },
  {
    animal: '소띠',
    icon: '🐮',
    p1: '소띠는 겨울에 한 해의 성과를 정리하고 내년의 기반을 다지는 시기입니다. 꾸준한 노력의 결과가 명확하게 드러나는 시기입니다.',
    p2: '성과에 만족하지 말고 부족한 부분을 보완하는 것이 중요합니다. 겨울 내내 기초를 더욱 탄탄히 다지면 내년의 성장이 더욱 안정적입니다.',
  },
  {
    animal: '호랑이띠',
    icon: '🐯',
    p1: '호랑이띠는 겨울에 리더십을 정리하고 내년의 방향을 설정하는 시기입니다. 한 해 동안 쌓은 신뢰와 성과를 바탕으로 더욱 큰 목표를 세울 수 있습니다.',
    p2: '강한 위치에 있을수록 겸손함과 배려가 필요합니다. 겨울 내내 팀원들과 함께 내년의 계획을 세우면 새해의 성공이 더욱 확실해집니다.',
  },
  {
    animal: '토끼띠',
    icon: '🐰',
    p1: '토끼띠는 겨울에 관계를 정리하고 내년의 인간관계를 준비하는 시기입니다. 한 해 동안 맺은 인연들을 정리하고 깊이 있는 관계를 만들 수 있습니다.',
    p2: '선택과 집중이 더욱 중요한 시기입니다. 겨울 내내 핵심 인맥을 더욱 돈독히 하면 내년의 협력이 더욱 효율적입니다.',
  },
  {
    animal: '용띠',
    icon: '🐲',
    p1: '용띠는 겨울에 확장운을 정리하고 내년의 전략을 수립하는 시기입니다. 한 해의 성과를 바탕으로 더욱 견고한 기반을 만들 수 있습니다.',
    p2: '성장의 속도를 조절하고 현재 상황을 객관적으로 평가하는 것이 중요합니다. 겨울 내내 신중한 계획을 세우면 내년의 성공이 더욱 확실해집니다.',
  },
  {
    animal: '뱀띠',
    icon: '🐍',
    p1: '뱀띠는 겨울에 통찰력을 정리하고 내년의 지혜를 준비하는 시기입니다. 한 해의 경험을 깊이 있게 성찰할 수 있는 좋은 시기입니다.',
    p2: '건강운은 겨울 추위에 대한 관리가 중요합니다. 겨울 내내 충분한 휴식과 영양 관리를 하면 내년을 건강하게 시작할 수 있습니다.',
  },
  {
    animal: '말띠',
    icon: '🐴',
    p1: '말띠는 겨울에 에너지를 정리하고 내년의 활동을 준비하는 시기입니다. 한 해의 활동을 정리하고 충분한 회복의 시간을 가질 수 있습니다.',
    p2: '속도를 조절하고 현재 상황을 점검하는 것이 중요합니다. 겨울 내내 의도적으로 휴식을 취하고 회복하면 내년을 더욱 강하게 시작할 수 있습니다.',
  },
  {
    animal: '양띠',
    icon: '🐑',
    p1: '양띠는 겨울에 관계 운을 정리하고 내년의 협력을 준비하는 시기입니다. 한 해 동안 맺은 신뢰 관계를 더욱 단단히 할 수 있습니다.',
    p2: '팀과 함께 내년의 계획을 세우는 것이 중요합니다. 겨울 내내 신뢰 관계를 더욱 깊게 하면 내년의 협력이 더욱 효율적입니다.',
  },
  {
    animal: '원숭이띠',
    icon: '🐵',
    p1: '원숭이띠는 겨울에 아이디어를 정리하고 내년의 전략을 수립하는 시기입니다. 한 해의 경험을 바탕으로 더욱 정교한 계획을 세울 수 있습니다.',
    p2: '현재까지의 성과를 점검하고 개선하는 것이 중요합니다. 겨울 내내 신중한 계획을 세우면 내년의 성공이 더욱 확실해집니다.',
  },
  {
    animal: '닭띠',
    icon: '🐔',
    p1: '닭띠는 겨울에 완성도를 정리하고 내년의 목표를 설정하는 시기입니다. 한 해의 성과를 정리하고 부족한 부분을 보완할 수 있습니다.',
    p2: '성과에 만족하지 말고 다음 단계를 준비하는 것이 중요합니다. 겨울 내내 기초를 더욱 탄탄히 다지면 내년의 새로운 도전이 더욱 성공적입니다.',
  },
  {
    animal: '개띠',
    icon: '🐶',
    p1: '개띠는 겨울에 책임감을 정리하고 내년의 역할을 준비하는 시기입니다. 한 해 동안 맡은 역할을 정리하고 내년의 계획을 세울 수 있습니다.',
    p2: '책임감이 강할수록 자신의 한계를 인정하는 것이 중요합니다. 겨울 내내 우선순위를 명확히 하고 충분한 휴식을 취하면 내년을 더욱 강하게 시작할 수 있습니다.',
  },
  {
    animal: '돼지띠',
    icon: '🐷',
    p1: '돼지띠는 겨울에 감각과 직관을 정리하고 내년의 지혜를 준비하는 시기입니다. 한 해의 경험을 깊이 있게 성찰할 수 있는 좋은 시기입니다.',
    p2: '현실 검증을 통해 경험을 지혜로 전환하는 것이 중요합니다. 겨울 내내 충분한 성찰의 시간을 가지면 내년의 큰 기회로 연결될 가능성이 높습니다.',
  },
]

export default function FortuneWinterPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <p className="text-xs text-slate-400">계절 특집</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">❄️ 2026년 겨울 운세 (12월-2월)</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            2026년 겨울은 성찰과 준비의 기운이 강한 시기입니다. 한 해의 성과를 정리하고 내년을 준비하는 시기로,
            지혜와 통찰의 흐름이 활발합니다. 띠별 겨울철 운세를 확인하고 이 시기의 기회를 최대한 활용하세요.
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
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">개인 사주로 겨울 운세를 정밀 분석하세요</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            띠 운세는 공통 기운을 보여주고, 실제 결과는 원국과 대운의 조합에서 갈립니다. 같은 띠라도 직업, 연애,
            재물의 강약이 다르게 나타나므로 개인 맞춤 해석이 가장 정확합니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
              내 사주로 겨울 운세 보기 →
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

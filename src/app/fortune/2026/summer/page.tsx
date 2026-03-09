import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '2026년 여름 운세 - 병오년 여름철 사주 운세 | 천명',
  description: '2026년 여름(6월-8월) 띠별 운세를 확인하세요. 열정, 결실, 도전의 여름철 운세를 전통 원리에 맞춰 정리한 계절 운세 가이드입니다.',
  keywords: ['2026년 여름 운세', '병오년 여름', '여름철 운세', '6월 운세', '사주 운세'],
}

const ANIMAL_FORTUNE = [
  {
    animal: '쥐띠',
    icon: '🐭',
    p1: '여름은 쥐띠에게 봄의 성과를 정리하고 다음 단계를 준비하는 시기입니다. 중반의 변수들이 정리되면서 명확한 방향성이 드러나기 시작합니다.',
    p2: '열정적인 활동도 좋지만 체력 관리가 중요합니다. 여름 중반에 의도적으로 속도를 조절하고 재정비하면 가을로 넘어가는 전환이 부드러워집니다.',
  },
  {
    animal: '소띠',
    icon: '🐮',
    p1: '소띠는 여름에 봄에 시작한 프로젝트들이 본격적인 결실을 맺는 시기입니다. 꾸준한 노력이 가시적인 성과로 나타나며 신뢰도가 높아집니다.',
    p2: '성과에 취해 속도를 높이기보다 품질을 유지하는 것이 중요합니다. 여름 내내 기초를 탄탄히 다지면 가을의 안정적인 성장으로 이어집니다.',
  },
  {
    animal: '호랑이띠',
    icon: '🐯',
    p1: '호랑이띠는 여름에 리더십과 추진력이 최고조에 달합니다. 큰 프로젝트나 팀 운영에서 두각을 나타내기 쉬우며 성과도 눈에 띄게 늘어납니다.',
    p2: '강한 에너지를 발휘할 때일수록 겸손함과 배려가 필요합니다. 팀원들의 의견을 존중하고 함께 성장하는 구조를 만들면 여름의 성과가 장기 신뢰로 전환됩니다.',
  },
  {
    animal: '토끼띠',
    icon: '🐰',
    p1: '토끼띠는 여름에 대외 활동이 절정에 달하는 시기입니다. 새로운 인간관계가 깊어지고 협력 기회가 많아지지만 선택과 집중이 여전히 중요합니다.',
    p2: '모든 관계를 동등하게 유지하려 하면 에너지가 분산됩니다. 핵심 인맥에 집중하고 나머지는 적절한 거리를 유지하면 여름을 더 효율적으로 보낼 수 있습니다.',
  },
  {
    animal: '용띠',
    icon: '🐲',
    p1: '용띠는 여름에 확장운이 절정에 달합니다. 새로운 사업이나 협업이 본격적으로 진행되며 성과도 눈에 띄게 나타나는 시기입니다.',
    p2: '성공의 기운이 강할수록 과신은 금물입니다. 여름 중반에 현재 상황을 객관적으로 점검하고 리스크를 재평가하면 가을의 안정적인 성장이 보장됩니다.',
  },
  {
    animal: '뱀띠',
    icon: '🐍',
    p1: '뱀띠는 여름에 통찰력이 빛나는 시기입니다. 복잡한 상황을 정확히 읽어내고 최적의 전략을 수립하는 능력이 두드러집니다.',
    p2: '건강운은 더위와 스트레스 관리가 중요합니다. 여름 중반에 충분한 휴식을 취하고 수분 섭취를 신경 쓰면 가을까지 건강을 유지할 수 있습니다.',
  },
  {
    animal: '말띠',
    icon: '🐴',
    p1: '말띠는 여름에 에너지가 최고조인 시기입니다. 이동과 변화의 흐름이 강하고 새로운 경험과 도전이 많아지는 시기입니다.',
    p2: '기세만으로 밀어붙이면 피로 누적이 심할 수 있습니다. 여름 중반에 의도적으로 휴식을 취하고 회복 주기를 설계하면 가을까지 에너지를 잘 유지할 수 있습니다.',
  },
  {
    animal: '양띠',
    icon: '🐑',
    p1: '양띠는 여름에 관계 운이 깊어지는 시기입니다. 봄에 만난 인연들이 더욱 돈독해지고 협력의 성과가 눈에 띄게 나타납니다.',
    p2: '혼자가 아닌 팀으로 움직일 때 최고의 성과를 얻습니다. 여름 내내 신뢰 관계를 더욱 단단히 다지면 가을의 안정적인 성장이 보장됩니다.',
  },
  {
    animal: '원숭이띠',
    icon: '🐵',
    p1: '원숭이띠는 여름에 아이디어 실행이 본격화되는 시기입니다. 빠른 판단과 실전 감각이 동시에 작동하며 성과도 눈에 띄게 늘어납니다.',
    p2: '성공의 기운이 강할수록 신중함이 필요합니다. 여름 중반에 현재까지의 성과를 점검하고 다음 단계를 신중히 계획하면 가을의 안정적인 성장으로 이어집니다.',
  },
  {
    animal: '닭띠',
    icon: '🐔',
    p1: '닭띠는 여름에 완성도가 빛나는 시기입니다. 봄부터 준비한 프로젝트들이 완성 단계에 접어들며 평가와 인정이 따라옵니다.',
    p2: '완벽함을 추구하되 적절한 시점에 공개하는 것이 중요합니다. 여름에 성과를 공개하고 피드백을 받으면 가을의 개선과 발전으로 이어집니다.',
  },
  {
    animal: '개띠',
    icon: '🐶',
    p1: '개띠는 여름에 책임감과 신뢰도가 높아지는 시기입니다. 맡은 역할에서 성과를 내고 주변의 신뢰를 얻기 쉬운 운입니다.',
    p2: '책임감이 강할수록 자신의 한계를 인정하는 것이 중요합니다. 여름 중반에 우선순위를 재정리하고 불필요한 부담을 덜면 가을까지 안정적으로 진행할 수 있습니다.',
  },
  {
    animal: '돼지띠',
    icon: '🐷',
    p1: '돼지띠는 여름에 감각과 직관이 최고조인 시기입니다. 새로운 기회를 빠르게 포착하고 행동으로 옮기기에 좋은 운입니다.',
    p2: '감정 표현이 긍정적으로 작동하는 시기이지만 신중함도 함께 필요합니다. 여름에 얻은 경험들이 가을의 큰 기회로 연결될 가능성이 높습니다.',
  },
]

export default function FortunesSummerPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <p className="text-xs text-slate-400">계절 특집</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">☀️ 2026년 여름 운세 (6월-8월)</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            2026년 여름은 열정과 결실의 기운이 강한 시기입니다. 봄에 시작한 계획들이 본격적인 성과를 맺으며,
            도전과 확장의 흐름이 활발합니다. 띠별 여름철 운세를 확인하고 이 시기의 성과를 최대한 활용하세요.
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
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">개인 사주로 여름 운세를 정밀 분석하세요</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            띠 운세는 공통 기운을 보여주고, 실제 결과는 원국과 대운의 조합에서 갈립니다. 같은 띠라도 직업, 연애,
            재물의 강약이 다르게 나타나므로 개인 맞춤 해석이 가장 정확합니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
              내 사주로 여름 운세 보기 →
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

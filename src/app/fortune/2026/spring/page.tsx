import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'

export const metadata: Metadata = {
  title: '2026년 봄 운세 - 병오년 봄철 사주 운세 | 사주해',
  description: '2026년 봄(3월-5월) 띠별 운세를 확인하세요. 새로운 시작, 성장, 활력의 봄철 운세를 전통 원리에 맞춰 정리한 계절 운세 가이드입니다.',
  keywords: ['2026년 봄 운세', '병오년 봄', '봄철 운세', '3월 운세', '사주 운세'],
}

const ANIMAL_FORTUNE = [
  {
    animal: '쥐띠',
    icon: '🐭',
    p1: '봄은 쥐띠에게 새로운 기회의 문이 열리는 시기입니다. 겨울 동안 준비한 계획들이 실행 단계로 넘어가며, 대외 활동이 활발해집니다.',
    p2: '초반의 빠른 속도를 유지하되 중반에 변수가 들어올 수 있으니 유연성을 갖춰야 합니다. 새로운 인연과 협력 기회가 많으니 신뢰 관계를 차근차근 쌓는 것이 좋습니다.',
  },
  {
    animal: '소띠',
    icon: '🐮',
    p1: '소띠는 봄의 따뜻한 기운 속에서 정체된 에너지를 깨우는 시간을 맞이합니다. 미뤄둔 프로젝트나 자격 취득을 시작하기에 최적의 시점입니다.',
    p2: '완벽함을 기다리지 말고 작은 단위로 시작하면 봄이 지날수록 자신감과 성과가 함께 쌓입니다. 건강 관리도 중요하니 규칙적인 운동과 휴식을 병행하세요.',
  },
  {
    animal: '호랑이띠',
    icon: '🐯',
    p1: '호랑이띠는 봄에 추진력과 리더십이 빛나는 시기입니다. 새로운 프로젝트나 팀 구성에서 주도적 역할을 하기에 좋은 운입니다.',
    p2: '강한 에너지를 발휘할 때일수록 주변과의 조율이 중요합니다. 동료와 팀원의 의견을 경청하고 협력 구조를 만들면 봄의 성과가 여름으로 이어집니다.',
  },
  {
    animal: '토끼띠',
    icon: '🐰',
    p1: '토끼띠에게 봄은 감정과 현실의 균형을 찾는 시기입니다. 대외 활동이 늘어나면서 새로운 인간관계가 형성되지만 선택과 집중이 필요합니다.',
    p2: '배려심이 강점이지만 경계가 흐려지기 쉬우니 자신의 우선순위를 명확히 하세요. 일과 휴식의 리듬을 잘 맞추면 봄 내내 안정적인 운을 유지할 수 있습니다.',
  },
  {
    animal: '용띠',
    icon: '🐲',
    p1: '용띠는 봄에 확장운이 본격적으로 시작됩니다. 새로운 사업, 이직, 외부 협업 같은 기회들이 나타나며 명확한 목표를 세울수록 성공 확률이 높아집니다.',
    p2: '기회가 많을수록 신중한 검증이 필요합니다. 성급한 결정보다 충분한 정보 수집과 검토를 거친 후 행동하면 봄의 성과가 안정적으로 쌓입니다.',
  },
  {
    animal: '뱀띠',
    icon: '🐍',
    p1: '뱀띠는 봄에 통찰력과 집중력이 강해지는 시기입니다. 겉으로 드러나지 않던 역량이 평가받기 쉬우며, 기획과 분석 중심의 역할에서 두각을 나타냅니다.',
    p2: '건강운은 수면과 스트레스 관리가 중요합니다. 관계에서는 과도한 해석보다 사실 기반 소통이 유리하며, 신뢰를 천천히 쌓으면 봄이 지날수록 신뢰도가 높아집니다.',
  },
  {
    animal: '말띠',
    icon: '🐴',
    p1: '말띠에게 봄은 에너지가 최고조에 달하는 시기입니다. 이동, 변화, 확장의 흐름이 강하고 실행 속도가 곧 경쟁력이 되는 국면이 많습니다.',
    p2: '기세만으로 밀어붙이면 피로 누적이 빠를 수 있으니 회복 주기를 설계해야 합니다. 봄 중반에 의도적인 휴식을 취하면 여름까지 에너지를 잘 유지할 수 있습니다.',
  },
  {
    animal: '양띠',
    icon: '🐑',
    p1: '양띠는 봄에 관계의 질이 운의 질로 연결되는 시기입니다. 신뢰 가능한 팀과 파트너를 확보할수록 성과가 안정적으로 늘어나는 흐름입니다.',
    p2: '혼자 버티기보다 협력을 통해 목표를 달성하는 것이 유리합니다. 작게 시작해 일관되게 축적하는 방식이 적합하며, 봄 내내 꾸준함이 최고의 전략입니다.',
  },
  {
    animal: '원숭이띠',
    icon: '🐵',
    p1: '원숭이띠는 봄에 아이디어와 실전 감각이 동시에 살아나는 시기입니다. 빠른 판단으로 기회를 잡을 수 있지만 신중함도 함께 필요합니다.',
    p2: '문서, 계약, 약속 같은 디테일을 단단히 챙기면 리스크를 크게 줄일 수 있습니다. 봄에 기초를 탄탄히 다지면 여름의 성과로 이어집니다.',
  },
  {
    animal: '닭띠',
    icon: '🐔',
    p1: '닭띠는 봄에 기준과 원칙이 빛나는 시기입니다. 평가, 심사, 승진처럼 객관적 결과가 필요한 영역에서 강점을 발휘하기 쉽습니다.',
    p2: '완성도를 높이는 능력이 큰 자산이지만 과도한 자기검열은 기회를 늦출 수 있습니다. 봄에는 공개 시점을 앞당기고 피드백을 받는 전략이 운을 더 크게 엽니다.',
  },
  {
    animal: '개띠',
    icon: '🐶',
    p1: '개띠는 봄에 책임과 확장의 기운이 함께 들어옵니다. 맡은 범위가 넓어지는 만큼 우선순위 관리가 중요하고, 경계 설정이 체력을 지켜줍니다.',
    p2: '가정과 일의 균형을 맞추면 심리적 안정이 커지고 판단력도 좋아집니다. 봄 내내 자신의 페이스를 유지하는 것이 장기 성과의 핵심입니다.',
  },
  {
    animal: '돼지띠',
    icon: '🐷',
    p1: '돼지띠는 봄에 감각과 직관이 강해지는 시기입니다. 새로운 분야에 도전하거나 배움을 시작하기에 좋은 운입니다.',
    p2: '감정 표현이 긍정적으로 작동하는 시기이지만 현실 검증도 함께 필요합니다. 봄에 새로운 경험을 쌓으면 연말에 큰 기회로 연결될 가능성이 높습니다.',
  },
]

const RELATED_LINKS = [
  { href: '/fortune/2026/summer', title: '2026 여름 운세', description: '봄 이후 이어지는 확장운을 미리 확인해보세요.' },
  { href: '/fortune/2026/fall', title: '2026 가을 운세', description: '수확 구간에서 무엇을 정리할지 미리 준비하세요.' },
  { href: '/fortune/2026/winter', title: '2026 겨울 운세', description: '연말 성찰과 다음 해 준비 포인트를 확인하세요.' },
  { href: '/fortune/2026', title: '2026 연간 운세', description: '계절 운세와 연간 흐름을 함께 보면 더 정확합니다.' },
  { href: '/fortune/2026/month/4', title: '4월 운세', description: '봄철 핵심 월 운세를 세부적으로 점검해보세요.' },
]

export default function FortuneSpringPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '2026년 운세', href: '/fortune/2026' }, { label: '봄 운세' }]} />

        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <p className="text-xs text-slate-400">계절 특집</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">🌸 2026년 봄 운세 (3월-5월)</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            2026년 봄은 새로운 시작과 성장의 기운이 강한 시기입니다. 겨울 동안 준비한 계획들이 실행 단계로 넘어가며,
            대외 활동과 새로운 인연이 활발해집니다. 띠별 봄철 운세를 확인하고 이 시기의 기회를 최대한 활용하세요.
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

        <RelatedContent links={RELATED_LINKS} />

        <section className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">개인 사주로 봄 운세를 정밀 분석하세요</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            띠 운세는 공통 기운을 보여주고, 실제 결과는 원국과 대운의 조합에서 갈립니다. 같은 띠라도 직업, 연애,
            재물의 강약이 다르게 나타나므로 개인 맞춤 해석이 가장 정확합니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
              내 사주로 봄 운세 보기 →
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

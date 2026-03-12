import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'
import { OHENG_COLORS } from '@/lib/oheng'

export const metadata: Metadata = {
  title: '오행이란? - 목화토금수 완벽 가이드 | 사주해',
  description: '목화토금수 오행의 성격, 건강, 직업, 연애 특성을 한눈에 정리한 실전 가이드. 내 오행 균형을 이해하고 선택 기준을 세워보세요.',
  keywords: ['오행이란', '목화토금수', '오행 성격', '오행 직업', '오행 연애'],
}

const ELEMENTS = [
  {
    name: '목',
    emoji: '🌳',
    personality: '성장 지향, 기획력, 확장 의지가 강합니다. 시작이 빠르고 사람과 아이디어를 연결하는 능력이 좋습니다.',
    health: '간담, 근육, 눈 피로 관리가 중요합니다. 긴장성 피로가 쌓이면 스트레칭과 수면 리듬 회복이 필요합니다.',
    career: '기획, 교육, 콘텐츠, 브랜딩, 신사업 개발처럼 확장성과 창의성이 필요한 분야와 궁합이 좋습니다.',
    love: '관계에서 미래 지향적이고 함께 성장하길 원합니다. 답답함이 누적되면 거리감을 두기 쉬워 대화 리듬이 중요합니다.',
  },
  {
    name: '화',
    emoji: '🔥',
    personality: '표현력, 존재감, 추진력이 강합니다. 감정과 동기가 빠르게 움직여 현장 장악력이 높은 타입입니다.',
    health: '심혈관, 체온 조절, 수면 과열에 주의가 필요합니다. 카페인 과다와 불규칙한 생활은 기복을 키울 수 있습니다.',
    career: '마케팅, 영업, 방송, 퍼포먼스, 리더십 포지션처럼 가시성과 전달력이 중요한 직무에서 강합니다.',
    love: '감정 표현이 분명하고 열정적입니다. 다만 순간 감정이 커질 때는 속도를 늦추는 습관이 관계 안정에 도움이 됩니다.',
  },
  {
    name: '토',
    emoji: '⛰️',
    personality: '안정적이고 조율력이 좋으며 사람과 상황을 중재하는 능력이 뛰어납니다. 책임감이 강한 현실형 성향입니다.',
    health: '소화기, 비위계, 순환 정체를 관리해야 합니다. 과식과 스트레스성 더부룩함을 줄이는 식습관이 중요합니다.',
    career: '운영, 관리, 회계, 행정, PM, 컨설팅처럼 구조를 세우고 유지하는 역할에서 성과가 잘 납니다.',
    love: '관계에서 신뢰와 꾸준함을 중시합니다. 감정 표현이 늦을 수 있어 의도적인 애정 표현이 관계 만족도를 높입니다.',
  },
  {
    name: '금',
    emoji: '⚔️',
    personality: '판단력, 질서감, 기준 설정 능력이 뛰어납니다. 불필요한 요소를 잘 정리하고 핵심을 남기는 데 강점이 있습니다.',
    health: '호흡기, 피부, 건조함 관리가 중요합니다. 과도한 긴장과 완벽주의는 어깨, 목의 뻣뻣함으로 이어질 수 있습니다.',
    career: '법무, 데이터, 품질관리, 금융, 감사, 엔지니어링처럼 정확성과 기준이 중요한 영역에 적합합니다.',
    love: '신뢰와 약속을 매우 중시합니다. 기준이 높은 편이라 상대에게 기대를 명확히 전달하면 오해를 줄일 수 있습니다.',
  },
  {
    name: '수',
    emoji: '💧',
    personality: '관찰력, 사고력, 적응력이 뛰어납니다. 깊게 파고드는 성향이 있어 복잡한 문제를 구조화하는 데 강합니다.',
    health: '신장, 방광, 호르몬 리듬, 냉증 관리가 핵심입니다. 수분 섭취와 체온 유지가 컨디션 안정에 직접적입니다.',
    career: '연구, 기획분석, 개발, 전략, 심리, 콘텐츠 리서치처럼 깊은 사고와 정보 처리 역량이 필요한 분야가 잘 맞습니다.',
    love: '감정의 깊이는 크지만 표현은 신중한 편입니다. 안전하다고 느낄 때 관계 몰입도가 높아져 장기 관계에 강합니다.',
  },
] as const

const RELATED_LINKS = [
  { href: '/guide/saju-basics', title: '사주 입문 가이드', description: '오행 이전에 사주 기본 구조를 먼저 이해해보세요.' },
  { href: '/blog/oheng-meaning', title: '오행 의미 상세 글', description: '상생/상극과 실전 적용법을 깊이 있게 확인하세요.' },
  { href: '/saju/free', title: '무료 사주풀이', description: '내 오행 분포와 균형을 실제 차트로 확인해보세요.' },
  { href: '/blog/yongsin-guide', title: '용신 가이드', description: '오행 균형을 기반으로 용신 판단 흐름까지 연결해보세요.' },
]

export default function OhengGuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '가이드' }, { label: '오행' }]} />

        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <h1 className="font-serif-kr text-3xl font-black text-amber-400">오행 완벽 가이드</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            오행은 성격 테스트가 아니라 에너지 운영 지도에 가깝습니다. 내게 많은 기운과 부족한 기운을 구분하면
            선택의 우선순위가 명확해지고, 삶의 리듬을 설계하기 쉬워집니다.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {ELEMENTS.map(item => (
            <article
              key={item.name}
              className="rounded-2xl border bg-slate-900/70 p-5"
              style={{ borderColor: `${OHENG_COLORS[item.name]}66` }}
            >
              <h2 className="font-serif-kr text-2xl font-bold" style={{ color: OHENG_COLORS[item.name] }}>
                {item.emoji} {item.name}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                <p><span className="font-semibold text-slate-100">성격:</span> {item.personality}</p>
                <p><span className="font-semibold text-slate-100">건강:</span> {item.health}</p>
                <p><span className="font-semibold text-slate-100">직업:</span> {item.career}</p>
                <p><span className="font-semibold text-slate-100">연애:</span> {item.love}</p>
              </div>
            </article>
          ))}
        </section>

        <RelatedContent links={RELATED_LINKS} />

        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">내 오행 밸런스 확인하기</h2>
          <p className="mt-3 leading-relaxed text-slate-200">
            같은 직업, 같은 관계라도 오행 분포에 따라 에너지 소모 방식이 다릅니다. 사주해에서 내 사주를 입력하고
            오행 차트를 확인하면 현재 삶의 피로 포인트와 보완 지점을 더 선명하게 파악할 수 있습니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/saju/free" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
              무료 사주로 오행 분석하기
            </Link>
            <Link href="/gunghap" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-100 hover:border-amber-400 hover:text-amber-300">
              궁합 분석 보러가기
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-100 hover:border-amber-400 hover:text-amber-300">
              프리미엄 해석 안내
            </Link>
            <Link href="/fortune/today" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-100 hover:border-amber-400 hover:text-amber-300">
              오늘의 운세 보기
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

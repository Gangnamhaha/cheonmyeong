import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabase } from '@/lib/db'

export const revalidate = 3600

type DailyFortuneRow = {
  group_index: number
  content: string
}

const ZODIAC = [
  { branch: '자', animal: '쥐', icon: '🐭', slug: 'rat', birthYears: [1960, 1972, 1984, 1996, 2008, 2020] },
  { branch: '축', animal: '소', icon: '🐮', slug: 'ox', birthYears: [1961, 1973, 1985, 1997, 2009, 2021] },
  { branch: '인', animal: '호랑이', icon: '🐯', slug: 'tiger', birthYears: [1962, 1974, 1986, 1998, 2010, 2022] },
  { branch: '묘', animal: '토끼', icon: '🐰', slug: 'rabbit', birthYears: [1963, 1975, 1987, 1999, 2011, 2023] },
  { branch: '진', animal: '용', icon: '🐲', slug: 'dragon', birthYears: [1964, 1976, 1988, 2000, 2012, 2024] },
  { branch: '사', animal: '뱀', icon: '🐍', slug: 'snake', birthYears: [1965, 1977, 1989, 2001, 2013, 2025] },
  { branch: '오', animal: '말', icon: '🐴', slug: 'horse', birthYears: [1966, 1978, 1990, 2002, 2014, 2026] },
  { branch: '미', animal: '양', icon: '🐑', slug: 'sheep', birthYears: [1967, 1979, 1991, 2003, 2015, 2027] },
  { branch: '신', animal: '원숭이', icon: '🐵', slug: 'monkey', birthYears: [1968, 1980, 1992, 2004, 2016, 2028] },
  { branch: '유', animal: '닭', icon: '🐔', slug: 'rooster', birthYears: [1969, 1981, 1993, 2005, 2017, 2029] },
  { branch: '술', animal: '개', icon: '🐶', slug: 'dog', birthYears: [1970, 1982, 1994, 2006, 2018, 2030] },
  { branch: '해', animal: '돼지', icon: '🐷', slug: 'pig', birthYears: [1971, 1983, 1995, 2007, 2019, 2031] },
] as const

type AnimalSlug = (typeof ZODIAC)[number]['slug']

const YEARLY_OUTLOOK: Record<AnimalSlug, string> = {
  rat: '2026년 쥐띠는 빠른 판단보다 우선순위 정리가 성패를 가릅니다. 상반기에는 일과 공부에서 새로운 제안이 늘지만, 모든 기회를 동시에 잡기보다 수익성과 성장성을 기준으로 압축하는 전략이 유리합니다. 하반기에는 인맥이 실질적 성과로 연결되기 쉬워 협업과 소개 운이 강합니다. 재물운은 지출 관리가 핵심이며, 생활비 구조를 재설계하면 작은 누수가 큰 차이를 만듭니다. 연애운은 솔직한 대화가 관계를 안정시키고, 건강운은 수면 리듬을 일정하게 맞출 때 집중력이 크게 올라갑니다.',
  ox: '2026년 소띠는 꾸준함이 가장 강한 무기가 되는 해입니다. 눈에 띄는 급상승보다 기반을 단단히 만드는 흐름이 강해, 직무 전문성 강화와 자격 준비가 장기 성과로 이어집니다. 상반기에는 책임이 늘어 피로가 쌓일 수 있으나, 일정을 세분화하면 부담을 통제할 수 있습니다. 하반기에는 재정 안정감이 커지고, 보수적 투자와 저축 계획이 좋은 결과를 만듭니다. 대인운은 신뢰 중심 관계가 깊어지며, 연애운은 느리지만 확실한 진전이 보입니다. 건강은 관절과 소화 관리에 집중하면 컨디션이 안정됩니다.',
  tiger: '2026년 호랑이띠는 도전과 확장이 동시에 열리는 해입니다. 상반기에는 이직, 역할 전환, 창업 검토처럼 방향을 바꾸는 이슈가 활발해 결단력이 빛납니다. 다만 속도가 너무 빠르면 실수가 생기므로 계약과 문서 검토를 꼼꼼히 하는 습관이 필요합니다. 하반기에는 성과가 가시화되며 평판운이 좋아집니다. 재물운은 공격적 소비를 줄이고 목표형 예산을 잡을수록 누적 이익이 커집니다. 연애운은 매력 상승기로 만남이 늘고, 기존 관계는 공통 목표를 세울 때 더욱 단단해집니다. 건강은 과로 신호를 초기에 잡는 것이 중요합니다.',
  rabbit: '2026년 토끼띠는 균형과 회복이 핵심 키워드입니다. 상반기에는 관계와 업무에서 조율 역할이 늘어 신뢰를 얻기 쉽고, 갈등을 부드럽게 풀어내는 능력이 큰 강점이 됩니다. 하반기에는 그동안 준비한 계획이 실행 단계로 넘어가며 성과가 안정적으로 쌓입니다. 재물운은 무리한 확장보다 현금흐름 관리가 우선이며, 고정비를 다듬으면 체감 여유가 빠르게 커집니다. 연애운은 감정 표현을 구체적으로 할수록 오해가 줄고 친밀감이 깊어집니다. 건강은 호흡 운동과 가벼운 유산소를 꾸준히 유지하면 컨디션 회복 속도가 빨라집니다.',
  dragon: '2026년 용띠는 존재감과 영향력이 크게 올라가는 해입니다. 상반기에는 리더십을 요구받는 장면이 많아지고, 발표와 기획 분야에서 강점이 드러납니다. 추진력은 뛰어나지만 디테일 관리가 성과의 완성도를 좌우하니 검토 체계를 미리 세우는 것이 좋습니다. 하반기에는 금전 기회가 확대되며, 부업이나 추가 수입 루트가 현실화될 가능성이 높습니다. 연애운은 자신감이 매력으로 작동해 새로운 인연이 들어오기 쉽습니다. 기존 관계는 배려의 표현이 중요합니다. 건강은 목과 어깨 긴장을 자주 풀어 주면 집중력 저하를 막을 수 있습니다.',
  snake: '2026년 뱀띠는 통찰력과 전략이 빛나는 해입니다. 상반기에는 정보 수집과 분석 능력이 강해 중요한 선택에서 한발 앞서갈 수 있습니다. 겉으로 드러나는 속도보다 내실을 다지는 움직임이 유리하며, 장기 프로젝트를 시작하기 좋은 시기입니다. 하반기에는 누적된 준비가 성과로 연결되어 평가와 보상이 따라옵니다. 재물운은 리스크 분산이 핵심이며, 한 방향 집중보다 포트폴리오 균형이 안정성을 높입니다. 연애운은 깊이 있는 대화가 관계의 질을 바꾸고, 건강운은 순환 관리와 스트레칭 루틴이 피로 회복에 큰 도움을 줍니다.',
  horse: '2026년 말띠는 활동 반경이 넓어지고 기회가 빠르게 들어오는 해입니다. 상반기에는 이동, 네트워킹, 새로운 프로젝트 참여가 잦아 에너지가 상승합니다. 즉흥적 결정이 늘기 쉬우므로 핵심 기준 세 가지를 정해 선택하면 시행착오를 줄일 수 있습니다. 하반기에는 결과가 숫자로 확인되며, 평판운과 브랜드 가치가 함께 올라갑니다. 재물운은 벌이는 커지지만 지출도 늘어 예산 통제가 필수입니다. 연애운은 밝은 에너지가 장점으로 작동하고, 건강운은 하체 밸런스와 수분 섭취를 챙길 때 회복력이 좋아집니다.',
  sheep: '2026년 양띠는 관계의 질이 성과를 만드는 해입니다. 상반기에는 협업과 조정 능력이 주목받아 팀 내 신뢰도가 높아지고, 함께하는 프로젝트에서 좋은 결과를 얻기 쉽습니다. 하반기에는 실속 있는 성과가 쌓이며 장기 계획의 실행력이 강화됩니다. 재물운은 안정적 흐름이 유리해 단기 변동보다 꾸준한 저축과 분산 운용이 맞습니다. 연애운은 따뜻한 배려가 관계 만족도를 높이며, 솔직한 표현이 갈등을 줄입니다. 건강은 위장 관리와 규칙적인 식사 패턴이 핵심이며, 휴식의 질을 높이면 집중력이 함께 좋아집니다.',
  monkey: '2026년 원숭이띠는 아이디어와 실행 속도가 모두 살아나는 해입니다. 상반기에는 창의적 제안이 빠르게 채택되며, 디지털·콘텐츠·기획 영역에서 존재감이 커집니다. 다만 동시에 여러 일을 벌리기 쉬워 마감 관리 체계가 필요합니다. 하반기에는 성과가 확장되고 외부 협업 제안이 늘어납니다. 재물운은 변동성이 있으나 수입 다변화 전략이 효과적이며, 작은 수익원을 꾸준히 키우는 방식이 좋습니다. 연애운은 유쾌한 소통이 매력을 높이고, 건강운은 눈 피로와 목 긴장 관리에 신경 쓰면 에너지 유지에 도움이 됩니다.',
  rooster: '2026년 닭띠는 정교함과 완성도가 경쟁력이 되는 해입니다. 상반기에는 세부 기획, 품질 관리, 문서화 능력이 높은 평가를 받아 중요한 역할을 맡기 쉽습니다. 하반기에는 그 결과가 승진, 계약, 고객 신뢰로 연결될 가능성이 큽니다. 재물운은 계획형 소비가 강점으로 작동하며, 목표 저축과 고정비 최적화가 자산 증가를 만듭니다. 연애운은 표현을 아끼지 않을수록 관계가 따뜻해지고, 싱글은 현실적인 가치관이 맞는 인연과의 연결이 유리합니다. 건강은 피부와 호흡기 관리, 실내 습도 조절이 컨디션 유지에 효과적입니다.',
  dog: '2026년 개띠는 책임감과 신뢰가 직접적인 기회로 돌아오는 해입니다. 상반기에는 주변의 기대가 커져 역할이 확대되지만, 우선순위를 명확히 하면 부담보다 성취가 크게 남습니다. 하반기에는 장기적으로 준비한 일이 결실을 맺고 실질적 보상이 따르기 쉽습니다. 재물운은 보수적 운영이 안정적이며, 충동 지출만 줄여도 저축 속도가 빨라집니다. 연애운은 진정성 있는 태도가 관계를 깊게 만들고, 기존 관계는 생활 리듬을 맞추는 대화가 중요합니다. 건강운은 면역 관리와 규칙적 운동이 피로 누적을 막는 핵심입니다.',
  pig: '2026년 돼지띠는 확장과 안정이 균형을 이루는 해입니다. 상반기에는 새로운 공부, 자격, 업무 스킬 업그레이드에 투자할수록 하반기 성과가 커집니다. 주변 도움운이 좋아 협업 제안과 소개 기회가 자연스럽게 들어옵니다. 하반기에는 금전 흐름이 안정되며, 중장기 목표를 세우고 자동화 저축을 적용하면 체감 성과가 빠릅니다. 연애운은 편안한 소통이 관계를 깊게 만들고, 싱글은 취향 기반 모임에서 인연운이 좋습니다. 건강은 식습관 균형과 늦은 야식 조절이 핵심이며, 수면 시간을 확보하면 전반적 운세 상승을 체감합니다.',
}

const TOPIC_LINKS = [
  { slug: 'jaemulun', label: '재물운' },
  { slug: 'yeonaewun', label: '연애운' },
  { slug: 'chwieobun', label: '취업운' },
] as const

function getZodiacBySlug(animal: string) {
  return ZODIAC.find(item => item.slug === animal)
}

function formatKoreanDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
}

export function generateStaticParams() {
  return ZODIAC.map(item => ({ animal: item.slug }))
}

type Params = { params: { animal: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { animal } = params
  const zodiac = getZodiacBySlug(animal)

  if (!zodiac) {
    return {
      title: '띠별 운세 | 사주해',
      description: '사주해에서 띠별 오늘 운세와 2026년 운세 흐름을 확인하세요.',
    }
  }

  const title = `${zodiac.animal}띠 2026 운세 | 오늘의 ${zodiac.animal}띠 운세 | 사주해`
  const description = `${zodiac.icon} ${zodiac.animal}띠를 위한 오늘의 운세와 2026년 연간 흐름을 한 페이지에서 확인하세요. ${zodiac.animal}띠 생년과 핵심 키워드, 맞춤 운세 안내까지 제공합니다.`

  return {
    title,
    description,
    keywords: [
      `${zodiac.animal}띠 2026 운세`,
      `${zodiac.animal}띠 오늘 운세`,
      `${zodiac.animal}띠 운세`,
      `${zodiac.animal}띠 생년`,
      '띠별 운세',
      '사주해',
    ],
    alternates: {
      canonical: `/fortune/ddi/${zodiac.slug}`,
    },
  }
}

export default async function DdiAnimalFortunePage({ params }: Params) {
  const { animal } = params
  const zodiac = getZodiacBySlug(animal)

  if (!zodiac) {
    notFound()
  }

  const today = new Date().toISOString().slice(0, 10)
  const todayLabel = formatKoreanDate(new Date())
  const supabase = getSupabase()
  const zodiacIndex = ZODIAC.findIndex(item => item.slug === zodiac.slug)

  let representative = '오늘의 운세 데이터가 준비되는 중입니다. 잠시 후 다시 확인해 주세요.'
  if (supabase) {
    const { data } = await supabase
      .from('daily_fortunes')
      .select('group_index, content')
      .eq('fortune_date', today)
      .order('group_index', { ascending: true })

    const rows = (data ?? []) as DailyFortuneRow[]
    const matches = rows.filter(row => row.group_index % 12 === zodiacIndex)
    if (matches.length > 0) {
      representative = matches[0].content
    }
  }

  const otherAnimals = ZODIAC.filter(item => item.slug !== zodiac.slug)
  const topicAnimalSlug = zodiac.slug === 'sheep' ? 'goat' : zodiac.slug

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <p className="text-xs text-slate-400">{todayLabel}</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">
            {zodiac.icon} {zodiac.animal}띠 2026 운세
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {zodiac.animal}띠 오늘의 흐름과 2026년 핵심 운세 포인트를 짧고 명확하게 정리했습니다.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 lg:col-span-2">
            <h2 className="font-serif-kr text-xl font-bold text-amber-300">오늘의 {zodiac.animal}띠 운세</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{representative}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="font-serif-kr text-xl font-bold text-amber-300">{zodiac.animal}띠 생년</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{zodiac.birthYears.join(', ')}</p>
            <p className="mt-2 text-xs text-slate-500">음력 입춘 기준으로 연도 경계가 달라질 수 있습니다.</p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">{zodiac.animal}띠 2026년 연간 전망</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{YEARLY_OUTLOOK[zodiac.slug]}</p>
        </section>

        <section className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">내 운세를 더 정확하게 확인해 보세요</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            띠 운세는 큰 흐름을 보여줍니다. 생년월일시 기반 사주 해석으로 나만의 운세 타이밍을 확인하세요.
          </p>
          <div className="mt-5 text-sm">
            <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 transition hover:bg-amber-400">
              내 사주로 더 정확한 운세 보기 →
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">다른 띠 운세도 함께 보기</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherAnimals.map(item => (
              <Link
                key={item.slug}
                href={`/fortune/ddi/${item.slug}`}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
              >
                {item.icon} {item.animal}띠
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300">더 자세한 운세</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {zodiac.animal}띠의 세부 카테고리 운세를 확인하고 재물, 연애, 취업 흐름을 더 구체적으로 살펴보세요.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TOPIC_LINKS.map(topic => (
              <Link
                key={topic.slug}
                href={`/fortune/ddi/${topicAnimalSlug}/${topic.slug}`}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
              >
                {zodiac.animal}띠 {topic.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

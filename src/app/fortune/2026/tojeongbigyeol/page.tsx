import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedContent from '@/components/RelatedContent'

export const metadata: Metadata = {
  title: '토정비결 2026 - 병오년 토정비결 운세 총정리 | 사주해',
  description: '토정비결 2026 병오년 운세를 한눈에 확인하세요. 이지함 선생의 토정비결로 보는 12지 동물별 월별 운세 분석과 해석입니다.',
  keywords: ['토정비결', '토정비결 2026', '병오년 토정비결', '무료 토정비결', '토정비결 운세'],
}

const RELATED_LINKS = [
  { href: '/fortune/2026/samjae', title: '2026 삼재띠', description: '들삼재, 눌삼재, 날삼재 핵심만 빠르게 확인하세요.' },
  { href: '/fortune/2026/daebak', title: '2026 대박띠', description: '병오년에서 기세를 타는 띠를 함께 비교해보세요.' },
  { href: '/fortune/2026', title: '2026 띠별 운세', description: '12지 띠별 연간 운세를 한눈에 정리한 페이지입니다.' },
  { href: '/fortune/2026/month/1', title: '1월 운세', description: '연초 월운을 먼저 확인해 토정비결을 실전에 연결하세요.' },
]

export default function TojeongbigyeolPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '2026년 운세', href: '/fortune/2026' }, { label: '토정비결' }]} />

        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <p className="text-xs text-slate-400">전통 운세</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">2026년 병오년 토정비결</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            조선시대 이지함 선생이 저술한 토정비결은 12지지의 특성과 월별 기운을 통해 한 해의 운세를 예측하는 전통 운학입니다.
            2026년 병오년의 띠별 토정비결 운세를 상세히 분석해드립니다.
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">토정비결이란?</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            토정비결(土正秘訣)은 조선시대 명리학자 이지함 선생이 저술한 운세 해석서입니다. 
            12지지 동물의 특성과 음력 월별 기운의 상호작용을 통해 개인의 운세를 예측합니다. 
            특히 태어난 띠와 해당 연도의 천간지지 조합을 분석하여 재물, 연애, 건강, 직업 운을 종합적으로 해석합니다.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            토정비결은 사주의 정밀함과 달리 누구나 쉽게 접근할 수 있는 대중적 운학으로, 
            한 해의 전반적인 흐름과 주의할 점을 빠르게 파악하는 데 유용합니다.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">2026년 병오년 토정비결 - 12지 동물별 운세</h2>
          
          <div className="mt-6 space-y-5">
            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐭 쥐띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                2026년 병오년은 쥐띠에게 속도 조절과 신중함이 요구되는 해입니다. 
                상반기는 새로운 기회가 들어오지만 중반부터 변수가 생기므로 성급한 결정을 피해야 합니다. 
                재물운은 지출 구조를 정리하면 후반기에 안정감이 커지고, 관계운은 솔직한 대화가 갈등을 줄입니다. 
                큰 결정보다 우선순위를 세워 단계적으로 진행하는 방식이 유리합니다.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐮 소띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                소띠는 병오년의 화기(火氣)를 통해 정체된 에너지를 깨우는 흐름을 받습니다. 
                기존에 미뤄둔 공부, 자격증, 커리어 확장 계획을 재가동하기에 적절한 시점입니다. 
                다만 완벽주의로 진입 속도를 늦추면 기회를 놓칠 수 있으니 작은 단위의 실행을 반복하세요. 
                연말로 갈수록 신뢰와 성과가 동시에 쌓이는 구조가 형성됩니다.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐯 호랑이띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                호랑이띠는 추진력과 존재감이 강해지는 해입니다. 
                병오의 양화 기운이 결단을 돕기 때문에 리더 역할이나 전면 프로젝트에서 두각을 나타내기 쉽습니다. 
                운이 강한 시기일수록 조율 능력이 성패를 가르므로 주변의 속도를 맞추고 협력 구조를 만들면 
                단기 성과를 장기 기반으로 전환할 수 있습니다.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐰 토끼띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                토끼띠에게 2026년은 감정과 현실의 균형을 점검하는 해입니다. 
                대외 활동이 늘어나는 만큼 체력과 집중력 관리가 중요하며, 선택과 집중이 운을 끌어올립니다. 
                연애와 인간관계는 배려가 강점으로 작동하지만 경계가 흐려지기 쉬우니 선을 분명히 하는 것이 좋습니다. 
                일에서는 루틴을 표준화하면 불필요한 소모가 줄어듭니다.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐲 용띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                용띠는 병오년에서 명확한 목표를 세울수록 기회가 커집니다. 
                확장운이 들어오므로 브랜딩, 사업, 이직, 외부 협업 같은 키워드가 활발하게 움직입니다. 
                다만 과열된 자신감은 리스크를 키울 수 있어 검증 루틴이 필수입니다. 
                수익 구조를 분산하고 장기 지표를 함께 보면 안정적으로 성장할 수 있습니다.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐍 뱀띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                뱀띠는 통찰과 집중이 강하게 살아나는 해입니다. 
                겉으로 드러나지 않던 역량이 평가받기 쉬우며, 기획과 분석 중심의 역할에서 높은 효율을 냅니다. 
                건강운은 수면과 순환 관리가 중요합니다. 
                관계에서는 과도한 해석보다 사실 기반 소통이 유리하며, 신뢰를 쌓는 속도를 조절하면 장기운이 좋아집니다.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐴 말띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                말띠에게 병오년은 본령에 가까운 해라 에너지가 크게 상승합니다. 
                이동, 변화, 확장의 흐름이 강하고 실행 속도가 곧 경쟁력이 되는 국면이 많습니다. 
                기세만으로 밀어붙이면 피로 누적이 빠를 수 있으니 회복 주기를 설계해야 합니다. 
                재물은 분산 투자와 현금흐름 관리가 핵심이며, 감정 소비를 줄이는 습관이 필요합니다.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐑 양띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                양띠는 병오년에서 관계의 질이 운의 질로 연결됩니다. 
                혼자 버티기보다 신뢰 가능한 팀과 파트너를 확보할수록 성과가 안정적으로 늘어나는 흐름입니다. 
                일에서는 방향성보다 지속성이 중요하며, 작게 시작해 일관되게 축적하는 방식이 적합합니다. 
                연애운은 상대의 리듬을 존중할 때 좋은 전개가 이어집니다.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐵 원숭이띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                원숭이띠는 아이디어와 실전 감각이 동시에 살아나는 해입니다. 
                빠른 판단으로 기회를 잡을 수 있지만, 중간 점검 없는 확장은 오히려 비용을 키울 수 있습니다. 
                문서, 계약, 약속 같은 디테일을 단단히 챙기면 리스크를 크게 줄일 수 있습니다. 
                사람운은 네트워크 확장보다 핵심 인맥 유지가 더 큰 수확을 만듭니다.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐔 닭띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                닭띠는 병오년에서 기준과 원칙이 빛나는 시기입니다. 
                평가, 심사, 승진처럼 객관적 결과가 필요한 영역에서 강점을 발휘하기 쉽습니다. 
                완성도를 높이는 능력이 큰 자산이지만 과도한 자기검열은 기회를 늦출 수 있습니다. 
                공개 시점을 앞당기고 피드백을 받는 전략이 운을 더 크게 엽니다.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐶 개띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                개띠는 2026년에 책임과 확장의 기운이 함께 들어옵니다. 
                맡은 범위가 넓어지는 만큼 우선순위 관리가 중요하고, 경계 설정이 체력과 성과를 동시에 지켜줍니다. 
                가정과 일의 균형을 맞추면 심리적 안정이 커지고 판단력도 좋아집니다. 
                금전은 공격보다 방어 전략이 유리하며, 불필요한 고정비부터 정리하는 것이 좋습니다.
              </p>
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-serif-kr text-lg font-bold text-amber-300">🐷 돼지띠</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                돼지띠는 병오년에서 감각과 직관이 강해지지만, 현실 검증이 동반될 때 가장 큰 성과를 얻습니다. 
                배움과 확장 욕구가 커져 새로운 분야에 도전하기 좋습니다. 
                연애운은 감정 표현이 긍정적으로 작동하며, 일에서는 과업을 세분화할수록 완성도가 높아집니다. 
                연말에는 누적된 경험이 기회로 연결되는 장면이 많아집니다.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">2026년 월별 토정비결 하이라이트</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
            <p><span className="font-bold text-amber-300">1월(정월):</span> 새해 시작의 기운. 계획 수립과 목표 설정이 중요한 시기입니다.</p>
            <p><span className="font-bold text-amber-300">2월(2월):</span> 변화의 기운이 강해집니다. 새로운 시작과 도전에 유리한 시기입니다.</p>
            <p><span className="font-bold text-amber-300">3월(3월):</span> 성장과 확장의 기운. 사업 확대와 새로운 프로젝트 시작에 좋습니다.</p>
            <p><span className="font-bold text-amber-300">4월(4월):</span> 안정과 정착의 시기. 기초를 다지고 체계를 정비하는 것이 좋습니다.</p>
            <p><span className="font-bold text-amber-300">5월(5월):</span> 활동과 이동의 기운. 여행, 이사, 전직 등의 변화에 유리합니다.</p>
            <p><span className="font-bold text-amber-300">6월(6월):</span> 휴식과 정리의 시기. 상반기를 마무리하고 하반기를 준비합니다.</p>
            <p><span className="font-bold text-amber-300">7월(7월):</span> 새로운 시작의 기운. 하반기 목표를 설정하고 실행합니다.</p>
            <p><span className="font-bold text-amber-300">8월(8월):</span> 수확과 성과의 시기. 상반기 노력이 결실을 맺습니다.</p>
            <p><span className="font-bold text-amber-300">9월(9월):</span> 변화와 전환의 기운. 새로운 방향 설정이 필요한 시기입니다.</p>
            <p><span className="font-bold text-amber-300">10월(10월):</span> 안정과 축적의 시기. 성과를 정리하고 기반을 다집니다.</p>
            <p><span className="font-bold text-amber-300">11월(11월):</span> 마무리와 정산의 시기. 연말을 준비하고 정리합니다.</p>
            <p><span className="font-bold text-amber-300">12월(12월):</span> 휴식과 성찰의 시기. 한 해를 돌아보고 내년을 준비합니다.</p>
          </div>
        </section>

        <RelatedContent links={RELATED_LINKS} />

        <section className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">개인 사주로 더 정확한 운세를 보세요</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            토정비결은 띠별 공통 기운을 보여주지만, 실제 운세는 개인의 사주(원국과 대운)에 따라 크게 달라집니다. 
            같은 띠라도 직업, 연애, 재물의 강약이 다르게 나타나므로 개인 맞춤 해석이 가장 정확합니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
              내 사주로 더 정확한 운세 보기 →
            </Link>
            <Link href="/fortune/2026" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              2026년 띠별 운세 보기
            </Link>
            <Link href="/fortune/today" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              오늘의 운세
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              프리미엄 해석
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

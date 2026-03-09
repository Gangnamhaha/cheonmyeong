import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '대박띠 2026 - 병오년 가장 운이 좋은 띠 | 천명',
  description: '2026년 병오년 대박띠를 확인하세요. 올해 가장 운이 좋은 띠와 각 대박띠별 상세 운세, 행운을 극대화하는 방법을 알려드립니다.',
  keywords: ['대박띠 2026', '올해 운 좋은 띠', '병오년 대박띠', '2026년 운세', '띠별 운세'],
}

export default function DaebakPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <p className="text-xs text-slate-400">운세 분석</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">2026년 대박띠 - 가장 운이 좋은 띠는?</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            2026년 병오년의 기운을 분석하여 가장 운이 좋은 대박띠를 소개합니다.
            각 대박띠별 상세 운세와 행운을 극대화하는 방법을 확인하세요.
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">2026년 병오년의 기운 분석</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            2026년은 병오년(丙午年)으로, 불의 기운(화기)이 매우 강한 해입니다. 
            병(丙)은 양의 불을 의미하고, 오(午)는 말을 의미하며 역시 불의 기운을 가지고 있습니다. 
            따라서 2026년은 화기가 이중으로 강해지는 해로, 추진력, 가시성, 외부 활동이 상승하는 시기입니다.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            화기가 강한 해에는 불의 기운과 조화를 이루는 띠들이 특히 운이 좋습니다. 
            동양 오행 이론에서 불(火)과 가장 잘 어울리는 것은 나무(木)와 불 자체(火)입니다. 
            따라서 호랑이띠(목기), 개띠(화기), 말띠(화기)가 2026년의 대박띠입니다.
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">2026년 대박띠 TOP 3</h2>
          
          <div className="mt-6 space-y-6">
            <article className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5">
              <h3 className="font-serif-kr text-xl font-bold text-amber-300">🐯 호랑이띠 - 인오술 삼합의 강자</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                호랑이띠는 2026년 병오년에서 가장 강력한 운을 받는 띠입니다. 
                호랑이(인)는 목기를 가지고 있으며, 말(오)과 개(술)와 함께 인오술 삼합을 이루어 
                불의 기운을 완벽하게 활용할 수 있습니다.
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div>
                  <p className="font-bold text-amber-300">재물운:</p>
                  <p className="mt-1">
                    사업 확장, 투자 수익, 부동산 거래 등에서 큰 성과를 기대할 수 있습니다. 
                    상반기부터 기회가 들어오므로 신속한 결정이 중요합니다.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-amber-300">연애운:</p>
                  <p className="mt-1">
                    매력과 카리스마가 극대화되는 시기입니다. 
                    싱글은 새로운 만남의 기회가 많고, 커플은 관계가 더욱 돈독해집니다.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-amber-300">직업운:</p>
                  <p className="mt-1">
                    리더십이 빛나는 시기로, 승진, 이직, 창업 등 큰 변화에 유리합니다. 
                    팀 내 영향력이 커지고 신뢰도 높아집니다.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-amber-300">건강운:</p>
                  <p className="mt-1">
                    에너지가 넘치는 시기이지만, 과로로 인한 피로 누적에 주의해야 합니다. 
                    규칙적인 운동과 충분한 휴식이 필요합니다.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5">
              <h3 className="font-serif-kr text-xl font-bold text-amber-300">🐶 개띠 - 인오술 삼합의 조화</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                개띠는 호랑이띠와 함께 인오술 삼합을 이루는 띠로, 2026년에 매우 좋은 운을 받습니다. 
                개(술)는 토기를 가지고 있으며, 불의 기운을 안정적으로 받아들일 수 있습니다.
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div>
                  <p className="font-bold text-amber-300">재물운:</p>
                  <p className="mt-1">
                    안정적인 수입 증가와 예상치 못한 횡재가 들어올 수 있습니다. 
                    보수적인 투자와 저축으로 자산을 늘리는 것이 좋습니다.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-amber-300">연애운:</p>
                  <p className="mt-1">
                    신뢰와 안정감이 매력으로 작동하는 시기입니다. 
                    진심 어린 태도가 좋은 인연을 만들고, 기존 관계는 더욱 깊어집니다.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-amber-300">직업운:</p>
                  <p className="mt-1">
                    책임감 있는 역할에서 높은 평가를 받습니다. 
                    팀 내 신뢰도가 높아지고, 중요한 프로젝트를 맡을 기회가 많아집니다.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-amber-300">건강운:</p>
                  <p className="mt-1">
                    전반적으로 건강한 시기입니다. 
                    스트레스 관리와 정기적인 운동으로 건강을 유지하면 더욱 좋습니다.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5">
              <h3 className="font-serif-kr text-xl font-bold text-amber-300">🐴 말띠 - 본명년의 특수 에너지</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                말띠는 2026년 병오년에서 본명년(本命年)을 맞이합니다. 
                말(오)은 불의 기운을 가지고 있으며, 병오년의 화기와 완벽하게 일치하여 
                특수한 에너지를 받게 됩니다.
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div>
                  <p className="font-bold text-amber-300">재물운:</p>
                  <p className="mt-1">
                    변화와 이동을 통한 재물 증가가 가능합니다. 
                    새로운 사업, 이직, 부동산 거래 등에서 좋은 결과를 기대할 수 있습니다.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-amber-300">연애운:</p>
                  <p className="mt-1">
                    활동적이고 매력적인 에너지가 돋보이는 시기입니다. 
                    새로운 만남의 기회가 많고, 기존 관계도 더욱 활발해집니다.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-amber-300">직업운:</p>
                  <p className="mt-1">
                    변화와 도전의 시기로, 새로운 분야로의 진출이나 창업에 유리합니다. 
                    실행력과 추진력이 극대화되는 시기입니다.
                  </p>
                </div>
                <div>
                  <p className="font-bold text-amber-300">건강운:</p>
                  <p className="mt-1">
                    에너지가 넘치는 시기이지만, 과도한 활동으로 인한 피로에 주의해야 합니다. 
                    회복 주기를 설계하고 충분한 휴식을 취하세요.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">대박띠별 월별 운세 하이라이트</h2>
          
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">호랑이띠</h3>
              <p className="mt-2">
                1월-3월: 새해 계획 실행, 기회 포착 / 4월-6월: 사업 확장, 투자 수익 / 
                7월-9월: 성과 정리, 관계 강화 / 10월-12월: 연말 정산, 내년 준비
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">개띠</h3>
              <p className="mt-2">
                1월-3월: 안정적 시작, 신뢰 구축 / 4월-6월: 수입 증가, 기회 확대 / 
                7월-9월: 성과 확인, 관계 정리 / 10월-12월: 감사와 나눔, 내년 계획
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">말띠</h3>
              <p className="mt-2">
                1월-3월: 활동 시작, 새로운 도전 / 4월-6월: 변화와 이동, 기회 포착 / 
                7월-9월: 성과 수확, 관계 확대 / 10월-12월: 정리와 준비, 내년 계획
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">대박띠의 행운을 극대화하는 방법</h2>
          
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">1. 적극적인 행동</h3>
              <p className="mt-2">
                2026년은 행동이 곧 결과로 이어지는 시기입니다. 
                미루지 말고 계획한 것들을 신속하게 실행하세요. 
                기회는 준비된 자에게만 찾아옵니다.
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">2. 인간관계 강화</h3>
              <p className="mt-2">
                좋은 운을 함께 나눌 수 있는 사람들과의 관계를 소중히 하세요. 
                네트워킹과 협력을 통해 더 큰 성과를 만들 수 있습니다.
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">3. 건강 관리</h3>
              <p className="mt-2">
                에너지가 넘치는 시기이지만, 과로로 인한 피로 누적에 주의하세요. 
                규칙적인 운동, 충분한 수면, 균형 잡힌 식단으로 건강을 유지하세요.
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">4. 재정 관리</h3>
              <p className="mt-2">
                수입이 증가하는 시기이지만, 지출도 함께 늘어날 수 있습니다. 
                계획적인 재정 관리와 저축으로 자산을 늘리세요.
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">5. 행운 색상 활용</h3>
              <p className="mt-2">
                호랑이띠: 초록색, 파란색 / 개띠: 빨강색, 주황색 / 말띠: 빨강색, 주황색
                이러한 색상을 옷, 액세서리, 인테리어에 활용하면 심리적 안정과 행운을 강화할 수 있습니다.
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
              <h3 className="font-bold text-amber-300">6. 자기계발</h3>
              <p className="mt-2">
                좋은 운을 더욱 크게 활용하기 위해 자기계발에 투자하세요. 
                새로운 기술 습득, 자격증 취득, 독서 등을 통해 내적 성장을 이루면 
                더 큰 기회를 맞이할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">다른 띠들의 2026년 운세</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            호랑이띠, 개띠, 말띠가 가장 좋은 운을 받지만, 다른 띠들도 각각의 특성에 맞는 운을 받습니다. 
            자신의 띠에 맞는 전략을 세우면 2026년을 더욱 의미 있게 보낼 수 있습니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link href="/fortune/2026" className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              2026년 띠별 운세 보기
            </Link>
            <Link href="/fortune/2026/tojeongbigyeol" className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              토정비결 2026
            </Link>
            <Link href="/fortune/2026/samjae" className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              삼재띠 2026
            </Link>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">내 사주로 올해 운세를 상세 분석하세요</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            띠별 운세는 공통 기운을 보여주지만, 실제 운세는 개인의 사주(원국과 대운)에 따라 크게 달라집니다. 
            같은 대박띠라도 직업, 연애, 재물의 강약이 다르게 나타나므로 개인 맞춤 해석이 가장 정확합니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
              내 사주로 올해 운세 상세 분석 →
            </Link>
            <Link href="/fortune/today" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              오늘의 운세
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              프리미�um 분석
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

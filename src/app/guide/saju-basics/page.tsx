import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '사주팔자란? - 사주 입문 가이드 | 천명',
  description: '사주팔자의 의미, 천간과 지지, 오행, 십신, 용신까지 처음 보는 분도 이해할 수 있게 정리한 사주 입문 가이드입니다.',
  keywords: ['사주팔자란', '사주 기초', '천간 지지', '십신', '용신', '명리학 입문'],
}

export default function SajuBasicsGuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6">
          <h1 className="font-serif-kr text-3xl font-black text-amber-400">사주팔자란?</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            사주팔자는 태어난 순간의 시간 정보로 기질과 운의 흐름을 읽는 동양의 시간 해석 체계입니다.
            어렵게 느껴지는 용어를 핵심부터 간단히 정리했습니다.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">사주팔자의 의미</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            사주(四柱)는 연주, 월주, 일주, 시주의 네 기둥이고, 각 기둥은 천간과 지지 두 글자로 구성됩니다.
            그래서 전체가 팔자(八字)가 됩니다.
          </p>
          <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-950/70 p-4 text-sm leading-relaxed text-slate-200">
            {`연주  월주  일주  시주
  │    │    │    │
천간  천간  천간  천간
지지  지지  지지  지지
=> 총 8글자(팔자)`}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">천간과 지지</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            천간은 하늘의 기운(갑을병정무기경신임계), 지지는 땅의 기운(자축인묘진사오미신유술해)을 의미합니다.
            두 축이 결합해 60갑자를 만들고, 그 조합이 사람마다 다른 시간 지문이 됩니다.
          </p>
          <p className="mt-4 text-sm text-slate-300">🌤️ 천간 = 방향성과 의식 / 🌍 지지 = 환경과 현실 작동 방식</p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">오행이란</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            오행(목화토금수)은 기운의 다섯 작동 원리입니다. 사주에서 어떤 오행이 과하거나 부족한지 보면 성향,
            관계 방식, 일의 스타일을 읽을 수 있습니다.
          </p>
          <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-950/70 p-4 text-sm leading-relaxed text-slate-200">
            {`🌳 목 → 성장/확장
🔥 화 → 표현/열정
⛰️ 토 → 안정/중재
⚔️ 금 → 질서/결단
💧 수 → 사고/유연성`}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">십신이란</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            십신은 나(일간)와 다른 기운의 관계를 10가지 역할로 해석하는 도구입니다. 예를 들어 재성은 자원과 현실
            운영, 관성은 책임과 사회적 구조, 인성은 배움과 보호의 의미를 가집니다.
          </p>
          <p className="mt-4 text-sm text-slate-300">비겁 · 식상 · 재성 · 관성 · 인성의 균형을 보면 삶의 운영 방식이 선명해집니다.</p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">용신이란</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            용신은 사주 전체 균형을 맞추는 핵심 기운입니다. 부족한 부분을 보완하거나 과한 흐름을 조절해 운의 질을
            개선하는 기준점 역할을 합니다.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            같은 상황에서도 용신 방향에 맞는 선택을 하면 시행착오를 줄일 수 있습니다.
          </p>
        </section>

        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">바로 실전으로 연결하기</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/saju/free" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400">
              무료 사주풀이 시작
            </Link>
            <Link href="/gunghap" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-100 hover:border-amber-400 hover:text-amber-300">
              궁합 분석 보기
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-100 hover:border-amber-400 hover:text-amber-300">
              요금제 보기
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

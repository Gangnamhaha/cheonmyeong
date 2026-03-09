import type { Metadata } from 'next'
import Link from 'next/link'
import UpsellBanner from '@/components/UpsellBanner'
import { getSupabase } from '@/lib/db'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '오늘의 운세 - 2026년 3월 | 천명',
  description: '오늘의 띠별 운세를 확인하세요. 쥐띠부터 돼지띠까지 12띠 운세를 한 번에 보고, 내 사주 기반 맞춤 운세로 더 깊게 확인할 수 있습니다.',
  keywords: ['오늘의 운세', '띠별 운세', '무료 운세', '사주 운세', '천명'],
}

type DailyFortuneRow = {
  group_index: number
  content: string
}

const ZODIAC = [
  { branch: '자', animal: '쥐', icon: '🐭' },
  { branch: '축', animal: '소', icon: '🐮' },
  { branch: '인', animal: '호랑이', icon: '🐯' },
  { branch: '묘', animal: '토끼', icon: '🐰' },
  { branch: '진', animal: '용', icon: '🐲' },
  { branch: '사', animal: '뱀', icon: '🐍' },
  { branch: '오', animal: '말', icon: '🐴' },
  { branch: '미', animal: '양', icon: '🐑' },
  { branch: '신', animal: '원숭이', icon: '🐵' },
  { branch: '유', animal: '닭', icon: '🐔' },
  { branch: '술', animal: '개', icon: '🐶' },
  { branch: '해', animal: '돼지', icon: '🐷' },
] as const

function formatKoreanDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
}

export default async function TodayFortunePage() {
  const today = new Date().toISOString().slice(0, 10)
  const todayLabel = formatKoreanDate(new Date())
  const supabase = getSupabase()

  let rows: DailyFortuneRow[] = []
  if (supabase) {
    const { data } = await supabase
      .from('daily_fortunes')
      .select('group_index, content')
      .eq('fortune_date', today)
      .order('group_index', { ascending: true })

    rows = (data ?? []) as DailyFortuneRow[]
  }

  const grouped = ZODIAC.map((item, index) => {
    const fortunes = rows.filter(row => row.group_index % 12 === index)
    return {
      ...item,
      representative: fortunes[0]?.content ?? '오늘의 운세 데이터가 준비되는 중입니다. 잠시 후 다시 확인해 주세요.',
      totalGroups: fortunes.length,
    }
  })

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <p className="text-xs text-slate-400">{todayLabel}</p>
          <h1 className="font-serif-kr mt-2 text-3xl font-black text-amber-400">오늘의 띠별 운세</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            매일 갱신되는 60갑자 데이터를 바탕으로 12띠 운세를 정리했습니다. 오늘의 흐름을 먼저 확인하고,
            내 생년월일시 기반 정밀 해석으로 이어가세요.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map(item => (
            <article key={item.animal} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-serif-kr text-xl font-bold text-amber-300">
                  {item.icon} {item.animal}띠
                </h2>
                <span className="text-xs text-slate-500">{item.totalGroups}/5 그룹 반영</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{item.representative}</p>
            </article>
          ))}
        </section>

        <div className="mt-10">
          <UpsellBanner variant="card" />
        </div>

        <section className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="font-serif-kr text-2xl font-bold text-amber-300">오늘 운세를 더 정확하게 보는 방법</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">
            띠별 운세는 큰 흐름을 보는 데 유리하지만, 실제 운의 방향은 사주 원국과 대운, 세운의 상호작용으로
            달라집니다. 생년월일시를 입력해 개인 맞춤 해석을 받아보세요.
          </p>
          <div className="mt-4">
            <UpsellBanner variant="inline" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/saju/free" className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 transition hover:bg-amber-400">
              무료 사주 분석으로 더 정확한 운세 보기 →
            </Link>
            <Link href="/gunghap" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              무료 궁합 보기
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              프리미엄 해석 안내
            </Link>
            <Link href="/fortune/2026" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300">
              2026년 운세 보기
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

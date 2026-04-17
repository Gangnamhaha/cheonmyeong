import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabase } from '@/lib/db'
import CardDownloadButtons from './CardDownloadButtons'

type Params = { params: { id: string } }

type JsonMap = Record<string, unknown>

async function getResult(id: string) {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data } = await supabase
    .from('saju_results')
    .select('id, form_data, saju_data, ai_interpretations, created_at, view_count')
    .eq('id', id)
    .single()

  return data
}

function getDayPillarText(sajuData: JsonMap): string {
  const saju = (sajuData.saju ?? {}) as JsonMap
  const dayPillar = (saju.dayPillar ?? {}) as JsonMap
  return `${dayPillar.heavenlyStemHanja ?? dayPillar.heavenlyStem ?? ''}${dayPillar.earthlyBranchHanja ?? dayPillar.earthlyBranch ?? ''}` || '정보 없음'
}

function getYongsinText(sajuData: JsonMap): string {
  const yongsin = (sajuData.yongsin ?? {}) as JsonMap
  return typeof yongsin.yongsin === 'string' ? yongsin.yongsin : '정보 없음'
}

function asText(value: unknown, fallback = '-'): string {
  if (typeof value === 'string' && value.trim()) return value
  return fallback
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const row = await getResult(params.id)
  if (!row) {
    return {
      title: '사주 결과를 찾을 수 없습니다 | 사주해',
      description: '요청한 사주 결과가 존재하지 않습니다.',
    }
  }

  const formData = (row.form_data ?? {}) as JsonMap
  const sajuData = (row.saju_data ?? {}) as JsonMap
  const name = typeof formData.name === 'string' && formData.name.trim() ? formData.name : '사용자'
  const dayPillar = getDayPillarText(sajuData)
  const yongsin = getYongsinText(sajuData)

  return {
    title: `${name}님의 사주팔자 결과 | 사주해`,
    description: `일주: ${dayPillar} | 용신: ${yongsin} | AI 사주 분석 결과`,
    openGraph: {
      title: `${name}님의 사주팔자 결과 | 사주해`,
      description: `일주: ${dayPillar} | 용신: ${yongsin} | AI 사주 분석 결과`,
      images: [{ url: `/api/og/${params.id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name}님의 사주팔자 결과 | 사주해`,
      description: `일주: ${dayPillar} | 용신: ${yongsin} | AI 사주 분석 결과`,
      images: [`/api/og/${params.id}`],
    },
  }
}

export default async function ResultPage({ params }: Params) {
  const row = await getResult(params.id)
  if (!row) notFound()

  const formData = (row.form_data ?? {}) as JsonMap
  const sajuData = (row.saju_data ?? {}) as JsonMap
  const saju = (sajuData.saju ?? {}) as JsonMap
  const oheng = ((sajuData.oheng ?? {}) as JsonMap).counts as JsonMap | undefined
  const aiInterpretations = (row.ai_interpretations ?? {}) as JsonMap

  const firstAiCategory = Object.entries(aiInterpretations).find((entry) => typeof entry[1] === 'string' && (entry[1] as string).trim())

  const pillars = [
    { label: '시주', key: 'hourPillar' },
    { label: '일주', key: 'dayPillar' },
    { label: '월주', key: 'monthPillar' },
    { label: '년주', key: 'yearPillar' },
  ]

  return (
    <main className="min-h-screen px-4 py-10" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-xs tracking-widest" style={{ color: 'var(--text-muted)' }}>사주해 공유 결과</p>
          <h1 className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-accent)' }}>
            {(formData.name as string) || '사용자'}님의 사주팔자
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {(formData.year as number) || '-'}년 {(formData.month as number) || '-'}월 {(formData.day as number) || '-'}일 {(formData.hour as number) || '-'}시 {(formData.minute as number) || 0}분
            {' · '}
            {formData.gender === 'male' ? '남성' : '여성'}
            {formData.calendarType === 'lunar' ? ' · 음력' : ' · 양력'}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {pillars.map(({ label, key }) => {
            const pillar = (saju[key] ?? {}) as JsonMap
            return (
              <div key={key} className="rounded-xl border p-4 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="mt-2 text-2xl font-bold" style={{ color: '#f59e0b' }}>
                  {asText(pillar.heavenlyStemHanja, asText(pillar.heavenlyStem))}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{asText(pillar.heavenlyStem)}</p>
                <p className="mt-1 text-2xl font-bold" style={{ color: '#f59e0b' }}>
                  {asText(pillar.earthlyBranchHanja, asText(pillar.earthlyBranch))}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{asText(pillar.earthlyBranch)}</p>
              </div>
            )
          })}
        </section>

        <section className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-accent)' }}>오행 요약</h2>
          <div className="mt-4 grid grid-cols-5 gap-2 text-center">
            {(['목', '화', '토', '금', '수'] as const).map((el) => (
              <div key={el} className="rounded-lg px-2 py-3" style={{ background: 'var(--bg-secondary)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{el}</p>
                <p className="mt-1 text-xl font-bold" style={{ color: '#f59e0b' }}>{(oheng?.[el] as number) ?? 0}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            일주: {getDayPillarText(sajuData)} · 용신: {getYongsinText(sajuData)}
          </p>
        </section>

        <CardDownloadButtons id={params.id} name={asText(formData.name, '사용자')} />

        {firstAiCategory && (
          <section className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-accent)' }}>AI 해석</h2>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>{firstAiCategory[0]}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-7" style={{ color: 'var(--text-secondary)' }}>
              {String(firstAiCategory[1])}
            </p>
          </section>
        )}


        {/* 구독 유도 CTA */}
        <section className="rounded-2xl border-2 p-6 text-center" style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #2d1500 100%)', borderColor: '#f59e0b' }}>
          <p className="text-xs tracking-widest font-semibold mb-2" style={{ color: '#f59e0b' }}>🔒 더 많은 운세가 잠겨있어요</p>
          <h3 className="text-xl font-bold mb-3" style={{ color: '#fff' }}>연애운 · 재물운 · 직업운 · 월별 상세 운세</h3>
          <div className="mb-4 rounded-xl p-4 text-left text-sm space-y-2" style={{ background: 'rgba(245,158,11,0.1)', filter: 'blur(0px)' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', userSelect: 'none' }}>● 2026년 재물운: ██████████████</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', userSelect: 'none' }}>● 이달의 연애운: ██████████</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', userSelect: 'none' }}>● 직업·커리어 운세: ████████████</p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-full px-8 py-4 text-base font-bold transition hover:opacity-90 shadow-lg"
            style={{ background: '#f59e0b', color: '#111827' }}
          >
            ₩3,900으로 전체 운세 보기 →
          </Link>
          <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>첫 달 특가 · 언제든 해지 가능</p>
        </section>

        <section className="rounded-2xl border p-6 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>내 사주도 무료로 보기</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center rounded-full px-6 py-3 text-sm font-bold transition hover:opacity-90"
            style={{ background: '#f59e0b', color: '#111827' }}
          >
            나도 사주 보기 →
          </Link>
        </section>
      </div>
    </main>
  )
}


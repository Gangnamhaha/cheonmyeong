'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { trackShare } from '@/lib/analytics'
import { shareGunghapResult } from '@/lib/kakao'
import { MBTI_TYPES, type MbtiType, getMbtiCompatibility } from '@/data/mbti-compatibility'

function MbtiSelector({
  label,
  value,
  onSelect,
}: {
  label: string
  value: MbtiType | null
  onSelect: (type: MbtiType) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-200">{label}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MBTI_TYPES.map((type) => {
          const active = value === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'border-amber-400 bg-amber-400/15 text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.25)]'
                  : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:text-slate-100'
              }`}
            >
              {type}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function MbtiClient() {
  const [me, setMe] = useState<MbtiType | null>(null)
  const [partner, setPartner] = useState<MbtiType | null>(null)

  const result = useMemo(() => {
    if (!me || !partner) return null
    return getMbtiCompatibility(me, partner)
  }, [me, partner])

  const shareTitle = result ? `${result.me} x ${result.partner} MBTI 궁합` : 'MBTI 궁합'

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-200">🎯 MBTI 궁합 확인하기</h2>
        <button
          type="button"
          onClick={() => {
            setMe(null)
            setPartner(null)
          }}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
        >
          초기화
        </button>
      </div>

      <div className="space-y-5">
        <MbtiSelector label="나의 MBTI" value={me} onSelect={setMe} />
        <MbtiSelector label="상대방 MBTI" value={partner} onSelect={setPartner} />
      </div>

      <div className="mt-6 min-h-44">
        {!result ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-8 text-center text-sm text-slate-400">
            MBTI 두 개를 선택하면 궁합 결과가 나타나요 ✨
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-4 transition-all duration-300 animate-in fade-in-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-300">
                <span className="font-bold text-amber-200">{result.me}</span> ×{' '}
                <span className="font-bold text-amber-200">{result.partner}</span>
              </p>
              <p className={`text-sm font-bold ${result.profile.colorClass}`}>
                {result.profile.emoji} {result.tier}
              </p>
            </div>

            <div className="flex items-center gap-2 text-amber-300">
              <span className="text-xs text-slate-400">궁합 점수</span>
              <span className="text-lg font-bold">{result.profile.score}%</span>
              <span className="text-sm">{'★'.repeat(result.profile.stars)}{'☆'.repeat(5 - result.profile.stars)}</span>
            </div>

            <p className="text-sm leading-relaxed text-slate-200">{result.profile.summary}</p>
            <p className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm leading-relaxed text-slate-300">
              🔮 {result.flavor}
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-3">
                <p className="mb-2 text-xs font-semibold text-emerald-300">강점</p>
                <ul className="space-y-1 text-xs leading-relaxed text-slate-300">
                  {result.profile.strengths.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-orange-900/50 bg-orange-950/20 p-3">
                <p className="mb-2 text-xs font-semibold text-orange-300">주의 포인트</p>
                <ul className="space-y-1 text-xs leading-relaxed text-slate-300">
                  {result.profile.cautions.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-xs leading-relaxed text-amber-100">
              <span className="font-semibold text-amber-300">궁합 조언: </span>
              {result.profile.advice}
            </div>

            <div className="grid gap-2 pt-1 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  shareGunghapResult({ person1: result.me, person2: result.partner, score: result.profile.score })
                  trackShare('kakao', 'mbti-compatibility')
                }}
                className="w-full rounded-lg py-3 text-sm font-bold transition-transform duration-200 hover:scale-[1.01]"
                style={{ background: '#FEE500', color: '#191919' }}
              >
                카카오톡으로 공유하기
              </button>
              <Link
                href="/gunghap"
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-500/20"
              >
                내 사주로 더 정확한 궁합 보기 →
              </Link>
            </div>
            <p className="text-center text-xs text-slate-500">{shareTitle}</p>
          </div>
        )}
      </div>
    </section>
  )
}

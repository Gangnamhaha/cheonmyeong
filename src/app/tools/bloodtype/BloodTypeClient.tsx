'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { trackShare } from '@/lib/analytics'
import { shareGunghapResult } from '@/lib/kakao'
import { BLOOD_TYPES, type BloodType, getBloodTypeCompatibility } from '@/data/bloodtype-compatibility'

const BLOOD_TYPE_EMOJI: Record<BloodType, string> = {
  A: '🧩',
  B: '🔥',
  O: '🌞',
  AB: '🪄',
}

function BloodTypeSelector({
  label,
  value,
  onSelect,
}: {
  label: string
  value: BloodType | null
  onSelect: (type: BloodType) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-200">{label}</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {BLOOD_TYPES.map((type) => {
          const active = value === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className={`rounded-2xl border px-4 py-5 text-center transition-all duration-200 ${
                active
                  ? 'border-amber-400 bg-amber-400/15 text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.25)]'
                  : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:text-slate-100'
              }`}
            >
              <p className="text-2xl">{BLOOD_TYPE_EMOJI[type]}</p>
              <p className="mt-2 text-lg font-black">{type}형</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function BloodTypeClient() {
  const [me, setMe] = useState<BloodType | null>(null)
  const [partner, setPartner] = useState<BloodType | null>(null)

  const result = useMemo(() => {
    if (!me || !partner) return null
    return getBloodTypeCompatibility(me, partner)
  }, [me, partner])

  const starCount = result?.stars ?? 0

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-amber-200">🩸 혈액형 궁합 확인하기</h2>
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
        <BloodTypeSelector label="나의 혈액형" value={me} onSelect={setMe} />
        <BloodTypeSelector label="상대방 혈액형" value={partner} onSelect={setPartner} />
      </div>

      <div className="mt-6 min-h-44">
        {!result ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-8 text-center text-sm text-slate-400">
            혈액형 두 개를 선택하면 궁합 결과가 나타나요 💫
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-4 transition-all duration-300 animate-in fade-in-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-300">
                <span className="font-bold text-amber-200">{result.me}형</span> ×{' '}
                <span className="font-bold text-amber-200">{result.partner}형</span>
              </p>
              <p className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-amber-300">
                {result.chemistry}
              </p>
            </div>

            <div className="flex items-center gap-2 text-amber-300">
              <span className="text-xs text-slate-400">궁합 점수</span>
              <span className="text-lg font-bold">{result.score}%</span>
              <span className="text-sm">{'★'.repeat(starCount)}{'☆'.repeat(5 - starCount)}</span>
            </div>

            <p className="text-sm leading-relaxed text-slate-200">{result.summary}</p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-3">
                <p className="mb-2 text-xs font-semibold text-emerald-300">강점</p>
                <ul className="space-y-1 text-xs leading-relaxed text-slate-300">
                  {result.strengths.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-rose-900/50 bg-rose-950/20 p-3">
                <p className="mb-2 text-xs font-semibold text-rose-300">잠재 갈등</p>
                <ul className="space-y-1 text-xs leading-relaxed text-slate-300">
                  {result.conflicts.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-xs leading-relaxed text-amber-100">
              <span className="font-semibold text-amber-300">관계 조언: </span>
              {result.advice}
            </div>

            <div className="grid gap-2 pt-1 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  shareGunghapResult({ person1: `${result.me}형`, person2: `${result.partner}형`, score: result.score })
                  trackShare('kakao', 'bloodtype-compatibility')
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
          </div>
        )}
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'

type UpsellBannerProps = {
  variant: 'inline' | 'card'
}

export default function UpsellBanner({ variant }: UpsellBannerProps) {
  if (variant === 'inline') {
    return (
      <Link
        href="/pricing"
        className="inline-flex text-sm font-semibold text-amber-300 transition hover:text-amber-200"
      >
        ✨ 프리미엄 리포트로 더 상세한 해석을 받아보세요 →
      </Link>
    )
  }

  return (
    <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-[0_12px_40px_-20px_rgba(245,158,11,0.45)]">
      <h3 className="font-serif-kr text-2xl font-bold text-amber-300">더 정확한 운세 분석이 필요하신가요?</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">
        무료 해석으로 큰 흐름을 확인했다면, 프리미엄 리포트에서 원국, 대운, 세운 조합과 실전 조언까지
        깊이 있게 확인해보세요.
      </p>
      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <Link
          href="/pricing"
          className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 transition hover:bg-amber-400"
        >
          프리미엄 리포트 ₩9,900
        </Link>
        <Link
          href="/pricing"
          className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
        >
          요금제 보기
        </Link>
      </div>
    </section>
  )
}

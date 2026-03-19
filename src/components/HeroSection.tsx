import type { ReactNode } from 'react'

interface HeroSectionProps {
  greeting: string
  theme: string
  onScrollDown: () => void
  children?: ReactNode
  totalCount?: number
}

function TaegeukSvg({ size = 280 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className="hero-taegeuk animate-rotateSlow">
      <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M100,5 A95,95 0 0,1 100,195 A47.5,47.5 0 0,1 100,100 A47.5,47.5 0 0,0 100,5" fill="currentColor" opacity="0.15" />
      <path d="M100,195 A95,95 0 0,1 100,5 A47.5,47.5 0 0,1 100,100 A47.5,47.5 0 0,0 100,195" fill="currentColor" opacity="0.06" />
      <circle cx="100" cy="52.5" r="12" fill="currentColor" opacity="0.08" />
      <circle cx="100" cy="147.5" r="12" fill="currentColor" opacity="0.18" />
    </svg>
  )
}

export default function HeroSection({
  greeting,
  theme,
  onScrollDown,
  children,
  totalCount = 0,
}: HeroSectionProps) {
  return (
    <section className="hero-bg min-h-[85vh] flex flex-col items-center justify-center px-4 relative">
      <TaegeukSvg size={320} />

      <div className="text-center relative z-10 animate-fadeInScale">
        <h1
          className="font-serif-kr text-6xl font-black mb-2 tracking-tight"
          style={{ color: 'var(--text-accent)' }}
        >
          사주해
        </h1>
        <p
          className="font-serif-kr text-2xl tracking-[0.3em] mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          AI 사주팔자
        </p>
        <p
          className="text-sm font-medium max-w-xs mx-auto leading-relaxed"
          style={{ color: 'var(--accent)', opacity: 0, animation: 'fadeIn 0.6s ease-out 0.3s forwards' }}
        >
          당신의 사주가 음악이 되고, 영상이 됩니다.
        </p>

        <p className="text-xs mt-3 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
          {greeting}
        </p>
      </div>

      {children && <div className="w-full max-w-md mt-6 relative z-10">{children}</div>}

      {totalCount > 0 && (
        <div
          className="mt-6 text-center relative z-10"
          style={{ opacity: 0, animation: 'fadeIn 0.5s ease-out 0.7s forwards' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }} suppressHydrationWarning>
            지금까지{' '}
            <span className="stat-number font-bold text-sm">{totalCount.toLocaleString()}</span>
            회 분석 완료
          </p>
        </div>
      )}

      <button
        type="button"
        className="scroll-arrow text-2xl"
        style={{ color: theme === 'dark' ? 'var(--text-muted)' : 'var(--text-muted)' }}
        onClick={onScrollDown}
        aria-label="입력 폼으로 스크롤"
      >
        ↓
      </button>
    </section>
  )
}

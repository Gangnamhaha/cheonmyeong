import { FortuneResult } from '@/lib/fortune'
import { OHENG_COLORS } from '@/lib/oheng'

interface FortuneCardProps {
  yearlyFortune: FortuneResult
  monthlyFortune: FortuneResult
}

const RATING_STYLES: Record<string, { color: string; label: string; glow: string }> = {
  길: { color: '#34d399', label: '길 吉', glow: '0 2px 12px rgba(52, 211, 153, 0.3)' },
  평: { color: '#fbbf24', label: '평 平', glow: '0 2px 12px rgba(251, 191, 36, 0.25)' },
  흉: { color: '#f87171', label: '흉 凶', glow: '0 2px 12px rgba(248, 113, 113, 0.3)' },
}

const STEM_HANJA: Record<string, string> = {
  갑: '甲', 을: '乙', 병: '丙', 정: '丁', 무: '戊',
  기: '己', 경: '庚', 신: '辛', 임: '壬', 계: '癸',
}
const BRANCH_HANJA: Record<string, string> = {
  자: '子', 축: '丑', 인: '寅', 묘: '卯', 진: '辰', 사: '巳',
  오: '午', 미: '未', 신: '申', 유: '酉', 술: '戌', 해: '亥',
}

function FortuneColumn({ fortune, title, subtitle }: { fortune: FortuneResult; title: string; subtitle: string }) {
  const color = OHENG_COLORS[fortune.element] ?? '#94a3b8'
  const rating = RATING_STYLES[fortune.rating] ?? RATING_STYLES['평']

  return (
    <div
      className="flex-1 rounded-2xl p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div className="text-center mb-3">
        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>
      </div>

      <div className="flex justify-center gap-2 mb-3">
        <span
          className="text-3xl font-black"
          style={{ color, textShadow: `0 2px 8px ${color}40` }}
        >
          {STEM_HANJA[fortune.stem] ?? fortune.stem}
        </span>
        <span
          className="text-3xl font-black"
          style={{ color, textShadow: `0 2px 8px ${color}40` }}
        >
          {BRANCH_HANJA[fortune.branch] ?? fortune.branch}
        </span>
      </div>

      <div className="text-center mb-2">
        <span
          className="text-sm font-bold px-3 py-1 rounded-full"
          style={{
            color,
            backgroundColor: color + '20',
            border: `1px solid ${color}40`,
          }}
        >
          {fortune.sipsin}
        </span>
      </div>

      <div className="text-center mb-3">
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{
            color: rating.color,
            backgroundColor: rating.color + '18',
            boxShadow: rating.glow,
          }}
        >
          {rating.label}
        </span>
      </div>

      <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {fortune.description}
      </p>
    </div>
  )
}

export default function FortuneCard({ yearlyFortune, monthlyFortune }: FortuneCardProps) {
  const now = new Date()

  return (
    <div>
      <h2 className="text-center text-lg font-bold mb-4 tracking-wide" style={{ color: 'var(--accent)' }}>
        세운 · 월운 <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>(歲運·月運)</span>
      </h2>

      <div className="flex gap-3">
        <FortuneColumn
          fortune={yearlyFortune}
          title={`${now.getFullYear()}년 세운`}
          subtitle="歲運"
        />
        <FortuneColumn
          fortune={monthlyFortune}
          title={`${now.getMonth() + 1}월 월운`}
          subtitle="月運"
        />
      </div>
    </div>
  )
}

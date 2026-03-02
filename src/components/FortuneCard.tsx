import { FortuneResult } from '@/lib/fortune'
import { OHENG_COLORS } from '@/lib/oheng'

interface FortuneCardProps {
  yearlyFortune: FortuneResult
  monthlyFortune: FortuneResult
}

const RATING_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  길: { bg: 'bg-green-500/20', text: 'text-green-400', label: '길 吉' },
  평: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '평 平' },
  흉: { bg: 'bg-red-500/20', text: 'text-red-400', label: '흉 凶' },
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
    <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <div className="text-center mb-3">
        <div className="text-sm font-bold text-slate-300">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>

      {/* 간지 */}
      <div className="flex justify-center gap-1 mb-3">
        <span className="text-2xl font-bold" style={{ color }}>
          {STEM_HANJA[fortune.stem] ?? fortune.stem}
        </span>
        <span className="text-2xl font-bold" style={{ color }}>
          {BRANCH_HANJA[fortune.branch] ?? fortune.branch}
        </span>
      </div>

      {/* 십신 관계 */}
      <div className="text-center mb-2">
        <span
          className="text-sm font-bold px-2 py-0.5 rounded-full"
          style={{
            color,
            backgroundColor: color + '22',
            border: `1px solid ${color}44`,
          }}
        >
          {fortune.sipsin}
        </span>
      </div>

      {/* 길흉 */}
      <div className="text-center mb-3">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${rating.bg} ${rating.text}`}>
          {rating.label}
        </span>
      </div>

      {/* 설명 */}
      <p className="text-xs text-slate-400 text-center leading-relaxed">
        {fortune.description}
      </p>
    </div>
  )
}

export default function FortuneCard({ yearlyFortune, monthlyFortune }: FortuneCardProps) {
  const now = new Date()

  return (
    <div>
      <h2 className="text-center text-lg font-bold text-amber-400 mb-4 tracking-wide">
        세운 · 월운 <span className="text-slate-400 text-sm font-normal">(歲運·月運)</span>
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

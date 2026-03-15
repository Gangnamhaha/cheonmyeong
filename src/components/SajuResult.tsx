import { SajuResult } from '@/lib/saju'
import { OHENG_COLORS } from '@/lib/oheng'

interface SajuResultProps {
  result: SajuResult
}

const PILLAR_LABELS = ['시주 (時柱)', '일주 (日柱)', '월주 (月柱)', '년주 (年柱)']

export default function SajuResultCard({ result }: SajuResultProps) {
  const pillars = [
    result.hourPillar,
    result.dayPillar,
    result.monthPillar,
    result.yearPillar,
  ]

  return (
    <div>
      <h2 className="text-center text-lg font-bold mb-4 tracking-wide" style={{ color: 'var(--accent)' }}>
        사주팔자 <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>(四柱八字)</span>
      </h2>

      <p className="text-center text-sm mb-5" style={{ color: 'var(--text-muted)' }}>{result.rawText}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pillars.map((pillar, i) => {
          const color = OHENG_COLORS[pillar.element] ?? '#94a3b8'
          const isLight = pillar.element === '금'
          return (
            <div
              key={i}
              data-testid="saju-pillar"
              className="rounded-2xl p-4 flex flex-col items-center gap-1.5"
              style={{
                background: `linear-gradient(180deg, ${color}18 0%, ${color}08 100%)`,
                border: `1px solid ${color}40`,
                backdropFilter: 'blur(8px)',
                animation: 'fadeIn 0.4s ease-out forwards',
                animationDelay: `${i * 0.1}s`,
                opacity: 0,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{PILLAR_LABELS[i]}</span>
              <div className="text-center">
                <div
                  className="text-3xl font-black"
                  style={{ color, textShadow: `0 2px 8px ${color}40` }}
                >
                  {pillar.heavenlyStemHanja}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{pillar.heavenlyStem}</div>
              </div>
              <div className="w-8 h-px my-0.5" style={{ background: 'var(--border-color)' }} />
              <div className="text-center">
                <div
                  className="text-3xl font-black"
                  style={{ color, textShadow: `0 2px 8px ${color}40` }}
                >
                  {pillar.earthlyBranchHanja}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{pillar.earthlyBranch}</div>
              </div>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full mt-1"
                style={{
                  backgroundColor: color + '25',
                  color: isLight ? 'var(--text-primary)' : color,
                  border: `1px solid ${color}44`,
                  boxShadow: `0 2px 8px ${color}30`,
                }}
              >
                {pillar.element}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

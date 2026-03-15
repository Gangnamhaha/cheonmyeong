import { OhengResult, OHENG_COLORS } from '@/lib/oheng'

interface OhengChartProps {
  result: OhengResult
}

const OHENG_LABELS: Record<string, string> = {
  목: '木',
  화: '火',
  토: '土',
  금: '金',
  수: '水',
}

const OHENG_ICONS: Record<string, string> = {
  목: '🌳',
  화: '🔥',
  토: '⛰️',
  금: '⚡',
  수: '💧',
}

const OHENG_ORDER = ['목', '화', '토', '금', '수'] as const

export default function OhengChart({ result }: OhengChartProps) {
  const maxCount = Math.max(...Object.values(result.counts), 1)

  return (
    <div>
      <h2 className="text-center text-lg font-bold mb-4 tracking-wide" style={{ color: 'var(--accent)' }}>
        오행 분포 <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>(五行)</span>
      </h2>

      <div className="flex items-end justify-center gap-3 h-40 mb-4">
        {OHENG_ORDER.map((element, idx) => {
          const count = result.counts[element] ?? 0
          const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0
          const color = OHENG_COLORS[element] ?? '#94a3b8'
          const isDominant = element === result.dominant

          return (
            <div
              key={element}
              className="flex flex-col items-center gap-1.5 flex-1"
              style={{
                animation: 'fadeIn 0.4s ease-out forwards',
                animationDelay: `${idx * 0.08}s`,
                opacity: 0,
              }}
            >
              <span className="text-lg">{OHENG_ICONS[element]}</span>
              <span className="text-xs font-bold" style={{ color }}>
                {count}
              </span>
              <div className="w-full flex items-end justify-center" style={{ height: '90px' }}>
                <div
                  data-testid="oheng-bar"
                  className="w-full"
                  style={{
                    height: count === 0 ? '4px' : `${heightPct}%`,
                    background: count === 0
                      ? 'transparent'
                      : `linear-gradient(180deg, ${color} 0%, ${color}66 100%)`,
                    borderRadius: '6px 6px 4px 4px',
                    border: count === 0 ? `2px dashed var(--text-muted)` : 'none',
                    opacity: isDominant ? 1 : 0.75,
                    minHeight: '4px',
                    boxShadow: isDominant ? `0 0 14px ${color}50` : 'none',
                    transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </div>
              <div className="text-center">
                <div className="text-base font-bold" style={{ color }}>
                  {OHENG_LABELS[element]}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{element}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-center gap-4 text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        <span>
          강한 오행:{' '}
          <span style={{ color: OHENG_COLORS[result.dominant] }} className="font-bold">
            {result.dominant}({OHENG_LABELS[result.dominant]})
          </span>
        </span>
        <span>
          약한 오행:{' '}
          <span style={{ color: OHENG_COLORS[result.weak] }} className="font-bold">
            {result.weak}({OHENG_LABELS[result.weak]})
          </span>
        </span>
        <span>
          균형:{' '}
          <span
            className={`font-bold ${
              result.balance === '균형'
                ? 'text-emerald-400'
                : result.balance === '결핍'
                ? 'text-rose-400'
                : 'text-amber-400'
            }`}
          >
            {result.balance}
          </span>
        </span>
      </div>
    </div>
  )
}

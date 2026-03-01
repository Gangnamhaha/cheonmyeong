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

const OHENG_ORDER = ['목', '화', '토', '금', '수'] as const

export default function OhengChart({ result }: OhengChartProps) {
  const maxCount = Math.max(...Object.values(result.counts), 1)

  return (
    <div>
      <h2 className="text-center text-lg font-bold text-amber-400 mb-4 tracking-wide">
        오행 분포 <span className="text-slate-400 text-sm font-normal">(五行)</span>
      </h2>

      {/* 바 차트 */}
      <div className="flex items-end justify-center gap-3 h-32 mb-3">
        {OHENG_ORDER.map(element => {
          const count = result.counts[element] ?? 0
          const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0
          const color = OHENG_COLORS[element] ?? '#94a3b8'
          const isDominant = element === result.dominant
          const isWeak = element === result.weak && count === 0

          return (
            <div
              key={element}
              className="flex flex-col items-center gap-1 flex-1"
            >
              {/* 카운트 */}
              <span className="text-xs font-bold" style={{ color }}>
                {count}
              </span>
              {/* 바 */}
              <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                <div
                  data-testid="oheng-bar"
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: count === 0 ? '4px' : `${heightPct}%`,
                    backgroundColor: count === 0 ? '#334155' : color,
                    opacity: isDominant ? 1 : 0.7,
                    minHeight: '4px',
                  }}
                />
              </div>
              {/* 라벨 */}
              <div className="text-center">
                <div className="text-base font-bold" style={{ color }}>
                  {OHENG_LABELS[element]}
                </div>
                <div className="text-xs text-slate-400">{element}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 요약 */}
      <div className="flex justify-center gap-4 text-xs text-slate-400 mt-2">
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
                ? 'text-green-400'
                : result.balance === '결핍'
                ? 'text-red-400'
                : 'text-yellow-400'
            }`}
          >
            {result.balance}
          </span>
        </span>
      </div>
    </div>
  )
}

import { DaeunResult } from '@/lib/daeun'
import { OHENG_COLORS } from '@/lib/oheng'

interface DaeunTimelineProps {
  result: DaeunResult
}

export default function DaeunTimeline({ result }: DaeunTimelineProps) {
  return (
    <div>
      <h2 className="text-center text-lg font-bold text-amber-400 mb-4 tracking-wide">
        대운 흐름 <span className="text-slate-400 text-sm font-normal">(大運)</span>
      </h2>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        {/* 방향 표시 */}
        <div className="flex justify-center gap-4 mb-4 text-xs">
          <span className="text-slate-500">
            방향:{' '}
            <span className={result.direction === '순행' ? 'text-blue-400' : 'text-orange-400'}>
              {result.direction} {result.direction === '순행' ? '→' : '←'}
            </span>
          </span>
          <span className="text-slate-500">
            시작: <span className="text-slate-300">{result.startAge}세</span>
          </span>
        </div>

        {/* 타임라인 (가로 스크롤) */}
        <div className="overflow-x-auto pb-2 -mx-1 scrollbar-hide">
          <div className="flex gap-2 min-w-max px-1">
            {result.periods.map((period, i) => {
              const color = OHENG_COLORS[period.element] ?? '#94a3b8'
              return (
                <div
                  key={i}
                  className="flex-shrink-0 w-16 rounded-lg p-2 flex flex-col items-center gap-1 border transition-colors"
                  style={{
                    borderColor: color + '44',
                    backgroundColor: color + '11',
                  }}
                >
                  {/* 나이 범위 */}
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {period.startAge}~{period.endAge}세
                  </span>
                  {/* 천간 */}
                  <div className="text-lg font-bold" style={{ color }}>
                    {period.stemHanja}
                  </div>
                  {/* 지지 */}
                  <div className="text-lg font-bold" style={{ color }}>
                    {period.branchHanja}
                  </div>
                  {/* 한글 */}
                  <span className="text-[10px] text-slate-400">
                    {period.stem}{period.branch}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

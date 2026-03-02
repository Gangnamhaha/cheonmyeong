import { YongsinResult } from '@/lib/yongsin'
import { OHENG_COLORS } from '@/lib/oheng'

interface YongsinCardProps {
  result: YongsinResult
}

const OHENG_HANJA: Record<string, string> = {
  목: '木', 화: '火', 토: '土', 금: '金', 수: '水',
}

export default function YongsinCard({ result }: YongsinCardProps) {
  const yongsinColor = OHENG_COLORS[result.yongsin] ?? '#94a3b8'
  const huisinColor = OHENG_COLORS[result.huisin] ?? '#94a3b8'

  return (
    <div>
      <h2 className="text-center text-lg font-bold text-amber-400 mb-4 tracking-wide">
        용신 · 희신 <span className="text-slate-400 text-sm font-normal">(用神)</span>
      </h2>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        {/* 용신 & 희신 뱃지 */}
        <div className="flex justify-center gap-6 mb-4">
          {/* 용신 */}
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-2">용신 (用神)</div>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-2 mx-auto"
              style={{
                color: yongsinColor,
                borderColor: yongsinColor,
                backgroundColor: yongsinColor + '22',
              }}
            >
              {OHENG_HANJA[result.yongsin] ?? result.yongsin}
            </div>
            <div className="text-sm font-bold mt-1" style={{ color: yongsinColor }}>
              {result.yongsin}
            </div>
          </div>

          {/* 희신 */}
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-2">희신 (喜神)</div>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-2 mx-auto"
              style={{
                color: huisinColor,
                borderColor: huisinColor,
                backgroundColor: huisinColor + '22',
              }}
            >
              {OHENG_HANJA[result.huisin] ?? result.huisin}
            </div>
            <div className="text-sm font-bold mt-1" style={{ color: huisinColor }}>
              {result.huisin}
            </div>
          </div>
        </div>

        {/* 판단 근거 */}
        <div className="text-sm text-slate-300 text-center mb-4 leading-relaxed">
          {result.reason}
        </div>

        {/* 유리/불리 오행 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
            <div className="text-xs text-green-400 mb-2 text-center">유리한 오행</div>
            <div className="flex justify-center gap-2">
              {result.favorable.filter(Boolean).map(el => (
                <span
                  key={el}
                  className="text-sm font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: OHENG_COLORS[el] ?? '#94a3b8',
                    backgroundColor: (OHENG_COLORS[el] ?? '#94a3b8') + '22',
                  }}
                >
                  {OHENG_HANJA[el] ?? el} {el}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            <div className="text-xs text-red-400 mb-2 text-center">불리한 오행</div>
            <div className="flex justify-center gap-2">
              {result.unfavorable.filter(Boolean).map(el => (
                <span
                  key={el}
                  className="text-sm font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: OHENG_COLORS[el] ?? '#94a3b8',
                    backgroundColor: (OHENG_COLORS[el] ?? '#94a3b8') + '22',
                  }}
                >
                  {OHENG_HANJA[el] ?? el} {el}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

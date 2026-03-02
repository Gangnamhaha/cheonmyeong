import { IlganStrength } from '@/lib/ilgan-strength'

interface IlganStrengthBadgeProps {
  result: IlganStrength
}

export default function IlganStrengthBadge({ result }: IlganStrengthBadgeProps) {
  const isStrong = result.strength === '신강'
  const accentColor = isStrong ? '#3b82f6' : '#f97316'
  const total = result.details.support + result.details.opposition
  const supportPct = total > 0 ? (result.details.support / total) * 100 : 50

  return (
    <div>
      <h2 className="text-center text-lg font-bold text-amber-400 mb-4 tracking-wide">
        일간 강약 <span className="text-slate-400 text-sm font-normal">(身强身弱)</span>
      </h2>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        {/* 메인 뱃지 */}
        <div className="flex flex-col items-center mb-4">
          <div
            className="text-3xl font-black mb-1"
            style={{ color: accentColor }}
          >
            {result.strength}
          </div>
          <div className="text-slate-400 text-sm">
            점수: <span className="font-bold text-slate-200">{result.score > 0 ? '+' : ''}{result.score}</span>
          </div>
        </div>

        {/* 게이지 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>신약 (身弱)</span>
            <span>신강 (身强)</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden relative">
            {/* 도움 (support) 영역 */}
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${supportPct}%`,
                background: `linear-gradient(to right, #f97316, #3b82f6)`,
              }}
            />
            {/* 중앙 마커 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-400" />
          </div>
        </div>

        {/* 세부 내역 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
            <div className="text-xs text-blue-400 mb-1">도움 (비겁+인성)</div>
            <div className="text-xl font-bold text-blue-300">{result.details.support}</div>
          </div>
          <div className="text-center bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
            <div className="text-xs text-orange-400 mb-1">억제 (식상+재관)</div>
            <div className="text-xl font-bold text-orange-300">{result.details.opposition}</div>
          </div>
        </div>

        {/* 월령 도움 여부 */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs">
          <span className="text-slate-500">월령({result.details.monthBranchElement}):</span>
          <span className={result.details.monthBranchHelps ? 'text-green-400' : 'text-red-400'}>
            {result.details.monthBranchHelps ? '✓ 일간을 도움' : '✗ 일간을 억제'}
          </span>
        </div>
      </div>
    </div>
  )
}

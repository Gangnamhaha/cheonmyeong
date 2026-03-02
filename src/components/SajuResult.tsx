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
      <h2 className="text-center text-lg font-bold text-amber-400 mb-4 tracking-wide">
        사주팔자 <span className="text-slate-400 text-sm font-normal">(四柱八字)</span>
      </h2>

      {/* rawText */}
      <p className="text-center text-slate-400 text-sm mb-5">{result.rawText}</p>

      {/* 4기둥 카드 */}
      <div className="grid grid-cols-4 gap-2">
        {pillars.map((pillar, i) => {
          const color = OHENG_COLORS[pillar.element] ?? '#94a3b8'
          const isLight = pillar.element === '금' // 금은 흰색이라 텍스트 어둡게
          return (
            <div
              key={i}
              data-testid="saju-pillar"
              className="rounded-xl p-3 flex flex-col items-center gap-1 border border-slate-700"
              style={{ backgroundColor: color + '22', borderColor: color + '55' }}
            >
              <span className="text-xs text-slate-400">{PILLAR_LABELS[i]}</span>
              {/* 천간 */}
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color }}
                >
                  {pillar.heavenlyStemHanja}
                </div>
                <div className="text-xs text-slate-300">{pillar.heavenlyStem}</div>
              </div>
              {/* 구분선 */}
              <div className="w-full h-px bg-slate-700 my-1" />
              {/* 지지 */}
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color }}
                >
                  {pillar.earthlyBranchHanja}
                </div>
                <div className="text-xs text-slate-300">{pillar.earthlyBranch}</div>
              </div>
              {/* 오행 */}
              <span
                className="text-xs px-2 py-0.5 rounded-full mt-1"
                style={{
                  backgroundColor: color + '33',
                  color: isLight ? '#1e293b' : color,
                  border: `1px solid ${color}55`,
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

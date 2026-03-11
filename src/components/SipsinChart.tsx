import { SipsinResult, SipsinName } from '@/lib/sipsin'

interface SipsinChartProps {
  result: SipsinResult
}

const SIPSIN_GROUP: Record<string, { label: string; color: string; members: SipsinName[] }> = {
  비겁: { label: '비겁', color: '#94a3b8', members: ['비견', '겁재'] },
  식상: { label: '식상', color: '#4ade80', members: ['식신', '상관'] },
  재성: { label: '재성', color: '#facc15', members: ['편재', '정재'] },
  관성: { label: '관성', color: '#f87171', members: ['편관', '정관'] },
  인성: { label: '인성', color: '#60a5fa', members: ['편인', '정인'] },
}

function getSipsinColor(name: SipsinName | '본인'): string {
  if (name === '본인') return '#fbbf24'
  for (const group of Object.values(SIPSIN_GROUP)) {
    if (group.members.includes(name)) return group.color
  }
  return '#94a3b8'
}

const PILLAR_LABELS = ['시주', '일주', '월주', '년주']

export default function SipsinChart({ result }: SipsinChartProps) {
  const positions = [
    { stem: result.hourStem, branch: result.hourBranch },
    { stem: result.dayStem, branch: result.dayBranch },
    { stem: result.monthStem, branch: result.monthBranch },
    { stem: result.yearStem, branch: result.yearBranch },
  ]

  // Summary bar
  const allNames: SipsinName[] = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인']

  return (
    <div>
      <h2 className="text-center text-lg font-bold text-amber-400 mb-4 tracking-wide">
        십신 분석 <span className="text-slate-400 text-sm font-normal">(十神)</span>
      </h2>

      {/* 4기둥 십신 그리드 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4">
        {positions.map((pos, i) => (
          <div
            key={i}
            className="rounded-xl p-3 flex flex-col items-center gap-2 border border-slate-700 bg-slate-800/50"
          >
            <span className="text-xs text-slate-500">{PILLAR_LABELS[i]}</span>
            {/* 천간 십신 */}
            <div className="text-center">
              <span
                className="text-sm font-bold px-2 py-0.5 rounded-full"
                style={{
                  color: getSipsinColor(pos.stem),
                  backgroundColor: getSipsinColor(pos.stem) + '22',
                  border: `1px solid ${getSipsinColor(pos.stem)}44`,
                }}
              >
                {pos.stem}
              </span>
            </div>
            <div className="w-full h-px bg-slate-700" />
            {/* 지지 십신 */}
            <div className="text-center">
              <span
                className="text-sm font-bold px-2 py-0.5 rounded-full"
                style={{
                  color: getSipsinColor(pos.branch),
                  backgroundColor: getSipsinColor(pos.branch) + '22',
                  border: `1px solid ${getSipsinColor(pos.branch)}44`,
                }}
              >
                {pos.branch}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 십신 요약 */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-3">
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-5">
          {Object.values(SIPSIN_GROUP).map(group => {
            const count = group.members.reduce((sum, m) => sum + (result.summary[m] ?? 0), 0)
            return (
              <div key={group.label} className="text-center">
                <div className="text-xs font-bold" style={{ color: group.color }}>
                  {group.label}
                </div>
                <div className="text-lg font-bold text-slate-200">{count}</div>
                <div className="text-[10px] text-slate-500">
                  {group.members.map(m => {
                    const c = result.summary[m] ?? 0
                    return c > 0 ? `${m}${c}` : null
                  }).filter(Boolean).join(' ')}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 개별 십신 수 (작은 도트) */}
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {allNames.map(name => {
          const count = result.summary[name] ?? 0
          if (count === 0) return null
          return (
            <span
              key={name}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                color: getSipsinColor(name),
                backgroundColor: getSipsinColor(name) + '22',
                border: `1px solid ${getSipsinColor(name)}44`,
              }}
            >
              {name} {count}
            </span>
          )
        })}
      </div>
    </div>
  )
}

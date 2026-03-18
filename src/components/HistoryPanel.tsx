export interface HistoryEntry {
  year: number
  month: number
  day: number
  hour: number
  gender: 'male' | 'female'
  date: string
  dayPillar?: string
}

interface HistoryPanelProps {
  history: HistoryEntry[]
  onLoadHistory: (entry: HistoryEntry) => void
}

export default function HistoryPanel({ history, onLoadHistory }: HistoryPanelProps) {
  if (history.length === 0) return null

  return (
    <section className="px-4 pb-8 max-w-md mx-auto relative z-10">
      <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
        📋 최근 분석 기록
      </h3>
      <div className="space-y-2">
        {history.map((entry, i) => (
          <button
            key={i}
            className="history-card w-full text-left flex items-center justify-between"
            onClick={() => onLoadHistory(entry)}
          >
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {entry.year}.{String(entry.month).padStart(2, '0')}.{String(entry.day).padStart(2, '0')}
              </span>
              <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                {entry.hour}시 · {entry.gender === 'male' ? '남' : '여'}
              </span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {entry.date}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

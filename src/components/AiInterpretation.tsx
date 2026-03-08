'use client'

import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

interface AiInterpretationProps {
  interpretation: string | null
  loading: boolean
  error: string | null
  onRetry?: () => void
}

export default function AiInterpretation({
  interpretation,
  loading,
  error,
  onRetry,
}: AiInterpretationProps) {
  const { isSpeaking, isSupported, speak, stop } = useSpeechSynthesis()
  const canReadAloud = !loading && Boolean(interpretation)

  function handleReadToggle() {
    if (!interpretation) {
      return
    }

    if (!isSupported) {
      alert('이 브라우저에서는 음성 읽기를 지원하지 않습니다. Chrome 또는 Safari를 이용해주세요.')
      return
    }

    if (isSpeaking) {
      stop()
      return
    }

    speak(interpretation)
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-wide" style={{ color: 'var(--text-accent)' }}>
          AI 사주 해석 <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>(命理 解釋)</span>
        </h2>
        {canReadAloud && (
          <button
            type="button"
            onClick={handleReadToggle}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover-scale theme-transition shrink-0"
            style={{
              color: isSpeaking ? '#ef4444' : 'var(--text-muted)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            {isSpeaking ? '🔇 멈추기' : '🔊 읽어주기'}
          </button>
        )}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 min-h-[120px] flex items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <svg
              className="animate-spin h-8 w-8 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <p className="text-sm">사주를 해석하고 있습니다...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-colors"
              >
                다시 시도
              </button>
            )}
          </div>
        )}

        {!loading && !error && interpretation && (
          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line w-full">
            {interpretation}
          </div>
        )}
      </div>
    </div>
  )
}

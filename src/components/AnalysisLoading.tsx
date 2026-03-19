'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  { icon: '🏛️', label: '사주 원국 계산 중', desc: '천간·지지 팔자를 계산합니다' },
  { icon: '📊', label: '오행 분석 중', desc: '목·화·토·금·수 분포를 분석합니다' },
  { icon: '🔮', label: '용신 판단 중', desc: '유리한 오행 방향을 찾습니다' },
  { icon: '🤖', label: 'AI 해석 생성 중', desc: 'AI가 맞춤 해석을 작성합니다' },
]

interface AnalysisLoadingProps {
  onCancel?: () => void
}

export default function AnalysisLoading({ onCancel }: AnalysisLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const timers = STEPS.map((_, i) => setTimeout(() => setCurrentStep(i), i * 2500))

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="py-8 px-4 max-w-md mx-auto animate-fadeIn">
      <div className="flex justify-center mb-6">
        <div
          className="w-16 h-16 rounded-full animate-pulse"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', opacity: 0.8 }}
        />
      </div>

      <p className="text-center text-sm font-bold mb-6" style={{ color: 'var(--accent)' }}>
        사주를 분석하고 있습니다
      </p>

      <div className="space-y-3">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl p-3 transition-all duration-500"
            style={{
              background: i <= currentStep ? 'var(--bg-card)' : 'transparent',
              border: `1px solid ${i <= currentStep ? 'var(--border-color)' : 'transparent'}`,
              opacity: i <= currentStep ? 1 : 0.3,
              transform: i <= currentStep ? 'translateX(0)' : 'translateX(8px)',
            }}
          >
            <span className="text-xl flex-shrink-0">{i < currentStep ? '✅' : step.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {step.label}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {step.desc}
              </p>
            </div>
            {i === currentStep && (
              <div
                className="w-4 h-4 rounded-full animate-spin border-2 flex-shrink-0"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'var(--bg-secondary)', width: '80%' }} />
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'var(--bg-secondary)', width: '60%' }} />
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'var(--bg-secondary)', width: '70%' }} />
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 mx-auto block text-xs px-4 py-2 rounded-lg transition-all hover:opacity-80"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
        >
          취소
        </button>
      )}
    </div>
  )
}

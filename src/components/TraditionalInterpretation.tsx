'use client'

import { useMemo, useState } from 'react'
import type { TraditionalInterpretation as TraditionalInterpretationResult } from '@/lib/traditional-interpret'

interface TraditionalInterpretationProps {
  result: TraditionalInterpretationResult
}

type Section = {
  key: string
  title: string
  icon: string
  items: string[]
}

export default function TraditionalInterpretation({ result }: TraditionalInterpretationProps) {
  const sections = useMemo<Section[]>(() => {
    return [
      { key: 'personality', title: '성격·십신', icon: '📖', items: result.personality },
      { key: 'dayPillar', title: '일주 해석', icon: '🏛️', items: result.dayPillar },
      { key: 'career', title: '직업 추천', icon: '💼', items: result.career },
      { key: 'health', title: '건강 주의', icon: '🏥', items: result.health },
      { key: 'fortune', title: '운세 참고', icon: '🌟', items: result.fortune },
      { key: 'yongsinAdvice', title: '용신 조언', icon: '🔮', items: result.yongsinAdvice },
    ].filter((section) => section.items.length > 0)
  }, [result])

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    personality: true,
    dayPillar: true,
  })

  if (!sections.length) return null

  return (
    <div
      className="rounded-xl p-4 space-y-3 max-w-md"
      style={{
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">전통 해석</h3>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            color: 'var(--text-secondary)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
          }}
        >
          태을철학 해설서
        </span>
      </div>

      <div className="space-y-2">
        {sections.map((section) => {
          const isOpen = openMap[section.key] ?? false
          return (
            <div
              key={section.key}
              className="rounded-lg"
              style={{
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
              }}
            >
              <button
                onClick={() => setOpenMap((prev) => ({ ...prev, [section.key]: !isOpen }))}
                className="w-full flex items-center justify-between px-3 py-2 text-left"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="text-sm font-medium">{section.icon} {section.title}</span>
                <span style={{ color: 'var(--accent)' }}>{isOpen ? '−' : '+'}</span>
              </button>

              {isOpen && (
                <ul className="px-4 pb-3 space-y-2">
                  {section.items.map((item, idx) => (
                    <li key={`${section.key}-${idx}`} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      • {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

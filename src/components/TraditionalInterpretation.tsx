'use client'

import { useMemo, useState } from 'react'
import type { TraditionalInterpretation as TraditionalInterpretationResult, TraditionalEntry } from '@/lib/traditional-interpret'

interface TraditionalInterpretationProps {
  result: TraditionalInterpretationResult
}

type Section = {
  key: string
  title: string
  icon: string
  items: TraditionalEntry[]
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
      { key: 'children', title: '자손운', icon: '👶', items: result.children },
      { key: 'relationship', title: '부부·연인', icon: '💑', items: result.relationship },
      { key: 'general', title: '종합 참고', icon: '📋', items: result.general },
    ].filter((section) => section.items.length > 0)
  }, [result])

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    personality: true,
    dayPillar: true,
  })

  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({})

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
                <div className="px-4 pb-3 space-y-3">
                  {section.items.map((item, idx) => {
                    const itemKey = `${section.key}-${idx}`
                    const isOriginalVisible = showOriginal[itemKey] ?? false
                    return (
                      <div
                        key={itemKey}
                        className="text-sm leading-relaxed"
                        style={{
                          borderBottom: idx < section.items.length - 1 ? '1px solid var(--border-color)' : 'none',
                          paddingBottom: idx < section.items.length - 1 ? '0.75rem' : 0,
                        }}
                      >
                        <p style={{ color: 'var(--text-primary)' }}>{item.plain}</p>
                        <button
                          onClick={() => setShowOriginal((prev) => ({ ...prev, [itemKey]: !isOriginalVisible }))}
                          className="mt-1 text-xs flex items-center gap-1"
                          style={{ color: 'var(--text-tertiary, var(--text-secondary))', opacity: 0.7 }}
                        >
                          {isOriginalVisible ? '▼ 원문 접기' : '▶ 원문 보기'}
                        </button>
                        {isOriginalVisible && (
                          <p
                            className="mt-1 text-xs leading-relaxed px-2 py-1.5 rounded"
                            style={{
                              color: 'var(--text-secondary)',
                              background: 'var(--bg-tertiary, var(--bg-card))',
                              borderLeft: '2px solid var(--accent)',
                              opacity: 0.8,
                            }}
                          >
                            {item.original}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

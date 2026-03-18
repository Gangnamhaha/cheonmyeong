'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { FullSajuResult } from '@/lib/saju'

interface SajuState {
  fullResult: FullSajuResult | null
  loading: boolean
  error: string | null
  formData: {
    name: string
    year: number
    month: number
    day: number
    hour: number
    gender: 'male' | 'female'
    calendarType: 'solar' | 'lunar'
  } | null
  aiInterpretation: string | null
  setFullResult: (r: FullSajuResult | null) => void
  setLoading: (l: boolean) => void
  setError: (e: string | null) => void
  setFormData: (d: SajuState['formData']) => void
  setAiInterpretation: (a: string | null) => void
}

const SajuContext = createContext<SajuState | null>(null)

export function SajuProvider({ children }: { children: ReactNode }) {
  const [fullResult, setFullResult] = useState<FullSajuResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<SajuState['formData']>(null)
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null)

  return (
    <SajuContext.Provider
      value={{
        fullResult,
        loading,
        error,
        formData,
        aiInterpretation,
        setFullResult,
        setLoading,
        setError,
        setFormData,
        setAiInterpretation,
      }}
    >
      {children}
    </SajuContext.Provider>
  )
}

export function useSaju() {
  const ctx = useContext(SajuContext)
  if (!ctx) throw new Error('useSaju must be used within SajuProvider')
  return ctx
}

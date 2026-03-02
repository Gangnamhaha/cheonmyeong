'use client'

import { Locale, LOCALE_LABELS } from '@/lib/i18n'

interface LocaleSwitcherProps {
  locale: Locale
  onChange: (locale: Locale) => void
}

const LOCALES: Locale[] = ['ko', 'en', 'zh']

export default function LocaleSwitcher({ locale, onChange }: LocaleSwitcherProps) {
  return (
    <div className="flex justify-center gap-1 mb-4">
      {LOCALES.map(loc => (
        <button
          key={loc}
          onClick={() => onChange(loc)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            locale === loc
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </div>
  )
}

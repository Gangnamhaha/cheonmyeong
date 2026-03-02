'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light'
type FontSize = 'normal' | 'large' | 'xlarge'

const FONT_SIZE_LABELS: Record<FontSize, string> = {
  normal: '가',
  large: '가+',
  xlarge: '가++',
}

const FONT_SIZE_ORDER: FontSize[] = ['normal', 'large', 'xlarge']

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  fontSize: FontSize
  cycleFontSize: () => void
  fontSizeLabel: string
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  fontSize: 'normal',
  cycleFontSize: () => {},
  fontSizeLabel: '가',
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [fontSize, setFontSize] = useState<FontSize>('normal')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedTheme = localStorage.getItem('cheonmyeong-theme') as Theme | null
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme)
    }
    const storedFontSize = localStorage.getItem('cheonmyeong-fontsize') as FontSize | null
    if (storedFontSize && FONT_SIZE_ORDER.includes(storedFontSize)) {
      setFontSize(storedFontSize)
    }
    setMounted(true)
  }, [])

  // Apply theme class
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
    localStorage.setItem('cheonmyeong-theme', theme)
  }, [theme, mounted])

  // Apply font size class
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    FONT_SIZE_ORDER.forEach(s => root.classList.remove(`fontsize-${s}`))
    root.classList.add(`fontsize-${fontSize}`)
    localStorage.setItem('cheonmyeong-fontsize', fontSize)
  }, [fontSize, mounted])

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const cycleFontSize = useCallback(() => {
    setFontSize(prev => {
      const idx = FONT_SIZE_ORDER.indexOf(prev)
      return FONT_SIZE_ORDER[(idx + 1) % FONT_SIZE_ORDER.length]
    })
  }, [])

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div className="dark">{children}</div>
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      fontSize,
      cycleFontSize,
      fontSizeLabel: FONT_SIZE_LABELS[fontSize],
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

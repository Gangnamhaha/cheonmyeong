'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'
import UserMenu from '@/components/UserMenu'

const NAV_LINKS = [
  { href: '/', label: '사주분석' },
  { href: '/gunghap', label: '궁합' },
  { href: '/pricing', label: '요금제' },
  { href: '/inquiry', label: '고객문의' },
]

export default function Navbar() {
  const { theme, toggleTheme, cycleFontSize, fontSizeLabel } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md theme-transition"
      style={{
        background: theme === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(245, 240, 232, 0.85)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand + Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-serif-kr text-lg font-bold tracking-tight"
            style={{ color: 'var(--text-accent)' }}
          >
            천명(天命)
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="테마 변경"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Font size cycle */}
          <button
            onClick={cycleFontSize}
            className="hidden sm:flex h-8 items-center justify-center rounded-md px-2 text-xs font-bold transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
            aria-label="글자 크기 변경"
          >
            {fontSizeLabel}
          </button>

          {/* User menu */}
          <UserMenu />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-md text-lg transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile slide-down panel */}
      {mobileOpen && (
        <div
          className="md:hidden border-t animate-fadeIn"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {link.label}
              </Link>
            ))}
            {/* Font size toggle for mobile */}
            <button
              onClick={cycleFontSize}
              className="sm:hidden px-3 py-2.5 rounded-md text-sm font-medium text-left transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              글자 크기: {fontSizeLabel}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

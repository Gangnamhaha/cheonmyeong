'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[var(--text-muted)]">© 2025 천명(天命). All rights reserved.</p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[var(--text-secondary)]">
          <Link href="/" className="transition-colors hover:text-[var(--text-accent)]">
            홈
          </Link>
          <Link href="/terms" className="transition-colors hover:text-[var(--text-accent)]">
            이용약관
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-[var(--text-accent)]">
            개인정보처리방침
          </Link>
          <Link href="/refund" className="transition-colors hover:text-[var(--text-accent)]">
            환불정책
          </Link>
          <Link href="/admin" className="transition-colors hover:text-[var(--text-accent)]">
            관리자
          </Link>
        </nav>
      </div>
    </footer>
  )
}

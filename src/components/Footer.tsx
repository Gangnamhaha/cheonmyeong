'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-muted)]">© 2025 천명(天命). All rights reserved.</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-secondary)]">
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
            <Link href="/inquiry" className="transition-colors hover:text-[var(--text-accent)]">
              고객문의
            </Link>
            <Link href="/admin" className="transition-colors hover:text-[var(--text-accent)]">
              관리자
            </Link>
          </nav>
        </div>

        <div className="border-t border-[var(--border-color)] pt-3">
          <div className="flex flex-col gap-1 text-[10px] leading-relaxed text-[var(--text-muted)]">
            <p>상호: 주식회사 에이아이트리 | 대표: 김은수 | 사업자등록번호: 569-87-03583</p>
            <p>통신판매업 신고: 제2025-서울성북-1353호 | 연락처: 02-988-2572</p>
            <p>주소: 서울특별시 성북구 삼양로 22 1층, 102호(길음동, 기린빌딩)</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

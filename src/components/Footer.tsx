'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-semibold text-[var(--text-primary)]">서비스</p>
              <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--text-secondary)]">
                <Link href="/" className="transition-colors hover:text-[var(--text-accent)]">
                  홈
                </Link>
                <Link href="/gunghap" className="transition-colors hover:text-[var(--text-accent)]">
                  궁합
                </Link>
                <Link href="/pricing" className="transition-colors hover:text-[var(--text-accent)]">
                  요금제
                </Link>
              </nav>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-[var(--text-primary)]">콘텐츠</p>
              <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--text-secondary)]">
                <Link href="/fortune/today" className="transition-colors hover:text-[var(--text-accent)]">
                  오늘의 운세
                </Link>
                <Link href="/fortune/2026" className="transition-colors hover:text-[var(--text-accent)]">
                  2026년 운세
                </Link>
                <Link href="/saju/free" className="transition-colors hover:text-[var(--text-accent)]">
                  무료 사주풀이
                </Link>
              </nav>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-[var(--text-primary)]">가이드</p>
              <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--text-secondary)]">
                <Link href="/guide/saju-basics" className="transition-colors hover:text-[var(--text-accent)]">
                  사주 입문
                </Link>
                <Link href="/guide/oheng" className="transition-colors hover:text-[var(--text-accent)]">
                  오행 가이드
                </Link>
                <Link href="/gunghap/free" className="transition-colors hover:text-[var(--text-accent)]">
                  무료 궁합
                </Link>
              </nav>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-muted)]">&copy; {new Date().getFullYear()} 천명(天命). All rights reserved.</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-secondary)]">
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
          </nav>
        </div>
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

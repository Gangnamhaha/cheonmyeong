'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-4">
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
                <Link href="/fortune/2026/spring" className="transition-colors hover:text-[var(--text-accent)]">
                  봄 운세
                </Link>
                <Link href="/fortune/2026/summer" className="transition-colors hover:text-[var(--text-accent)]">
                  여름 운세
                </Link>
                <Link href="/fortune/2026/fall" className="transition-colors hover:text-[var(--text-accent)]">
                  가을 운세
                </Link>
                <Link href="/fortune/2026/winter" className="transition-colors hover:text-[var(--text-accent)]">
                  겨울 운세
                </Link>
                <span className="text-[10px] text-[var(--text-muted)]">월별 운세:</span>
                <Link href="/fortune/2026/month/1" className="transition-colors hover:text-[var(--text-accent)]">
                  1월 운세
                </Link>
                <Link href="/fortune/2026/month/3" className="transition-colors hover:text-[var(--text-accent)]">
                  3월 운세
                </Link>
                <Link href="/fortune/2026/month/6" className="transition-colors hover:text-[var(--text-accent)]">
                  6월 운세
                </Link>
                <Link href="/fortune/2026/month/9" className="transition-colors hover:text-[var(--text-accent)]">
                  9월 운세
                </Link>
                <Link href="/fortune/ddi/rat" className="transition-colors hover:text-[var(--text-accent)]">
                  띠별 운세
                </Link>
                <span className="text-[10px] text-[var(--text-muted)]">별자리 운세:</span>
                <Link href="/fortune/zodiac/aries" className="transition-colors hover:text-[var(--text-accent)]">
                  양자리 운세
                </Link>
                <Link href="/fortune/zodiac/leo" className="transition-colors hover:text-[var(--text-accent)]">
                  사자자리 운세
                </Link>
                <Link href="/fortune/zodiac/scorpio" className="transition-colors hover:text-[var(--text-accent)]">
                  전갈자리 운세
                </Link>
                <Link href="/fortune/zodiac/aquarius" className="transition-colors hover:text-[var(--text-accent)]">
                  물병자리 운세
                </Link>
                <Link href="/fortune/zodiac/pisces" className="transition-colors hover:text-[var(--text-accent)]">
                  물고기자리 운세
                </Link>
                <Link href="/fortune/ddi/rat/jaemulun" className="transition-colors hover:text-[var(--text-accent)]">
                  재물운
                </Link>
                <Link href="/fortune/ddi/rat/yeonaewun" className="transition-colors hover:text-[var(--text-accent)]">
                  연애운
                </Link>
                <Link href="/fortune/ddi/rat/chwieobun" className="transition-colors hover:text-[var(--text-accent)]">
                  취업운
                </Link>
                <Link href="/saju/free" className="transition-colors hover:text-[var(--text-accent)]">
                  무료 사주풀이
                </Link>
                <Link href="/blog" className="transition-colors hover:text-[var(--text-accent)]">
                  블로그
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
            <div>
              <p className="mb-2 text-xs font-semibold text-[var(--text-primary)]">무료 도구</p>
              <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--text-secondary)]">
                <Link href="/tools/mbti" className="transition-colors hover:text-[var(--text-accent)]">
                  MBTI 궁합
                </Link>
                <Link href="/tools/bloodtype" className="transition-colors hover:text-[var(--text-accent)]">
                  혈액형 궁합
                </Link>
                <Link href="/tools/name" className="transition-colors hover:text-[var(--text-accent)]">
                  이름풀이
                </Link>
              </nav>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-muted)]">&copy; {new Date().getFullYear()} 사주해. All rights reserved.</p>
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

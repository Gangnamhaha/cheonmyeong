import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-10 text-[var(--text-primary)] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-accent)]">
          ← 홈으로 돌아가기
        </Link>

        <section className="mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-[var(--card-shadow)] sm:p-8">
          <h1 className="font-serif-kr text-3xl font-bold text-[var(--text-accent)]">개인정보처리방침</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            사주해은 개인정보보호법 등 관련 법령을 준수하며, 이용자의 개인정보를 안전하게 처리합니다.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-7 text-[var(--text-secondary)]">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">1. 수집하는 개인정보 항목</h2>
              <p>
                회사는 서비스 제공을 위해 다음 정보를 수집할 수 있습니다: 이름, 생년월일시, 성별, 이메일, OAuth 고유 식별자(구글/카카오 로그인), 접속 로그, 쿠키, 결제 및 환불 처리에 필요한 거래 정보.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">2. 개인정보 수집 및 이용 목적</h2>
              <p>
                수집한 정보는 회원 식별 및 인증, 사주 분석 결과 제공, 크레딧/구독 관리, 결제 및 환불 처리, 고객 문의 대응, 부정 이용 방지, 서비스 품질 개선 및 통계 분석을 위해 사용됩니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">3. 개인정보 보유 및 이용기간</h2>
              <p>
                원칙적으로 회원 탈퇴 또는 수집·이용 목적 달성 시 지체 없이 파기합니다. 다만 전자상거래 등에서의 소비자 보호에 관한 법률 등 관계 법령에 따라 거래 기록, 결제 기록, 분쟁 처리 기록은 법정 보관기간 동안 보관할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">4. 개인정보 제3자 제공</h2>
              <p>
                회사는 원칙적으로 이용자 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 결제 처리, 인증, 클라우드 인프라 운영 등 서비스 제공에 필수적인 업무 범위 내에서 관련 법령에 따라 일부 처리를 위탁하거나 제공할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">5. 쿠키의 사용</h2>
              <p>
                회사는 로그인 유지, 환경 설정 저장, 서비스 이용 통계 분석을 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있으나, 이 경우 일부 기능 이용이 제한될 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">6. 이용자의 권리 및 행사 방법</h2>
              <p>
                이용자는 언제든지 자신의 개인정보 열람, 정정, 삭제, 처리정지 요청을 할 수 있습니다. 요청은 이메일(any001004@gmail.com)로 접수할 수 있으며, 회사는 관련 법령이 정한 기간 내에 조치합니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">7. 개인정보 보호책임자</h2>
              <p>
                개인정보 보호책임자: 사주해 운영팀<br />
                연락처: any001004@gmail.com
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">8. 시행일</h2>
              <p>본 개인정보처리방침은 2025년 1월 1일부터 적용됩니다.</p>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}

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
            사주해는 개인정보보호법 등 관련 법령을 준수하며, 이용자의 개인정보를 안전하게 처리합니다.
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
                수집한 정보는 회원 식별 및 인증, 사주 분석 결과 제공, 이용권/구독 관리, 결제 및 환불 처리, 고객 문의 대응, 부정 이용 방지, 서비스 품질 개선 및 통계 분석을 위해 사용됩니다.
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

            <section id="data-deletion">
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">6-1. 사용자 데이터 삭제 요청 (Data Deletion Instructions)</h2>
              <p className="mb-3">
                사주해는 이용자의 모든 개인정보 및 서비스 이용 데이터를 완전히 삭제할 수 있는 방법을 제공합니다. 삭제된 데이터는 복구할 수 없습니다.
              </p>
              <p className="mb-3 font-semibold text-[var(--text-primary)]">삭제 요청 방법:</p>
              <ol className="mb-3 list-decimal space-y-1 pl-5">
                <li>이메일로 요청: <a href="mailto:any001004@gmail.com" className="text-[var(--text-accent)] underline">any001004@gmail.com</a></li>
                <li>제목: &quot;데이터 삭제 요청&quot;</li>
                <li>본문: 가입 이메일 주소 또는 OAuth 제공자(구글/카카오/페이스북) 및 해당 계정의 고유 ID를 기재해주세요.</li>
                <li>회사는 요청 접수 후 영업일 기준 7일 이내에 해당 이용자의 모든 데이터(계정 정보, 사주 분석 기록, 구독/결제 기록, 쿠키 식별자, 로그 기록 등)를 완전히 삭제하고 이메일로 완료 확인을 전송합니다.</li>
              </ol>
              <p className="mb-3 font-semibold text-[var(--text-primary)]">Facebook 계정 연동 해제:</p>
              <p className="mb-2">
                Facebook 로그인으로 가입한 이용자는 Facebook 계정 설정에서 &quot;사주해&quot; 앱을 제거하는 것만으로도 계정 연동 및 관련 데이터 처리를 중단할 수 있습니다.
              </p>
              <p className="mb-2">
                Facebook 계정 설정 경로: <code className="rounded bg-[var(--bg-secondary)] px-2 py-0.5 text-xs">Settings → Apps and Websites → 사주해 → Remove</code>
              </p>
              <p>
                이후 사주해 측의 관련 데이터 완전 삭제를 원하실 경우 위 이메일로 추가 요청해주시기 바랍니다. 회사는 법령상 보존이 필요한 정보를 제외한 모든 데이터를 삭제합니다.
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

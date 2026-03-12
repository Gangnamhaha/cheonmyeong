import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-10 text-[var(--text-primary)] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-accent)]">
          ← 홈으로 돌아가기
        </Link>

        <section className="mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-[var(--card-shadow)] sm:p-8">
          <h1 className="font-serif-kr text-3xl font-bold text-[var(--text-accent)]">이용약관</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            사주해 서비스 이용에 관한 기본 조건을 안내합니다. 본 약관은 sajuhae.vercel.app에서 제공하는 AI 기반 사주 분석 서비스 및 유료 상품 이용에 적용됩니다.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-7 text-[var(--text-secondary)]">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">제1조 (서비스 소개)</h2>
              <p>
                사주해는 이용자가 입력한 생년월일시, 성별 등 정보를 기반으로 사주팔자, 오행, 십신, 용신, 대운 등 명리 요소를 분석하고 AI 해석을 제공하는 온라인 SaaS 서비스입니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">제2조 (이용 조건 및 회원 의무)</h2>
              <p>
                이용자는 관련 법령, 본 약관, 서비스 내 안내사항을 준수해야 하며, 타인의 정보를 무단으로 입력하거나 계정을 부정 사용해서는 안 됩니다. 회사는 부정 이용이 확인되는 경우 이용 제한, 결제 차단, 계정 정지 조치를 취할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">제3조 (결제, 구독, 크레딧 및 환불)</h2>
              <p>
                서비스는 크레딧 충전형 상품 및 정기 구독 상품을 제공합니다. 결제는 외부 결제사업자(예: 카드사, 간편결제사)를 통해 처리되며, 실제 결제 승인 시점에 이용 계약이 성립합니다. 환불 기준은 별도 고지된 환불정책 페이지(/refund)를 따릅니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">제4조 (AI 분석 결과에 대한 면책)</h2>
              <p>
                사주해의 해석 결과는 통계적·알고리즘적 분석과 전통 명리 해석을 결합한 참고 정보이며, 의료·법률·투자·세무 등 전문 자문을 대체하지 않습니다. 이용자는 결과를 최종 판단의 유일한 근거로 사용해서는 안 되며, 회사는 이용자의 의사결정 및 그로 인한 손해에 대해 법령상 책임 범위를 넘어 보증하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">제5조 (지적재산권)</h2>
              <p>
                서비스 화면 구성, 콘텐츠, 알고리즘 결과 표현, 상호 및 로고(사주해)에 관한 저작권 및 지적재산권은 회사 또는 정당한 권리자에게 귀속됩니다. 이용자는 회사의 사전 동의 없이 복제, 배포, 2차적 저작물 작성, 상업적 이용을 할 수 없습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">제6조 (계정 관리)</h2>
              <p>
                이용자는 OAuth 로그인 계정(예: Google, Kakao)의 보안을 스스로 관리해야 하며, 계정 도용 의심 시 즉시 회사에 통지해야 합니다. 계정 관리 소홀로 발생한 불이익은 이용자 책임입니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">제7조 (서비스 변경 및 중단)</h2>
              <p>
                회사는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경할 수 있으며, 긴급 장애 대응, 설비 점검, 외부 사업자 정책 변경, 천재지변 등 불가항력 사유가 있는 경우 서비스 제공을 일시 중단할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">제8조 (분쟁 해결 및 준거법)</h2>
              <p>
                회사와 이용자 간 분쟁은 상호 협의를 우선으로 하며, 협의가 어려운 경우 대한민국 법령을 준거법으로 합니다. 관할 법원은 민사소송법상 관할 법원을 따릅니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">제9조 (문의)</h2>
              <p>
                약관 관련 문의는 아래 이메일로 접수할 수 있습니다. 이메일: any001004@gmail.com
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}

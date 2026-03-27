import Link from 'next/link'

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-10 text-[var(--text-primary)] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-accent)]">
          ← 홈으로 돌아가기
        </Link>

        <section className="mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-[var(--card-shadow)] sm:p-8">
          <h1 className="font-serif-kr text-3xl font-bold text-[var(--text-accent)]">환불정책</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            본 정책은 사주해의 이용권 상품 및 정기 구독 상품의 환불 기준과 절차를 안내합니다.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-7 text-[var(--text-secondary)]">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">1. 이용권 환불</h2>
              <p>
                결제 완료 후 미사용 이용권에 한해 결제일로부터 7일 이내 환불 요청이 가능합니다. 일부 이용권이라도 사용된 경우, 사용분에 해당하는 금액 및 결제수단 수수료를 제외한 금액이 환불될 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">2. 구독 환불</h2>
              <p>
                정기 구독은 결제 주기 시작 후 7일 이내이며 사용 이력이 없는 경우 전액 환불이 가능합니다. 이미 분석 기능을 사용했거나 이용권이 지급·소진된 경우에는 일할 계산 또는 사용량 기준으로 차감 후 환불될 수 있습니다. 구독 해지는 다음 결제일부터 과금이 중단됩니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">3. 환불 불가 사유</h2>
              <p>
                다음에 해당하는 경우 환불이 제한될 수 있습니다: 이용자의 고의 또는 중대한 과실로 서비스 이용이 불가능한 경우, 약관 위반으로 계정 이용이 제한된 경우, 디지털 콘텐츠 제공이 완료되어 재판매가 불가능한 경우, 법령상 청약철회 예외에 해당하는 경우.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">4. 환불 절차</h2>
              <p>
                환불을 원하시는 경우 계정 이메일, 결제일시, 결제수단, 요청 사유를 기재하여 고객지원 메일로 접수해 주세요. 회사는 접수일로부터 영업일 기준 3~7일 내 검토 결과를 안내하며, 승인 시 결제수단별 처리 기간에 따라 환불이 완료됩니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">5. 문의처</h2>
              <p>
                서비스명: 사주해<br />
                서비스 주소: sajuhae.vercel.app<br />
                이메일: any001004@gmail.com
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}

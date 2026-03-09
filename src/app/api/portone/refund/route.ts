import { NextRequest, NextResponse } from 'next/server'
import { cancelPayment } from '@/lib/portone'
import { getSupabase } from '@/lib/db'
import { cookies } from 'next/headers'

/**
 * POST /api/portone/refund
 *
 * Admin-only: Full refund for a given paymentId.
 * No partial refunds (per plan spec).
 *
 * Body: { paymentId: string, reason?: string }
 */
export async function POST(req: NextRequest) {
  // Admin auth check
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')?.value
  if (!adminToken) {
    return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const { paymentId, reason } = await req.json()

    if (!paymentId || typeof paymentId !== 'string') {
      return NextResponse.json({ error: 'paymentId가 필요합니다.' }, { status: 400 })
    }

    const refundReason = reason || '관리자 환불 처리'

    // Check payment exists in DB
    const supabase = getSupabase()
    if (supabase) {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_id', paymentId)
        .single()

      if (!payment) {
        return NextResponse.json({ error: '결제 내역을 찾을 수 없습니다.' }, { status: 404 })
      }

      if (payment.status === 'refunded') {
        return NextResponse.json({ error: '이미 환불 처리된 결제입니다.' }, { status: 409 })
      }

      if (payment.status !== 'paid') {
        return NextResponse.json({ error: `환불 불가 상태: ${payment.status}` }, { status: 400 })
      }
    }

    // Call PortOne V2 cancel API
    const result = await cancelPayment(paymentId, refundReason)

    // Update payment status in DB
    if (supabase) {
      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          metadata: { refund_reason: refundReason, refunded_at: new Date().toISOString() },
        })
        .eq('payment_id', paymentId)
    }

    return NextResponse.json({
      ok: true,
      paymentId,
      refundReason,
      cancelledAt: result.cancelledAt,
    })
  } catch (error) {
    console.error('Refund error:', error)
    const message = error instanceof Error ? error.message : '환불 처리 중 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

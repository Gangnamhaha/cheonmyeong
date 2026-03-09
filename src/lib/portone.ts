/**
 * PortOne V2 REST API helpers
 *
 * V2 uses direct API Secret auth (no token exchange).
 * Base URL: https://api.portone.io
 * Auth header: Authorization: PortOne <API_SECRET>
 */

const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET || ''
const PORTONE_API_BASE = 'https://api.portone.io'

export interface PortoneV2Amount {
  total: number
  taxFree?: number
  currency: string
}

export interface PortoneV2Payment {
  id: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'VIRTUAL_ACCOUNT_ISSUED'
  transactionId?: string
  storeId?: string
  amount: PortoneV2Amount
  method?: {
    type: string
    card?: {
      name?: string
      number?: string
    }
  }
  channel?: {
    key?: string
    name?: string
    pgProvider?: string
  }
  customer?: {
    email?: string
    name?: string
  }
  customData?: string
  paidAt?: string
  orderName?: string
}

function getAuthHeaders(): Record<string, string> {
  if (!PORTONE_API_SECRET) {
    throw new Error('PORTONE_API_SECRET is not configured')
  }
  return {
    Authorization: `PortOne ${PORTONE_API_SECRET}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Verify payment via PortOne V2 API.
 * GET https://api.portone.io/payments/{paymentId}
 */
export async function verifyPortonePayment(paymentId: string): Promise<PortoneV2Payment> {
  const response = await fetch(
    `${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PortOne V2 API error (${response.status}): ${errorText}`)
  }

  return (await response.json()) as PortoneV2Payment
}

/**
 * Execute a billingKey payment (server-side recurring charge).
 * POST https://api.portone.io/payments/{paymentId}/billing-key
 *
 * This charges the customer using a previously issued billingKey.
 */
export async function payWithBillingKey(params: {
  paymentId: string
  billingKey: string
  orderName: string
  amount: number
  currency?: string
  customer?: { id?: string; name?: string; email?: string }
}): Promise<PortoneV2Payment> {
  const response = await fetch(
    `${PORTONE_API_BASE}/payments/${encodeURIComponent(params.paymentId)}/billing-key`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        billingKey: params.billingKey,
        orderName: params.orderName,
        amount: {
          total: params.amount,
        },
        currency: params.currency || 'KRW',
        customer: params.customer,
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PortOne billingKey payment error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  // V2 response wraps payment inside { payment: {...} }
  return (data.payment ?? data) as PortoneV2Payment
}

/**
 * Delete (revoke) a billingKey.
 * DELETE https://api.portone.io/billing-keys/{billingKey}
 */
export async function deleteBillingKey(billingKey: string): Promise<void> {
  const response = await fetch(
    `${PORTONE_API_BASE}/billing-keys/${encodeURIComponent(billingKey)}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    // 404 = already deleted, treat as success
    if (response.status !== 404) {
      throw new Error(`PortOne billingKey delete error (${response.status}): ${errorText}`)
    }
  }
}

/**
 * Get billingKey info.
 * GET https://api.portone.io/billing-keys/{billingKey}
 */
/**
 * Cancel (refund) a payment via PortOne V2 API.
 * POST https://api.portone.io/payments/{paymentId}/cancel
 *
 * Full refund only (no partial). Admin-initiated.
 */
export async function cancelPayment(paymentId: string, reason: string): Promise<{
  cancellationId: string
  cancelledAt: string
  totalAmount: number
}> {
  const response = await fetch(
    `${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}/cancel`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        reason,
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`PortOne cancel error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return data.cancellation ?? data
}

export async function getBillingKeyInfo(billingKey: string): Promise<{ billingKey: string; status: string; card?: { name?: string; number?: string } } | null> {
  const response = await fetch(
    `${PORTONE_API_BASE}/billing-keys/${encodeURIComponent(billingKey)}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    if (response.status === 404) return null
    const errorText = await response.text()
    throw new Error(`PortOne billingKey info error (${response.status}): ${errorText}`)
  }

  return (await response.json()) as { billingKey: string; status: string; card?: { name?: string; number?: string } }
}

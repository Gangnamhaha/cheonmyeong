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

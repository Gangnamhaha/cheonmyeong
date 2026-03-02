const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET || ''
const PORTONE_API_BASE = 'https://api.iamport.kr'

interface PortoneTokenResponse {
  code: number
  message: string | null
  response: {
    access_token: string
  } | null
}

interface PortonePaymentApiResponse {
  code: number
  message: string | null
  response: {
    imp_uid: string
    merchant_uid: string
    customer_uid?: string
    status: string
    amount: number
    paid_amount: number
    pay_method: string
    pg_provider: string
    buyer_email?: string
    buyer_name?: string
    custom_data?: string
    paid_at?: number
  } | null
}

interface PortoneAgainResponse {
  code: number
  message: string | null
}

export interface PortonePaymentResult {
  impUid: string
  merchantUid: string
  customerUid?: string
  status: string
  amount: number
  paidAmount: number
  payMethod: string
  pgProvider: string
  customData?: string
  paidAt?: string
}

async function getPortoneToken(): Promise<string> {
  if (!PORTONE_API_SECRET) {
    throw new Error('PORTONE_API_SECRET is not configured')
  }

  const response = await fetch(`${PORTONE_API_BASE}/users/getToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imp_secret: PORTONE_API_SECRET,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get PortOne token: ${response.status}`)
  }

  const data = (await response.json()) as PortoneTokenResponse
  if (!data.response?.access_token) {
    throw new Error(data.message || 'PortOne token response missing access token')
  }

  return data.response.access_token
}

export async function verifyPortonePayment(impUid: string): Promise<PortonePaymentResult> {
  const token = await getPortoneToken()
  const response = await fetch(`${PORTONE_API_BASE}/payments/${impUid}`, {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to verify PortOne payment: ${response.status}`)
  }

  const data = (await response.json()) as PortonePaymentApiResponse
  if (!data.response) {
    throw new Error(data.message || 'PortOne payment not found')
  }

  return {
    impUid: data.response.imp_uid,
    merchantUid: data.response.merchant_uid,
    customerUid: data.response.customer_uid,
    status: data.response.status,
    amount: data.response.amount,
    paidAmount: data.response.paid_amount,
    payMethod: data.response.pay_method,
    pgProvider: data.response.pg_provider,
    customData: data.response.custom_data,
    paidAt: data.response.paid_at ? new Date(data.response.paid_at * 1000).toISOString() : undefined,
  }
}

export async function requestBillingPayment(
  customerUid: string,
  merchantUid: string,
  amount: number,
  name: string
): Promise<void> {
  const token = await getPortoneToken()
  const response = await fetch(`${PORTONE_API_BASE}/subscribe/payments/again`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_uid: customerUid,
      merchant_uid: merchantUid,
      amount,
      name,
      currency: 'KRW',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to request PortOne billing payment: ${response.status}`)
  }

  const data = (await response.json()) as PortoneAgainResponse
  if (data.code !== 0) {
    throw new Error(data.message || 'PortOne billing payment request failed')
  }
}

export { getPortoneToken }

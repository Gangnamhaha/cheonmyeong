import { NextRequest, NextResponse } from 'next/server'
import { createElement } from 'react'
import { checkAdminAuth } from '@/lib/admin-auth'
import { sendEmail } from '@/lib/email'
import { WelcomeEmail } from '@/emails/WelcomeEmail'
import { ReceiptEmail } from '@/emails/ReceiptEmail'
import { PasswordResetEmail } from '@/emails/PasswordResetEmail'

type EmailTemplate = 'welcome' | 'receipt' | 'passwordReset'

interface SendEmailBody {
  to?: string
  template?: EmailTemplate
  data?: Record<string, unknown>
}

function hasValidInternalSecret(req: NextRequest): boolean {
  const configuredSecret = process.env.INTERNAL_API_SECRET || process.env.EMAIL_API_SECRET
  if (!configuredSecret) return false

  const internalSecret = req.headers.get('x-internal-secret')
  const bearer = req.headers.get('authorization')
  const bearerToken = bearer?.startsWith('Bearer ') ? bearer.slice('Bearer '.length).trim() : null

  return internalSecret === configuredSecret || bearerToken === configuredSecret
}

function renderTemplate(template: EmailTemplate, data: Record<string, unknown>) {
  if (template === 'welcome') {
    return {
      subject: '천명 AI에 오신 것을 환영합니다!',
      react: createElement(WelcomeEmail, { name: String(data.name ?? '고객') }),
    }
  }

  if (template === 'receipt') {
    return {
      subject: '천명 AI 결제 영수증 안내',
      react: createElement(ReceiptEmail, {
        name: String(data.name ?? '고객'),
        planName: String(data.planName ?? ''),
        amount: String(data.amount ?? ''),
        date: String(data.date ?? ''),
        orderId: String(data.orderId ?? ''),
      }),
    }
  }

  return {
    subject: '천명 AI 비밀번호 재설정 안내',
    react: createElement(PasswordResetEmail, { resetUrl: String(data.resetUrl ?? '') }),
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth()
    const isInternal = hasValidInternalSecret(req)

    if (!isAdmin && !isInternal) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as SendEmailBody
    const to = body.to?.trim()
    const template = body.template
    const data = body.data ?? {}

    if (!to || !template) {
      return NextResponse.json({ error: 'to, template 값이 필요합니다.' }, { status: 400 })
    }

    if (!['welcome', 'receipt', 'passwordReset'].includes(template)) {
      return NextResponse.json({ error: '지원하지 않는 템플릿입니다.' }, { status: 400 })
    }

    const { subject, react } = renderTemplate(template, data)
    const result = await sendEmail(to, subject, react)

    return NextResponse.json({ success: true, id: result?.id ?? null })
  } catch (error) {
    const message = error instanceof Error ? error.message : '이메일 전송에 실패했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

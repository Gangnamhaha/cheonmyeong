import { Resend } from 'resend'
import { type ReactElement } from 'react'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.EMAIL_FROM || '사주해 AI <onboarding@resend.dev>'

export async function sendEmail(to: string, subject: string, react: ReactElement) {
  if (!resend) {
    console.log('[EMAIL] RESEND_API_KEY not set, skipping email to:', to)
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject,
    react,
  })

  if (error) {
    console.error('[EMAIL] Error:', error)
    throw error
  }

  return data
}

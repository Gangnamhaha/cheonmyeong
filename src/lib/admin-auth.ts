import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdminEmail, verifyAdminToken } from '@/lib/admin'

/**
 * 관리자 인증 확인 (dual auth)
 * 1. admin_token 쿠키 (아이디/비번 로그인)
 * 2. NextAuth 세션 + ADMIN_EMAILS (OAuth 로그인)
 */
export async function checkAdminAuth(): Promise<boolean> {
  // 1. 쿠키 토큰 확인
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (token && verifyAdminToken(token)) return true

  // 2. NextAuth 세션 폴백
  const session = await getServerSession(authOptions)
  if (session?.user?.email && isAdminEmail(session.user.email)) return true

  return false
}

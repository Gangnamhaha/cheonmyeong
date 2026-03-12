'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [guestEmail, setGuestEmail] = useState('')
  const [guestLoading, setGuestLoading] = useState(false)
  const [error, setError] = useState(
    callbackError === 'CredentialsSignin' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : '',
  )

  const isValid = email.trim() && password.length >= 1

  async function handleGuestLogin(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = guestEmail.trim()
    if (!trimmed) { setError('이메일을 입력해주세요.'); return }
    setError('')
    setGuestLoading(true)

    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? '비회원 로그인에 실패했습니다.')
        setGuestLoading(false)
        return
      }
      window.location.href = '/'
    } catch {
      setError('네트워크 오류가 발생했습니다.')
      setGuestLoading(false)
    }
  }

  async function handleCredentialLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email: email.trim(),
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif-kr text-3xl font-bold mb-1" style={{ color: 'var(--text-accent)' }}>사주해</h1>
          <p className="font-serif-kr text-lg tracking-widest mb-4" style={{ color: 'var(--text-secondary)' }}>天命</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>로그인하고 더 많은 AI 해석을 이용하세요</p>
        </div>

        <div
          className="rounded-2xl p-6 shadow-lg space-y-4 theme-transition"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          {/* Google */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium text-sm hover-scale transition-all"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Google로 로그인
          </button>

          {/* Kakao */}
          <button
            onClick={() => signIn('kakao', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium text-sm hover-scale transition-all"
            style={{ background: '#FEE500', color: '#000000' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#000" d="M12 3C6.48 3 2 6.36 2 10.5c0 2.66 1.76 5 4.41 6.32l-1.12 4.13c-.1.36.3.65.62.44l4.9-3.22c.38.04.78.06 1.19.06 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"/></svg>
            카카오로 로그인
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>또는 이메일로 로그인</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>

          {/* Email/Password Login */}
          <form onSubmit={handleCredentialLogin} className="space-y-3">
            {error && (
              <div
                className="rounded-xl px-4 py-2.5 text-sm"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
              >
                {error}
              </div>
            )}

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일 주소"
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              disabled={loading}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full py-3 rounded-xl font-medium text-sm hover-scale transition-all disabled:cursor-not-allowed"
              style={{
                background: isValid ? 'var(--accent)' : 'var(--bg-secondary)',
                color: isValid ? 'var(--accent-text)' : 'var(--text-muted)',
              }}
            >
              {loading ? '로그인 중...' : '이메일로 로그인'}
            </button>
          </form>

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            계정이 없으신가요?{' '}
            <Link href="/signup" className="underline" style={{ color: 'var(--text-accent)' }}>
              회원가입
            </Link>
          </p>

          {/* Guest login */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>비회원 로그인</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>

          <form onSubmit={handleGuestLogin} className="space-y-3">
            <input
              type="email"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
              placeholder="이메일 주소"
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              disabled={guestLoading}
            />
            <button
              type="submit"
              disabled={guestLoading || !guestEmail.trim()}
              className="w-full py-3 rounded-xl font-medium text-sm hover-scale transition-all disabled:cursor-not-allowed"
              style={{
                background: 'var(--bg-secondary)',
                color: guestEmail.trim() ? 'var(--text-primary)' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
            >
              {guestLoading ? '로그인 중...' : '이메일로 비회원 로그인'}
            </button>
          </form>

          <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
            비회원으로 결제한 크레딧을 사용할 수 있습니다.
          </p>
        </div>

        <a href="/" className="block text-center text-sm mt-6 hover-scale" style={{ color: 'var(--text-muted)' }}>
          ← 홈으로 돌아가기
        </a>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="font-serif-kr text-3xl font-bold mb-1" style={{ color: 'var(--text-accent)' }}>사주해</p>
          <p style={{ color: 'var(--text-muted)' }}>로딩 중...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

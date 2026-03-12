'use client'

import { useState } from 'react'
import Link from 'next/link'

interface InquiryItem {
  id: string
  subject: string
  content: string
  status: 'pending' | 'replied'
  createdAt: string
  reply?: string
  repliedAt?: string
}

export default function InquiryPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [lookupEmail, setLookupEmail] = useState('')
  const [inquiries, setInquiries] = useState<InquiryItem[]>([])
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !name.trim() || !subject.trim() || !content.trim()) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    setError('')
    setLoading(true)
    setSuccess(false)

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, subject, content }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '문의 등록에 실패했습니다.')
      } else {
        setSuccess(true)
        setSubject('')
        setContent('')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLookup() {
    if (!lookupEmail.trim()) { setLookupError('이메일을 입력해주세요.'); return }
    setLookupError('')
    setLookupLoading(true)

    try {
      const res = await fetch(`/api/inquiry?email=${encodeURIComponent(lookupEmail.trim())}`)
      const data = await res.json()
      if (!res.ok) {
        setLookupError(data.error ?? '조회에 실패했습니다.')
      } else {
        setInquiries(data.inquiries ?? [])
        if ((data.inquiries ?? []).length === 0) {
          setLookupError('해당 이메일로 등록된 문의가 없습니다.')
        }
      }
    } catch {
      setLookupError('네트워크 오류가 발생했습니다.')
    } finally {
      setLookupLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="font-serif-kr text-3xl font-bold mb-1" style={{ color: 'var(--text-accent)' }}>사주해</h1>
          </Link>
          <p className="font-serif-kr text-lg tracking-widest mb-4" style={{ color: 'var(--text-secondary)' }}>天命</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>고객 문의</p>
        </div>

        {/* Inquiry Form */}
        <div
          className="rounded-2xl p-6 shadow-lg space-y-4 theme-transition mb-8"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>문의하기</h2>

          {success && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
              문의가 접수되었습니다. 답변은 이메일 또는 아래 조회에서 확인하실 수 있습니다.
            </div>
          )}

          {error && (
            <div className="rounded-xl px-4 py-2.5 text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일 주소"
              className={inputClass}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              disabled={loading}
            />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름"
              className={inputClass}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              disabled={loading}
              maxLength={30}
            />
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="제목"
              className={inputClass}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              disabled={loading}
              maxLength={100}
            />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="문의 내용을 입력해주세요"
              rows={5}
              className={inputClass + ' resize-none'}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              disabled={loading}
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={loading || !email.trim() || !name.trim() || !subject.trim() || !content.trim()}
              className="w-full py-3 rounded-xl font-medium text-sm hover-scale transition-all disabled:cursor-not-allowed"
              style={{
                background: email.trim() && name.trim() && subject.trim() && content.trim() ? 'var(--accent)' : 'var(--bg-secondary)',
                color: email.trim() && name.trim() && subject.trim() && content.trim() ? 'var(--accent-text)' : 'var(--text-muted)',
              }}
            >
              {loading ? '접수 중...' : '문의 접수'}
            </button>
          </form>
        </div>

        {/* Inquiry Lookup */}
        <div
          className="rounded-2xl p-6 shadow-lg space-y-4 theme-transition"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>내 문의 조회</h2>

          <div className="flex gap-2">
            <input
              type="email"
              value={lookupEmail}
              onChange={e => setLookupEmail(e.target.value)}
              placeholder="이메일 주소"
              className={inputClass + ' flex-1'}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
            />
            <button
              onClick={handleLookup}
              disabled={lookupLoading || !lookupEmail.trim()}
              className="px-4 py-3 rounded-xl text-sm font-medium hover-scale transition-all disabled:opacity-40"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              {lookupLoading ? '...' : '조회'}
            </button>
          </div>

          {lookupError && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{lookupError}</p>
          )}

          {inquiries.length > 0 && (
            <div className="space-y-3">
              {inquiries.map(inq => (
                <div
                  key={inq.id}
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{inq.subject}</p>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: inq.status === 'replied' ? 'rgba(74,222,128,0.15)' : 'rgba(250,204,21,0.15)',
                        color: inq.status === 'replied' ? '#4ade80' : '#facc15',
                      }}
                    >
                      {inq.status === 'replied' ? '답변 완료' : '대기 중'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{inq.content}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(inq.createdAt).toLocaleString('ko-KR')}
                  </p>
                  {inq.reply && (
                    <div className="mt-2 rounded-lg p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                      <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--text-accent)' }}>관리자 답변</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{inq.reply}</p>
                      {inq.repliedAt && (
                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                          {new Date(inq.repliedAt).toLocaleString('ko-KR')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Link href="/" className="block text-center text-sm mt-6 hover-scale" style={{ color: 'var(--text-muted)' }}>
          ← 홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}

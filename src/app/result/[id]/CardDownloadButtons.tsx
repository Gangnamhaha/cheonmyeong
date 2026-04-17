'use client'

import { useState } from 'react'

type Props = {
  id: string
  name: string
}

type CardFormat = 'instagram' | 'story'

export default function CardDownloadButtons({ id, name }: Props) {
  const [loadingFormat, setLoadingFormat] = useState<CardFormat | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleDownload(format: CardFormat) {
    if (loadingFormat) return
    setLoadingFormat(format)

    try {
      const response = await fetch(`/api/card/${id}?format=${format}`)
      if (!response.ok) {
        throw new Error('card-download-failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const safeName = (name || '사용자').trim() || '사용자'
      const suffix = format === 'story' ? 'story' : 'instagram'

      anchor.href = url
      anchor.download = `사주해_사주카드_${safeName}_${suffix}.png`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      window.alert('SNS 카드 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoadingFormat(null)
    }
  }

  async function handleCopyLink() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.alert('링크 복사에 실패했습니다.')
    }
  }

  function handleShareX() {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`AI가 분석한 ${name}님의 사주팔자 결과 🔮 #사주해 #AI사주 #사주풀이`)
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  function handleShareKakao() {
    const url = window.location.href
    const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=kakao&url=${encodeURIComponent(url)}`
    window.open(kakaoUrl, '_blank', 'width=500,height=600')
  }

  return (
    <section className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-accent)' }}>공유하기</h2>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        결과를 저장하거나 친구에게 공유해 보세요.
      </p>

      {/* 공유 버튼 */}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#374151', color: '#fff' }}
        >
          {copied ? '✓ 복사됨!' : '🔗 링크 복사'}
        </button>

        <button
          type="button"
          onClick={handleShareX}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#000', color: '#fff' }}
        >
          𝕏 X에 공유
        </button>
      </div>

      {/* 다운로드 버튼 */}
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleDownload('instagram')}
          disabled={loadingFormat !== null}
          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: '#f59e0b', color: '#111827' }}
        >
          {loadingFormat === 'instagram' ? '저장 중...' : '📷 인스타 카드 저장'}
        </button>

        <button
          type="button"
          onClick={() => handleDownload('story')}
          disabled={loadingFormat !== null}
          className="inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
        >
          {loadingFormat === 'story' ? '저장 중...' : '📱 스토리용 저장'}
        </button>
      </div>
    </section>
  )
}

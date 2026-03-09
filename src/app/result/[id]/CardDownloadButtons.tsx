'use client'

import { useState } from 'react'

type Props = {
  id: string
  name: string
}

type CardFormat = 'instagram' | 'story'

export default function CardDownloadButtons({ id, name }: Props) {
  const [loadingFormat, setLoadingFormat] = useState<CardFormat | null>(null)

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
      anchor.download = `천명_사주카드_${safeName}_${suffix}.png`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      window.alert('SNS 카드 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoadingFormat(null)
    }
  }

  return (
    <section className="rounded-2xl border p-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-accent)' }}>SNS 카드 저장</h2>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        결과 카드를 저장해서 인스타 피드/스토리에 공유해 보세요.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleDownload('instagram')}
          disabled={loadingFormat !== null}
          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: '#f59e0b', color: '#111827' }}
        >
          {loadingFormat === 'instagram' ? '저장 중...' : 'SNS 카드 저장'}
        </button>

        <button
          type="button"
          onClick={() => handleDownload('story')}
          disabled={loadingFormat !== null}
          className="inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
        >
          {loadingFormat === 'story' ? '저장 중...' : '스토리용 저장'}
        </button>
      </div>
    </section>
  )
}

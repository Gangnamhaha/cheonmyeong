'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SITE_DOMAIN } from '@/lib/constants'
import { OHENG_COLORS } from '@/lib/oheng'
import type { FullSajuResult } from '@/lib/saju'

interface ShareCardProps {
  fullResult: FullSajuResult
  name: string
}

const OHENG_ORDER = ['목', '화', '토', '금', '수'] as const

export default function ShareCard({ fullResult, name }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const generateCard = useCallback(() => {
    const c = canvasRef.current
    if (!c) return

    setIsGenerating(true)
    c.width = 1080
    c.height = 1350

    const ctx = c.getContext('2d')
    if (!ctx) {
      setIsGenerating(false)
      return
    }

    const W = 1080
    const H = 1350
    const font = "'Pretendard Variable', sans-serif"

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, W, H)

    const glow = ctx.createRadialGradient(W / 2, H * 0.3, 50, W / 2, H * 0.3, W * 0.5)
    glow.addColorStop(0, 'rgba(251,191,36,0.12)')
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = '#fbbf2444'
    ctx.lineWidth = 3
    ctx.strokeRect(30, 30, W - 60, H - 60)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillStyle = '#fbbf24'
    ctx.font = `bold 64px ${font}`
    ctx.fillText('사주해', W / 2, 100)

    ctx.fillStyle = '#94a3b8'
    ctx.font = `28px ${font}`
    ctx.fillText(`${name || ''}님의 사주팔자`, W / 2, 160)

    const pillars = [
      fullResult.saju.hourPillar,
      fullResult.saju.dayPillar,
      fullResult.saju.monthPillar,
      fullResult.saju.yearPillar,
    ]
    const labels = ['시주', '일주', '월주', '년주']
    const cardW = 200
    const gap = 30
    const startX = (W - cardW * 4 - gap * 3) / 2

    pillars.forEach((pillar, index) => {
      const x = startX + index * (cardW + gap)
      const y = 220
      const color = OHENG_COLORS[pillar.element] ?? '#94a3b8'

      ctx.fillStyle = `${color}18`
      ctx.beginPath()
      ctx.roundRect(x, y, cardW, 300, 16)
      ctx.fill()

      ctx.strokeStyle = `${color}66`
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#94a3b8'
      ctx.font = `24px ${font}`
      ctx.fillText(labels[index], x + cardW / 2, y + 30)

      ctx.fillStyle = color
      ctx.font = `bold 56px ${font}`
      ctx.fillText(pillar.heavenlyStemHanja ?? pillar.heavenlyStem, x + cardW / 2, y + 100)

      ctx.fillStyle = '#334155'
      ctx.fillRect(x + 30, y + 140, cardW - 60, 2)

      ctx.fillStyle = color
      ctx.font = `bold 56px ${font}`
      ctx.fillText(pillar.earthlyBranchHanja ?? pillar.earthlyBranch, x + cardW / 2, y + 200)

      ctx.fillStyle = `${color}33`
      ctx.beginPath()
      ctx.roundRect(x + cardW / 2 - 35, y + 245, 70, 32, 16)
      ctx.fill()

      ctx.fillStyle = color
      ctx.font = `bold 20px ${font}`
      ctx.fillText(pillar.element, x + cardW / 2, y + 261)
    })

    const ohengY = 560
    ctx.fillStyle = '#f8fafc'
    ctx.font = `bold 32px ${font}`
    ctx.fillText('오행 분포', W / 2, ohengY)

    const barStartX = 140
    const barW = W - 280
    const barH = 40
    const total = Object.values(fullResult.oheng.counts).reduce((sum, value) => sum + value, 0) || 1
    let accX = barStartX

    OHENG_ORDER.forEach((element) => {
      const count = fullResult.oheng.counts[element] ?? 0
      const width = (count / total) * barW
      const color = OHENG_COLORS[element] ?? '#94a3b8'

      if (width > 0) {
        ctx.fillStyle = color
        ctx.fillRect(accX, ohengY + 25, width, barH)

        if (width > 40) {
          ctx.fillStyle = '#ffffff'
          ctx.font = `bold 18px ${font}`
          ctx.fillText(`${element}${count}`, accX + width / 2, ohengY + 45)
        }
      }

      accX += width
    })

    const infoY = 680
    const strengthColor = fullResult.ilganStrength.strength === '신강' ? '#3b82f6' : '#f97316'
    ctx.fillStyle = strengthColor
    ctx.font = `bold 36px ${font}`
    ctx.fillText(fullResult.ilganStrength.strength, W * 0.25, infoY)

    ctx.fillStyle = '#94a3b8'
    ctx.font = `22px ${font}`
    ctx.fillText('일간 강약', W * 0.25, infoY + 40)

    const yongsinElement = fullResult.yongsin.yongsin
    const yongsinColor = OHENG_COLORS[yongsinElement] ?? '#fbbf24'
    ctx.fillStyle = yongsinColor
    ctx.font = `bold 36px ${font}`
    ctx.fillText(yongsinElement, W * 0.5, infoY)

    ctx.fillStyle = '#94a3b8'
    ctx.font = `22px ${font}`
    ctx.fillText('용신', W * 0.5, infoY + 40)

    const rating = fullResult.yearlyFortune.rating
    const ratingColor = rating === '길' ? '#4ade80' : rating === '흉' ? '#f87171' : '#fbbf24'
    ctx.fillStyle = ratingColor
    ctx.font = `bold 36px ${font}`
    ctx.fillText(rating, W * 0.75, infoY)

    ctx.fillStyle = '#94a3b8'
    ctx.font = `22px ${font}`
    ctx.fillText('올해 운세', W * 0.75, infoY + 40)

    ctx.fillStyle = '#fbbf24'
    ctx.font = `24px ${font}`
    ctx.fillText('당신의 사주가 음악이 되고, 영상이 됩니다.', W / 2, H - 100)

    ctx.fillStyle = '#94a3b8'
    ctx.font = `20px ${font}`
    ctx.fillText(SITE_DOMAIN, W / 2, H - 60)

    c.toBlob((blob) => {
      setIsGenerating(false)
      if (!blob) return

      setImageBlob(blob)
      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev)
        }
        return URL.createObjectURL(blob)
      })
    }, 'image/png')
  }, [fullResult, name])

  const handleDownload = useCallback(() => {
    if (!imageBlob) return
    downloadBlob(imageBlob)
  }, [imageBlob])

  const handleShare = useCallback(async () => {
    if (!imageBlob) return

    const file = new File([imageBlob], 'saju-card.png', { type: 'image/png' })

    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try {
        await navigator.share({
          title: '나의 사주 카드 - 사주해',
          text: '내 사주 카드 확인해보기',
          files: [file],
        })
        return
      } catch {
        // User cancelled share or browser rejected share.
      }
    }

    downloadBlob(imageBlob)
  }, [imageBlob])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button
        onClick={generateCard}
        disabled={isGenerating}
        className="w-full mt-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
        style={{
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        }}
      >
        {isGenerating ? '카드 생성 중...' : '📤 사주 카드 공유하기'}
      </button>

      {previewUrl && (
        <div
          className="mt-3 rounded-2xl p-3"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="사주 카드 미리보기" className="w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={handleShare}
              className="py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-[1.01]"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-text)',
              }}
            >
              공유하기
            </button>
            <button
              onClick={handleDownload}
              className="py-2.5 rounded-lg text-sm font-semibold"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }}
            >
              저장하기
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'saju-card.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

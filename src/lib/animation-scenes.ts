import { OHENG_COLORS } from '@/lib/oheng'
import type { FullSajuResult } from '@/lib/saju'

type OhengKey = '목' | '화' | '토' | '금' | '수'
const OHENG_ORDER: OhengKey[] = ['목', '화', '토', '금', '수']
const OHENG_HANJA: Record<OhengKey, string> = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' }
const KOREAN_FONT = "'Pretendard Variable', 'Noto Sans KR', sans-serif"

const SPARKLES = [
  { left: '12%', top: '68%', delay: 0 },
  { left: '24%', top: '74%', delay: 0.35 },
  { left: '38%', top: '70%', delay: 0.7 },
  { left: '55%', top: '76%', delay: 0.15 },
  { left: '68%', top: '66%', delay: 0.5 },
  { left: '78%', top: '72%', delay: 0.85 },
  { left: '88%', top: '68%', delay: 0.25 },
]

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center') {
  ctx.font = `${size}px ${KOREAN_FONT}`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke() }
}

function drawBaseBackground(ctx: CanvasRenderingContext2D, w: number, h: number, tone?: string) {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, w, h)
  const radial = ctx.createRadialGradient(w * 0.5, h * 0.42, 40, w * 0.5, h * 0.42, w * 0.48)
  radial.addColorStop(0, 'rgba(251, 191, 36, 0.16)')
  radial.addColorStop(0.4, 'rgba(30, 41, 59, 0.08)')
  radial.addColorStop(1, 'rgba(15, 23, 42, 0)')
  ctx.fillStyle = radial
  ctx.fillRect(0, 0, w, h)
  if (tone) { ctx.fillStyle = tone; ctx.fillRect(0, 0, w, h) }
}

export function drawSceneTitle(ctx: CanvasRenderingContext2D, w: number, h: number, name: string, year: number, month: number, day: number, gender: string) {
  drawBaseBackground(ctx, w, h)
  drawText(ctx, '사주해', w / 2, h * 0.38, 124, '#fbbf24')
  drawText(ctx, 'AI 사주분석', w / 2, h * 0.45, 36, '#94a3b8')
  drawText(ctx, `${name} · ${gender === 'male' ? '남' : '여'} · ${year}년 ${month}월 ${day}일`, w / 2, h * 0.51, 34, '#cbd5e1')
  SPARKLES.forEach((sparkle, idx) => {
    const x = (parseFloat(sparkle.left) / 100) * w
    const y = (parseFloat(sparkle.top) / 100) * h
    ctx.beginPath()
    ctx.arc(x, y - idx * 18, 4 + (idx % 3), 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(251, 191, 36, 0.85)'
    ctx.fill()
  })
}

export function drawScenePillars(ctx: CanvasRenderingContext2D, w: number, h: number, fullResult: FullSajuResult) {
  drawBaseBackground(ctx, w, h)
  drawText(ctx, '사주팔자', w / 2, h * 0.18, 60, '#f8fafc')
  const labels = ['시주', '일주', '월주', '년주']
  const pillars = [fullResult.saju.hourPillar, fullResult.saju.dayPillar, fullResult.saju.monthPillar, fullResult.saju.yearPillar]
  const cardW = 220, cardH = 350, gap = 24
  const totalW = cardW * 4 + gap * 3
  const startX = (w - totalW) / 2
  pillars.forEach((pillar, idx) => {
    const x = startX + idx * (cardW + gap), y = h * 0.28
    const color = OHENG_COLORS[pillar.element] ?? '#94a3b8'
    drawRoundedRect(ctx, x, y, cardW, cardH, 20, 'rgba(30, 41, 59, 0.85)', `${color}99`)
    drawText(ctx, labels[idx], x + cardW / 2, y + 34, 24, '#94a3b8')
    drawText(ctx, pillar.heavenlyStemHanja ?? pillar.heavenlyStem, x + cardW / 2, y + 100, 64, color)
    drawText(ctx, pillar.heavenlyStem, x + cardW / 2, y + 142, 28, '#cbd5e1')
    ctx.fillStyle = '#334155'; ctx.fillRect(x + 24, y + 178, cardW - 48, 2)
    drawText(ctx, pillar.earthlyBranchHanja ?? pillar.earthlyBranch, x + cardW / 2, y + 232, 64, color)
    drawText(ctx, pillar.earthlyBranch, x + cardW / 2, y + 274, 28, '#cbd5e1')
    drawRoundedRect(ctx, x + cardW / 2 - 44, y + 300, 88, 34, 17, `${color}33`, `${color}aa`)
    drawText(ctx, pillar.element, x + cardW / 2, y + 317, 22, color)
  })
}

export function drawSceneOheng(ctx: CanvasRenderingContext2D, w: number, h: number, fullResult: FullSajuResult) {
  drawBaseBackground(ctx, w, h)
  drawText(ctx, '오행의 조화', w / 2, h * 0.2, 60, '#f8fafc')
  const counts = fullResult.oheng.counts
  const maxValue = Math.max(...Object.values(counts), 1)
  const baseX = w * 0.16, baseY = h * 0.3, rowH = 110
  OHENG_ORDER.forEach((element, idx) => {
    const count = counts[element]
    const color = OHENG_COLORS[element]
    const barW = ((w * 0.62) * count) / maxValue
    drawText(ctx, `${element} ${OHENG_HANJA[element]}`, baseX, baseY + idx * rowH, 34, color, 'left')
    drawRoundedRect(ctx, baseX + 140, baseY + idx * rowH - 24, w * 0.62, 48, 24, 'rgba(51, 65, 85, 0.5)')
    drawRoundedRect(ctx, baseX + 140, baseY + idx * rowH - 24, Math.max(barW, 30), 48, 24, color)
    drawText(ctx, String(count), baseX + 170 + Math.max(barW, 30), baseY + idx * rowH, 32, '#e2e8f0', 'left')
    if (element === fullResult.oheng.dominant) {
      drawRoundedRect(ctx, baseX + 130, baseY + idx * rowH - 34, Math.max(barW, 30) + 30, 68, 30, `${color}22`, `${color}`)
    }
  })
  const badgeColor = fullResult.oheng.balance === '균형' ? '#4ade80' : fullResult.oheng.balance === '편중' ? '#fbbf24' : '#f87171'
  drawRoundedRect(ctx, w * 0.35, h * 0.84, w * 0.3, 66, 33, `${badgeColor}33`, badgeColor)
  drawText(ctx, fullResult.oheng.balance, w / 2, h * 0.84 + 33, 34, badgeColor)
}

export function drawSceneStrength(ctx: CanvasRenderingContext2D, w: number, h: number, fullResult: FullSajuResult) {
  drawBaseBackground(ctx, w, h)
  const total = fullResult.ilganStrength.details.support + fullResult.ilganStrength.details.opposition
  const gaugePercent = total > 0 ? fullResult.ilganStrength.details.support / total : 0.5
  const strengthColor = fullResult.ilganStrength.strength === '신강' ? '#3b82f6' : '#f97316'
  drawText(ctx, '일간 강약', w * 0.27, h * 0.2, 48, '#f8fafc')
  drawText(ctx, '용신 (用神)', w * 0.73, h * 0.2, 48, '#f8fafc')
  ctx.beginPath(); ctx.arc(w * 0.27, h * 0.5, 150, 0, Math.PI * 2)
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 24; ctx.stroke()
  ctx.beginPath(); ctx.arc(w * 0.27, h * 0.5, 150, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * gaugePercent)
  ctx.strokeStyle = strengthColor; ctx.lineWidth = 24; ctx.lineCap = 'round'; ctx.stroke()
  drawText(ctx, fullResult.ilganStrength.strength, w * 0.27, h * 0.5, 54, strengthColor)
  const yongsin = fullResult.yongsin.yongsin as OhengKey
  const yongsinColor = OHENG_COLORS[yongsin] ?? '#f8fafc'
  drawText(ctx, OHENG_HANJA[yongsin] ?? fullResult.yongsin.yongsin, w * 0.73, h * 0.48, 128, yongsinColor)
  drawText(ctx, fullResult.yongsin.yongsin, w * 0.73, h * 0.56, 48, yongsinColor)
  drawText(ctx, `희신: ${fullResult.yongsin.huisin}`, w * 0.73, h * 0.64, 34, '#cbd5e1')
}

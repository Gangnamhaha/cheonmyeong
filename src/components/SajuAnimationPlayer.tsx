'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { OHENG_COLORS } from '@/lib/oheng'
import type { FullSajuResult } from '@/lib/saju'
import type { TraditionalInterpretation } from '@/lib/traditional-interpret'

interface SajuAnimationPlayerProps {
  fullResult: FullSajuResult
  formData: {
    name: string
    year: number
    month: number
    day: number
    hour: number
    gender: 'male' | 'female'
    calendarType: 'solar' | 'lunar'
  }
  traditionalResult: TraditionalInterpretation | null
  aiInterpretation: string | null
  onClose: () => void
}

type SceneIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6
type OhengKey = '목' | '화' | '토' | '금' | '수'

const SCENE_DURATIONS = [8000, 11000, 8000, 10000, 10000, 12000, 8000] as const
const OHENG_ORDER: OhengKey[] = ['목', '화', '토', '금', '수']
const OHENG_HANJA: Record<OhengKey, string> = {
  목: '木',
  화: '火',
  토: '土',
  금: '金',
  수: '水',
}
const SPARKLES = [
  { left: '12%', top: '68%', delay: 0 },
  { left: '24%', top: '74%', delay: 0.35 },
  { left: '35%', top: '62%', delay: 0.1 },
  { left: '52%', top: '76%', delay: 0.42 },
  { left: '66%', top: '70%', delay: 0.22 },
  { left: '78%', top: '65%', delay: 0.5 },
  { left: '86%', top: '73%', delay: 0.16 },
]
const KOREAN_FONT = "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  stroke?: string,
) {
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
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: CanvasTextAlign = 'center',
  font = KOREAN_FONT,
) {
  ctx.font = `${size}px ${font}`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
}

function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  size: number,
  color: string,
  maxLines = 4,
) {
  ctx.font = `${size}px ${KOREAN_FONT}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color

  const lines: string[] = []
  let current = ''
  for (const char of text) {
    const next = current + char
    if (ctx.measureText(next).width > maxWidth) {
      if (current) lines.push(current)
      current = char
      if (lines.length >= maxLines) break
    } else {
      current = next
    }
  }
  if (current && lines.length < maxLines) lines.push(current)

  lines.forEach((line, idx) => {
    ctx.fillText(line, x, y + idx * lineHeight)
  })
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

  if (tone) {
    ctx.fillStyle = tone
    ctx.fillRect(0, 0, w, h)
  }
}

function drawScene0(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  formData: SajuAnimationPlayerProps['formData'],
) {
  drawBaseBackground(ctx, w, h)
  drawText(ctx, '사주해', w / 2, h * 0.38, 124, '#fbbf24')
  drawText(ctx, '天命 사주분석', w / 2, h * 0.45, 36, '#94a3b8')
  drawText(
    ctx,
    `${formData.name} · ${formData.gender === 'male' ? '남' : '여'} · ${formData.year}년 ${formData.month}월 ${formData.day}일`,
    w / 2,
    h * 0.51,
    34,
    '#cbd5e1',
  )

  SPARKLES.forEach((sparkle, idx) => {
    const x = (Number.parseFloat(sparkle.left) / 100) * w
    const y = (Number.parseFloat(sparkle.top) / 100) * h
    ctx.beginPath()
    ctx.arc(x, y - idx * 18, 4 + (idx % 3), 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(251, 191, 36, 0.85)'
    ctx.fill()
  })
}

function drawScene1(ctx: CanvasRenderingContext2D, w: number, h: number, fullResult: FullSajuResult) {
  drawBaseBackground(ctx, w, h)
  drawText(ctx, '사주팔자', w / 2, h * 0.18, 60, '#f8fafc')

  const labels = ['시주', '일주', '월주', '년주']
  const pillars = [
    fullResult.saju.hourPillar,
    fullResult.saju.dayPillar,
    fullResult.saju.monthPillar,
    fullResult.saju.yearPillar,
  ]
  const cardW = 220
  const cardH = 350
  const gap = 24
  const totalW = cardW * 4 + gap * 3
  const startX = (w - totalW) / 2

  pillars.forEach((pillar, idx) => {
    const x = startX + idx * (cardW + gap)
    const y = h * 0.28
    const color = OHENG_COLORS[pillar.element] ?? '#94a3b8'
    drawRoundedRect(ctx, x, y, cardW, cardH, 20, 'rgba(30, 41, 59, 0.85)', `${color}99`)
    drawText(ctx, labels[idx], x + cardW / 2, y + 34, 24, '#94a3b8')
    drawText(ctx, pillar.heavenlyStemHanja ?? pillar.heavenlyStem, x + cardW / 2, y + 100, 64, color)
    drawText(ctx, pillar.heavenlyStem, x + cardW / 2, y + 142, 28, '#cbd5e1')
    ctx.fillStyle = '#334155'
    ctx.fillRect(x + 24, y + 178, cardW - 48, 2)
    drawText(ctx, pillar.earthlyBranchHanja ?? pillar.earthlyBranch, x + cardW / 2, y + 232, 64, color)
    drawText(ctx, pillar.earthlyBranch, x + cardW / 2, y + 274, 28, '#cbd5e1')
    drawRoundedRect(ctx, x + cardW / 2 - 44, y + 300, 88, 34, 17, `${color}33`, `${color}aa`)
    drawText(ctx, pillar.element, x + cardW / 2, y + 317, 22, color)
  })
}

function drawScene2(ctx: CanvasRenderingContext2D, w: number, h: number, fullResult: FullSajuResult) {
  drawBaseBackground(ctx, w, h)
  drawText(ctx, '오행의 조화', w / 2, h * 0.2, 60, '#f8fafc')

  const counts = fullResult.oheng.counts
  const maxValue = Math.max(...Object.values(counts), 1)
  const baseX = w * 0.16
  const baseY = h * 0.3
  const rowH = 110

  OHENG_ORDER.forEach((element, idx) => {
    const count = counts[element]
    const color = OHENG_COLORS[element]
    const width = ((w * 0.62) * count) / maxValue
    drawText(ctx, `${element} ${OHENG_HANJA[element]}`, baseX, baseY + idx * rowH, 34, color, 'left')
    drawRoundedRect(ctx, baseX + 140, baseY + idx * rowH - 24, w * 0.62, 48, 24, 'rgba(51, 65, 85, 0.5)')
    drawRoundedRect(ctx, baseX + 140, baseY + idx * rowH - 24, Math.max(width, 30), 48, 24, color)
    drawText(ctx, String(count), baseX + 170 + Math.max(width, 30), baseY + idx * rowH, 32, '#e2e8f0', 'left')

    if (element === fullResult.oheng.dominant) {
      drawRoundedRect(ctx, baseX + 130, baseY + idx * rowH - 34, Math.max(width, 30) + 30, 68, 30, `${color}22`, `${color}`)
    }
  })

  const badgeColor =
    fullResult.oheng.balance === '균형'
      ? '#4ade80'
      : fullResult.oheng.balance === '편중'
        ? '#fbbf24'
        : '#f87171'
  drawRoundedRect(ctx, w * 0.35, h * 0.84, w * 0.3, 66, 33, `${badgeColor}33`, badgeColor)
  drawText(ctx, fullResult.oheng.balance, w / 2, h * 0.84 + 33, 34, badgeColor)
}

function drawScene3(ctx: CanvasRenderingContext2D, w: number, h: number, fullResult: FullSajuResult) {
  drawBaseBackground(ctx, w, h)

  const total = fullResult.ilganStrength.details.support + fullResult.ilganStrength.details.opposition
  const gaugePercent = total > 0 ? fullResult.ilganStrength.details.support / total : 0.5
  const strengthColor = fullResult.ilganStrength.strength === '신강' ? '#3b82f6' : '#f97316'

  drawText(ctx, '일간 강약', w * 0.27, h * 0.2, 48, '#f8fafc')
  drawText(ctx, '용신 (用神)', w * 0.73, h * 0.2, 48, '#f8fafc')

  ctx.beginPath()
  ctx.arc(w * 0.27, h * 0.5, 150, 0, Math.PI * 2)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 24
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(w * 0.27, h * 0.5, 150, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * gaugePercent)
  ctx.strokeStyle = strengthColor
  ctx.lineWidth = 24
  ctx.lineCap = 'round'
  ctx.stroke()

  drawText(ctx, fullResult.ilganStrength.strength, w * 0.27, h * 0.5, 54, strengthColor)

  const yongsin = fullResult.yongsin.yongsin as OhengKey
  const yongsinColor = OHENG_COLORS[yongsin] ?? '#f8fafc'
  drawText(ctx, OHENG_HANJA[yongsin] ?? fullResult.yongsin.yongsin, w * 0.73, h * 0.48, 128, yongsinColor)
  drawText(ctx, fullResult.yongsin.yongsin, w * 0.73, h * 0.56, 48, yongsinColor)
  drawText(ctx, `희신: ${fullResult.yongsin.huisin}`, w * 0.73, h * 0.64, 34, '#cbd5e1')
}

function drawScene4(ctx: CanvasRenderingContext2D, w: number, h: number, fullResult: FullSajuResult) {
  const rating = fullResult.yearlyFortune.rating
  const tone = rating === '길' ? 'rgba(22, 101, 52, 0.18)' : rating === '흉' ? 'rgba(127, 29, 29, 0.18)' : 'rgba(146, 64, 14, 0.15)'
  const ratingColor = rating === '길' ? '#4ade80' : rating === '흉' ? '#f87171' : '#fbbf24'

  drawBaseBackground(ctx, w, h, tone)
  drawText(ctx, `${new Date().getFullYear()}년 운세`, w / 2, h * 0.2, 60, '#f8fafc')
  drawRoundedRect(ctx, w * 0.4, h * 0.3, w * 0.2, 120, 28, `${ratingColor}33`, ratingColor)
  drawText(ctx, rating, w / 2, h * 0.3 + 60, 68, ratingColor)

  drawMultilineText(
    ctx,
    (fullResult.yearlyFortune.description || '당신에게 의미 있는 변화를 맞이하는 시기입니다.').slice(0, 100),
    w * 0.18,
    h * 0.52,
    w * 0.64,
    56,
    38,
    '#e2e8f0',
    5,
  )
}

function drawScene5(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fullResult: FullSajuResult,
  traditionalResult: TraditionalInterpretation | null,
  aiInterpretation: string | null,
) {
  drawBaseBackground(ctx, w, h)
  drawText(ctx, '운명의 메시지', w / 2, h * 0.2, 60, '#f8fafc')

  const rows = traditionalResult
    ? [
        `성격: ${traditionalResult.personality[0]?.plain ?? '기질의 균형을 잘 다스리면 큰 성장이 있습니다.'}`,
        `직업: ${traditionalResult.career[0]?.plain ?? '지속적인 집중이 성과를 크게 키워줍니다.'}`,
        `운세: ${traditionalResult.fortune[0]?.plain ?? fullResult.yearlyFortune.description}`,
      ]
    : [
        (aiInterpretation?.slice(0, 150) || fullResult.yearlyFortune.description || '당신의 흐름은 천천히 상승하는 중입니다.').slice(0, 150),
      ]

  rows.forEach((line, idx) => {
    const y = h * 0.36 + idx * 160
    drawRoundedRect(ctx, w * 0.12, y - 42, w * 0.76, 104, 22, 'rgba(30, 41, 59, 0.7)', '#334155')
    drawMultilineText(ctx, line, w * 0.16, y + 4, w * 0.68, 40, 30, '#e2e8f0', 2)
  })
}

function drawScene6(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawBaseBackground(ctx, w, h)
  drawText(ctx, '당신의 운명이 펼쳐집니다', w / 2, h * 0.45, 62, '#f8fafc')
  drawText(ctx, '사주해 sajuhae.vercel.app', w / 2, h * 0.54, 30, '#fbbf24')
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 4
  ctx.strokeRect(56, 56, w - 112, h - 112)
}

export default function SajuAnimationPlayer({
  fullResult,
  formData,
  traditionalResult,
  aiInterpretation,
  onClose,
}: SajuAnimationPlayerProps) {
  const [currentScene, setCurrentScene] = useState<SceneIndex>(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [sceneElapsed, setSceneElapsed] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordProgress, setRecordProgress] = useState(0)
  const [narrationEnabled, setNarrationEnabled] = useState(true)

  const { isSupported: ttsSupported, isSpeaking, speak, stop: stopNarration, isMobile, isUnlocked } = useSpeechSynthesis()

  // On mobile, disable auto-narration by default — user must tap 🔈 to enable
  // (mobile browsers block programmatic speak() without user gesture)
  useEffect(() => {
    if (isMobile) setNarrationEnabled(false)
  }, [isMobile])

  const sceneStartRef = useRef<number>(Date.now())
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetAutoHide = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying || currentScene < 6) {
        setShowControls(false)
      }
    }, 3000)
  }, [isPlaying, currentScene])

  useEffect(() => {
    sceneStartRef.current = Date.now()
    setSceneElapsed(0)

    let rafId = 0
    const tick = () => {
      setSceneElapsed(Date.now() - sceneStartRef.current)
      rafId = window.requestAnimationFrame(tick)
    }
    rafId = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [currentScene])

  useEffect(() => {
    if (!isPlaying) return

    const duration = SCENE_DURATIONS[currentScene]
    const timeout = window.setTimeout(() => {
      setCurrentScene((prev) => {
        if (prev >= 6) {
          setIsPlaying(false)
          setShowControls(true)
          return 6
        }
        return (prev + 1) as SceneIndex
      })
    }, duration)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [currentScene, isPlaying])

  useEffect(() => {
    if (!showControls) return
    if (isPlaying || currentScene < 6) {
      resetAutoHide()
    }
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
    }
  }, [showControls, isPlaying, currentScene, resetAutoHide])

  const getNarrationText = useCallback((scene: SceneIndex): string => {
    switch (scene) {
      case 0:
        return `사주해 사주분석. ${formData.name}, ${formData.gender === 'male' ? '남성' : '여성'}, ${formData.year}년 ${formData.month}월 ${formData.day}일의 사주를 분석합니다.`
      case 1: {
        const p = fullResult.saju
        return `사주팔자. 시주 ${p.hourPillar.heavenlyStem} ${p.hourPillar.earthlyBranch}, 일주 ${p.dayPillar.heavenlyStem} ${p.dayPillar.earthlyBranch}, 월주 ${p.monthPillar.heavenlyStem} ${p.monthPillar.earthlyBranch}, 년주 ${p.yearPillar.heavenlyStem} ${p.yearPillar.earthlyBranch}.`
      }
      case 2: {
        const counts = fullResult.oheng.counts
        const parts = OHENG_ORDER.map((el) => `${el} ${counts[el]}`)
        return `오행의 조화. ${parts.join(', ')}. 오행 밸런스는 ${fullResult.oheng.balance}입니다.`
      }
      case 3:
        return `일간 강약은 ${fullResult.ilganStrength.strength}입니다. 용신은 ${fullResult.yongsin.yongsin}, 희신은 ${fullResult.yongsin.huisin}입니다.`
      case 4: {
        const desc = fullResult.yearlyFortune.description || '의미 있는 변화를 맞이하는 시기입니다.'
        return `${new Date().getFullYear()}년 운세. 등급은 ${fullResult.yearlyFortune.rating}. ${desc.slice(0, 100)}`
      }
      case 5: {
        if (traditionalResult) {
          const personality = traditionalResult.personality[0]?.plain ?? ''
          const career = traditionalResult.career[0]?.plain ?? ''
          return `운명의 메시지. 성격, ${personality}. 직업, ${career}.`
        }
        const snippet = (aiInterpretation || fullResult.yearlyFortune.description || '당신의 흐름은 꾸준히 확장됩니다.').slice(0, 120)
        return `운명의 메시지. ${snippet}`
      }
      case 6:
        return '당신의 운명이 펼쳐집니다. 사주해.'
      default:
        return ''
    }
  }, [formData, fullResult, traditionalResult, aiInterpretation])

  // Auto-narrate on scene change
  useEffect(() => {
    if (!narrationEnabled || !ttsSupported) return
    // On mobile, wait until TTS is unlocked via user gesture (narration toggle tap)
    if (isMobile && !isUnlocked) return

    const text = getNarrationText(currentScene)
    if (!text) return

    const timer = setTimeout(() => {
      speak(text)
    }, 300)

    return () => {
      clearTimeout(timer)
      stopNarration()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene, narrationEnabled, ttsSupported, isMobile, isUnlocked])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopNarration()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggleNarration = useCallback(() => {
    if (narrationEnabled) {
      stopNarration()
      setNarrationEnabled(false)
    } else {
      setNarrationEnabled(true)
      // Speak current scene directly within user gesture — this IS the unlock.
      // Don't call unlockTts() separately: its '.' utterance gets cancelled by
      // speak() immediately after, breaking TTS on some mobile browsers.
      const text = getNarrationText(currentScene as SceneIndex)
      if (text) speak(text)
    }
  }, [narrationEnabled, stopNarration, speak, getNarrationText, currentScene])

  const handleToggleControls = () => {
    if (!isPlaying || currentScene >= 6) return
    // Tap to advance to next scene
    setCurrentScene((prev) => {
      if (prev >= 6) {
        setIsPlaying(false)
        setShowControls(true)
        return 6
      }
      return (prev + 1) as SceneIndex
    })
  }

  const handleReplay = () => {
    setCurrentScene(0)
    setIsPlaying(true)
    setShowControls(false)
  }

  const runSceneDraw = useCallback(
    (
      scene: SceneIndex,
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
    ) => {
      switch (scene) {
        case 0:
          drawScene0(ctx, width, height, formData)
          break
        case 1:
          drawScene1(ctx, width, height, fullResult)
          break
        case 2:
          drawScene2(ctx, width, height, fullResult)
          break
        case 3:
          drawScene3(ctx, width, height, fullResult)
          break
        case 4:
          drawScene4(ctx, width, height, fullResult)
          break
        case 5:
          drawScene5(ctx, width, height, fullResult, traditionalResult, aiInterpretation)
          break
        case 6:
          drawScene6(ctx, width, height)
          break
      }
    },
    [formData, fullResult, traditionalResult, aiInterpretation],
  )

  const holdScene = useCallback(
    async (
      scene: SceneIndex,
      duration: number,
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
    ) => {
      await new Promise<void>((resolve) => {
        let start = 0
        const frame = (time: number) => {
          if (!start) start = time
          runSceneDraw(scene, ctx, width, height)
          if (time - start < duration) {
            window.requestAnimationFrame(frame)
          } else {
            resolve()
          }
        }
        window.requestAnimationFrame(frame)
      })
    },
    [runSceneDraw],
  )

  const fadeThroughBlack = useCallback(
    async (
      fromScene: SceneIndex,
      toScene: SceneIndex,
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
    ) => {
      const totalFrames = 20
      await new Promise<void>((resolve) => {
        let frameIndex = 0
        const frame = () => {
          const t = frameIndex / (totalFrames - 1)
          if (t < 0.5) {
            runSceneDraw(fromScene, ctx, width, height)
            ctx.fillStyle = `rgba(0, 0, 0, ${t * 2})`
            ctx.fillRect(0, 0, width, height)
          } else {
            runSceneDraw(toScene, ctx, width, height)
            ctx.fillStyle = `rgba(0, 0, 0, ${(1 - t) * 2})`
            ctx.fillRect(0, 0, width, height)
          }

          frameIndex += 1
          if (frameIndex < totalFrames) {
            window.requestAnimationFrame(frame)
          } else {
            resolve()
          }
        }
        window.requestAnimationFrame(frame)
      })
    },
    [runSceneDraw],
  )

  const handleSaveVideo = useCallback(async () => {
    if (isRecording) return
    setIsRecording(true)
    setRecordProgress(0)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      canvas.style.display = 'none'
      document.body.appendChild(canvas)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        document.body.removeChild(canvas)
        setIsRecording(false)
        return
      }

      const stream = canvas.captureStream(30)
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 })
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }

      recorder.start(100)

      for (let i = 0; i < 7; i += 1) {
        const scene = i as SceneIndex
        await holdScene(scene, SCENE_DURATIONS[scene], ctx, canvas.width, canvas.height)
        setRecordProgress(Math.round(((i + 0.5) / 7) * 100))

        if (i < 6) {
          await fadeThroughBlack(scene, (i + 1) as SceneIndex, ctx, canvas.width, canvas.height)
          setRecordProgress(Math.round(((i + 1) / 7) * 100))
        }
      }

      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve()
        recorder.stop()
      })

      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `사주해_운명스토리_${formData.name}_${date}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      document.body.removeChild(canvas)

      setRecordProgress(100)
    } finally {
      setTimeout(() => {
        setIsRecording(false)
      }, 300)
    }
  }, [fadeThroughBlack, formData.name, holdScene, isRecording])

  const pillars = [
    { label: '시주', pillar: fullResult.saju.hourPillar },
    { label: '일주', pillar: fullResult.saju.dayPillar },
    { label: '월주', pillar: fullResult.saju.monthPillar },
    { label: '년주', pillar: fullResult.saju.yearPillar },
  ]

  const ohengMax = Math.max(...Object.values(fullResult.oheng.counts), 1)
  const ilganTotal = fullResult.ilganStrength.details.support + fullResult.ilganStrength.details.opposition
  const ilganSupportPct = ilganTotal > 0 ? fullResult.ilganStrength.details.support / ilganTotal : 0.5
  const ilganColor = fullResult.ilganStrength.strength === '신강' ? '#3b82f6' : '#f97316'
  const yearlyDescription = (fullResult.yearlyFortune.description || '').slice(0, 100)
  const yearlyTypedText = yearlyDescription.slice(0, Math.floor((yearlyDescription.length * sceneElapsed) / SCENE_DURATIONS[4]))
  const scene3Typed = fullResult.ilganStrength.strength.slice(
    0,
    clamp(Math.floor((fullResult.ilganStrength.strength.length * sceneElapsed) / 900), 0, fullResult.ilganStrength.strength.length),
  )
  const aiSnippet = (aiInterpretation || '').slice(0, 150)

  const renderScene = () => {
    if (currentScene === 0) {
      return (
        <motion.div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.16),rgba(15,23,42,0)_55%)]" />
          {SPARKLES.map((sparkle, index) => (
            <motion.span
              key={index}
              className="absolute h-1.5 w-1.5 rounded-full bg-amber-300/85"
              style={{ left: sparkle.left, top: sparkle.top }}
              animate={{ y: [-6, -64], opacity: [0.2, 0.9, 0.1], scale: [0.7, 1.2, 0.8] }}
              transition={{ duration: 2.8 + (index % 3) * 0.45, delay: sparkle.delay, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            />
          ))}
          <motion.h2
            className="relative text-5xl font-black text-amber-300"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          >
            사주해
          </motion.h2>
          <motion.p
            className="mt-4 text-sm tracking-[0.3em] text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            天命 사주분석
          </motion.p>
          <motion.p
            className="mt-7 text-sm text-slate-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.9 }}
          >
            {formData.name} · {formData.gender === 'male' ? '남' : '여'} · {formData.year}년 {formData.month}월 {formData.day}일
          </motion.p>
        </motion.div>
      )
    }

    if (currentScene === 1) {
      return (
        <div className="flex h-full w-full flex-col px-4 pt-16">
          <motion.h3
            className="mb-8 text-center text-3xl font-bold text-slate-100"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            사주팔자
          </motion.h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pillars.map(({ label, pillar }, idx) => {
              const color = OHENG_COLORS[pillar.element] ?? '#94a3b8'
              return (
                <motion.div
                  key={label}
                  className="rounded-xl border bg-slate-900/70 p-3 text-center shadow-[0_0_22px_rgba(15,23,42,0.5)]"
                  style={{ borderColor: `${color}99` }}
                  initial={{ y: 40, opacity: 0, boxShadow: `0 0 0 ${color}00` }}
                  animate={{ y: 0, opacity: 1, boxShadow: [`0 0 0 ${color}00`, `0 0 22px ${color}66`, `0 0 14px ${color}22`] }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14, delay: idx * 0.3 }}
                >
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="mt-2 text-3xl font-black" style={{ color }}>{pillar.heavenlyStemHanja ?? pillar.heavenlyStem}</p>
                  <p className="text-xs text-slate-300">{pillar.heavenlyStem}</p>
                  <div className="my-2 h-px w-full bg-slate-700" />
                  <p className="text-3xl font-black" style={{ color }}>{pillar.earthlyBranchHanja ?? pillar.earthlyBranch}</p>
                  <p className="text-xs text-slate-300">{pillar.earthlyBranch}</p>
                  <span className="mt-2 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold" style={{ color, borderColor: `${color}77`, backgroundColor: `${color}22` }}>
                    {pillar.element}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )
    }

    if (currentScene === 2) {
      const progress = clamp(sceneElapsed / SCENE_DURATIONS[2], 0, 1)

      return (
        <div className="flex h-full w-full flex-col px-6 pt-16">
          <motion.h3
            className="mb-9 text-center text-3xl font-bold text-slate-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            오행의 조화
          </motion.h3>
          <div className="space-y-4">
            {OHENG_ORDER.map((element, idx) => {
              const count = fullResult.oheng.counts[element]
              const color = OHENG_COLORS[element]
              const ratio = maxRatio(count, ohengMax)
              const targetWidth = `${Math.max(ratio * 100, 8)}%`
              const displayCount = Math.floor(count * progress)
              const isDominant = element === fullResult.oheng.dominant

              return (
                <motion.div
                  key={element}
                  className="space-y-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold" style={{ color }}>{element} {OHENG_HANJA[element]}</span>
                    <span className="text-slate-200">{displayCount}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-700/80">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color, boxShadow: isDominant ? `0 0 14px ${color}` : 'none' }}
                      initial={{ width: '0%' }}
                      animate={{ width: targetWidth }}
                      transition={{ duration: 0.65, delay: idx * 0.15, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.95, type: 'spring', stiffness: 160, damping: 14 }}
          >
            <span
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                fullResult.oheng.balance === '균형'
                  ? 'border-green-300/50 bg-green-400/15 text-green-300'
                  : fullResult.oheng.balance === '편중'
                    ? 'border-amber-300/50 bg-amber-400/15 text-amber-300'
                    : 'border-red-300/50 bg-red-400/15 text-red-300'
              }`}
            >
              {fullResult.oheng.balance}
            </span>
          </motion.div>
        </div>
      )
    }

    if (currentScene === 3) {
      const gaugeProgress = clamp(sceneElapsed / SCENE_DURATIONS[3], 0, 1)
      const gaugePct = ilganSupportPct * gaugeProgress
      const yongsinColor = OHENG_COLORS[fullResult.yongsin.yongsin] ?? '#f8fafc'

      return (
        <div className="grid h-full w-full grid-cols-2 gap-4 px-4 pt-16">
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-slate-100">일간 강약</h3>
            <div className="relative mt-8 h-44 w-44">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="72" stroke="#334155" strokeWidth="14" fill="none" />
                <circle
                  cx="90"
                  cy="90"
                  r="72"
                  stroke={ilganColor}
                  strokeWidth="14"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 72}`}
                  strokeDashoffset={`${2 * Math.PI * 72 * (1 - gaugePct)}`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-black" style={{ color: ilganColor }}>
                {scene3Typed}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-slate-100">용신 (用神)</h3>
            <motion.div
              className="mt-12 text-6xl font-black"
              style={{ color: yongsinColor }}
              initial={{ opacity: 0, scale: 0.4, rotate: -40 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            >
              {OHENG_HANJA[fullResult.yongsin.yongsin as OhengKey] ?? fullResult.yongsin.yongsin}
            </motion.div>
            <motion.p
              className="mt-2 text-2xl font-bold"
              style={{ color: yongsinColor }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {fullResult.yongsin.yongsin}
            </motion.p>
            <motion.p
              className="mt-4 text-sm text-slate-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              희신: {fullResult.yongsin.huisin}
            </motion.p>
          </div>
        </div>
      )
    }

    if (currentScene === 4) {
      const rating = fullResult.yearlyFortune.rating
      const ratingColor = rating === '길' ? '#4ade80' : rating === '흉' ? '#f87171' : '#fbbf24'
      const toneClass =
        rating === '길'
          ? 'bg-green-500/12'
          : rating === '흉'
            ? 'bg-red-500/12'
            : 'bg-amber-500/12'

      return (
        <div className="relative flex h-full w-full flex-col items-center px-6 pt-16">
          <motion.div
            className={`pointer-events-none absolute inset-0 ${toneClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <h3 className="relative text-3xl font-bold text-slate-100">{new Date().getFullYear()}년 운세</h3>
          <motion.div
            className="relative mt-8 rounded-2xl border px-6 py-4 text-4xl font-black"
            style={{ color: ratingColor, borderColor: `${ratingColor}99`, backgroundColor: `${ratingColor}1a` }}
            initial={{ y: -80, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 12 }}
          >
            {rating}
          </motion.div>
          <p className="relative mt-8 max-w-xs text-center text-base leading-relaxed text-slate-200">
            {yearlyTypedText}
          </p>
        </div>
      )
    }

    if (currentScene === 5) {
      const traditionalRows = traditionalResult
        ? [
            `성격: ${traditionalResult.personality[0]?.plain ?? ''}`,
            `직업: ${traditionalResult.career[0]?.plain ?? ''}`,
            `운세: ${traditionalResult.fortune[0]?.plain ?? ''}`,
          ].filter((line) => line.split(': ')[1])
        : []

      const fallback = fullResult.yearlyFortune.description || '당신의 흐름은 꾸준히 확장됩니다.'
      const typedAi = (aiSnippet || fallback).slice(0, Math.floor(((aiSnippet || fallback).length * sceneElapsed) / SCENE_DURATIONS[5]))

      return (
        <div className="flex h-full w-full flex-col px-5 pt-16">
          <h3 className="mb-8 text-center text-3xl font-bold text-slate-100">운명의 메시지</h3>
          {traditionalRows.length > 0 ? (
            <div className="space-y-4">
              {traditionalRows.slice(0, 3).map((line, idx) => (
                <motion.div
                  key={line}
                  className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm leading-relaxed text-slate-200"
                  initial={{ x: 48, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.5, duration: 0.6 }}
                >
                  {line}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-5 text-sm leading-relaxed text-slate-200">
              {typedAi}
            </p>
          )}
        </div>
      )
    }

    const outroOpacity = currentScene === 6 ? clamp(1 - Math.max((sceneElapsed - 1900) / 600, 0), 0, 1) : 1
    return (
      <motion.div
        className="relative flex h-full w-full flex-col items-center justify-center"
        style={{ opacity: outroOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div className="pointer-events-none absolute inset-4">
          <motion.span
            className="absolute left-0 top-0 h-px w-full origin-left bg-amber-300"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute right-0 top-0 h-full w-px origin-top bg-amber-300"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute bottom-0 right-0 h-px w-full origin-right bg-amber-300"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute bottom-0 left-0 h-full w-px origin-bottom bg-amber-300"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeInOut' }}
          />
        </motion.div>
        <p className="text-center text-3xl font-semibold text-slate-100">당신의 운명이 펼쳐집니다</p>
        <p className="mt-4 text-sm text-amber-300">사주해 sajuhae.vercel.app</p>
      </motion.div>
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#0f172a] text-slate-100"
      style={{ fontFamily: KOREAN_FONT }}
      onClick={handleToggleControls}
    >
      {ttsSupported && (
        <button
          type="button"
          className="absolute right-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-slate-600/60 bg-slate-900/80 text-lg shadow-lg backdrop-blur transition-colors hover:bg-slate-800"
          onClick={(e) => {
            e.stopPropagation()
            handleToggleNarration()
          }}
          aria-label={narrationEnabled ? '나레이션 끄기' : '나레이션 켜기'}
          title={narrationEnabled ? '나레이션 끄기' : '나레이션 켜기'}
        >
          {narrationEnabled ? (isSpeaking ? '🔊' : '🔈') : '🔇'}
        </button>
      )}

      <div className="mx-auto h-full w-full max-w-md border-x border-slate-800/70 bg-[#0f172a]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            className="h-full w-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          >
            {renderScene()}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {(showControls || (!isPlaying && currentScene === 6)) && (
            <motion.div
              className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-slate-700/80 bg-slate-950/85 px-4 py-3 backdrop-blur"
              initial={{ y: 70, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 70, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-center gap-2">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 w-2 rounded-full ${idx === currentScene ? 'bg-amber-300' : 'bg-slate-600'}`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-200 transition hover:bg-slate-700"
                  onClick={handleReplay}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <path d="M3 4v6h6" />
                  </svg>
                  다시 보기
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 rounded-lg border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-amber-300 transition hover:bg-amber-500/20"
                  onClick={handleSaveVideo}
                  disabled={isRecording}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M4 21h16" />
                  </svg>
                  영상 저장
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-200 transition hover:bg-slate-700"
                  onClick={onClose}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12" />
                    <path d="M18 6 6 18" />
                  </svg>
                  닫기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isRecording && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-72 rounded-xl border border-amber-300/40 bg-slate-900/90 px-5 py-4 text-center">
              <p className="text-lg font-semibold text-amber-300">녹화 중...</p>
              <p className="mt-1 text-sm text-slate-300">{recordProgress}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
                <motion.div
                  className="h-full rounded-full bg-amber-300"
                  animate={{ width: `${recordProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function maxRatio(value: number, max: number) {
  if (max <= 0) return 0
  return value / max
}

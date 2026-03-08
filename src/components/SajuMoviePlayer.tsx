'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { OHENG_COLORS } from '@/lib/oheng'
import { MovieAudioEngine } from '@/lib/movie-audio'
import type { FullSajuResult } from '@/lib/saju'
import type { TraditionalInterpretation } from '@/lib/traditional-interpret'
import type { MovieScene, MovieScenario } from '@/app/api/movie-scenario/route'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SajuMoviePlayerProps {
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

type OhengKey = '목' | '화' | '토' | '금' | '수'
type MoodType = 'mystical' | 'dramatic' | 'warm' | 'intense' | 'serene' | 'hopeful'
type MovieGenre = 'classic' | 'romance' | 'growth' | 'adventure' | 'fantasy' | 'period'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SCENE_DURATIONS = [8000, 7000, 10000, 8000, 8000, 8000, 10000, 6000] as const
const OHENG_ORDER: OhengKey[] = ['목', '화', '토', '금', '수']
const OHENG_HANJA: Record<OhengKey, string> = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' }
const KOREAN_FONT = "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif"
const LETTERBOX_H = 48

const MOOD_COLORS: Record<MoodType, { bg: string; accent: string; glow: string }> = {
  mystical: { bg: '#0a0e1a', accent: '#c4b5fd', glow: 'rgba(196, 181, 253, 0.15)' },
  dramatic: { bg: '#0f0a1a', accent: '#f59e0b', glow: 'rgba(245, 158, 11, 0.12)' },
  warm: { bg: '#1a0f0a', accent: '#fb923c', glow: 'rgba(251, 146, 60, 0.12)' },
  intense: { bg: '#1a0a0a', accent: '#ef4444', glow: 'rgba(239, 68, 68, 0.12)' },
  serene: { bg: '#0a1a1a', accent: '#5eead4', glow: 'rgba(94, 234, 212, 0.1)' },
  hopeful: { bg: '#0f1a0a', accent: '#fbbf24', glow: 'rgba(251, 191, 36, 0.14)' },
}

const MOVIE_GENRES: { id: MovieGenre; label: string; icon: string; description: string; color: string }[] = [
  { id: 'classic', label: '클래식 운명극', icon: '🎭', description: '전통적인 사주 해석을 서정적 영화로', color: '#c4b5fd' },
  { id: 'romance', label: '로맨스', icon: '💕', description: '사랑과 인연의 이야기로 풀어낸 운명', color: '#fb7185' },
  { id: 'growth', label: '성장 서사', icon: '🌱', description: '시련과 극복, 성장의 여정', color: '#34d399' },
  { id: 'adventure', label: '모험', icon: '⚔️', description: '운명에 맞서는 영웅의 대서사시', color: '#f59e0b' },
  { id: 'fantasy', label: '판타지', icon: '✨', description: '신비로운 세계관 속 운명의 이야기', color: '#818cf8' },
  { id: 'period', label: '시대극', icon: '🏯', description: '조선시대 배경의 사극풍 운명 서사', color: '#a78bfa' },
]

/* ------------------------------------------------------------------ */
/*  Particles                                                          */
/* ------------------------------------------------------------------ */

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.5 + 0.2,
  }))
}

function ParticleField({ color, count = 40 }: { color: string; count?: number }) {
  const particles = useMemo(() => generateParticles(count), [count])
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
          }}
          animate={{
            y: [0, -(40 + Math.random() * 60)],
            opacity: [0, p.opacity, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Typewriter text                                                    */
/* ------------------------------------------------------------------ */

function TypewriterText({
  text,
  speed = 45,
  delay = 0,
  className = '',
}: {
  text: string
  speed?: number
  delay?: number
  className?: string
}) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setStarted(false)
    const startTimer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimer)
  }, [text, delay])

  useEffect(() => {
    if (!started) return
    if (displayed.length >= text.length) return

    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1))
    }, speed)
    return () => clearTimeout(timer)
  }, [displayed, text, speed, started])

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && started && (
        <motion.span
          className="inline-block w-0.5 bg-current"
          style={{ height: '1em', verticalAlign: 'text-bottom' }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Canvas drawing for video export                                    */
/* ------------------------------------------------------------------ */

function drawMovieBackground(ctx: CanvasRenderingContext2D, w: number, h: number, mood: MoodType) {
  const colors = MOOD_COLORS[mood]
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, w, h)

  // Radial glow
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 30, w * 0.5, h * 0.45, w * 0.5)
  grad.addColorStop(0, colors.glow)
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.02)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Letterbox bars
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, LETTERBOX_H * 2)
  ctx.fillRect(0, h - LETTERBOX_H * 2, w, LETTERBOX_H * 2)
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.font = `${size}px ${KOREAN_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = size * 0.3
  ctx.fillText(text, x, y)
  ctx.shadowBlur = 0
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  size: number,
  color: string,
): void {
  ctx.font = `${size}px ${KOREAN_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color

  const lines: string[] = []
  let current = ''
  for (const char of text) {
    if (ctx.measureText(current + char).width > maxWidth) {
      if (current) lines.push(current)
      current = char
    } else {
      current += char
    }
  }
  if (current) lines.push(current)

  const startY = y - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((line, idx) => {
    ctx.fillText(line, x, startY + idx * lineHeight)
  })
}

function drawSceneForCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sceneIdx: number,
  scene: MovieScene,
  fullResult: FullSajuResult,
  formData: SajuMoviePlayerProps['formData'],
  bgImage?: HTMLImageElement | null,
) {
  const mood = (scene.mood || 'mystical') as MoodType
  const accent = MOOD_COLORS[mood]?.accent ?? '#fbbf24'

  // Draw background: AI image or mood gradient
  if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
    const imgW = bgImage.naturalWidth
    const imgH = bgImage.naturalHeight
    const imgRatio = imgW / imgH
    const canvasRatio = w / h
    let sx = 0, sy = 0, sw = imgW, sh = imgH
    if (imgRatio > canvasRatio) {
      sw = imgH * canvasRatio
      sx = (imgW - sw) / 2
    } else {
      sh = imgW / canvasRatio
      sy = (imgH - sh) / 2
    }
    ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, w, h)
    // Dark overlay for text readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
    ctx.fillRect(0, 0, w, h)
    // Letterbox bars
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, LETTERBOX_H * 2)
    ctx.fillRect(0, h - LETTERBOX_H * 2, w, LETTERBOX_H * 2)
  } else {
    drawMovieBackground(ctx, w, h, mood)
  }

  // Subtitle at top
  drawCenteredText(ctx, scene.subtitle, w / 2, LETTERBOX_H * 2 + 60, 28, '#94a3b8')

  switch (scene.type) {
    case 'prologue':
      drawCenteredText(ctx, '천명', w / 2, h * 0.38, 120, accent)
      drawCenteredText(ctx, '天命', w / 2, h * 0.45, 40, '#64748b')
      drawWrappedText(ctx, scene.narration, w / 2, h * 0.62, w * 0.7, 52, 32, '#e2e8f0')
      break

    case 'birth':
      drawCenteredText(ctx, `${formData.year}`, w / 2, h * 0.32, 80, accent)
      drawCenteredText(ctx, `${formData.month}월 ${formData.day}일`, w / 2, h * 0.4, 48, '#e2e8f0')
      drawCenteredText(ctx, formData.name, w / 2, h * 0.5, 64, '#f8fafc')
      drawWrappedText(ctx, scene.narration, w / 2, h * 0.68, w * 0.72, 48, 28, '#cbd5e1')
      break

    case 'pillars': {
      const pillars = [
        { label: '년', p: fullResult.saju.yearPillar },
        { label: '월', p: fullResult.saju.monthPillar },
        { label: '일', p: fullResult.saju.dayPillar },
        { label: '시', p: fullResult.saju.hourPillar },
      ]
      const cardW = 180
      const gap = 20
      const totalW = cardW * 4 + gap * 3
      const startX = (w - totalW) / 2

      pillars.forEach(({ label, p }, idx) => {
        const cx = startX + idx * (cardW + gap) + cardW / 2
        const color = OHENG_COLORS[p.element] ?? '#94a3b8'
        // Card background
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)'
        ctx.beginPath()
        ctx.roundRect(startX + idx * (cardW + gap), h * 0.26, cardW, 280, 16)
        ctx.fill()
        ctx.strokeStyle = `${color}88`
        ctx.lineWidth = 2
        ctx.stroke()
        drawCenteredText(ctx, label + '주', cx, h * 0.26 + 30, 22, '#94a3b8')
        drawCenteredText(ctx, p.heavenlyStemHanja ?? p.heavenlyStem, cx, h * 0.26 + 90, 56, color)
        drawCenteredText(ctx, p.earthlyBranchHanja ?? p.earthlyBranch, cx, h * 0.26 + 180, 56, color)
        drawCenteredText(ctx, p.element, cx, h * 0.26 + 245, 20, color)
      })
      drawWrappedText(ctx, scene.narration, w / 2, h * 0.78, w * 0.8, 44, 26, '#cbd5e1')
      break
    }

    case 'elements': {
      const counts = fullResult.oheng.counts
      const maxVal = Math.max(...Object.values(counts), 1)
      OHENG_ORDER.forEach((el, idx) => {
        const count = counts[el]
        const color = OHENG_COLORS[el]
        const barWidth = (w * 0.5 * count) / maxVal
        const y = h * 0.3 + idx * 80
        drawCenteredText(ctx, `${el} ${OHENG_HANJA[el]}`, w * 0.2, y, 28, color)
        ctx.fillStyle = 'rgba(51, 65, 85, 0.5)'
        ctx.beginPath()
        ctx.roundRect(w * 0.3, y - 16, w * 0.5, 32, 16)
        ctx.fill()
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(w * 0.3, y - 16, Math.max(barWidth, 20), 32, 16)
        ctx.fill()
        drawCenteredText(ctx, String(count), w * 0.3 + Math.max(barWidth, 20) + 30, y, 24, '#e2e8f0')
      })
      drawWrappedText(ctx, scene.narration, w / 2, h * 0.76, w * 0.75, 44, 26, '#cbd5e1')
      break
    }

    case 'guardian': {
      const yongsin = fullResult.yongsin.yongsin as OhengKey
      const yColor = OHENG_COLORS[yongsin] ?? '#fbbf24'
      drawCenteredText(ctx, OHENG_HANJA[yongsin] ?? yongsin, w / 2, h * 0.38, 140, yColor)
      drawCenteredText(ctx, yongsin, w / 2, h * 0.47, 48, yColor)
      drawCenteredText(ctx, `희신: ${fullResult.yongsin.huisin}`, w / 2, h * 0.54, 28, '#94a3b8')
      drawWrappedText(ctx, scene.narration, w / 2, h * 0.7, w * 0.72, 48, 28, '#cbd5e1')
      break
    }

    case 'fortune': {
      const rating = fullResult.yearlyFortune.rating
      const rColor = rating === '길' ? '#4ade80' : rating === '흉' ? '#f87171' : '#fbbf24'
      drawCenteredText(ctx, `${new Date().getFullYear()}년`, w / 2, h * 0.32, 48, '#e2e8f0')
      drawCenteredText(ctx, rating, w / 2, h * 0.42, 96, rColor)
      drawWrappedText(ctx, scene.narration, w / 2, h * 0.62, w * 0.72, 48, 28, '#cbd5e1')
      break
    }

    case 'message':
      drawWrappedText(ctx, scene.narration, w / 2, h * 0.5, w * 0.72, 52, 32, '#e2e8f0')
      break

    case 'epilogue':
      drawCenteredText(ctx, scene.narration.split('.')[0] ?? scene.narration, w / 2, h * 0.45, 42, '#f8fafc')
      drawCenteredText(ctx, '천명 cheonmyeong.vercel.app', w / 2, h * 0.55, 26, accent)
      break

    default:
      drawWrappedText(ctx, scene.narration, w / 2, h * 0.5, w * 0.72, 48, 30, '#e2e8f0')
  }
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function SajuMoviePlayer({
  fullResult,
  formData,
  traditionalResult,
  aiInterpretation,
  onClose,
}: SajuMoviePlayerProps) {
  const [scenario, setScenario] = useState<MovieScenario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<MovieGenre | null>(null)
  const [currentScene, setCurrentScene] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordProgress, setRecordProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [narrationEnabled, setNarrationEnabled] = useState(true)
  const [sceneImages, setSceneImages] = useState<(string | null)[]>([])
  const [imageProgress, setImageProgress] = useState(0)
  const [loadingPhase, setLoadingPhase] = useState<'scenario' | 'images' | null>(null)

  const { isSupported: ttsSupported, isSpeaking, speak, stop: stopNarration } = useSpeechSynthesis()

  const audioRef = useRef<MovieAudioEngine | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const imageElsRef = useRef<(HTMLImageElement | null)[]>([])
  const imageAbortRef = useRef<AbortController | null>(null)
  const sceneImagesRef = useRef<(string | null)[]>([])

  /* ---------- Fetch scenario & generate scene images ---------- */
  useEffect(() => {
    if (!selectedGenre) return
    let cancelled = false
    const imgAbort = new AbortController()
    imageAbortRef.current = imgAbort

    async function fetchScenarioAndImages() {
      try {
        setLoading(true)
        setError(null)
        setScenario(null)
        setSceneImages([])
        setImageProgress(0)
        setLoadingPhase('scenario')

        audioRef.current?.stop()
        audioRef.current?.destroy()
        audioRef.current = null

        // Build traditional summary
        let traditionalSummary = ''
        if (traditionalResult) {
          const parts: string[] = []
          if (traditionalResult.personality[0]?.plain) parts.push(`성격: ${traditionalResult.personality[0].plain}`)
          if (traditionalResult.career[0]?.plain) parts.push(`직업: ${traditionalResult.career[0].plain}`)
          if (traditionalResult.fortune[0]?.plain) parts.push(`운세: ${traditionalResult.fortune[0].plain}`)
          if (traditionalResult.relationship[0]?.plain) parts.push(`관계: ${traditionalResult.relationship[0].plain}`)
          if (traditionalResult.health[0]?.plain) parts.push(`건강: ${traditionalResult.health[0].plain}`)
          traditionalSummary = parts.join('\n')
        }

        const res = await fetch('/api/movie-scenario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData: {
              name: formData.name,
              year: formData.year,
              month: formData.month,
              day: formData.day,
              gender: formData.gender,
            },
            saju: fullResult.saju,
            oheng: fullResult.oheng,
            ilganStrength: fullResult.ilganStrength,
            yongsin: fullResult.yongsin,
            yearlyFortune: fullResult.yearlyFortune,
            traditionalSummary,
            genre: selectedGenre,
          }),
        })

        if (!res.ok) throw new Error('시나리오 생성 실패')
        const data = await res.json()

        if (cancelled || !data.scenario) return

        setCurrentScene(0)
        setShowControls(false)
        setIsMuted(false)
        setScenario(data.scenario)

        // --- Phase 2: Generate AI scene images ---
        setLoadingPhase('images')
        const scenes: MovieScene[] = data.scenario.scenes
        const imgUrls: (string | null)[] = new Array(scenes.length).fill(null)
        const imgEls: (HTMLImageElement | null)[] = new Array(scenes.length).fill(null)
        let completed = 0

        await Promise.allSettled(
          scenes.map(async (scene: MovieScene, idx: number) => {
            if (imgAbort.signal.aborted) return
            try {
              const imgRes = await fetch('/api/generate-scene-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  gender: formData.gender,
                  birthYear: formData.year,
                  sceneType: scene.type,
                  narration: scene.narration,
                  mood: scene.mood,
                  genre: selectedGenre,
                }),
                signal: imgAbort.signal,
              })
              if (imgRes.ok) {
                const imgData = await imgRes.json()
                if (imgData.image) {
                  const bin = atob(imgData.image)
                  const bytes = new Uint8Array(bin.length)
                  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
                  const blob = new Blob([bytes], { type: 'image/png' })
                  const url = URL.createObjectURL(blob)
                  imgUrls[idx] = url
                  const el = new Image()
                  el.src = url
                  imgEls[idx] = el
                }
              }
            } catch {
              /* silent fail — scene plays without image */
            }
            completed++
            if (!imgAbort.signal.aborted) setImageProgress(completed)
          }),
        )

        if (cancelled) return

        setSceneImages([...imgUrls])
        sceneImagesRef.current = imgUrls
        imageElsRef.current = imgEls
        setLoadingPhase(null)
        setLoading(false)
        setIsPlaying(true)

        // Init audio
        const engine = new MovieAudioEngine()
        await engine.init()
        audioRef.current = engine
        engine.play(data.scenario.scenes[0]?.mood ?? 'mystical')
      } catch (err) {
        if (!cancelled) {
          console.error(err)
          setError('시나리오를 생성하지 못했습니다.')
          setLoading(false)
          setLoadingPhase(null)
        }
      }
    }

    fetchScenarioAndImages()
    return () => {
      cancelled = true
      imgAbort.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre])

  /* ---------- Scene auto-advance ---------- */
  useEffect(() => {
    if (!isPlaying || !scenario) return

    const scenes = scenario.scenes
    if (currentScene >= scenes.length) {
      setIsPlaying(false)
      setShowControls(true)
      return
    }

    // Change mood
    const mood = scenes[currentScene]?.mood as MoodType | undefined
    if (mood && audioRef.current) {
      audioRef.current.changeMood(mood)
    }

    const duration = SCENE_DURATIONS[currentScene] ?? 8000
    timerRef.current = setTimeout(() => {
      setCurrentScene((prev) => prev + 1)
    }, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentScene, isPlaying, scenario])

  /* ---------- Auto-hide controls ---------- */
  useEffect(() => {
    if (!showControls || !isPlaying) return
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3500)
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current) }
  }, [showControls, isPlaying])

  /* ---------- Cleanup ---------- */
  useEffect(() => {
    return () => {
      audioRef.current?.destroy()
      stopNarration()
      imageAbortRef.current?.abort()
      sceneImagesRef.current.forEach(url => { if (url) URL.revokeObjectURL(url) })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- Auto-narration (TTS) ---------- */
  useEffect(() => {
    if (!narrationEnabled || !ttsSupported || !scenario) return

    const scene = scenario.scenes[currentScene]
    if (!scene?.narration) return

    const timer = setTimeout(() => {
      speak(scene.narration)
    }, 500)

    return () => {
      clearTimeout(timer)
      stopNarration()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene, narrationEnabled, ttsSupported, scenario])

  /* ---------- Handlers ---------- */
  const handleReplay = useCallback(() => {
    audioRef.current?.stop()
    stopNarration()
    imageAbortRef.current?.abort()
    sceneImagesRef.current.forEach(url => { if (url) URL.revokeObjectURL(url) })
    setSceneImages([])
    sceneImagesRef.current = []
    imageElsRef.current = []
    setCurrentScene(0)
    setScenario(null)
    setLoading(true)
    setError(null)
    setSelectedGenre(null)
    setIsPlaying(false)
    setShowControls(false)
  }, [stopNarration])

  const handleToggleMute = useCallback(() => {
    const muted = audioRef.current?.toggleMute() ?? false
    setIsMuted(muted)
  }, [])

  const handleClose = useCallback(() => {
    audioRef.current?.stop()
    stopNarration()
    imageAbortRef.current?.abort()
    sceneImagesRef.current.forEach(url => { if (url) URL.revokeObjectURL(url) })
    setTimeout(() => {
      audioRef.current?.destroy()
      onClose()
    }, 300)
  }, [onClose, stopNarration])

  const handleToggleNarration = useCallback(() => {
    if (narrationEnabled) {
      stopNarration()
    }
    setNarrationEnabled((prev) => !prev)
  }, [narrationEnabled, stopNarration])

  const handleSkipImages = useCallback(() => {
    imageAbortRef.current?.abort()
  }, [])

  /* ---------- Video export ---------- */
  const handleSaveVideo = useCallback(async () => {
    if (isRecording || !scenario) return
    setIsRecording(true)
    setRecordProgress(0)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      canvas.style.display = 'none'
      document.body.appendChild(canvas)

      const ctx = canvas.getContext('2d')
      if (!ctx) { document.body.removeChild(canvas); setIsRecording(false); return }

      const stream = canvas.captureStream(30)
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 })
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.start(100)

      const scenes = scenario.scenes
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i]
        const dur = SCENE_DURATIONS[i] ?? 8000

        // Hold scene
        await new Promise<void>((resolve) => {
          let start = 0
          const frame = (time: number) => {
            if (!start) start = time
            drawSceneForCanvas(ctx, canvas.width, canvas.height, i, scene, fullResult, formData, imageElsRef.current[i])
            if (time - start < dur) requestAnimationFrame(frame)
            else resolve()
          }
          requestAnimationFrame(frame)
        })
        setRecordProgress(Math.round(((i + 0.7) / scenes.length) * 100))

        // Fade transition
        if (i < scenes.length - 1) {
          await new Promise<void>((resolve) => {
            let frameIdx = 0
            const totalFrames = 15
            const frame = () => {
              const t = frameIdx / (totalFrames - 1)
              if (t < 0.5) {
                drawSceneForCanvas(ctx, canvas.width, canvas.height, i, scenes[i], fullResult, formData, imageElsRef.current[i])
                ctx.fillStyle = `rgba(0,0,0,${t * 2})`
                ctx.fillRect(0, 0, canvas.width, canvas.height)
              } else {
                drawSceneForCanvas(ctx, canvas.width, canvas.height, i + 1, scenes[i + 1], fullResult, formData, imageElsRef.current[i + 1])
                ctx.fillStyle = `rgba(0,0,0,${(1 - t) * 2})`
                ctx.fillRect(0, 0, canvas.width, canvas.height)
              }
              frameIdx++
              if (frameIdx < totalFrames) requestAnimationFrame(frame)
              else resolve()
            }
            requestAnimationFrame(frame)
          })
        }
        setRecordProgress(Math.round(((i + 1) / scenes.length) * 100))
      }

      await new Promise<void>((resolve) => { recorder.onstop = () => resolve(); recorder.stop() })

      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `천명_운명영화_${formData.name}_${new Date().toISOString().slice(0, 10)}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      document.body.removeChild(canvas)
      setRecordProgress(100)
    } finally {
      setTimeout(() => setIsRecording(false), 300)
    }
  }, [isRecording, scenario, fullResult, formData])

  /* ---------- Scene rendering ---------- */
  const sceneData = scenario?.scenes[currentScene]
  const mood = (sceneData?.mood ?? 'mystical') as MoodType
  const colors = MOOD_COLORS[mood]
  const pillars = useMemo(() => [
    { label: '년주', p: fullResult.saju.yearPillar },
    { label: '월주', p: fullResult.saju.monthPillar },
    { label: '일주', p: fullResult.saju.dayPillar },
    { label: '시주', p: fullResult.saju.hourPillar },
  ], [fullResult.saju])

  function renderScene() {
    if (!sceneData) return null

    const narrationBlock = (
      <motion.p
        className="mx-auto mt-6 max-w-sm px-4 text-center text-base leading-relaxed text-slate-300"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 1.2 }}
      >
        <TypewriterText text={sceneData.narration} speed={50} delay={2000} />
      </motion.p>
    )

    switch (sceneData.type) {
      case 'prologue':
        return (
          <div className="flex h-full flex-col items-center justify-center">
            <motion.p
              className="mb-2 text-xs tracking-[0.4em] text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.5 }}
            >
              {scenario?.title ?? '천명의 이야기'}
            </motion.p>
            <motion.h1
              className="text-6xl font-black"
              style={{ color: colors.accent, textShadow: `0 0 40px ${colors.glow}` }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.8 }}
            >
              {'천명'}
            </motion.h1>
            <motion.p
              className="mt-3 text-sm tracking-[0.3em] text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              天命
            </motion.p>
            {narrationBlock}
          </div>
        )

      case 'birth':
        return (
          <div className="flex h-full flex-col items-center justify-center">
            <motion.p
              className="text-7xl font-light tabular-nums"
              style={{ color: colors.accent }}
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: 'circOut' }}
            >
              {formData.year}
            </motion.p>
            <motion.p
              className="mt-2 text-2xl text-slate-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {formData.month}월 {formData.day}일
            </motion.p>
            <motion.p
              className="mt-6 text-4xl font-bold text-white"
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, letterSpacing: '0.15em' }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              {formData.name}
            </motion.p>
            {narrationBlock}
          </div>
        )

      case 'pillars':
        return (
          <div className="flex h-full flex-col px-4 pt-20">
            <motion.h3
              className="mb-6 text-center text-2xl font-bold text-slate-100"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              사주팔자
            </motion.h3>
            <div className="grid grid-cols-4 gap-2">
              {pillars.map(({ label, p }, idx) => {
                const c = OHENG_COLORS[p.element] ?? '#94a3b8'
                return (
                  <motion.div
                    key={label}
                    className="rounded-xl border bg-slate-900/60 p-2.5 text-center"
                    style={{ borderColor: `${c}66` }}
                    initial={{ y: 60, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.5 + idx * 0.6 }}
                  >
                    <p className="text-[10px] text-slate-400">{label}</p>
                    <motion.p
                      className="mt-1 text-3xl font-black"
                      style={{ color: c, textShadow: `0 0 16px ${c}44` }}
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      transition={{ delay: 0.8 + idx * 0.6, duration: 0.6 }}
                    >
                      {p.heavenlyStemHanja ?? p.heavenlyStem}
                    </motion.p>
                    <p className="text-[10px] text-slate-300">{p.heavenlyStem}</p>
                    <div className="my-1.5 h-px bg-slate-700" />
                    <motion.p
                      className="text-3xl font-black"
                      style={{ color: c, textShadow: `0 0 16px ${c}44` }}
                      initial={{ rotateY: -90 }}
                      animate={{ rotateY: 0 }}
                      transition={{ delay: 1.1 + idx * 0.6, duration: 0.6 }}
                    >
                      {p.earthlyBranchHanja ?? p.earthlyBranch}
                    </motion.p>
                    <p className="text-[10px] text-slate-300">{p.earthlyBranch}</p>
                    <span
                      className="mt-1.5 inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ color: c, borderColor: `${c}55`, backgroundColor: `${c}15` }}
                    >
                      {p.element}
                    </span>
                  </motion.div>
                )
              })}
            </div>
            {narrationBlock}
          </div>
        )

      case 'elements': {
        const counts = fullResult.oheng.counts
        const maxVal = Math.max(...Object.values(counts), 1)

        return (
          <div className="flex h-full flex-col px-5 pt-20">
            <motion.h3
              className="mb-6 text-center text-2xl font-bold text-slate-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              오행의 흐름
            </motion.h3>
            <div className="space-y-4">
              {OHENG_ORDER.map((el, idx) => {
                const count = counts[el]
                const c = OHENG_COLORS[el]
                const pct = `${Math.max((count / maxVal) * 100, 10)}%`
                const isDom = el === fullResult.oheng.dominant

                return (
                  <motion.div
                    key={el}
                    className="space-y-1"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.25, duration: 0.6 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold" style={{ color: c }}>
                        {el} {OHENG_HANJA[el]}
                        {isDom && <span className="ml-1 text-[10px] text-amber-300">★</span>}
                      </span>
                      <span className="text-slate-300">{count}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-700/60">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: c, boxShadow: isDom ? `0 0 12px ${c}` : 'none' }}
                        initial={{ width: '0%' }}
                        animate={{ width: pct }}
                        transition={{ duration: 1, delay: 0.5 + idx * 0.25, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <motion.div
              className="mt-4 flex justify-center"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, type: 'spring', stiffness: 140 }}
            >
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  fullResult.oheng.balance === '균형'
                    ? 'border-green-400/40 bg-green-400/10 text-green-300'
                    : fullResult.oheng.balance === '편중'
                      ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                      : 'border-red-400/40 bg-red-400/10 text-red-300'
                }`}
              >
                {fullResult.oheng.balance}
              </span>
            </motion.div>
            {narrationBlock}
          </div>
        )
      }

      case 'guardian': {
        const yongsin = fullResult.yongsin.yongsin as OhengKey
        const yColor = OHENG_COLORS[yongsin] ?? colors.accent

        return (
          <div className="flex h-full flex-col items-center justify-center">
            <motion.p
              className="mb-4 text-sm text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              당신의 수호자
            </motion.p>
            <motion.p
              className="text-8xl font-black"
              style={{ color: yColor, textShadow: `0 0 60px ${yColor}66, 0 0 120px ${yColor}22` }}
              initial={{ scale: 0.2, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 10, delay: 0.8 }}
            >
              {OHENG_HANJA[yongsin] ?? yongsin}
            </motion.p>
            <motion.p
              className="mt-3 text-3xl font-bold"
              style={{ color: yColor }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              {yongsin}
            </motion.p>
            <motion.p
              className="mt-2 text-sm text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              희신: {fullResult.yongsin.huisin}
            </motion.p>
            {narrationBlock}
          </div>
        )
      }

      case 'fortune': {
        const rating = fullResult.yearlyFortune.rating
        const rColor = rating === '길' ? '#4ade80' : rating === '흉' ? '#f87171' : '#fbbf24'

        return (
          <div className="flex h-full flex-col items-center justify-center">
            <motion.p
              className="text-xl text-slate-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {new Date().getFullYear()}년
            </motion.p>
            <motion.p
              className="mt-6 text-8xl font-black"
              style={{ color: rColor, textShadow: `0 0 50px ${rColor}55` }}
              initial={{ y: -100, opacity: 0, scale: 1.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 1 }}
            >
              {rating}
            </motion.p>
            {narrationBlock}
          </div>
        )
      }

      case 'message':
        return (
          <div className="flex h-full flex-col items-center justify-center px-6">
            <motion.div
              className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <p className="text-center text-lg leading-relaxed text-slate-200">
                <TypewriterText text={sceneData.narration} speed={55} delay={800} />
              </p>
            </motion.div>
          </div>
        )

      case 'epilogue':
        return (
          <div className="flex h-full flex-col items-center justify-center">
            <motion.p
              className="max-w-xs text-center text-2xl font-medium leading-relaxed text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1.5 }}
            >
              <TypewriterText text={sceneData.narration} speed={60} delay={600} />
            </motion.p>
            <motion.div
              className="pointer-events-none absolute inset-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1.5 }}
            >
              <span className="absolute inset-x-0 top-0 block h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 block h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
              <span className="absolute inset-y-0 left-0 block w-px bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
              <span className="absolute inset-y-0 right-0 block w-px bg-gradient-to-b from-transparent via-amber-400/50 to-transparent" />
            </motion.div>
            <motion.p
              className="mt-8 text-sm text-amber-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
            >
              천명 cheonmyeong.vercel.app
            </motion.p>
          </div>
        )

      default:
        return (
          <div className="flex h-full items-center justify-center px-6">
            <p className="text-center text-lg text-slate-200">{sceneData.narration}</p>
          </div>
        )
    }
  }

  /* ---------- Loading state ---------- */
  if (selectedGenre === null) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0e1a] text-slate-100" style={{ fontFamily: KOREAN_FONT }}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.18),transparent_45%),radial-gradient(circle_at_80%_25%,rgba(129,140,248,0.16),transparent_48%),radial-gradient(circle_at_50%_85%,rgba(51,65,85,0.5),transparent_58%)]" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col justify-center px-6 py-12">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h2 className="text-3xl font-black tracking-wide text-amber-300 sm:text-4xl">🎬 운명의 장르를 선택하세요</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">당신의 사주를 어떤 이야기로 풀어볼까요?</p>
          </motion.div>

          <motion.div
            className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            {MOVIE_GENRES.map((genre) => (
              <motion.button
                key={genre.id}
                type="button"
                className="group relative overflow-hidden rounded-2xl border bg-slate-900/45 px-4 py-5 text-left backdrop-blur transition-colors"
                style={{ borderColor: `${genre.color}44` }}
                onClick={() => setSelectedGenre(genre.id)}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.03, borderColor: `${genre.color}cc`, boxShadow: `0 0 24px ${genre.color}44` }}
                whileTap={{ scale: 0.98 }}
              >
                <span
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
                  style={{ backgroundColor: `${genre.color}44` }}
                />
                <div className="relative z-10">
                  <p className="text-3xl">{genre.icon}</p>
                  <p className="mt-3 text-base font-bold" style={{ color: genre.color }}>{genre.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300/90">{genre.description}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            <button
              type="button"
              className="rounded-lg border border-slate-600 bg-slate-900/50 px-5 py-2.5 text-sm text-slate-300 transition hover:border-slate-400 hover:bg-slate-800"
              onClick={handleClose}
            >
              닫기
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  if (loading) {
    const totalSceneCount = scenario?.scenes.length ?? 8
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0e1a]">
        <motion.div
          className="h-16 w-16 rounded-full border-2 border-amber-400/30 border-t-amber-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        {loadingPhase === 'images' ? (
          <>
            <motion.p
              className="mt-6 text-lg text-amber-300"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              영화 장면을 그리고 있습니다...
            </motion.p>
            <p className="mt-2 text-sm text-slate-400">
              {imageProgress} / {totalSceneCount} 장면 완성
            </p>
            <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-slate-700">
              <motion.div
                className="h-full rounded-full bg-amber-400"
                animate={{ width: `${(imageProgress / totalSceneCount) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <button
              type="button"
              className="mt-5 rounded-lg border border-slate-600 bg-slate-800/60 px-4 py-2 text-xs text-slate-400 transition hover:border-slate-400 hover:text-slate-200"
              onClick={handleSkipImages}
            >
              건너뛰기
            </button>
          </>
        ) : (
          <>
            <motion.p
              className="mt-6 text-lg text-amber-300"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              시나리오를 집필하고 있습니다...
            </motion.p>
            <p className="mt-2 text-sm text-slate-500">AI가 당신만의 영화를 준비 중입니다</p>
          </>
        )}
      </div>
    )
  }

  if (error || !scenario) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0e1a]">
        <p className="text-lg text-red-400">{error ?? '알 수 없는 오류'}</p>
        <button
          type="button"
          className="mt-4 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    )
  }

  const totalScenes = scenario.scenes.length
  const isLastScene = currentScene >= totalScenes

  /* ---------- Render ---------- */
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 text-slate-100"
      style={{ backgroundColor: colors.bg, fontFamily: KOREAN_FONT }}
      onClick={() => {
        if (isPlaying && !isLastScene) setShowControls((v) => !v)
      }}
    >
      {/* Particles */}
      <ParticleField color={colors.accent} count={35} />

      {/* Letterbox bars */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-black to-transparent" />

      {/* Scene subtitle */}
      {sceneData && (
        <motion.p
          key={`sub-${currentScene}`}
          className="absolute left-0 right-0 top-12 z-20 text-center text-xs tracking-[0.3em] text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {sceneData.subtitle}
        </motion.p>
      )}

      {/* Main content */}
      <div className="mx-auto h-full w-full max-w-md">
        <AnimatePresence mode="wait">
          {!isLastScene && (
            <motion.div
              key={currentScene}
              className="relative h-full w-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'circInOut' }}
            >
              {/* AI-generated scene background image */}
              {sceneImages[currentScene] && (
                <motion.div
                  className="absolute inset-0 z-0"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sceneImages[currentScene]!}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
                </motion.div>
              )}
              <div className="relative z-10 h-full">
                {renderScene()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Narration button */}
      {ttsSupported && (
        <button
          type="button"
          className="absolute right-14 top-3 z-30 rounded-full bg-black/40 p-2 text-slate-400 backdrop-blur hover:text-white"
          onClick={(e) => { e.stopPropagation(); handleToggleNarration() }}
          aria-label={narrationEnabled ? '나레이션 끄기' : '나레이션 켜기'}
          title={narrationEnabled ? '나레이션 끄기' : '나레이션 켜기'}
        >
          <span className="flex h-5 w-5 items-center justify-center text-sm">
            {narrationEnabled ? (isSpeaking ? '🔊' : '🔈') : '🔇'}
          </span>
        </button>
      )}

      {/* Mute button (always visible) */}
      <button
        type="button"
        className="absolute right-3 top-3 z-30 rounded-full bg-black/40 p-2 text-slate-400 backdrop-blur hover:text-white"
        onClick={(e) => { e.stopPropagation(); handleToggleMute() }}
      >
        {isMuted ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-14 left-0 right-0 z-20 flex items-center justify-center gap-1.5">
        {scenario.scenes.map((_, idx) => (
          <motion.span
            key={idx}
            className="rounded-full"
            style={{
              width: idx === currentScene ? 16 : 6,
              height: 6,
              backgroundColor: idx === currentScene ? colors.accent : '#475569',
            }}
            layout
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Control panel */}
      <AnimatePresence>
        {(showControls || isLastScene) && (
          <motion.div
            className="absolute inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-slate-700/50 bg-black/80 px-4 py-3 backdrop-blur"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                className="flex items-center justify-center gap-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-slate-200 hover:bg-slate-700"
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
                className="flex items-center justify-center gap-1 rounded-lg border border-amber-400/50 bg-amber-500/10 px-3 py-2.5 text-amber-300 hover:bg-amber-500/20"
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
                className="flex items-center justify-center gap-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-slate-200 hover:bg-slate-700"
                onClick={handleClose}
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

      {/* Recording overlay */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-72 rounded-xl border border-amber-300/40 bg-slate-900/90 px-5 py-4 text-center">
              <p className="text-lg font-semibold text-amber-300">영화 녹화 중...</p>
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

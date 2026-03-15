'use client'

import { useRef, useEffect, useState } from 'react'

const SHOWCASE_ITEMS = [
  {
    mood: 'mystical',
    title: '신비로운 운명',
    desc: '보라빛 우주 속 당신의 사주',
    icon: '🔮',
    bg: '#0a0e1a',
    accent: '#c4b5fd',
    particles: ['#c4b5fd', '#a78bfa', '#818cf8'],
  },
  {
    mood: 'dramatic',
    title: '극적인 전환',
    desc: '황금빛 운명의 서사시',
    icon: '🎭',
    bg: '#0f0a1a',
    accent: '#f59e0b',
    particles: ['#f59e0b', '#fbbf24', '#d97706'],
  },
  {
    mood: 'warm',
    title: '따뜻한 인연',
    desc: '오렌지빛 온기의 이야기',
    icon: '🌅',
    bg: '#1a0f0a',
    accent: '#fb923c',
    particles: ['#fb923c', '#f97316', '#fdba74'],
  },
  {
    mood: 'intense',
    title: '강렬한 운세',
    desc: '붉은 열정의 사주 풀이',
    icon: '🔥',
    bg: '#1a0a0a',
    accent: '#ef4444',
    particles: ['#ef4444', '#f87171', '#dc2626'],
  },
  {
    mood: 'serene',
    title: '고요한 흐름',
    desc: '청록빛 평온의 사주',
    icon: '🌊',
    bg: '#0a1a1a',
    accent: '#5eead4',
    particles: ['#5eead4', '#2dd4bf', '#14b8a6'],
  },
  {
    mood: 'hopeful',
    title: '희망의 빛',
    desc: '새벽빛 미래의 운명',
    icon: '✨',
    bg: '#0f1a0a',
    accent: '#fbbf24',
    particles: ['#fbbf24', '#84cc16', '#a3e635'],
  },
]

function MiniCanvas({
  bg,
  accent,
  particles,
  isActive,
}: {
  bg: string
  accent: string
  particles: string[]
  isActive: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const particleData = useRef<Array<{ x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number }>>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 280
    canvas.height = 160

    // Initialize particles
    particleData.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * 280,
      y: Math.random() * 160,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2.5 + 0.5,
      color: particles[Math.floor(Math.random() * particles.length)],
      alpha: Math.random() * 0.6 + 0.2,
    }))

    let running = true

    function draw() {
      if (!running || !ctx || !canvas) return
      const w = canvas.width
      const h = canvas.height

      // Background
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Radial glow
      const glow = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.5)
      glow.addColorStop(0, accent + '25')
      glow.addColorStop(0.5, accent + '08')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      // Particles
      for (const p of particleData.current) {
        p.x += p.vx * (isActive ? 1.5 : 0.5)
        p.y += p.vy * (isActive ? 1.5 : 0.5)
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * (isActive ? 1.3 : 1), 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha * (isActive ? 1 : 0.6)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Center text
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = accent
      ctx.font = `bold 18px 'Pretendard Variable', sans-serif`
      ctx.fillText('사주해', w / 2, h * 0.42)
      ctx.fillStyle = accent + '88'
      ctx.font = `12px 'Pretendard Variable', sans-serif`
      ctx.fillText('AI 운명 애니메이션', w / 2, h * 0.58)

      // Letterbox bars (cinema feel)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, 8)
      ctx.fillRect(0, h - 8, w, 8)

      frameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      running = false
      cancelAnimationFrame(frameRef.current)
    }
  }, [bg, accent, particles, isActive])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl"
      style={{ display: 'block' }}
    />
  )
}

export default function AnimationShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-rotate
  useEffect(() => {
    if (!isPlaying) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 6)
    }, 3000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying])

  const handleClick = (index: number) => {
    setActiveIndex(index)
    setIsPlaying(false)
    // Resume after 5s
    setTimeout(() => setIsPlaying(true), 5000)
  }

  const active = SHOWCASE_ITEMS[activeIndex]

  return (
    <section className="px-4 py-6 max-w-md mx-auto relative z-10">
      <h2
        className="text-center text-sm font-bold mb-3"
        style={{ color: 'var(--accent)' }}
      >
        🎬 운명 애니메이션 미리보기
      </h2>

      {/* Main preview */}
      <div
        className="rounded-2xl overflow-hidden mb-3 relative"
        style={{
          aspectRatio: '16/9',
          boxShadow: `0 4px 24px ${active.accent}30`,
          border: `1px solid ${active.accent}40`,
        }}
      >
        <MiniCanvas
          bg={active.bg}
          accent={active.accent}
          particles={active.particles}
          isActive={true}
        />
        {/* Overlay info */}
        <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{active.icon}</span>
            <div>
              <p className="text-xs font-bold text-white">{active.title}</p>
              <p className="text-xs text-white/60">{active.desc}</p>
            </div>
          </div>
        </div>
        {/* Play indicator */}
        <div className="absolute top-2 right-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/50 text-white/80">
            ▶ {activeIndex + 1}/6
          </span>
        </div>
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-6 gap-1.5">
        {SHOWCASE_ITEMS.map((item, i) => (
          <button
            key={item.mood}
            onClick={() => handleClick(i)}
            className="rounded-lg overflow-hidden transition-all"
            style={{
              aspectRatio: '1',
              background: item.bg,
              border: i === activeIndex ? `2px solid ${item.accent}` : '1px solid var(--border-color)',
              opacity: i === activeIndex ? 1 : 0.6,
              transform: i === activeIndex ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center gap-0.5">
              <span className="text-sm">{item.icon}</span>
              <span className="text-[8px] font-bold" style={{ color: item.accent }}>{item.title.slice(0, 3)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
        사주 분석 후 나만의 운명 애니메이션을 감상하세요
      </p>
    </section>
  )
}

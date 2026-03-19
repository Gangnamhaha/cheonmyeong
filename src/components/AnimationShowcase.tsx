'use client'

import { useRef, useEffect, useState, lazy, Suspense } from 'react'
import type { FullSajuResult } from '@/lib/saju'
// lottie removed (404 error on sparkle-stars.json)
const SajuAnimationPlayer = lazy(() => import('./SajuAnimationPlayer'))

const EC: Record<string, string> = { '목': '#4ade80', '화': '#f87171', '토': '#fbbf24', '금': '#e2e8f0', '수': '#60a5fa' }

const S = [
  { m: 'mystical', t: '수(水)의 운명', i: '🔮', bg: '#080c18', ac: '#60a5fa', nm: '은하', p: ['壬申','辛亥','癸丑','癸亥'], el: ['수','금','수','수'], d: '수', st: '신강', y: '목', f: '길',
    fd: { name: '은하', year: 1992, month: 11, day: 22, hour: 23, gender: 'female' as const, calendarType: 'solar' as const },
    fr: { saju: { yearPillar: { heavenlyStem: '임', heavenlyStemHanja: '壬', earthlyBranch: '신', earthlyBranchHanja: '申', element: '수' }, monthPillar: { heavenlyStem: '신', heavenlyStemHanja: '辛', earthlyBranch: '해', earthlyBranchHanja: '亥', element: '금' }, dayPillar: { heavenlyStem: '계', heavenlyStemHanja: '癸', earthlyBranch: '축', earthlyBranchHanja: '丑', element: '수' }, hourPillar: { heavenlyStem: '계', heavenlyStemHanja: '癸', earthlyBranch: '해', earthlyBranchHanja: '亥', element: '수' }, rawText: '壬申 辛亥 癸丑 癸亥' }, oheng: { counts: { '목': 0, '화': 0, '토': 1, '금': 2, '수': 5 }, dominant: '수', weak: '목', balance: '편중' as const }, ilganStrength: { strength: '신강' as const, score: 6, details: { support: 7, opposition: 1, monthBranchElement: '수', monthBranchHelps: true } }, yongsin: { yongsin: '목', huisin: '화', reason: '', favorable: ['목','화'], unfavorable: ['수','금'] }, sipsin: { yearStem: '겁재', yearBranch: '편인', monthStem: '편인', monthBranch: '겁재', dayBranch: '편관', hourStem: '비견', hourBranch: '겁재', summary: { '비겁':1,'겁재':3,'식신':0,'상관':0,'편재':0,'정재':0,'편관':1,'정관':0,'편인':2,'정인':0 } }, daeun: { startAge: 3, cycles: [{ age: 3, stem: '경', branch: '술', element: '금' }] }, yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '정재', rating: '길' as const, description: '재물운이 열리는 해' }, monthlyFortune: { stem: '기', branch: '축', element: '토', sipsin: '편관', rating: '평' as const, description: '안정적인 달' } } as unknown as FullSajuResult },
  { m: 'dramatic', t: '화(火)의 운명', i: '🎭', bg: '#18080c', ac: '#f87171', nm: '태양', p: ['戊辰','戊午','丙午','甲午'], el: ['토','토','화','목'], d: '화', st: '신강', y: '금', f: '평',
    fd: { name: '태양', year: 1988, month: 6, day: 15, hour: 12, gender: 'male' as const, calendarType: 'solar' as const },
    fr: { saju: { yearPillar: { heavenlyStem: '무', heavenlyStemHanja: '戊', earthlyBranch: '진', earthlyBranchHanja: '辰', element: '토' }, monthPillar: { heavenlyStem: '무', heavenlyStemHanja: '戊', earthlyBranch: '오', earthlyBranchHanja: '午', element: '토' }, dayPillar: { heavenlyStem: '병', heavenlyStemHanja: '丙', earthlyBranch: '오', earthlyBranchHanja: '午', element: '화' }, hourPillar: { heavenlyStem: '갑', heavenlyStemHanja: '甲', earthlyBranch: '오', earthlyBranchHanja: '午', element: '목' }, rawText: '戊辰 戊午 丙午 甲午' }, oheng: { counts: { '목':1,'화':4,'토':2,'금':0,'수':1 }, dominant: '화', weak: '금', balance: '편중' as const }, ilganStrength: { strength: '신강' as const, score: 5, details: { support: 6, opposition: 2, monthBranchElement: '화', monthBranchHelps: true } }, yongsin: { yongsin: '금', huisin: '수', reason: '', favorable: ['금','수'], unfavorable: ['화','목'] }, sipsin: { yearStem: '식신', yearBranch: '편관', monthStem: '식신', monthBranch: '비견', dayBranch: '비견', hourStem: '편인', hourBranch: '비견', summary: { '비겁':3,'겁재':0,'식신':2,'상관':0,'편재':0,'정재':0,'편관':1,'정관':0,'편인':1,'정인':0 } }, daeun: { startAge: 5, cycles: [{ age: 5, stem: '기', branch: '미', element: '토' }] }, yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '비견', rating: '평' as const, description: '자기 확신의 해' }, monthlyFortune: { stem: '경', branch: '인', element: '금', sipsin: '편재', rating: '길' as const, description: '재물 기회의 달' } } as unknown as FullSajuResult },
  { m: 'warm', t: '토(土)의 운명', i: '🌅', bg: '#181008', ac: '#fbbf24', nm: '하늘', p: ['乙亥','己卯','己未','戊辰'], el: ['목','토','토','토'], d: '토', st: '신강', y: '금', f: '길',
    fd: { name: '하늘', year: 1995, month: 3, day: 8, hour: 8, gender: 'female' as const, calendarType: 'solar' as const },
    fr: { saju: { yearPillar: { heavenlyStem: '을', heavenlyStemHanja: '乙', earthlyBranch: '해', earthlyBranchHanja: '亥', element: '목' }, monthPillar: { heavenlyStem: '기', heavenlyStemHanja: '己', earthlyBranch: '묘', earthlyBranchHanja: '卯', element: '토' }, dayPillar: { heavenlyStem: '기', heavenlyStemHanja: '己', earthlyBranch: '미', earthlyBranchHanja: '未', element: '토' }, hourPillar: { heavenlyStem: '무', heavenlyStemHanja: '戊', earthlyBranch: '진', earthlyBranchHanja: '辰', element: '토' }, rawText: '乙亥 己卯 己未 戊辰' }, oheng: { counts: { '목':2,'화':0,'토':4,'금':0,'수':2 }, dominant: '토', weak: '화', balance: '결핍' as const }, ilganStrength: { strength: '신강' as const, score: 4, details: { support: 5, opposition: 3, monthBranchElement: '목', monthBranchHelps: false } }, yongsin: { yongsin: '금', huisin: '수', reason: '', favorable: ['금','수'], unfavorable: ['토','화'] }, sipsin: { yearStem: '편관', yearBranch: '정재', monthStem: '비견', monthBranch: '편관', dayBranch: '비견', hourStem: '겁재', hourBranch: '비견', summary: { '비겁':3,'겁재':1,'식신':0,'상관':0,'편재':0,'정재':1,'편관':2,'정관':0,'편인':0,'정인':0 } }, daeun: { startAge: 7, cycles: [{ age: 7, stem: '경', branch: '진', element: '금' }] }, yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '정관', rating: '길' as const, description: '안정과 성취의 해' }, monthlyFortune: { stem: '신', branch: '축', element: '금', sipsin: '식신', rating: '길' as const, description: '표현력이 빛나는 달' } } as unknown as FullSajuResult },
  { m: 'intense', t: '금(金)의 운명', i: '⚔️', bg: '#0c0810', ac: '#e2e8f0', nm: '강철', p: ['庚午','乙酉','辛酉','丙申'], el: ['금','목','금','화'], d: '금', st: '신강', y: '화', f: '길',
    fd: { name: '강철', year: 1990, month: 9, day: 12, hour: 16, gender: 'male' as const, calendarType: 'solar' as const },
    fr: { saju: { yearPillar: { heavenlyStem: '경', heavenlyStemHanja: '庚', earthlyBranch: '오', earthlyBranchHanja: '午', element: '금' }, monthPillar: { heavenlyStem: '을', heavenlyStemHanja: '乙', earthlyBranch: '유', earthlyBranchHanja: '酉', element: '목' }, dayPillar: { heavenlyStem: '신', heavenlyStemHanja: '辛', earthlyBranch: '유', earthlyBranchHanja: '酉', element: '금' }, hourPillar: { heavenlyStem: '병', heavenlyStemHanja: '丙', earthlyBranch: '신', earthlyBranchHanja: '申', element: '화' }, rawText: '庚午 乙酉 辛酉 丙申' }, oheng: { counts: { '목':1,'화':2,'토':0,'금':4,'수':1 }, dominant: '금', weak: '토', balance: '편중' as const }, ilganStrength: { strength: '신강' as const, score: 3, details: { support: 5, opposition: 3, monthBranchElement: '금', monthBranchHelps: true } }, yongsin: { yongsin: '화', huisin: '목', reason: '', favorable: ['화','목'], unfavorable: ['금','수'] }, sipsin: { yearStem: '겁재', yearBranch: '정관', monthStem: '편재', monthBranch: '비견', dayBranch: '비견', hourStem: '정관', hourBranch: '겁재', summary: { '비겁':3,'겁재':2,'식신':0,'상관':0,'편재':1,'정재':0,'편관':0,'정관':2,'편인':0,'정인':0 } }, daeun: { startAge: 4, cycles: [{ age: 4, stem: '병', branch: '술', element: '화' }] }, yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '정관', rating: '길' as const, description: '도전과 성취의 해' }, monthlyFortune: { stem: '무', branch: '인', element: '토', sipsin: '정인', rating: '평' as const, description: '학습과 성장의 달' } } as unknown as FullSajuResult },
  { m: 'serene', t: '목(木)의 운명', i: '🌿', bg: '#081810', ac: '#4ade80', nm: '숲', p: ['甲戌','丙寅','甲寅','丁卯'], el: ['목','화','목','화'], d: '목', st: '신강', y: '금', f: '길',
    fd: { name: '숲', year: 1994, month: 2, day: 4, hour: 6, gender: 'female' as const, calendarType: 'solar' as const },
    fr: { saju: { yearPillar: { heavenlyStem: '갑', heavenlyStemHanja: '甲', earthlyBranch: '술', earthlyBranchHanja: '戌', element: '목' }, monthPillar: { heavenlyStem: '병', heavenlyStemHanja: '丙', earthlyBranch: '인', earthlyBranchHanja: '寅', element: '화' }, dayPillar: { heavenlyStem: '갑', heavenlyStemHanja: '甲', earthlyBranch: '인', earthlyBranchHanja: '寅', element: '목' }, hourPillar: { heavenlyStem: '정', heavenlyStemHanja: '丁', earthlyBranch: '묘', earthlyBranchHanja: '卯', element: '화' }, rawText: '甲戌 丙寅 甲寅 丁卯' }, oheng: { counts: { '목':4,'화':2,'토':1,'금':0,'수':1 }, dominant: '목', weak: '금', balance: '편중' as const }, ilganStrength: { strength: '신강' as const, score: 5, details: { support: 6, opposition: 2, monthBranchElement: '목', monthBranchHelps: true } }, yongsin: { yongsin: '금', huisin: '토', reason: '', favorable: ['금','토'], unfavorable: ['목','수'] }, sipsin: { yearStem: '비견', yearBranch: '편재', monthStem: '식신', monthBranch: '비견', dayBranch: '비견', hourStem: '상관', hourBranch: '겁재', summary: { '비겁':3,'겁재':1,'식신':1,'상관':1,'편재':1,'정재':0,'편관':0,'정관':0,'편인':0,'정인':0 } }, daeun: { startAge: 6, cycles: [{ age: 6, stem: '을', branch: '축', element: '목' }] }, yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '식신', rating: '길' as const, description: '창의력이 폭발하는 해' }, monthlyFortune: { stem: '경', branch: '인', element: '금', sipsin: '편관', rating: '평' as const, description: '규율과 절제의 달' } } as unknown as FullSajuResult },
  { m: 'hopeful', t: '균형의 운명', i: '✨', bg: '#101018', ac: '#d4a853', nm: '별', p: ['丙子','乙未','庚辰','壬午'], el: ['화','목','금','수'], d: '균형', st: '신약', y: '토', f: '평',
    fd: { name: '별', year: 1996, month: 8, day: 4, hour: 12, gender: 'male' as const, calendarType: 'solar' as const },
    fr: { saju: { yearPillar: { heavenlyStem: '병', heavenlyStemHanja: '丙', earthlyBranch: '자', earthlyBranchHanja: '子', element: '화' }, monthPillar: { heavenlyStem: '을', heavenlyStemHanja: '乙', earthlyBranch: '미', earthlyBranchHanja: '未', element: '목' }, dayPillar: { heavenlyStem: '경', heavenlyStemHanja: '庚', earthlyBranch: '진', earthlyBranchHanja: '辰', element: '금' }, hourPillar: { heavenlyStem: '임', heavenlyStemHanja: '壬', earthlyBranch: '오', earthlyBranchHanja: '午', element: '수' }, rawText: '丙子 乙未 庚辰 壬午' }, oheng: { counts: { '목':1,'화':2,'토':2,'금':1,'수':2 }, dominant: '화', weak: '목', balance: '균형' as const }, ilganStrength: { strength: '신약' as const, score: -2, details: { support: 3, opposition: 5, monthBranchElement: '토', monthBranchHelps: true } }, yongsin: { yongsin: '토', huisin: '금', reason: '', favorable: ['토','금'], unfavorable: ['목','수'] }, sipsin: { yearStem: '편관', yearBranch: '정재', monthStem: '정재', monthBranch: '정인', dayBranch: '편인', hourStem: '식신', hourBranch: '편관', summary: { '비겁':0,'겁재':0,'식신':1,'상관':0,'편재':0,'정재':2,'편관':2,'정관':0,'편인':1,'정인':1 } }, daeun: { startAge: 3, cycles: [{ age: 3, stem: '병', branch: '신', element: '화' }] }, yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '편관', rating: '평' as const, description: '변화와 성장의 해' }, monthlyFortune: { stem: '기', branch: '해', element: '토', sipsin: '정인', rating: '길' as const, description: '지혜가 빛나는 달' } } as unknown as FullSajuResult },
]

// Movie scene texts per genre
const MOVIE_SCENES: Record<string, string[]> = {
  mystical: ['깊은 물의 흐름 속에', '은하의 운명이 펼쳐집니다', '수(水)의 지혜가', '당신을 이끕니다', '신비로운 별빛 아래', '운명의 강이 흐릅니다'],
  dramatic: ['불꽃처럼 타오르는', '태양의 운명이 시작됩니다', '화(火)의 열정이', '세상을 비춥니다', '극적인 전환의 순간', '새로운 길이 열립니다'],
  warm: ['대지의 포근한 품에서', '하늘의 운명이 자라납니다', '토(土)의 온기가', '인연을 감싸줍니다', '따뜻한 햇살 아래', '사랑이 꽃피웁니다'],
  intense: ['강철의 의지로', '강철의 운명이 단련됩니다', '금(金)의 결단이', '길을 열어줍니다', '강렬한 각오 속에', '승리가 기다립니다'],
  serene: ['고요한 숲속에서', '숲의 운명이 뿌리내립니다', '목(木)의 생명력이', '하늘을 향합니다', '푸른 잎사귀 사이로', '성장의 빛이 비칩니다'],
  hopeful: ['새벽빛이 밝아오며', '별의 운명이 조화를 이룹니다', '균형의 기운이', '미래를 밝혀줍니다', '희망의 빛 속에서', '새로운 시작입니다'],
}

// Mood gradient colors
const MOOD_COLORS: Record<string, { bg1: string; bg2: string; glow: string; text: string }> = {
  mystical: { bg1: '#0a0520', bg2: '#1a0a3a', glow: '#a78bfa', text: '#c4b5fd' },
  dramatic: { bg1: '#1a0a05', bg2: '#2a1005', glow: '#f59e0b', text: '#fbbf24' },
  warm: { bg1: '#1a0f05', bg2: '#2a1a0a', glow: '#fb923c', text: '#fdba74' },
  intense: { bg1: '#1a0505', bg2: '#2a0a0a', glow: '#ef4444', text: '#fca5a5' },
  serene: { bg1: '#051a0f', bg2: '#0a2a1a', glow: '#2dd4bf', text: '#5eead4' },
  hopeful: { bg1: '#0f0f1a', bg2: '#1a1a2a', glow: '#fbbf24', text: '#fde68a' },
}

const VIDEO_MAP: Record<number, string> = {
  0: '/videos/scene-1.webm',  // 클래식 운명극
  1: '/videos/scene-2.webm',  // 로맨스
  2: '/videos/scene-3.webm',  // 성장서사
  3: '/videos/scene-4.webm',  // 모험
  4: '/videos/scene-5.webm',  // 판타지
}

function Preview({ s, index }: { s: typeof S[0]; index: number }) {
  const videoSrc = VIDEO_MAP[index]

  // If video exists, use <video> tag
  if (videoSrc) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '300px' }}>
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // Fallback: Canvas animation for genres without video
  const ref = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const c = ref.current; if (!c) return
    const context = c.getContext('2d')
    if (context === null) return
    const ctx: CanvasRenderingContext2D = context
    c.width = 1080; c.height = 1920
    const W = 1080, H = 1920
    let running = true
    let visible = true
    timeRef.current = 0

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0.1 })
    observer.observe(c)

    const mood = MOOD_COLORS[s.m] ?? MOOD_COLORS.mystical
    const scenes = MOVIE_SCENES[s.m] ?? MOVIE_SCENES.mystical
    const font = "'Pretendard Variable', sans-serif"

    // Particles in mood color
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 1.5, vy: -Math.random() * 1.2 - 0.2,
      r: Math.random() * 3 + 0.5, alpha: Math.random() * 0.4 + 0.1,
    }))

    function draw() {
      if (!running) return
      if (!visible) { frameRef.current = requestAnimationFrame(draw); return }
      timeRef.current += 1 / 60
      const t = timeRef.current

      // 6 text scenes, 5s each = 30s loop
      const sceneDur = 5
      const sceneIdx = Math.floor(t / sceneDur) % 6
      const sceneT = (t % sceneDur) / sceneDur

      // Mood gradient background
      const grad = ctx.createLinearGradient(0, 0, W, H)
      grad.addColorStop(0, mood.bg1)
      grad.addColorStop(1, mood.bg2)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Animated radial glow (breathing)
      const glowSize = W * 0.4 + Math.sin(t * 0.5) * W * 0.08
      const g = ctx.createRadialGradient(W / 2, H * 0.4, 30, W / 2, H * 0.4, glowSize)
      g.addColorStop(0, mood.glow + '30')
      g.addColorStop(0.5, mood.glow + '10')
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      // Second glow (lower)
      const g2 = ctx.createRadialGradient(W * 0.3, H * 0.7, 20, W * 0.3, H * 0.7, W * 0.3)
      g2.addColorStop(0, mood.glow + '15')
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, W, H)

      // Floating particles
      ctx.save()
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W }
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        const flicker = 0.5 + Math.sin(t * 1.5 + p.x * 0.01) * 0.3
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r + Math.sin(t * 2 + p.y * 0.005) * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = mood.glow + Math.floor(p.alpha * flicker * 255).toString(16).padStart(2, '0')
        ctx.fill()
      }
      ctx.restore()

      // === #5: Wave / 물결 효과 (하단) ===
      ctx.save()
      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath()
        const waveY = H * 0.82 + wave * 35
        const amp = 20 + wave * 8
        const freq = 0.008 - wave * 0.001
        const speed = t * (0.8 + wave * 0.3)
        ctx.moveTo(0, waveY)
        for (let x = 0; x <= W; x += 4) {
          ctx.lineTo(x, waveY + Math.sin(x * freq + speed) * amp)
        }
        ctx.lineTo(W, H)
        ctx.lineTo(0, H)
        ctx.closePath()
        ctx.fillStyle = mood.glow + (12 - wave * 3).toString(16).padStart(2, '0')
        ctx.fill()
      }
      ctx.restore()

      // Typewriter text — current scene line
      const lineText = scenes[sceneIdx]
      const charCount = Math.min(Math.floor(sceneT * lineText.length * 2), lineText.length)
      const visibleText = lineText.slice(0, charCount)

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // === #6: Neon glow text effect ===
      ctx.save()
      ctx.font = `bold 58px ${font}`
      // Outer glow layers
      ctx.shadowColor = mood.glow
      ctx.shadowBlur = 40
      ctx.fillStyle = mood.text
      ctx.fillText(visibleText, W / 2, H * 0.45)
      // Second glow pass for stronger effect
      ctx.shadowBlur = 20
      ctx.fillText(visibleText, W / 2, H * 0.45)
      ctx.shadowBlur = 0
      ctx.restore()

      // Cursor blink with glow
      if (charCount < lineText.length && Math.sin(t * 6) > 0) {
        const textW = ctx.measureText(visibleText).width
        ctx.save()
        ctx.shadowColor = mood.glow
        ctx.shadowBlur = 15
        ctx.fillStyle = mood.text
        ctx.fillRect(W / 2 + textW / 2 + 8, H * 0.45 - 25, 3, 50)
        ctx.restore()
      }

      // Sub info with subtle glow
      ctx.save()
      ctx.shadowColor = mood.glow
      ctx.shadowBlur = 8
      ctx.fillStyle = mood.text + '88'
      ctx.font = `28px ${font}`
      ctx.fillText(`${s.nm}님의 사주 이야기`, W / 2, H * 0.56)
      ctx.restore()

      // 4 pillars with neon
      ctx.save()
      ctx.shadowColor = mood.glow
      ctx.shadowBlur = 12
      ctx.font = `bold 40px ${font}`
      ctx.fillStyle = mood.text + 'aa'
      ctx.fillText(s.p.join('  '), W / 2, H * 0.65)
      ctx.restore()

      // Bottom info
      ctx.fillStyle = mood.text + '44'
      ctx.font = `24px ${font}`
      ctx.fillText(`${s.st} · 용신 ${s.y} · ${s.fd.year}.${s.fd.month}.${s.fd.day}`, W / 2, H * 0.74)

      // Fade transition
      if (sceneT < 0.06) {
        ctx.fillStyle = `rgba(0,0,0,${1 - sceneT / 0.06})`
        ctx.fillRect(0, 0, W, H)
      } else if (sceneT > 0.94) {
        ctx.fillStyle = `rgba(0,0,0,${(sceneT - 0.94) / 0.06})`
        ctx.fillRect(0, 0, W, H)
      }

      // Scene dots
      for (let i = 0; i < 6; i++) {
        ctx.beginPath()
        ctx.arc(W / 2 - 62 + i * 25, H - 70, 6, 0, Math.PI * 2)
        ctx.fillStyle = i === sceneIdx ? mood.glow : 'rgba(255,255,255,0.12)'
        ctx.fill()
      }

      // Letterbox
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, 24)
      ctx.fillRect(0, H - 24, W, 24)

      // Brand
      ctx.fillStyle = mood.glow + '55'
      ctx.font = `20px ${font}`
      ctx.fillText('사주해 sajuhae.vercel.app', W / 2, H - 48)

      frameRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { running = false; cancelAnimationFrame(frameRef.current); observer.disconnect() }
  }, [s])

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '300px' }}>
      <canvas
        ref={ref}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  )
}

const GENRES = [
  { icon: '🎭', name: '클래식 운명극', mood: 'Classic', desc: '운명의 수레바퀴가 돌아간다', color: '#a78bfa' },
  { icon: '💕', name: '로맨스', mood: 'Romance', desc: '사랑과 인연의 이야기', color: '#f472b6' },
  { icon: '🌱', name: '성장서사', mood: 'Growth', desc: '시련을 넘어 피어나는 꽃', color: '#4ade80' },
  { icon: '⚔️', name: '모험', mood: 'Adventure', desc: '미지의 세계로 떠나는 여정', color: '#f59e0b' },
  { icon: '🔮', name: '판타지', mood: 'Fantasy', desc: '신비로운 마법의 세계', color: '#60a5fa' },
  { icon: '🏯', name: '시대극', mood: 'Historical', desc: '역사 속 운명의 서사', color: '#ef4444' },
]

export default function AnimationShowcase() {
  const [idx, setIdx] = useState(0)
  const [auto, setAuto] = useState(true)
  const [play, setPlay] = useState(false)

  // Auto-cycle through 6 samples every 20 seconds (4 scenes × 5s each)
  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setIdx(p => (p + 1) % 6), 67000)
    return () => clearInterval(id)
  }, [auto])

  const a = S[idx]

  return (
    <>
      <div className="mt-3 rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="px-3 pt-3 pb-1 flex items-center justify-between">
          <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>🎬 운명 애니메이션</span>
          <span className="text-[10px] font-medium" style={{ color: GENRES[idx].color }}>{GENRES[idx].icon} {GENRES[idx].name} · {GENRES[idx].mood}</span>
        </div>
        <div className="w-full px-3 pb-2 cursor-pointer" onClick={() => { setAuto(false); setPlay(true) }}>
          <div className="rounded-xl overflow-hidden" style={{ boxShadow: `0 2px 16px ${a.ac}20`, border: `1px solid ${a.ac}25` }}>
            <Preview s={a} index={idx} />
          </div>
        </div>

        {/* 6 genre cards */}
        <div className="px-3 pb-3 grid grid-cols-3 gap-2">
          {GENRES.map((g, i) => (
            <button
              key={i}
              onClick={() => { setIdx(i); setAuto(false); setTimeout(() => setAuto(true), 70000) }}
              className="rounded-xl p-2.5 text-center transition-all"
              style={{
                background: i === idx ? g.color + '18' : 'var(--bg-secondary)',
                border: i === idx ? `1.5px solid ${g.color}60` : '1px solid var(--border-color)',
                boxShadow: i === idx ? `0 2px 12px ${g.color}20` : 'none',
                transform: i === idx ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              <span className="text-lg block">{g.icon}</span>
              <p className="text-[10px] font-bold mt-1" style={{ color: i === idx ? g.color : 'var(--text-primary)' }}>{g.name}</p>
              <p className="text-[9px] font-medium" style={{ color: i === idx ? g.color + 'cc' : 'var(--text-secondary)' }}>{g.mood}</p>
              <p className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{g.desc}</p>
            </button>
          ))}
        </div>
      </div>
      {play && (
        <Suspense fallback={null}>
          <SajuAnimationPlayer fullResult={a.fr} formData={a.fd} traditionalResult={null} aiInterpretation={null} onClose={() => { setPlay(false); setAuto(true) }} />
        </Suspense>
      )}
    </>
  )
}

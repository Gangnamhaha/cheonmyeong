'use client'

import { useRef, useEffect, useState, lazy, Suspense } from 'react'
import type { FullSajuResult } from '@/lib/saju'

const SajuAnimationPlayer = lazy(() => import('./SajuAnimationPlayer'))

// 6 sample saju profiles — each with a different dominant element
const SAMPLE_PROFILES: Array<{
  mood: string
  title: string
  desc: string
  icon: string
  bg: string
  accent: string
  particles: string[]
  formData: { name: string; year: number; month: number; day: number; hour: number; gender: 'male' | 'female'; calendarType: 'solar' | 'lunar' }
  fullResult: FullSajuResult
}> = [
  {
    mood: 'mystical', title: '신비로운 운명', desc: '수(水) 기운이 강한 사주', icon: '🔮',
    bg: '#0a0e1a', accent: '#c4b5fd', particles: ['#c4b5fd', '#a78bfa', '#818cf8'],
    formData: { name: '은하', year: 1992, month: 11, day: 22, hour: 23, gender: 'female', calendarType: 'solar' },
    fullResult: {
      saju: {
        yearPillar: { heavenlyStem: '임', heavenlyStemHanja: '壬', earthlyBranch: '신', earthlyBranchHanja: '申', element: '수' },
        monthPillar: { heavenlyStem: '신', heavenlyStemHanja: '辛', earthlyBranch: '해', earthlyBranchHanja: '亥', element: '금' },
        dayPillar: { heavenlyStem: '계', heavenlyStemHanja: '癸', earthlyBranch: '축', earthlyBranchHanja: '丑', element: '수' },
        hourPillar: { heavenlyStem: '계', heavenlyStemHanja: '癸', earthlyBranch: '해', earthlyBranchHanja: '亥', element: '수' },
        rawText: '壬申 辛亥 癸丑 癸亥',
      },
      oheng: { counts: { '목': 0, '화': 0, '토': 1, '금': 2, '수': 5 }, dominant: '수', weak: '목', balance: '편중' as const },
      ilganStrength: { strength: '신강' as const, score: 6, details: { support: 7, opposition: 1, monthBranchElement: '수', monthBranchHelps: true } },
      yongsin: { yongsin: '목', huisin: '화', reason: '', favorable: ['목', '화'], unfavorable: ['수', '금'] },
      sipsin: { yearStem: '겁재', yearBranch: '편인', monthStem: '편인', monthBranch: '겁재', dayBranch: '편관', hourStem: '비견', hourBranch: '겁재', summary: { '비겁': 1, '겁재': 3, '식신': 0, '상관': 0, '편재': 0, '정재': 0, '편관': 1, '정관': 0, '편인': 2, '정인': 0 } },
      daeun: { startAge: 3, cycles: [{ age: 3, stem: '경', branch: '술', element: '금' }, { age: 13, stem: '기', branch: '유', element: '토' }] },
      yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '정재', rating: '길' as const, description: '재물운이 열리는 해' },
      monthlyFortune: { stem: '기', branch: '축', element: '토', sipsin: '편관', rating: '평' as const, description: '안정적인 달' },
    } as unknown as FullSajuResult,
  },
  {
    mood: 'dramatic', title: '극적인 전환', desc: '화(火) 기운이 강한 사주', icon: '🎭',
    bg: '#0f0a1a', accent: '#f59e0b', particles: ['#f59e0b', '#fbbf24', '#d97706'],
    formData: { name: '태양', year: 1988, month: 6, day: 15, hour: 12, gender: 'male', calendarType: 'solar' },
    fullResult: {
      saju: {
        yearPillar: { heavenlyStem: '무', heavenlyStemHanja: '戊', earthlyBranch: '진', earthlyBranchHanja: '辰', element: '토' },
        monthPillar: { heavenlyStem: '무', heavenlyStemHanja: '戊', earthlyBranch: '오', earthlyBranchHanja: '午', element: '토' },
        dayPillar: { heavenlyStem: '병', heavenlyStemHanja: '丙', earthlyBranch: '오', earthlyBranchHanja: '午', element: '화' },
        hourPillar: { heavenlyStem: '갑', heavenlyStemHanja: '甲', earthlyBranch: '오', earthlyBranchHanja: '午', element: '목' },
        rawText: '戊辰 戊午 丙午 甲午',
      },
      oheng: { counts: { '목': 1, '화': 4, '토': 2, '금': 0, '수': 1 }, dominant: '화', weak: '금', balance: '편중' as const },
      ilganStrength: { strength: '신강' as const, score: 5, details: { support: 6, opposition: 2, monthBranchElement: '화', monthBranchHelps: true } },
      yongsin: { yongsin: '금', huisin: '수', reason: '', favorable: ['금', '수'], unfavorable: ['화', '목'] },
      sipsin: { yearStem: '식신', yearBranch: '편관', monthStem: '식신', monthBranch: '비견', dayBranch: '비견', hourStem: '편인', hourBranch: '비견', summary: { '비겁': 3, '겁재': 0, '식신': 2, '상관': 0, '편재': 0, '정재': 0, '편관': 1, '정관': 0, '편인': 1, '정인': 0 } },
      daeun: { startAge: 5, cycles: [{ age: 5, stem: '기', branch: '미', element: '토' }, { age: 15, stem: '경', branch: '신', element: '금' }] },
      yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '비견', rating: '평' as const, description: '자기 확신의 해' },
      monthlyFortune: { stem: '경', branch: '인', element: '금', sipsin: '편재', rating: '길' as const, description: '재물 기회의 달' },
    } as unknown as FullSajuResult,
  },
  {
    mood: 'warm', title: '따뜻한 인연', desc: '토(土) 기운이 강한 사주', icon: '🌅',
    bg: '#1a0f0a', accent: '#fb923c', particles: ['#fb923c', '#f97316', '#fdba74'],
    formData: { name: '하늘', year: 1995, month: 3, day: 8, hour: 8, gender: 'female', calendarType: 'solar' },
    fullResult: {
      saju: {
        yearPillar: { heavenlyStem: '을', heavenlyStemHanja: '乙', earthlyBranch: '해', earthlyBranchHanja: '亥', element: '목' },
        monthPillar: { heavenlyStem: '기', heavenlyStemHanja: '己', earthlyBranch: '묘', earthlyBranchHanja: '卯', element: '토' },
        dayPillar: { heavenlyStem: '기', heavenlyStemHanja: '己', earthlyBranch: '미', earthlyBranchHanja: '未', element: '토' },
        hourPillar: { heavenlyStem: '무', heavenlyStemHanja: '戊', earthlyBranch: '진', earthlyBranchHanja: '辰', element: '토' },
        rawText: '乙亥 己卯 己未 戊辰',
      },
      oheng: { counts: { '목': 2, '화': 0, '토': 4, '금': 0, '수': 2 }, dominant: '토', weak: '화', balance: '결핍' as const },
      ilganStrength: { strength: '신강' as const, score: 4, details: { support: 5, opposition: 3, monthBranchElement: '목', monthBranchHelps: false } },
      yongsin: { yongsin: '금', huisin: '수', reason: '', favorable: ['금', '수'], unfavorable: ['토', '화'] },
      sipsin: { yearStem: '편관', yearBranch: '정재', monthStem: '비견', monthBranch: '편관', dayBranch: '비견', hourStem: '겁재', hourBranch: '비견', summary: { '비겁': 3, '겁재': 1, '식신': 0, '상관': 0, '편재': 0, '정재': 1, '편관': 2, '정관': 0, '편인': 0, '정인': 0 } },
      daeun: { startAge: 7, cycles: [{ age: 7, stem: '경', branch: '진', element: '금' }, { age: 17, stem: '신', branch: '사', element: '금' }] },
      yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '정관', rating: '길' as const, description: '안정과 성취의 해' },
      monthlyFortune: { stem: '신', branch: '축', element: '금', sipsin: '식신', rating: '길' as const, description: '표현력이 빛나는 달' },
    } as unknown as FullSajuResult,
  },
  {
    mood: 'intense', title: '강렬한 운세', desc: '금(金) 기운이 강한 사주', icon: '🔥',
    bg: '#1a0a0a', accent: '#ef4444', particles: ['#ef4444', '#f87171', '#dc2626'],
    formData: { name: '강철', year: 1990, month: 9, day: 12, hour: 16, gender: 'male', calendarType: 'solar' },
    fullResult: {
      saju: {
        yearPillar: { heavenlyStem: '경', heavenlyStemHanja: '庚', earthlyBranch: '오', earthlyBranchHanja: '午', element: '금' },
        monthPillar: { heavenlyStem: '을', heavenlyStemHanja: '乙', earthlyBranch: '유', earthlyBranchHanja: '酉', element: '목' },
        dayPillar: { heavenlyStem: '신', heavenlyStemHanja: '辛', earthlyBranch: '유', earthlyBranchHanja: '酉', element: '금' },
        hourPillar: { heavenlyStem: '병', heavenlyStemHanja: '丙', earthlyBranch: '신', earthlyBranchHanja: '申', element: '화' },
        rawText: '庚午 乙酉 辛酉 丙申',
      },
      oheng: { counts: { '목': 1, '화': 2, '토': 0, '금': 4, '수': 1 }, dominant: '금', weak: '토', balance: '편중' as const },
      ilganStrength: { strength: '신강' as const, score: 3, details: { support: 5, opposition: 3, monthBranchElement: '금', monthBranchHelps: true } },
      yongsin: { yongsin: '화', huisin: '목', reason: '', favorable: ['화', '목'], unfavorable: ['금', '수'] },
      sipsin: { yearStem: '겁재', yearBranch: '정관', monthStem: '편재', monthBranch: '비견', dayBranch: '비견', hourStem: '정관', hourBranch: '겁재', summary: { '비겁': 3, '겁재': 2, '식신': 0, '상관': 0, '편재': 1, '정재': 0, '편관': 0, '정관': 2, '편인': 0, '정인': 0 } },
      daeun: { startAge: 4, cycles: [{ age: 4, stem: '병', branch: '술', element: '화' }, { age: 14, stem: '정', branch: '해', element: '화' }] },
      yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '정관', rating: '길' as const, description: '도전과 성취의 해' },
      monthlyFortune: { stem: '무', branch: '인', element: '토', sipsin: '정인', rating: '평' as const, description: '학습과 성장의 달' },
    } as unknown as FullSajuResult,
  },
  {
    mood: 'serene', title: '고요한 흐름', desc: '목(木) 기운이 강한 사주', icon: '🌊',
    bg: '#0a1a1a', accent: '#5eead4', particles: ['#5eead4', '#2dd4bf', '#14b8a6'],
    formData: { name: '숲', year: 1994, month: 2, day: 4, hour: 6, gender: 'female', calendarType: 'solar' },
    fullResult: {
      saju: {
        yearPillar: { heavenlyStem: '갑', heavenlyStemHanja: '甲', earthlyBranch: '술', earthlyBranchHanja: '戌', element: '목' },
        monthPillar: { heavenlyStem: '병', heavenlyStemHanja: '丙', earthlyBranch: '인', earthlyBranchHanja: '寅', element: '화' },
        dayPillar: { heavenlyStem: '갑', heavenlyStemHanja: '甲', earthlyBranch: '인', earthlyBranchHanja: '寅', element: '목' },
        hourPillar: { heavenlyStem: '정', heavenlyStemHanja: '丁', earthlyBranch: '묘', earthlyBranchHanja: '卯', element: '화' },
        rawText: '甲戌 丙寅 甲寅 丁卯',
      },
      oheng: { counts: { '목': 4, '화': 2, '토': 1, '금': 0, '수': 1 }, dominant: '목', weak: '금', balance: '편중' as const },
      ilganStrength: { strength: '신강' as const, score: 5, details: { support: 6, opposition: 2, monthBranchElement: '목', monthBranchHelps: true } },
      yongsin: { yongsin: '금', huisin: '토', reason: '', favorable: ['금', '토'], unfavorable: ['목', '수'] },
      sipsin: { yearStem: '비견', yearBranch: '편재', monthStem: '식신', monthBranch: '비견', dayBranch: '비견', hourStem: '상관', hourBranch: '겁재', summary: { '비겁': 3, '겁재': 1, '식신': 1, '상관': 1, '편재': 1, '정재': 0, '편관': 0, '정관': 0, '편인': 0, '정인': 0 } },
      daeun: { startAge: 6, cycles: [{ age: 6, stem: '을', branch: '축', element: '목' }, { age: 16, stem: '갑', branch: '자', element: '목' }] },
      yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '식신', rating: '길' as const, description: '창의력이 폭발하는 해' },
      monthlyFortune: { stem: '경', branch: '인', element: '금', sipsin: '편관', rating: '평' as const, description: '규율과 절제의 달' },
    } as unknown as FullSajuResult,
  },
  {
    mood: 'hopeful', title: '희망의 빛', desc: '균형 잡힌 오행의 사주', icon: '✨',
    bg: '#0f1a0a', accent: '#fbbf24', particles: ['#fbbf24', '#84cc16', '#a3e635'],
    formData: { name: '별', year: 1996, month: 8, day: 4, hour: 12, gender: 'male', calendarType: 'solar' },
    fullResult: {
      saju: {
        yearPillar: { heavenlyStem: '병', heavenlyStemHanja: '丙', earthlyBranch: '자', earthlyBranchHanja: '子', element: '화' },
        monthPillar: { heavenlyStem: '을', heavenlyStemHanja: '乙', earthlyBranch: '미', earthlyBranchHanja: '未', element: '목' },
        dayPillar: { heavenlyStem: '경', heavenlyStemHanja: '庚', earthlyBranch: '진', earthlyBranchHanja: '辰', element: '금' },
        hourPillar: { heavenlyStem: '임', heavenlyStemHanja: '壬', earthlyBranch: '오', earthlyBranchHanja: '午', element: '수' },
        rawText: '丙子 乙未 庚辰 壬午',
      },
      oheng: { counts: { '목': 1, '화': 2, '토': 2, '금': 1, '수': 2 }, dominant: '화', weak: '목', balance: '균형' as const },
      ilganStrength: { strength: '신약' as const, score: -2, details: { support: 3, opposition: 5, monthBranchElement: '토', monthBranchHelps: true } },
      yongsin: { yongsin: '토', huisin: '금', reason: '', favorable: ['토', '금'], unfavorable: ['목', '수'] },
      sipsin: { yearStem: '편관', yearBranch: '정재', monthStem: '정재', monthBranch: '정인', dayBranch: '편인', hourStem: '식신', hourBranch: '편관', summary: { '비겁': 0, '겁재': 0, '식신': 1, '상관': 0, '편재': 0, '정재': 2, '편관': 2, '정관': 0, '편인': 1, '정인': 1 } },
      daeun: { startAge: 3, cycles: [{ age: 3, stem: '병', branch: '신', element: '화' }, { age: 13, stem: '정', branch: '유', element: '화' }] },
      yearlyFortune: { stem: '병', branch: '오', element: '화', sipsin: '편관', rating: '평' as const, description: '변화와 성장의 해' },
      monthlyFortune: { stem: '기', branch: '해', element: '토', sipsin: '정인', rating: '길' as const, description: '지혜가 빛나는 달' },
    } as unknown as FullSajuResult,
  },
]

function MiniCanvas({ bg, accent, particles, isActive }: { bg: string; accent: string; particles: string[]; isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const pts = useRef<Array<{ x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number }>>([])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    c.width = 280; c.height = 160
    pts.current = Array.from({ length: 25 }, () => ({
      x: Math.random() * 280, y: Math.random() * 160,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2.5 + 0.5, color: particles[Math.floor(Math.random() * particles.length)],
      alpha: Math.random() * 0.6 + 0.2,
    }))
    let on = true
    function draw() {
      if (!on || !ctx || !c) return
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 280, 160)
      const g = ctx.createRadialGradient(140, 80, 10, 140, 80, 140)
      g.addColorStop(0, accent + '25'); g.addColorStop(1, 'transparent')
      ctx.fillStyle = g; ctx.fillRect(0, 0, 280, 160)
      for (const p of pts.current) {
        p.x += p.vx * (isActive ? 1.5 : 0.5); p.y += p.vy * (isActive ? 1.5 : 0.5)
        if (p.x < 0) p.x = 280; if (p.x > 280) p.x = 0
        if (p.y < 0) p.y = 160; if (p.y > 160) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (isActive ? 1.3 : 1), 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha * (isActive ? 1 : 0.5); ctx.fill(); ctx.globalAlpha = 1
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = accent; ctx.font = `bold 16px 'Pretendard Variable', sans-serif`
      ctx.fillText('▶ 샘플 재생', 140, 75)
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 280, 6); ctx.fillRect(0, 154, 280, 6)
      frameRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { on = false; cancelAnimationFrame(frameRef.current) }
  }, [bg, accent, particles, isActive])

  return <canvas ref={canvasRef} className="w-full h-full rounded-xl" style={{ display: 'block' }} />
}

export default function AnimationShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showPlayer, setShowPlayer] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isPlaying) return
    intervalRef.current = setInterval(() => setActiveIndex((p) => (p + 1) % 6), 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying])

  const handlePlay = (index: number) => {
    setActiveIndex(index)
    setIsPlaying(false)
    setShowPlayer(true)
  }

  const active = SAMPLE_PROFILES[activeIndex]

  return (
    <>
      <div className="py-4">
        <h2 className="text-center text-xs font-bold mb-2" style={{ color: 'var(--accent)' }}>
          🎬 운명 애니메이션 미리보기
        </h2>

        {/* Main preview */}
        <button
          onClick={() => handlePlay(activeIndex)}
          className="w-full rounded-2xl overflow-hidden mb-2 relative cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{ aspectRatio: '16/9', boxShadow: `0 4px 20px ${active.accent}25`, border: `1px solid ${active.accent}30` }}
        >
          <MiniCanvas bg={active.bg} accent={active.accent} particles={active.particles} isActive={true} />
          <div className="absolute bottom-0 left-0 right-0 p-2.5" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
            <div className="flex items-center gap-2">
              <span className="text-base">{active.icon}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-white">{active.title}</p>
                <p className="text-[10px] text-white/60">{active.desc}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-1.5 right-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/50 text-white/80">{activeIndex + 1}/6</span>
          </div>
        </button>

        {/* Thumbnails */}
        <div className="grid grid-cols-6 gap-1">
          {SAMPLE_PROFILES.map((item, i) => (
            <button
              key={item.mood}
              onClick={() => { setActiveIndex(i); setIsPlaying(false); setTimeout(() => setIsPlaying(true), 5000) }}
              className="rounded-lg overflow-hidden transition-all"
              style={{
                aspectRatio: '1', background: item.bg,
                border: i === activeIndex ? `2px solid ${item.accent}` : '1px solid var(--border-color)',
                opacity: i === activeIndex ? 1 : 0.5,
                transform: i === activeIndex ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-sm">{item.icon}</span>
                <span className="text-[7px] font-bold" style={{ color: item.accent }}>{item.title.slice(0, 3)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Full animation player with sample data */}
      {showPlayer && (
        <Suspense fallback={null}>
          <SajuAnimationPlayer
            fullResult={active.fullResult}
            formData={active.formData}
            traditionalResult={null}
            aiInterpretation={null}
            onClose={() => { setShowPlayer(false); setIsPlaying(true) }}
          />
        </Suspense>
      )}
    </>
  )
}

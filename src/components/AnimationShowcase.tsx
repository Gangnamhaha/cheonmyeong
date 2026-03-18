'use client'

import { useRef, useEffect, useState, lazy, Suspense, useCallback } from 'react'
import type { FullSajuResult } from '@/lib/saju'
import { drawSceneTitle, drawScenePillars, drawSceneOheng, drawSceneStrength } from '@/lib/animation-scenes'

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

function Preview({ s }: { s: typeof S[0] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    c.width = 1080; c.height = 1920
    const W = 1080, H = 1920
    let running = true
    let visible = true
    timeRef.current = 0

    // Pause when off-screen to save CPU/memory
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { threshold: 0.1 })
    observer.observe(c)

    // Particles
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 1.5 - 0.3,
      r: Math.random() * 3 + 1, alpha: Math.random() * 0.5 + 0.2,
    }))

    function draw() {
      if (!running) return
      if (!visible) { frameRef.current = requestAnimationFrame(draw); return }
      timeRef.current += 1 / 60
      const t = timeRef.current
      const sceneDur = 5
      const sceneIdx = Math.floor(t / sceneDur) % 4
      const sceneT = (t % sceneDur) / sceneDur // 0~1 within scene

      // Draw the scene
      if (sceneIdx === 0) drawSceneTitle(ctx, W, H, s.nm, s.fd.year, s.fd.month, s.fd.day, s.fd.gender)
      else if (sceneIdx === 1) drawScenePillars(ctx, W, H, s.fr)
      else if (sceneIdx === 2) drawSceneOheng(ctx, W, H, s.fr)
      else drawSceneStrength(ctx, W, H, s.fr)

      // Animated particles overlay
      ctx.save()
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W }
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r + Math.sin(t * 2 + p.x * 0.01) * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha * (0.5 + Math.sin(t * 1.5 + p.y * 0.005) * 0.3)})`
        ctx.fill()
      }
      ctx.restore()

      // Fade transition at scene boundaries
      if (sceneT < 0.08) {
        const fadeIn = sceneT / 0.08
        ctx.fillStyle = `rgba(15, 23, 42, ${1 - fadeIn})`
        ctx.fillRect(0, 0, W, H)
      } else if (sceneT > 0.92) {
        const fadeOut = (sceneT - 0.92) / 0.08
        ctx.fillStyle = `rgba(15, 23, 42, ${fadeOut})`
        ctx.fillRect(0, 0, W, H)
      }

      // Scene indicator dots
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.arc(W / 2 - 45 + i * 30, H - 60, 8, 0, Math.PI * 2)
        ctx.fillStyle = i === sceneIdx ? '#fbbf24' : 'rgba(255,255,255,0.15)'
        ctx.fill()
      }

      // Letterbox
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, 20); ctx.fillRect(0, H - 20, W, 20)

      frameRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { running = false; cancelAnimationFrame(frameRef.current); observer.disconnect() }
  }, [s])

  return (
    <canvas
      ref={ref}
      className="w-full rounded-xl"
      style={{ display: 'block', aspectRatio: '9/16', maxHeight: '300px', objectFit: 'contain' }}
    />
  )
}

export default function AnimationShowcase() {
  const [idx, setIdx] = useState(0)
  const [auto, setAuto] = useState(true)
  const [play, setPlay] = useState(false)

  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => setIdx(p => (p+1)%6), 4000)
    return () => clearInterval(id)
  }, [auto])

  const a = S[idx]

  return (
    <>
      <div className="mt-3 rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="px-3 pt-3 pb-1 flex items-center justify-between">
          <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>🎬 운명 애니메이션</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{idx+1}/6</span>
        </div>
        <div className="w-full px-3 pb-2 cursor-pointer" onClick={() => { setAuto(false); setPlay(true) }}>
          <div className="rounded-xl overflow-hidden" style={{ boxShadow: `0 2px 16px ${a.ac}20`, border: `1px solid ${a.ac}25` }}>
            <Preview s={a} />
          </div>
        </div>
        <div className="px-3 pb-3 grid grid-cols-6 gap-1.5">
          {S.map((x, i) => (
            <button key={x.m} onClick={() => { setIdx(i); setAuto(false); setTimeout(() => setAuto(true), 6000) }}
              className="rounded-lg py-1.5 transition-all text-center"
              style={{ background: i===idx ? x.ac+'20' : 'var(--bg-secondary)', border: i===idx ? `1.5px solid ${x.ac}` : '1px solid transparent', opacity: i===idx ? 1 : 0.6 }}>
              <span className="text-xs">{x.i}</span>
              <p className="text-[7px] font-bold mt-0.5" style={{ color: i===idx ? x.ac : 'var(--text-muted)' }}>{x.d}</p>
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

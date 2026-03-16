'use client'

import { useRef, useEffect, useState, lazy, Suspense, useCallback } from 'react'
import type { FullSajuResult } from '@/lib/saju'

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
  const frame = useRef(0)
  const t = useRef(0)
  const scene = useRef(0)

  const draw = useCallback(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    const w = c.width, h = c.height
    t.current += 0.016
    const fn = "'Pretendard Variable',sans-serif"
    const r = s.fr // FullSajuResult

    // Switch scene every 4 seconds
    const sceneIdx = Math.floor(t.current / 4) % 4

    // Base background
    ctx.fillStyle = '#0a0e1a'; ctx.fillRect(0, 0, w, h)
    const g = ctx.createRadialGradient(w/2, h*0.4, 10, w/2, h*0.4, w*0.6)
    g.addColorStop(0, s.ac + '18'); g.addColorStop(1, 'transparent')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)

    // Floating particles
    for (let i = 0; i < 8; i++) {
      const px = (Math.sin(t.current*0.4+i*2.5)*0.4+0.5)*w
      const py = (Math.cos(t.current*0.3+i*1.8)*0.35+0.5)*h
      ctx.beginPath(); ctx.arc(px, py, 1+Math.sin(t.current+i)*0.5, 0, Math.PI*2)
      ctx.fillStyle = s.ac+'30'; ctx.fill()
    }

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'

    if (sceneIdx === 0) {
      // Scene 0: Title
      ctx.fillStyle = '#fbbf24'; ctx.font = `bold 22px ${fn}`
      ctx.fillText('사주해', w/2, h*0.3)
      ctx.fillStyle = '#94a3b8'; ctx.font = `12px ${fn}`
      ctx.fillText('AI 사주분석', w/2, h*0.43)
      ctx.fillStyle = '#cbd5e1'; ctx.font = `11px ${fn}`
      ctx.fillText(`${s.nm} · ${s.fd.year}년 ${s.fd.month}월 ${s.fd.day}일`, w/2, h*0.56)
      // Sparkles
      for (let i = 0; i < 5; i++) {
        const sx = w*0.2 + i*w*0.15, sy = h*0.72 + Math.sin(t.current*2+i)*4
        ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI*2)
        ctx.fillStyle = '#fbbf2488'; ctx.fill()
      }
    } else if (sceneIdx === 1) {
      // Scene 1: 4 Pillars
      ctx.fillStyle = '#f8fafc'; ctx.font = `bold 12px ${fn}`
      ctx.fillText('사주팔자', w/2, h*0.12)
      const pw = w*0.2, gap = 4, startX = (w-pw*4-gap*3)/2
      const labels = ['시주','일주','월주','년주']
      const pillars = [r.saju.hourPillar, r.saju.dayPillar, r.saju.monthPillar, r.saju.yearPillar]
      pillars.forEach((p: {heavenlyStemHanja?:string;heavenlyStem:string;earthlyBranchHanja?:string;earthlyBranch:string;element:string}, i: number) => {
        const x = startX+i*(pw+gap), y = h*0.2
        const ec = EC[p.element] ?? '#94a3b8'
        ctx.fillStyle = ec+'15'; ctx.beginPath(); ctx.roundRect(x, y, pw, h*0.6, 4); ctx.fill()
        ctx.strokeStyle = ec+'40'; ctx.lineWidth = 0.5; ctx.stroke()
        ctx.fillStyle = '#94a3b8'; ctx.font = `8px ${fn}`; ctx.fillText(labels[i], x+pw/2, y+10)
        ctx.fillStyle = ec; ctx.font = `bold 16px ${fn}`
        ctx.fillText(p.heavenlyStemHanja??p.heavenlyStem, x+pw/2, y+h*0.18)
        ctx.fillText(p.earthlyBranchHanja??p.earthlyBranch, x+pw/2, y+h*0.38)
        ctx.fillStyle = ec+'cc'; ctx.font = `bold 8px ${fn}`
        ctx.fillText(p.element, x+pw/2, y+h*0.52)
      })
    } else if (sceneIdx === 2) {
      // Scene 2: Oheng chart
      ctx.fillStyle = '#f8fafc'; ctx.font = `bold 12px ${fn}`
      ctx.fillText('오행의 조화', w/2, h*0.12)
      const order = ['목','화','토','금','수'] as const
      const icons: Record<string,string> = {'목':'🌳','화':'🔥','토':'⛰️','금':'⚡','수':'💧'}
      const maxV = Math.max(...Object.values(r.oheng.counts), 1)
      order.forEach((el, i) => {
        const cnt = (r.oheng.counts as Record<string,number>)[el] ?? 0
        const ec = EC[el] ?? '#94a3b8'
        const bw = (cnt/maxV) * w * 0.5
        const by = h*0.22 + i*h*0.14
        ctx.fillStyle = ec+'20'; ctx.beginPath(); ctx.roundRect(w*0.22, by, w*0.55, h*0.1, 4); ctx.fill()
        ctx.fillStyle = ec; ctx.beginPath(); ctx.roundRect(w*0.22, by, Math.max(bw,8), h*0.1, 4); ctx.fill()
        ctx.font = `10px ${fn}`; ctx.fillStyle = ec; ctx.textAlign = 'left'
        ctx.fillText(`${icons[el]} ${el}`, w*0.04, by+h*0.055)
        ctx.textAlign = 'center'; ctx.fillStyle = '#e2e8f0'; ctx.font = `bold 9px ${fn}`
        ctx.fillText(String(cnt), w*0.22+Math.max(bw,8)+12, by+h*0.055)
      })
      ctx.textAlign = 'center'
      const bc = r.oheng.balance==='균형'?'#4ade80':r.oheng.balance==='편중'?'#fbbf24':'#f87171'
      ctx.fillStyle = bc; ctx.font = `bold 10px ${fn}`
      ctx.fillText(r.oheng.balance, w/2, h*0.95)
    } else {
      // Scene 3: Strength + Yongsin
      ctx.fillStyle = '#f8fafc'; ctx.font = `bold 12px ${fn}`
      ctx.fillText('일간 강약 · 용신', w/2, h*0.12)
      const sc = r.ilganStrength.strength==='신강'?'#3b82f6':'#f97316'
      // Strength circle
      ctx.beginPath(); ctx.arc(w*0.3, h*0.5, 30, 0, Math.PI*2)
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 4; ctx.stroke()
      const total = r.ilganStrength.details.support+r.ilganStrength.details.opposition
      const pct = total>0?r.ilganStrength.details.support/total:0.5
      ctx.beginPath(); ctx.arc(w*0.3, h*0.5, 30, -Math.PI/2, -Math.PI/2+Math.PI*2*pct)
      ctx.strokeStyle = sc; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke()
      ctx.fillStyle = sc; ctx.font = `bold 14px ${fn}`
      ctx.fillText(r.ilganStrength.strength, w*0.3, h*0.5)
      // Yongsin
      const ye = r.yongsin.yongsin as string
      const yc = EC[ye] ?? '#f8fafc'
      const yh: Record<string,string> = {'목':'木','화':'火','토':'土','금':'金','수':'水'}
      ctx.fillStyle = yc; ctx.font = `bold 28px ${fn}`
      ctx.fillText(yh[ye]??ye, w*0.7, h*0.48)
      ctx.font = `12px ${fn}`; ctx.fillText(ye, w*0.7, h*0.62)
      ctx.fillStyle = '#cbd5e1'; ctx.font = `9px ${fn}`
      ctx.fillText(`희신: ${r.yongsin.huisin}`, w*0.7, h*0.74)
    }

    // Letterbox + scene indicator
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,w,3); ctx.fillRect(0,h-3,w,3)
    // Scene dots
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.arc(w/2-12+i*8, h-8, 2, 0, Math.PI*2)
      ctx.fillStyle = i===sceneIdx ? s.ac : '#333'; ctx.fill()
    }

    frame.current = requestAnimationFrame(draw)
  }, [s])

  useEffect(() => {
    const c = ref.current; if (!c) return; c.width = 360; c.height = 200; t.current = 0; draw()
    return () => cancelAnimationFrame(frame.current)
  }, [draw])

  return <canvas ref={ref} className="w-full h-full rounded-xl" style={{ display: 'block' }} />
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

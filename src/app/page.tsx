'use client'

import { useState, useCallback, useRef } from 'react'
import SajuForm from '@/components/SajuForm'
import SajuResultCard from '@/components/SajuResult'
import OhengChart from '@/components/OhengChart'
import { OHENG_COLORS } from '@/lib/oheng'
import AiInterpretation from '@/components/AiInterpretation'
import SipsinChart from '@/components/SipsinChart'
import IlganStrengthBadge from '@/components/IlganStrengthBadge'
import YongsinCard from '@/components/YongsinCard'
import DaeunTimeline from '@/components/DaeunTimeline'
import FortuneCard from '@/components/FortuneCard'
import { useTheme } from '@/components/ThemeProvider'
import { trackAnalysis } from '@/lib/analytics'
import { calculateFullSaju, FullSajuResult } from '@/lib/saju'

type AppState = 'form' | 'result'
type ResultTab = '사주' | '분석' | '운세' | 'AI'
type ViewMode = 'summary' | 'detail'

const RESULT_TABS: { key: ResultTab; label: string; icon: string }[] = [
  { key: '사주', label: '사주', icon: '🏛️' },
  { key: '분석', label: '분석', icon: '🔍' },
  { key: '운세', label: '운세', icon: '🌟' },
  { key: 'AI', label: 'AI', icon: '🤖' },
]

type AiCategory = '종합' | '성격' | '연애' | '직업' | '건강' | '재물'
const AI_CATEGORIES: { key: AiCategory; label: string; icon: string }[] = [
  { key: '종합', label: '종합', icon: '🔮' },
  { key: '성격', label: '성격', icon: '🧠' },
  { key: '연애', label: '연애', icon: '💕' },
  { key: '직업', label: '직업', icon: '💼' },
  { key: '건강', label: '건강', icon: '🏥' },
  { key: '재물', label: '재물', icon: '💰' },
]

interface FormData {
  name: string
  year: number
  month: number
  day: number
  hour: number
  minute: number
  calendarType: 'solar' | 'lunar'
  isLeapMonth: boolean
  gender: 'male' | 'female'
}

export default function Home() {
  const { theme, toggleTheme, cycleFontSize, fontSizeLabel } = useTheme()
  const [appState, setAppState] = useState<AppState>('form')
  const [loading, setLoading] = useState(false)
  const [fullResult, setFullResult] = useState<FullSajuResult | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<AiCategory>('종합')
  const [categoryCache, setCategoryCache] = useState<Partial<Record<AiCategory, string>>>({})
  const abortRef = useRef<AbortController | null>(null)
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [shareToast, setShareToast] = useState(false)
  const [saveImageLoading, setSaveImageLoading] = useState(false)
  const [saveDocxLoading, setSaveDocxLoading] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const downloadRef = useRef<HTMLDivElement>(null)

  // New state for tabs and view mode
  const [activeTab, setActiveTab] = useState<ResultTab>('사주')
  const [viewMode, setViewMode] = useState<ViewMode>('detail')

  const fetchInterpretation = useCallback(async (result: FullSajuResult, category: AiCategory) => {
    // Check cache first
    if (categoryCache[category]) {
      setAiInterpretation(categoryCache[category] ?? null)
      return
    }

    // Check credits before making request
    try {
      const creditRes = await fetch('/api/credits', { method: 'POST' })
      if (!creditRes.ok) {
        const creditData = await creditRes.json()
        setAiError(creditData.error ?? '크레딧이 부족합니다.')
        return
      }
    } catch {
      // Credit check failed, proceed anyway (graceful degradation)
    }

    // Abort previous request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setAiLoading(true)
    setAiError(null)
    setAiInterpretation(null)

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saju: result.saju,
          oheng: result.oheng,
          sipsin: result.sipsin,
          ilganStrength: result.ilganStrength,
          yongsin: result.yongsin,
          daeun: result.daeun,
          yearlyFortune: result.yearlyFortune,
          monthlyFortune: result.monthlyFortune,
          category,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        setAiError(data.error ?? 'AI 해석 중 오류가 발생했습니다.')
        return
      }

      // Handle streaming response
      const reader = res.body?.getReader()
      if (!reader) {
        setAiError('스트리밍을 지원하지 않는 환경입니다.')
        return
      }

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        accumulated += text
        setAiInterpretation(accumulated)
      }

      // Cache result
      setCategoryCache(prev => ({ ...prev, [category]: accumulated }))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setAiError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setAiLoading(false)
    }
  }, [categoryCache])

  function handleCategoryChange(category: AiCategory) {
    setActiveCategory(category)
    if (fullResult) {
      fetchInterpretation(fullResult, category)
    }
  }

  async function handleFormSubmit(data: FormData) {
    setLoading(true)
    setCalcError(null)
    setAiInterpretation(null)
    setAiError(null)
    setActiveCategory('종합')
    setCategoryCache({})
    setActiveTab('사주')
    setViewMode('detail')
    setFormData(data)

    try {
      const result = calculateFullSaju(
        data.year, data.month, data.day, data.hour, data.minute,
        data.calendarType, data.isLeapMonth, data.gender,
      )

      setFullResult(result)
      setAppState('result')
      trackAnalysis('사주분석')

      fetchInterpretation(result, '종합')
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : '사주 계산 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleFollowUp() {
    if (!followUpQuestion.trim() || !fullResult || followUpLoading) return
    const question = followUpQuestion.trim()
    setFollowUpQuestion('')
    setChatHistory(prev => [...prev, { role: 'user', content: question }])
    setFollowUpLoading(true)

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saju: fullResult.saju,
          oheng: fullResult.oheng,
          sipsin: fullResult.sipsin,
          ilganStrength: fullResult.ilganStrength,
          yongsin: fullResult.yongsin,
          daeun: fullResult.daeun,
          yearlyFortune: fullResult.yearlyFortune,
          monthlyFortune: fullResult.monthlyFortune,
          category: '종합',
          followUp: question,
          stream: false,
        }),
      })
      const data = await res.json()
      if (res.ok && data.interpretation) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.interpretation }])
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.error ?? 'AI 응답 중 오류가 발생했습니다.' }])
      }
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: '네트워크 오류가 발생했습니다.' }])
    } finally {
      setFollowUpLoading(false)
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareToast(true)
      setTimeout(() => setShareToast(false), 2000)
    })
  }

  async function handleSaveImage() {
    if (!downloadRef.current || saveImageLoading) return
    setSaveImageLoading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(downloadRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      const name = formData?.name ? `_${formData.name}` : ''
      link.download = `\uCC9C\uBA85_\uC0AC\uC8FC\uACB0\uACFC${name}_${new Date().toISOString().slice(0, 10)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      alert('\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.')
    } finally {
      setSaveImageLoading(false)
    }
  }

  async function handleSaveDocx() {
    if (!fullResult || saveDocxLoading) return
    setSaveDocxLoading(true)
    try {
      const docx = await import('docx')
      const { saveAs } = await import('file-saver')
      const { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, Packer } = docx

      const pillars = [
        { label: '\uC2DC\uC8FC (\u6642\u67F1)', p: fullResult.saju.hourPillar },
        { label: '\uC77C\uC8FC (\u65E5\u67F1)', p: fullResult.saju.dayPillar },
        { label: '\uC6D4\uC8FC (\u6708\u67F1)', p: fullResult.saju.monthPillar },
        { label: '\uB144\uC8FC (\u5E74\u67F1)', p: fullResult.saju.yearPillar },
      ]

      const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
      const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }

      const pillarTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: pillars.map(({ label }) =>
              new TableCell({
                borders: noBorders,
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: label, size: 18, color: '888888' })] })],
              })
            ),
          }),
          new TableRow({
            children: pillars.map(({ p }) =>
              new TableCell({
                borders: noBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: [
                  new TextRun({ text: `${p.heavenlyStemHanja ?? ''} (${p.heavenlyStem})`, size: 28, bold: true }),
                ] })],
              })
            ),
          }),
          new TableRow({
            children: pillars.map(({ p }) =>
              new TableCell({
                borders: noBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40 }, children: [
                  new TextRun({ text: `${p.earthlyBranchHanja ?? ''} (${p.earthlyBranch})`, size: 28, bold: true }),
                ] })],
              })
            ),
          }),
          new TableRow({
            children: pillars.map(({ p }) =>
              new TableCell({
                borders: noBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40 }, children: [
                  new TextRun({ text: p.element, size: 20, color: '666666' }),
                ] })],
              })
            ),
          }),
        ],
      })

      const ohengLine = ['\uBAA9', '\uD654', '\uD1A0', '\uAE08', '\uC218']
        .map(e => `${e}: ${fullResult.oheng.counts[e as keyof typeof fullResult.oheng.counts]}`).join('  |  ')

      const sections = [
        new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: '\uCC9C\uBA85 (\u5929\u547D) \uC0AC\uC8FC\uBD84\uC11D', bold: true, size: 36 }),
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
          new TextRun({
            text: [
              formData?.name || '',
              formData?.gender === 'male' ? '\uB0A8' : '\uC5EC',
              formData ? `${formData.year}\uB144 ${formData.month}\uC6D4 ${formData.day}\uC77C ${formData.hour}\uC2DC` : '',
              formData?.calendarType === 'lunar' ? '(\uC74C\uB825)' : '',
            ].filter(Boolean).join(' \u00B7 '),
            size: 22, color: '666666',
          }),
        ] }),
        new Paragraph({ spacing: { before: 100, after: 100 }, children: [] }),

        // \uC0AC\uC8FC\uD314\uC790
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
          new TextRun({ text: '\uC0AC\uC8FC\uD314\uC790 (\u56DB\u67F1\u516B\u5B57)', bold: true }),
        ] }),
        pillarTable,
        new Paragraph({ spacing: { before: 100, after: 100 }, children: [] }),

        // \uC624\uD589
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
          new TextRun({ text: '\uC624\uD589 \uBD84\uD3EC (\u4E94\u884C)', bold: true }),
        ] }),
        new Paragraph({ spacing: { after: 100 }, children: [
          new TextRun({ text: ohengLine, size: 22 }),
        ] }),
        new Paragraph({ children: [
          new TextRun({ text: `\uADE0\uD615 \uC0C1\uD0DC: ${fullResult.oheng.balance}`, size: 22, color: '444444' }),
        ] }),
        new Paragraph({ spacing: { before: 100, after: 100 }, children: [] }),

        // \uC77C\uAC04 \uAC15\uC57D + \uC6A9\uC2E0
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
          new TextRun({ text: '\uC77C\uAC04 \uAC15\uC57D \u00B7 \uC6A9\uC2E0', bold: true }),
        ] }),
        new Paragraph({ spacing: { after: 60 }, children: [
          new TextRun({ text: '\uC77C\uAC04 \uAC15\uC57D: ', size: 22 }),
          new TextRun({ text: fullResult.ilganStrength.strength, size: 24, bold: true }),
        ] }),
        new Paragraph({ spacing: { after: 60 }, children: [
          new TextRun({ text: '\uC6A9\uC2E0 (\u7528\u795E): ', size: 22 }),
          new TextRun({ text: fullResult.yongsin.yongsin, size: 24, bold: true }),
        ] }),
        new Paragraph({ children: [
          new TextRun({ text: fullResult.yongsin.reason, size: 20, color: '555555' }),
        ] }),
        new Paragraph({ spacing: { before: 100, after: 100 }, children: [] }),

        // \uC62C\uD574 \uC6B4\uC138
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
          new TextRun({ text: `${new Date().getFullYear()}\uB144 \uC6B4\uC138`, bold: true }),
        ] }),
        new Paragraph({ spacing: { after: 60 }, children: [
          new TextRun({ text: `\uD310\uC815: ${fullResult.yearlyFortune.rating}`, size: 22, bold: true }),
          new TextRun({ text: `  (${fullResult.yearlyFortune.pillar})`, size: 20, color: '888888' }),
        ] }),
        new Paragraph({ children: [
          new TextRun({ text: fullResult.yearlyFortune.description, size: 20, color: '444444' }),
        ] }),
      ]

      // AI \uD574\uC11D
      if (aiInterpretation) {
        sections.push(
          new Paragraph({ spacing: { before: 200, after: 100 }, children: [] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
            new TextRun({ text: 'AI \uC885\uD569 \uD574\uC11D', bold: true }),
          ] }),
          new Paragraph({ children: [
            new TextRun({ text: aiInterpretation, size: 20, color: '333333' }),
          ] }),
        )
      }

      // \uD478\uD130
      sections.push(
        new Paragraph({ spacing: { before: 300 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: `${new Date().toISOString().slice(0, 10)} | cheonmyeong.vercel.app`, size: 16, color: 'AAAAAA' }),
        ] }),
      )

      const doc = new Document({
        sections: [{ children: sections }],
      })

      const blob = await Packer.toBlob(doc)
      const name = formData?.name ? `_${formData.name}` : ''
      saveAs(blob, `\uCC9C\uBA85_\uC0AC\uC8FC\uACB0\uACFC${name}_${new Date().toISOString().slice(0, 10)}.docx`)
    } catch {
      alert('\uC6CC\uB4DC \uBB38\uC11C \uC800\uC7A5 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.')
    } finally {
      setSaveDocxLoading(false)
    }
  }

  function handleReset() {
    abortRef.current?.abort()
    setAppState('form')
    setFullResult(null)
    setFormData(null)
    setAiInterpretation(null)
    setAiError(null)
    setCalcError(null)
    setActiveCategory('종합')
    setCategoryCache({})
    setChatHistory([])
    setFollowUpQuestion('')
    setActiveTab('사주')
    setViewMode('detail')
  }

  // Summary view helper
  function renderSummary() {
    if (!fullResult) return null
    const ratingEmoji = fullResult.yearlyFortune.rating === '길' ? '🟢' : fullResult.yearlyFortune.rating === '흉' ? '🔴' : '🟡'
    const aiPreview = aiInterpretation ? aiInterpretation.slice(0, 100) + (aiInterpretation.length > 100 ? '...' : '') : null

    return (
      <div className="summary-card animate-fadeIn space-y-4">
        <div className="text-center">
          <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>간략 요약</div>
        </div>

        {/* 일간 */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>일간 (日干)</span>
          <span className="text-xl font-bold" style={{ color: 'var(--text-accent)' }}>
            {fullResult.saju.dayPillar.heavenlyStemHanja} {fullResult.saju.dayPillar.heavenlyStem}
          </span>
        </div>

        {/* 신강/신약 */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>강약</span>
          <span
            className="text-lg font-bold px-3 py-0.5 rounded-full"
            style={{
              color: fullResult.ilganStrength.strength === '신강' ? '#3b82f6' : '#f97316',
              background: fullResult.ilganStrength.strength === '신강' ? 'rgba(59,130,246,0.15)' : 'rgba(249,115,22,0.15)',
            }}
          >
            {fullResult.ilganStrength.strength}
          </span>
        </div>

        {/* 용신 */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>용신 (用神)</span>
          <span className="text-lg font-bold" style={{ color: 'var(--text-accent)' }}>
            {fullResult.yongsin.yongsin}
          </span>
        </div>

        {/* 올해 운세 */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date().getFullYear()}년 운세</span>
          <span className="text-lg font-bold">
            {ratingEmoji} {fullResult.yearlyFortune.rating}
          </span>
        </div>

        {/* AI 한줄 요약 */}
        {aiPreview && (
          <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {aiPreview}
            </p>
          </div>
        )}

        <button
          onClick={() => setViewMode('detail')}
          className="w-full text-sm font-medium py-2 rounded-lg hover-scale"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          상세 보기 →
        </button>
      </div>
    )
  }

  return (
    <>
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto">
        {appState === 'form' && (
          <>
            <SajuForm onSubmit={handleFormSubmit} loading={loading} />
            {calcError && (
              <div className="mx-4 mb-8 bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm text-center">
                {calcError}
              </div>
            )}
          </>
        )}

        {appState === 'result' && fullResult && (
          <div className="animate-fadeIn py-8 px-4" ref={resultRef}>
            {/* 헤더 */}
            <div className="text-center mb-4">
              <div className="flex justify-between items-center mb-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover-scale theme-transition"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                  aria-label="테마 전환"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={cycleFontSize}
                  className="p-2 rounded-full hover-scale theme-transition text-xs font-bold"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                  aria-label="글씨 크기 조절"
                  title="글씨 크기 조절"
                >
                  {fontSizeLabel}
                </button>
                <div>
                  <h1 className="font-serif-kr text-3xl font-bold" style={{ color: 'var(--text-accent)' }}>천명</h1>
                  <p className="font-serif-kr text-sm tracking-widest" style={{ color: 'var(--text-muted)' }}>天命</p>
                </div>
                {/* View Mode Toggle */}
                <button
                  onClick={() => setViewMode(viewMode === 'detail' ? 'summary' : 'detail')}
                  className="px-3 py-1.5 rounded-full text-xs font-medium hover-scale theme-transition"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  {viewMode === 'detail' ? '간략' : '상세'}
                </button>
              </div>
            </div>

            {viewMode === 'summary' ? renderSummary() : (
              <>
                {/* Tab Bar */}
                <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  {RESULT_TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all hover-scale ${
                        activeTab === tab.key ? 'tab-active-pulse' : ''
                      }`}
                      style={{
                        background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
                        color: activeTab === tab.key ? 'var(--accent-text)' : 'var(--text-secondary)',
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-8 tab-panel" key={activeTab}>
                  {activeTab === '사주' && (
                    <>
                      <SajuResultCard result={fullResult.saju} />
                      <OhengChart result={fullResult.oheng} />
                    </>
                  )}

                  {activeTab === '분석' && (
                    <>
                      <SipsinChart result={fullResult.sipsin} />
                      <IlganStrengthBadge result={fullResult.ilganStrength} />
                      <YongsinCard result={fullResult.yongsin} />
                    </>
                  )}

                  {activeTab === '운세' && (
                    <>
                      <DaeunTimeline result={fullResult.daeun} />
                      <FortuneCard yearlyFortune={fullResult.yearlyFortune} monthlyFortune={fullResult.monthlyFortune} />
                    </>
                  )}

                  {activeTab === 'AI' && (
                    <>
                      {/* 카테고리 탭 */}
                      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                        {AI_CATEGORIES.map(cat => (
                          <button
                            key={cat.key}
                            onClick={() => handleCategoryChange(cat.key)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover-scale"
                            style={{
                              background: activeCategory === cat.key ? 'var(--accent)' : 'var(--bg-secondary)',
                              color: activeCategory === cat.key ? 'var(--accent-text)' : 'var(--text-secondary)',
                              border: activeCategory === cat.key ? 'none' : '1px solid var(--border-color)',
                            }}
                          >
                            {cat.icon} {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* AI 해석 */}
                      <AiInterpretation
                        interpretation={aiInterpretation}
                        loading={aiLoading}
                        error={aiError}
                        onRetry={() => fetchInterpretation(fullResult, activeCategory)}
                      />

                      {/* 후속 질문 */}
                      {chatHistory.length > 0 && (
                        <div className="space-y-3">
                          {chatHistory.map((msg, i) => (
                            <div
                              key={i}
                              className={`text-sm p-3 rounded-lg ${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}
                              style={{
                                background: msg.role === 'user'
                                  ? 'rgba(245,158,11,0.1)'
                                  : 'var(--bg-card)',
                                border: `1px solid ${msg.role === 'user' ? 'rgba(245,158,11,0.2)' : 'var(--border-color)'}`,
                                color: msg.role === 'user' ? 'var(--text-accent)' : 'var(--text-secondary)',
                              }}
                            >
                              <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                                {msg.role === 'user' ? '나' : 'AI 명리사'}
                              </span>
                              <div className="whitespace-pre-line">{msg.content}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 후속 질문 입력 */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={followUpQuestion}
                          onChange={e => setFollowUpQuestion(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleFollowUp() }}
                          placeholder="추가 질문을 입력하세요..."
                          className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors"
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                          }}
                          disabled={followUpLoading}
                        />
                        <button
                          onClick={handleFollowUp}
                          disabled={followUpLoading || !followUpQuestion.trim()}
                          className="font-bold px-4 py-2 rounded-lg transition-colors text-sm hover-scale disabled:cursor-not-allowed"
                          style={{
                            background: followUpLoading || !followUpQuestion.trim() ? 'var(--bg-secondary)' : 'var(--accent)',
                            color: followUpLoading || !followUpQuestion.trim() ? 'var(--text-muted)' : 'var(--accent-text)',
                          }}
                        >
                          {followUpLoading ? '...' : '물어보기'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* 궁합 링크 */}
            <a
              href="/gunghap"
              className="block w-full text-center font-medium py-3 px-6 rounded-lg transition-colors text-sm mt-8 hover-lift"
              style={{
                background: 'rgba(236,72,153,0.1)',
                color: '#f472b6',
                border: '1px solid rgba(236,72,153,0.3)',
              }}
            >
              💑 궁합 보기
            </a>

            {/* 다운로드 + 공유 + 다시보기 버튼 */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleSaveImage}
                disabled={saveImageLoading}
                className="font-medium py-3 px-4 rounded-lg transition-colors text-sm hover-lift disabled:cursor-not-allowed"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {saveImageLoading ? '저장 중...' : '🖼️ 이미지 저장'}
              </button>
              <button
                onClick={handleSaveDocx}
                disabled={saveDocxLoading}
                className="font-medium py-3 px-4 rounded-lg transition-colors text-sm hover-lift disabled:cursor-not-allowed"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {saveDocxLoading ? '저장 중...' : '📄 워드 저장'}
              </button>
              <button
                onClick={handleShare}
                className="font-medium py-3 px-4 rounded-lg transition-colors text-sm hover-lift"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                🔗 링크 복사
              </button>
              <button
                onClick={handleReset}
                className="font-medium py-3 px-4 rounded-lg transition-colors text-sm hover-lift"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                🔄 다시 보기
              </button>
            </div>

            {/* 토스트 */}
            {shareToast && (
              <div
                className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-fadeIn"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                링크가 복사되었습니다!
              </div>
            )}
          </div>
        )}
      </div>
    </main>

    {/* === Hidden Download Card (off-screen, captured by html2canvas) === */}
    {fullResult && (
      <div ref={downloadRef} style={{
        position: 'fixed', left: '-10000px', top: 0, width: '420px',
        background: '#0f172a', padding: '32px 24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fbbf24', letterSpacing: '2px' }}>
            \uCC9C\uBA85
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '4px', marginTop: '2px' }}>
            \u5929\u547D \uC0AC\uC8FC\uBD84\uC11D
          </div>
          {formData && (
            <div style={{ marginTop: '12px', color: '#94a3b8', fontSize: '13px' }}>
              {formData.name && <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>{formData.name}</span>}
              {formData.name && ' \u00B7 '}
              {formData.gender === 'male' ? '\uB0A8' : '\uC5EC'} \u00B7{' '}
              {formData.year}\uB144 {formData.month}\uC6D4 {formData.day}\uC77C {formData.hour}\uC2DC
              {formData.calendarType === 'lunar' && ' (\uC74C\uB825)'}
            </div>
          )}
        </div>

        {/* \uC0AC\uC8FC 4\uAE30\uB465 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {[
            { p: fullResult.saju.hourPillar, l: '\uC2DC\uC8FC' },
            { p: fullResult.saju.dayPillar, l: '\uC77C\uC8FC' },
            { p: fullResult.saju.monthPillar, l: '\uC6D4\uC8FC' },
            { p: fullResult.saju.yearPillar, l: '\uB144\uC8FC' },
          ].map(({ p, l }, i) => {
            const c = OHENG_COLORS[p.element] ?? '#94a3b8'
            return (
              <div key={i} style={{
                background: c + '22', border: `1px solid ${c}55`,
                borderRadius: '12px', padding: '12px 8px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>{l}</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: c }}>{p.heavenlyStemHanja}</div>
                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{p.heavenlyStem}</div>
                <div style={{ width: '100%', height: '1px', background: '#334155', margin: '6px 0' }} />
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: c }}>{p.earthlyBranchHanja}</div>
                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{p.earthlyBranch}</div>
                <div style={{
                  fontSize: '10px', marginTop: '6px',
                  padding: '2px 8px', borderRadius: '9999px', display: 'inline-block',
                  background: c + '33', color: p.element === '\uAE08' ? '#1e293b' : c,
                  border: `1px solid ${c}55`,
                }}>{p.element}</div>
              </div>
            )
          })}
        </div>

        {/* \uC624\uD589 \uBD84\uD3EC */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '10px' }}>
            \uC624\uD589 \uBD84\uD3EC
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {(['\uBAA9', '\uD654', '\uD1A0', '\uAE08', '\uC218'] as const).map(e => (
              <div key={e} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: OHENG_COLORS[e] }}>
                  {fullResult.oheng.counts[e]}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{e}</div>
              </div>
            ))}
          </div>
        </div>

        {/* \uC77C\uAC04 \uAC15\uC57D + \uC6A9\uC2E0 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '14px', border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>\uC77C\uAC04 \uAC15\uC57D</div>
            <div style={{
              fontSize: '20px', fontWeight: 'bold', marginTop: '4px',
              color: fullResult.ilganStrength.strength === '\uC2E0\uAC15' ? '#3b82f6' : '#f97316',
            }}>{fullResult.ilganStrength.strength}</div>
          </div>
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '14px', border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>\uC6A9\uC2E0 (\u7528\u795E)</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', marginTop: '4px' }}>
              {fullResult.yongsin.yongsin}
            </div>
          </div>
        </div>

        {/* \uC62C\uD574 \uC6B4\uC138 */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '14px', border: '1px solid #334155', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {new Date().getFullYear()}\uB144 \uC6B4\uC138
            </span>
            <span style={{
              fontSize: '16px', fontWeight: 'bold',
              color: fullResult.yearlyFortune.rating === '\uAE38' ? '#4ade80'
                : fullResult.yearlyFortune.rating === '\uD749' ? '#f87171' : '#fbbf24',
            }}>
              {fullResult.yearlyFortune.rating === '\uAE38' ? '\u25CF ' : fullResult.yearlyFortune.rating === '\uD749' ? '\u25CF ' : '\u25CF '}
              {fullResult.yearlyFortune.rating}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
            {fullResult.yearlyFortune.description.slice(0, 100)}
            {fullResult.yearlyFortune.description.length > 100 ? '...' : ''}
          </div>
        </div>

        {/* AI \uC694\uC57D */}
        {aiInterpretation && (
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #334155', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '8px' }}>
              AI \uC885\uD569 \uD574\uC11D
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {aiInterpretation.slice(0, 300)}{aiInterpretation.length > 300 ? '...' : ''}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#475569' }}>
            {new Date().toISOString().slice(0, 10)}
          </span>
          <span style={{ fontSize: '10px', color: '#475569' }}>
            cheonmyeong.vercel.app
          </span>
        </div>
      </div>
    )}

    </>
  )
}

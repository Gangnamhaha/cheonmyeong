'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
import DailyFortuneCard from '@/components/DailyFortuneCard'
import { useTheme } from '@/components/ThemeProvider'
import { trackAnalysis, trackPurchase, trackShare } from '@/lib/analytics'
import { shareSajuResult } from '@/lib/kakao'
import { FullSajuResult } from '@/lib/saju'
import SajuAnimationPlayer from '@/components/SajuAnimationPlayer'
import SajuMoviePlayer from '@/components/SajuMoviePlayer'
import ShareCard from '@/components/ShareCard'
import AnalysisLoading from '@/components/AnalysisLoading'
import ErrorRetry from '@/components/ErrorRetry'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import {
  getTraditionalInterpretation,
  toTraditionalContextText,
  type TraditionalInterpretation as TraditionalInterpretationResult,
} from '@/lib/traditional-interpret'

type AppState = 'form' | 'result'
type ResultTab = '사주' | '분석' | '운세' | '해석'
type ViewMode = 'simple' | 'summary' | 'detail'
type ReportTier = 'basic' | 'pro'

const RESULT_TABS: { key: ResultTab; label: string; icon: string }[] = [
  { key: '사주', label: '사주', icon: '🏛️' },
  { key: '분석', label: '분석', icon: '🔍' },
  { key: '운세', label: '운세', icon: '🌟' },
  { key: '해석', label: 'AI해석', icon: '🤖' },
]

type AiCategory = '종합' | '성격' | '연애' | '직업' | '건강' | '재물' | '인생성장'
const AI_CATEGORIES: { key: AiCategory; label: string; icon: string }[] = [
  { key: '종합', label: '종합', icon: '🔮' },
  { key: '인생성장', label: '인생성장', icon: '🌱' },
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

interface CheckinStatus {
  success: boolean
  todayCheckin: boolean
  streak: number
  reward: number
  history: Array<{
    date: string
    streak: number
    reward: number
  }>
}

export default function HomeClient() {
  const { data: session, status: sessionStatus } = useSession()
  const { theme, toggleTheme, cycleFontSize, fontSizeLabel } = useTheme()
  const [appState, setAppState] = useState<AppState>('form')
  const [loading, setLoading] = useState(false)
  const [fullResult, setFullResult] = useState<FullSajuResult | null>(null)
  const [traditionalResult, setTraditionalResult] = useState<TraditionalInterpretationResult | null>(null)
  const [traditionalContext, setTraditionalContext] = useState('')
  const [formData, setFormData] = useState<FormData | null>(null)
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<AiCategory>('종합')
  const [categoryCache, setCategoryCache] = useState<Partial<Record<AiCategory, string>>>({})
  const abortRef = useRef<AbortController | null>(null)
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: sttSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition()
  const [shareToast, setShareToast] = useState(false)
  const [saveImageLoading, setSaveImageLoading] = useState(false)
  const [saveDocxLoading, setSaveDocxLoading] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [showMovie, setShowMovie] = useState(false)
  const [premiumLoadingTier, setPremiumLoadingTier] = useState<ReportTier | null>(null)
  const [premiumDownloadUrls, setPremiumDownloadUrls] = useState<Record<ReportTier, string | null>>({
    basic: null,
    pro: null,
  })
  const [premiumError, setPremiumError] = useState<string | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)
  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus | null>(null)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [checkinSubmitting, setCheckinSubmitting] = useState(false)
  const [checkinToast, setCheckinToast] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const downloadRef = useRef<HTMLDivElement>(null)

  // New state for tabs and view mode
  const [activeTab, setActiveTab] = useState<ResultTab>('사주')
  const [viewMode, setViewMode] = useState<ViewMode>('simple')
  const resultUrl = resultId ? `https://sajuhae.vercel.app/result/${resultId}` : null

  const fetchCheckinStatus = useCallback(async () => {
    if (!session?.user) {
      setCheckinStatus(null)
      return
    }

    setCheckinLoading(true)
    try {
      const res = await fetch('/api/checkin', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) return
      setCheckinStatus(data)
    } catch {
      // ignore check-in fetch failures on homepage
    } finally {
      setCheckinLoading(false)
    }
  }, [session?.user])

  async function handleCheckin() {
    if (checkinSubmitting) return

    setCheckinSubmitting(true)
    try {
      const res = await fetch('/api/checkin', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) return

      setCheckinStatus((prev) => ({
        success: true,
        todayCheckin: true,
        streak: data.streak ?? prev?.streak ?? 1,
        reward: data.reward ?? 0,
        history: prev?.history ?? [],
      }))

      await fetchCheckinStatus()

      if ((data.reward ?? 0) > 0) {
        setCheckinToast(`+${data.reward} 크레딧 보상!`)
        setTimeout(() => setCheckinToast(null), 2000)
      }
    } catch {
      // ignore
    } finally {
      setCheckinSubmitting(false)
    }
  }


  const fetchInterpretation = useCallback(async (
    result: FullSajuResult,
    category: AiCategory,
    context: string = traditionalContext,
  ) => {
    // Check cache first
    if (categoryCache[category]) {
      setAiInterpretation(categoryCache[category] ?? null)
      return
    }

    // Check credits before making request
    try {
      const creditRes = await fetch('/api/credits', { method: 'POST' })
      if (!creditRes.ok) {
        const creditData = await creditRes.json().catch(() => null)
        setAiError(
          (creditData && typeof creditData.error === 'string' && creditData.error) ||
            '크레딧이 부족합니다.',
        )
        return
      }
    } catch {
      setAiError('크레딧 확인 중 네트워크 오류가 발생했습니다. 다시 시도해 주세요.')
      return
    }

    // Abort previous request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // 30-second timeout
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    setAiLoading(true)
    setAiError(null)
    setAiInterpretation(null)

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
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
          traditionalContext: context || undefined,
          traditionalResult: traditionalResult || undefined,
          formData: formData || undefined,
        }),
      })

      if (!res.ok) {
        const contentType = res.headers.get('content-type') ?? ''
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => null)
          setAiError(
            (data && typeof data.error === 'string' && data.error) ||
              'AI 해석 중 오류가 발생했습니다.',
          )
          return
        }
        const text = await res.text().catch(() => '')
        setAiError(text || 'AI 해석 중 오류가 발생했습니다.')
        return
      }

      const okContentType = res.headers.get('content-type') ?? ''
      if (!okContentType.includes('text/plain')) {
        // Unexpected success payload (e.g. JSON)
        const data = await res.json().catch(() => null)
        setAiError(
          (data && typeof data.error === 'string' && data.error) ||
            'AI 응답 형식이 올바르지 않습니다. 잠시 후 다시 시도해 주세요.',
        )
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
      clearTimeout(timeoutId)
      if (err instanceof DOMException && err.name === 'AbortError') {
        setAiError('요청 시간이 초과되었습니다. 다시 시도해 주세요.')
        return
      }
      setAiError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      clearTimeout(timeoutId)
      setAiLoading(false)
    }
  }, [categoryCache, traditionalContext, traditionalResult, formData])

  function handleCategoryChange(category: AiCategory) {
    setActiveCategory(category)
    if (fullResult) {
      fetchInterpretation(fullResult, category)
    }
  }

  async function handleFormSubmit(data: FormData) {
    setLoading(true)
    setCalcError(null)
    setApiError(null)
    setAiInterpretation(null)
    setAiError(null)
    setActiveCategory('종합')
    setCategoryCache({})
    setActiveTab('사주')
    setViewMode('simple')
    setTraditionalResult(null)
    setTraditionalContext('')
    setPremiumDownloadUrls({ basic: null, pro: null })
    setPremiumError(null)
    setFormData(data)
    setResultId(null)

    try {
      const calcRes = await fetch('/api/saju/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: data.year,
          month: data.month,
          day: data.day,
          hour: data.hour,
          minute: data.minute,
          calendarType: data.calendarType,
          isLeapMonth: data.isLeapMonth,
          gender: data.gender,
        }),
      })

      const calcData = await calcRes.json().catch(() => null)
      if (!calcRes.ok) {
        const msg =
          calcData && typeof calcData.error === 'string'
            ? calcData.error
            : '사주 계산에 실패했습니다.'
        setApiError(msg)
        setCalcError(msg)
        return
      }

      const result = calcData as FullSajuResult

      const traditional = getTraditionalInterpretation(result, data.gender)
      const context = toTraditionalContextText(traditional, 500)

      setFullResult(result)
      setTraditionalResult(traditional)
      setTraditionalContext(context)
      setAppState('result')
      trackAnalysis('사주분석')

      try {
        const saveRes = await fetch('/api/result/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData: data,
            sajuData: result,
            traditionalData: traditional,
            aiInterpretations: {},
          }),
        })

        if (saveRes.ok) {
          const saveData = await saveRes.json()
          if (typeof saveData.id === 'string') {
            setResultId(saveData.id)
          }
        } else {
          const saveData = await saveRes.json().catch(() => null)
          setApiError((saveData && typeof saveData.error === 'string' && saveData.error) || '서버 연결에 실패했습니다')
        }
      } catch (err) {
        setApiError(err instanceof Error ? err.message : '서버 연결에 실패했습니다')
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : '서버 연결에 실패했습니다')
      setCalcError(err instanceof Error ? err.message : '사주 계산 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function handleRetry() {
    if (!formData || loading) return
    setApiError(null)
    handleFormSubmit(formData)
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
          traditionalContext: traditionalContext || undefined,
          traditionalResult: traditionalResult || undefined,
          formData: formData || undefined,
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

  // STT transcript → followUpQuestion 동기화
  useEffect(() => {
    const recognized = `${transcript} ${interimTranscript}`.trim()
    if (recognized) {
      setFollowUpQuestion(recognized)
    }
  }, [transcript, interimTranscript])

  useEffect(() => {
    if (document.querySelector('script[src*="portone"]')) return
    const script = document.createElement('script')
    script.src = 'https://cdn.portone.io/v2/browser-sdk.js'
    script.async = true
    document.head.appendChild(script)
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus !== 'authenticated') {
      setCheckinStatus(null)
      return
    }
    fetchCheckinStatus()
  }, [fetchCheckinStatus, sessionStatus])

  function handleMicToggle() {
    if (isListening) {
      stopListening()
      return
    }
    resetTranscript()
    startListening()
  }

  function handleShare() {
    const targetUrl = resultUrl || window.location.href
    navigator.clipboard.writeText(targetUrl).then(() => {
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
      link.download = `\uC0AC\uC8FC\uD574_\uC0AC\uC8FC\uACB0\uACFC${name}_${new Date().toISOString().slice(0, 10)}.png`
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
          new TextRun({ text: '사주해 사주분석', bold: true, size: 36, font: 'Malgun Gothic' }),
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
          new TextRun({ text: '사주팔자 (四柱八字)', bold: true, font: 'Malgun Gothic' }),
        ] }),
        pillarTable,
        new Paragraph({ spacing: { before: 100, after: 100 }, children: [] }),

        // \uC624\uD589
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
          new TextRun({ text: '오행 분포 (五行)', bold: true, font: 'Malgun Gothic' }),
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
          new TextRun({ text: '일간 강약 · 용신', bold: true, font: 'Malgun Gothic' }),
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

        // 십신 분석
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
          new TextRun({ text: '십신 분석 (十神)', bold: true, font: 'Malgun Gothic' }),
        ] }),
        new Paragraph({ spacing: { after: 60 }, children: [
          new TextRun({ text: [
            `비겁: ${(fullResult.sipsin.summary.비견 || 0) + (fullResult.sipsin.summary.겁재 || 0)}개`,
            `식상: ${(fullResult.sipsin.summary.식신 || 0) + (fullResult.sipsin.summary.상관 || 0)}개`,
            `재성: ${(fullResult.sipsin.summary.편재 || 0) + (fullResult.sipsin.summary.정재 || 0)}개`,
            `관성: ${(fullResult.sipsin.summary.편관 || 0) + (fullResult.sipsin.summary.정관 || 0)}개`,
            `인성: ${(fullResult.sipsin.summary.편인 || 0) + (fullResult.sipsin.summary.정인 || 0)}개`,
          ].join('  |  '), size: 22 }),
        ] }),
        new Paragraph({ spacing: { after: 60 }, children: [
          new TextRun({ text: `년간: ${fullResult.sipsin.yearStem}  |  월간: ${fullResult.sipsin.monthStem}  |  일지: ${fullResult.sipsin.dayBranch}  |  시간: ${fullResult.sipsin.hourStem}`, size: 20, color: '666666' }),
        ] }),
        new Paragraph({ spacing: { before: 100, after: 100 }, children: [] }),

        // 올해 운세
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
          new TextRun({ text: `${new Date().getFullYear()}년 운세`, bold: true, font: 'Malgun Gothic' }),
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
            new TextRun({ text: 'AI 종합 해석', bold: true, font: 'Malgun Gothic' }),
          ] }),
          new Paragraph({ children: [
            new TextRun({ text: aiInterpretation, size: 20, color: '333333' }),
          ] }),
        )
      }

      // 푸터
      sections.push(
        new Paragraph({ spacing: { before: 300 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: `${new Date().toISOString().slice(0, 10)} | sajuhae.vercel.app`, size: 16, color: 'AAAAAA' }),
        ] }),
      )

      const KR_FONT = 'Malgun Gothic'
      const doc = new Document({
        styles: {
          default: {
            document: { run: { font: KR_FONT } },
            title: { run: { font: KR_FONT } },
            heading1: { run: { font: KR_FONT } },
            heading2: { run: { font: KR_FONT } },
            heading3: { run: { font: KR_FONT } },
          },
        },
        sections: [{ children: sections }],
      })
      const blob = await Packer.toBlob(doc)
      const name = formData?.name ? `_${formData.name}` : ''
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `사주해_사주결과${name}_${new Date().toISOString().slice(0, 10)}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('워드 문서 저장 중 오류가 발생했습니다.')
    } finally {
      setSaveDocxLoading(false)
    }
  }

  async function handlePremiumReport(tier: ReportTier = 'basic') {
    if (!fullResult || !formData || premiumLoadingTier) return

    const plan = tier === 'pro' ? 'premium_report_pro' : 'premium_report'
    const planName = tier === 'pro' ? '프로페셔널 종합 리포트' : '프리미엄 종합 리포트'
    const amount = tier === 'pro' ? 25000 : 9900

    setPremiumLoadingTier(tier)
    setPremiumDownloadUrls((prev) => ({ ...prev, [tier]: null }))
    setPremiumError(null)

    try {
      const isGuest = !session
      let guestEmail = ''

      if (isGuest) {
        const input = window.prompt('프리미엄 리포트 결제를 위해 이메일 주소를 입력해 주세요.')
        if (!input) {
          setPremiumError('이메일 입력이 필요합니다.')
          return
        }
        const trimmed = input.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          setPremiumError('올바른 이메일 형식을 입력해 주세요.')
          return
        }
        guestEmail = trimmed
      }

      const prepRes = await fetch('/api/portone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          ...(isGuest ? { guestEmail } : {}),
        }),
      })

      if (!prepRes.ok) {
        const prepData = await prepRes.json()
        setPremiumError(prepData.error ?? '결제 준비에 실패했습니다.')
        return
      }

      const paymentData = await prepRes.json()
      if (!window.PortOne) {
        setPremiumError('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.')
        return
      }

      const response = await window.PortOne.requestPayment({
        storeId: paymentData.storeId,
        channelKey: paymentData.channelKey,
        paymentId: paymentData.paymentId,
        orderName: paymentData.orderName,
        totalAmount: paymentData.totalAmount,
        currency: paymentData.currency,
        payMethod: 'CARD',
        redirectUrl: window.location.href,
        customer: {
          email: session?.user?.email || guestEmail || undefined,
          fullName: session?.user?.name || undefined,
        },
        customData: JSON.stringify({ userId: paymentData.userId, plan }),
      })

      if (response?.code) {
        const isCanceled = response.code === 'PAY_PROCESS_CANCELED' || response.code === 'PAY_PROCESS_ABORTED'
        setPremiumError(isCanceled ? '결제가 취소되었습니다.' : (response.message ?? '결제 처리 중 오류가 발생했습니다.'))
        return
      }

      const verifyRes = await fetch('/api/portone/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: paymentData.paymentId, isGuest }),
      })

      if (!verifyRes.ok) {
        setPremiumError('결제 검증에 실패했습니다. 다시 시도해 주세요.')
        return
      }

      trackPurchase({
        paymentId: paymentData.paymentId,
        planName,
        amount,
      })

      const generateRes = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sajuData: fullResult,
          formData,
          traditionalContext: traditionalContext || undefined,
          paymentId: paymentData.paymentId,
          tier,
        }),
      })

      const generateData = await generateRes.json()
      if (!generateRes.ok) {
        setPremiumError(generateData.error ?? '리포트 생성에 실패했습니다.')
        return
      }

      if (typeof generateData.downloadUrl === 'string') {
        setPremiumDownloadUrls((prev) => ({ ...prev, [tier]: generateData.downloadUrl }))
      }
    } catch {
      setPremiumError('프리미엄 리포트 처리 중 네트워크 오류가 발생했습니다.')
    } finally {
      setPremiumLoadingTier(null)
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
    setTraditionalResult(null)
    setTraditionalContext('')
    setChatHistory([])
    setFollowUpQuestion('')
    setActiveTab('사주')
    setViewMode('simple')
    setResultId(null)
    setPremiumLoadingTier(null)
    setPremiumDownloadUrls({ basic: null, pro: null })
    setPremiumError(null)
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

  function renderSimple() {
    if (!fullResult) return null
    const dayElement = fullResult.saju.dayPillar.element
    const dayColor = OHENG_COLORS[dayElement] ?? '#94a3b8'
    const ratingEmoji = fullResult.yearlyFortune.rating === '길' ? '🟢' : fullResult.yearlyFortune.rating === '흉' ? '🔴' : '🟡'
    const strengthColor = fullResult.ilganStrength.strength === '신강' ? '#3b82f6' : '#f97316'

    return (
      <div className="animate-fadeIn space-y-4">
        <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <div className="mb-4">
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>나의 일간</div>
            <div className="text-5xl font-black mb-1" style={{ color: dayColor, textShadow: `0 4px 12px ${dayColor}40` }}>
              {fullResult.saju.dayPillar.heavenlyStemHanja}
            </div>
            <div className="text-sm font-bold" style={{ color: dayColor }}>
              {fullResult.saju.dayPillar.heavenlyStem} · {dayElement}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>강약</div>
              <div className="text-lg font-bold" style={{ color: strengthColor }}>
                {fullResult.ilganStrength.strength}
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>용신</div>
              <div className="text-lg font-bold" style={{ color: 'var(--text-accent)' }}>
                {fullResult.yongsin.yongsin}
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>올해 운세</div>
              <div className="text-lg font-bold">
                {ratingEmoji} {fullResult.yearlyFortune.rating}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>오행 분포</div>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden">
              {(['목', '화', '토', '금', '수'] as const).map(el => {
                const count = fullResult.oheng.counts[el] ?? 0
                const color = OHENG_COLORS[el] ?? '#94a3b8'
                return (
                  <div
                    key={el}
                    style={{
                      flex: Math.max(count, 0.3),
                      background: count === 0 ? 'var(--bg-secondary)' : color,
                      opacity: count === 0 ? 0.3 : 0.85,
                    }}
                    title={`${el}: ${count}`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between mt-1">
              {(['목', '화', '토', '금', '수'] as const).map(el => (
                <span key={el} className="text-xs" style={{ color: OHENG_COLORS[el] ?? '#94a3b8' }}>
                  {el}{fullResult.oheng.counts[el] ?? 0}
                </span>
              ))}
            </div>
          </div>

          {aiInterpretation && (
            <div className="rounded-xl p-3 mb-4" style={{ background: 'var(--bg-secondary)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>🤖 AI 한줄 요약</div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {aiInterpretation.slice(0, 120)}{aiInterpretation.length > 120 ? '...' : ''}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setViewMode('detail')}
            className="py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            📊 상세 보기
          </button>
          <a
            href="/saju/music"
            className="py-2.5 rounded-xl text-sm font-medium text-center block"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            🎵 사주 음악
          </a>
        </div>
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
            {session && (
              <div
                className="mx-4 mb-4 rounded-2xl p-4 animate-fadeIn"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>오늘의 출석 체크</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-accent)' }}>
                      {checkinStatus?.todayCheckin
                        ? <>🔥 연속 {checkinStatus.streak}일</>
                        : '출석 체크로 연속 보상을 받아보세요'}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                      7일 +2 · 30일 +5 · 100일 +10 크레딧
                    </p>
                  </div>
                  {checkinStatus?.todayCheckin ? (
                    <div
                      className="px-3 py-2 rounded-xl text-xs font-bold animate-pulse"
                      style={{
                        background: 'rgba(245, 158, 11, 0.16)',
                        color: 'var(--text-accent)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                      }}
                    >
                      출석 완료
                    </div>
                  ) : (
                    <button
                      onClick={handleCheckin}
                      disabled={checkinLoading || checkinSubmitting}
                      className="px-4 py-2 rounded-xl text-sm font-bold hover-scale disabled:cursor-not-allowed"
                      style={{
                        background: 'var(--accent)',
                        color: 'var(--accent-text)',
                      }}
                    >
                      {checkinSubmitting ? '처리 중...' : '출석 체크하기'}
                    </button>
                  )}
                </div>
              </div>
            )}
            {calcError && (
              <div className="mx-4 mb-8 bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm text-center">
                {calcError}
              </div>
            )}
          </>
        )}

        {loading && <AnalysisLoading onCancel={() => { abortRef.current?.abort(); setLoading(false) }} />}

        {apiError && !loading && (
          <div className="mx-4 mb-8">
            <ErrorRetry error={apiError} onRetry={handleRetry} />
          </div>
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
                  <h1 className="font-serif-kr text-3xl font-bold" style={{ color: 'var(--text-accent)' }}>사주해</h1>
                  <p className="font-serif-kr text-sm tracking-widest" style={{ color: 'var(--text-muted)' }}>AI 사주팔자</p>
                </div>
                {/* View Mode Toggle */}
                <div className="flex gap-1 rounded-full p-0.5" style={{ background: 'var(--bg-secondary)' }}>
                  <button
                    onClick={() => setViewMode('simple')}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: viewMode === 'simple' ? 'var(--accent)' : 'transparent',
                      color: viewMode === 'simple' ? 'var(--accent-text)' : 'var(--text-muted)',
                    }}
                  >
                    단순
                  </button>
                  <button
                    onClick={() => setViewMode('summary')}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: viewMode === 'summary' ? 'var(--accent)' : 'transparent',
                      color: viewMode === 'summary' ? 'var(--accent-text)' : 'var(--text-muted)',
                    }}
                  >
                    간략
                  </button>
                  <button
                    onClick={() => setViewMode('detail')}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: viewMode === 'detail' ? 'var(--accent)' : 'transparent',
                      color: viewMode === 'detail' ? 'var(--accent-text)' : 'var(--text-muted)',
                    }}
                  >
                    상세
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'simple' ? renderSimple() : viewMode === 'summary' ? renderSummary() : (
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
                      <DailyFortuneCard
                        stem={fullResult.saju.dayPillar.heavenlyStem}
                        branch={fullResult.saju.dayPillar.earthlyBranch}
                      />
                      <DaeunTimeline result={fullResult.daeun} />
                      <FortuneCard yearlyFortune={fullResult.yearlyFortune} monthlyFortune={fullResult.monthlyFortune} />
                    </>
                  )}

                  {activeTab === '해석' && (
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
                          <div
                            className="rounded-2xl p-4"
                            style={{
                              background: 'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(217,119,6,0.2) 100%)',
                              border: '1px solid rgba(251,191,36,0.35)',
                            }}
                          >
                            <div className="text-sm font-bold mb-1" style={{ color: '#f59e0b' }}>
                              프리미엄 리포트
                            </div>
                            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                              기본(₩9,900): 7개 카테고리 심층 분석 / 프로(₩25,000): 대운 10년 + 세운 3년 + 인생 조언 포함
                            </p>
                            <button
                              onClick={() => handlePremiumReport('basic')}
                              disabled={premiumLoadingTier !== null}
                              className="w-full font-bold py-3.5 px-4 rounded-xl text-sm transition-all hover:scale-[1.01] disabled:cursor-not-allowed"
                              style={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                                color: '#1f2937',
                                boxShadow: '0 6px 18px rgba(245, 158, 11, 0.28)',
                              }}
                            >
                              {premiumLoadingTier === 'basic'
                                ? '기본 리포트 생성 중...'
                                : '📄 기본 리포트 ₩9,900'}
                            </button>

                            <button
                              onClick={() => handlePremiumReport('pro')}
                              disabled={premiumLoadingTier !== null}
                              className="mt-2 w-full font-bold py-3.5 px-4 rounded-xl text-sm transition-all hover:scale-[1.01] disabled:cursor-not-allowed"
                              style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                                color: '#fff7ed',
                                boxShadow: '0 6px 18px rgba(180, 83, 9, 0.35)',
                              }}
                            >
                              {premiumLoadingTier === 'pro'
                                ? '프로 리포트 생성 중...'
                                : '📘 프로 리포트 ₩25,000'}
                            </button>

                            {premiumDownloadUrls.basic && (
                              <a
                                href={premiumDownloadUrls.basic}
                                className="mt-2 block w-full text-center font-bold py-3 rounded-xl text-sm"
                                style={{
                                  background: 'rgba(255,255,255,0.85)',
                                  color: '#92400e',
                                  border: '1px solid rgba(217,119,6,0.35)',
                                }}
                              >
                                ⬇️ 기본 리포트 다운로드
                              </a>
                            )}

                            {premiumDownloadUrls.pro && (
                              <a
                                href={premiumDownloadUrls.pro}
                                className="mt-2 block w-full text-center font-bold py-3 rounded-xl text-sm"
                                style={{
                                  background: 'rgba(120,53,15,0.85)',
                                  color: '#ffedd5',
                                  border: '1px solid rgba(251,191,36,0.35)',
                                }}
                              >
                                ⬇️ 프로 리포트 다운로드
                              </a>
                            )}

                            {premiumError && (
                              <div className="mt-2 text-xs" style={{ color: '#ef4444' }}>
                                {premiumError}
                              </div>
                            )}
                          </div>

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
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={followUpQuestion}
                              onChange={e => setFollowUpQuestion(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleFollowUp() }}
                              placeholder={isListening ? '말씀하세요...' : '추가 질문을 입력하세요...'}
                              className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors"
                              style={{
                                background: 'var(--bg-secondary)',
                                border: `1px solid ${isListening ? '#ef4444' : 'var(--border-color)'}`,
                                color: 'var(--text-primary)',
                              }}
                              disabled={followUpLoading}
                            />
                            <button
                              type="button"
                              onClick={handleMicToggle}
                              disabled={followUpLoading}
                              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-all text-base disabled:cursor-not-allowed"
                              style={{
                                background: isListening ? 'rgba(239,68,68,0.15)' : 'var(--bg-secondary)',
                                border: `1px solid ${isListening ? 'rgba(239,68,68,0.4)' : 'var(--border-color)'}`,
                                color: isListening ? '#ef4444' : 'var(--text-muted)',
                              }}
                              title={isListening ? '음성 입력 중지' : '음성으로 질문하기'}
                            >
                              {isListening ? (
                                <span className="animate-pulse">⏺</span>
                              ) : '🎤'}
                            </button>
                            <button
                              onClick={handleFollowUp}
                              disabled={followUpLoading || !followUpQuestion.trim()}
                              className="shrink-0 font-bold px-4 py-2 rounded-lg transition-colors text-sm hover-scale disabled:cursor-not-allowed"
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

            {/* ═══ 액션 버튼 (2열 그리드) ═══ */}
            <div className="mt-6 space-y-2">
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>더 알아보기</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/saju/music"
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#f8fafc' }}
                >
                  🎵 사주 음악
                </a>
                <button
                  onClick={() => setShowMovie(true)}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#f8fafc' }}
                >
                  🎬 운명 애니메이션
                </button>
                <button
                  onClick={() => setShowAnimation(true)}
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#1e293b' }}
                >
                  ✨ 운명 스토리
                </button>
                <a
                  href="/gunghap"
                  className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.3)' }}
                >
                  💑 궁합 보기
                </a>
              </div>
              <ShareCard fullResult={fullResult} name={formData?.name || ''} />
            </div>

            {/* 다운로드 + 공유 + 다시보기 버튼 */}
            <div className="grid grid-cols-2 gap-3 mt-3">
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

    {checkinToast && (
      <div
        className="fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-bold shadow-lg animate-fadeIn z-50"
        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
      >
        {checkinToast}
      </div>
    )}

    {/* === Hidden Download Card (off-screen, captured by html2canvas) === */}
    {fullResult && (
      <div ref={downloadRef} style={{
        position: 'fixed', left: '-10000px', top: 0, width: '420px',
        background: '#0f172a', padding: '32px 24px',
        fontFamily: '"Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fbbf24', letterSpacing: '2px' }}>
            {'사주해'}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', letterSpacing: '4px', marginTop: '2px' }}>
            {'AI 사주분석'}
          </div>
          {formData && (
            <div style={{ marginTop: '12px', color: '#94a3b8', fontSize: '13px' }}>
              {formData.name && <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>{formData.name}</span>}
              {formData.name && ' · '}
              {formData.gender === 'male' ? '남' : '여'}{' · '}
              {formData.year}{'년 '}{formData.month}{'월 '}{formData.day}{'일 '}{formData.hour}{'시'}
              {formData.calendarType === 'lunar' && ' (음력)'}
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
            {'오행 분포'}
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
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{'일간 강약'}</div>
            <div style={{
              fontSize: '20px', fontWeight: 'bold', marginTop: '4px',
              color: fullResult.ilganStrength.strength === '신강' ? '#3b82f6' : '#f97316',
            }}>{fullResult.ilganStrength.strength}</div>
          </div>
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '14px', border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{'용신 (用神)'}</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24', marginTop: '4px' }}>
              {fullResult.yongsin.yongsin}
            </div>
          </div>
        </div>

        {/* \uC62C\uD574 \uC6B4\uC138 */}
        <div style={{ background: '#1e293b', borderRadius: '12px', padding: '14px', border: '1px solid #334155', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {new Date().getFullYear()}{'년 운세'}
            </span>
            <span style={{
              fontSize: '16px', fontWeight: 'bold',
              color: fullResult.yearlyFortune.rating === '길' ? '#4ade80'
                : fullResult.yearlyFortune.rating === '흉' ? '#f87171' : '#fbbf24',
            }}>
              {'● '}
              {fullResult.yearlyFortune.rating}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
            {fullResult.yearlyFortune.description}
          </div>
        </div>

        {/* AI \uC694\uC57D */}
        {aiInterpretation && (
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #334155', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '8px' }}>
              {'AI 종합 해석'}
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {aiInterpretation}
            </div>
          </div>
        )}

        {/* 카카오톡 공유 */}
        <button
          onClick={() => {
            if (fullResult && formData) {
              shareSajuResult({
                name: formData.name || '사용자',
                dayPillar: `${fullResult.saju.dayPillar.heavenlyStemHanja || fullResult.saju.dayPillar.heavenlyStem}${fullResult.saju.dayPillar.earthlyBranchHanja || fullResult.saju.dayPillar.earthlyBranch}`,
                yongsin: fullResult.yongsin.yongsin,
                summary: aiInterpretation?.slice(0, 100),
                resultUrl: resultUrl ?? undefined,
                resultId: resultId ?? undefined,
              })
              trackShare('kakao', 'saju')
            }
          }}
          style={{
            width: '100%',
            padding: '12px',
            background: '#FEE500',
            color: '#191919',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1C4.58 1 1 3.87 1 7.35c0 2.14 1.39 4.03 3.5 5.12l-.9 3.28c-.08.28.25.5.48.33l3.84-2.54c.35.04.71.06 1.08.06 4.42 0 8-2.87 8-6.25S13.42 1 9 1z" fill="#191919"/>
          </svg>
          카카오톡으로 공유하기
        </button>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: '#475569' }}>
            {new Date().toISOString().slice(0, 10)}
          </span>
          <span style={{ fontSize: '10px', color: '#475569' }}>
            sajuhae.vercel.app
          </span>
        </div>
      </div>
    )}

    {/* === 운명 스토리 애니메이션 플레이어 === */}
    {showAnimation && fullResult && formData && (
      <SajuAnimationPlayer
        fullResult={fullResult}
        formData={formData}
        traditionalResult={traditionalResult}
        aiInterpretation={aiInterpretation}
        onClose={() => setShowAnimation(false)}
      />
    )}

    {/* === 운명 애니메이션 플레이어 === */}
    {showMovie && fullResult && formData && (
      <SajuMoviePlayer
        fullResult={fullResult}
        formData={formData}
        traditionalResult={traditionalResult}
        aiInterpretation={aiInterpretation}
        onClose={() => setShowMovie(false)}
      />
    )}

    </>
  )
}

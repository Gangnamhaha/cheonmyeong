'use client'

import { useState, useRef, useEffect } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const EXAMPLE_QUESTIONS = [
  '사주에서 오행이 뭔가요?',
  '용신이 뭔지 쉽게 알려주세요',
  '올해 갑진년의 특징은?',
  '음양의 조화란 무엇인가요?',
]

export default function SajuChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition()
  const {
    isSpeaking,
    isSupported: isTtsSupported,
    speak,
    stop,
  } = useSpeechSynthesis()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const recognizedText = `${transcript} ${interimTranscript}`.trim()
    if (recognizedText) {
      setInput(recognizedText)
    }
  }, [interimTranscript, transcript])

  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingMessageIndex(null)
    }
  }, [isSpeaking])

  async function sendMessage(question?: string) {
    const text = (question ?? input).trim()
    if (!text || loading) return

    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const errMsg = (data as { error?: string }).error ?? 'AI 응답에 실패했습니다.'
        setMessages([...newMessages, { role: 'assistant', content: errMsg }])
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setMessages([...newMessages, { role: 'assistant', content: '응답을 읽을 수 없습니다.' }])
        setLoading(false)
        return
      }

      const decoder = new TextDecoder()
      let assistantText = ''

      setMessages([...newMessages, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        assistantText += decoder.decode(value, { stream: true })
        setMessages([...newMessages, { role: 'assistant', content: assistantText }])
      }

      setLoading(false)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages([...newMessages, { role: 'assistant', content: '네트워크 오류가 발생했습니다.' }])
      }
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleMicToggle() {
    if (isListening) {
      stopListening()
      return
    }

    resetTranscript()
    startListening()
  }

  function handleSpeakToggle(index: number, content: string) {
    if (speakingMessageIndex === index && isSpeaking) {
      stop()
      setSpeakingMessageIndex(null)
      return
    }

    setSpeakingMessageIndex(index)
    speak(content)
  }

  // Collapsed state — just the toggle button
  if (!isOpen) {
    return (
      <div className="mx-4 mb-8">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-2xl p-4 hover-scale theme-transition"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔮</span>
            <div className="text-left flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                사주에 대해 궁금한 점이 있나요?
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                AI 명리학 전문가에게 물어보세요
              </p>
            </div>
            <span className="text-lg" style={{ color: 'var(--text-muted)' }}>💬</span>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-8">
      <div
        className="rounded-2xl overflow-hidden theme-transition"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔮</span>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                AI 명리학 상담
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                사주·오행·궁합 무엇이든 물어보세요
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover-scale"
            style={{ color: 'var(--text-muted)' }}
            aria-label="채팅 닫기"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          className="px-4 py-3 space-y-3 overflow-y-auto scrollbar-hide"
          style={{ maxHeight: '320px', minHeight: '120px' }}
        >
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>
                사주에 대해 궁금한 점을 자유롭게 물어보세요!
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 rounded-full text-xs hover-scale theme-transition"
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-1.5 ${msg.role === 'assistant' ? 'max-w-[92%]' : ''}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={
                    msg.role === 'user'
                      ? {
                          background: 'var(--accent)',
                          color: 'var(--accent-text)',
                          borderBottomRightRadius: '4px',
                        }
                      : {
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          borderBottomLeftRadius: '4px',
                        }
                  }
                >
                  {msg.content || (loading && i === messages.length - 1 && (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '300ms' }} />
                    </span>
                  ))}
                </div>
                {isTtsSupported && msg.role === 'assistant' && msg.content && (
                  <button
                    type="button"
                    onClick={() => handleSpeakToggle(i, msg.content)}
                    className="h-7 w-7 rounded-full text-xs hover-scale theme-transition"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                    }}
                    aria-label={speakingMessageIndex === i && isSpeaking ? '음성 읽기 중지' : '메시지 읽기'}
                    title={speakingMessageIndex === i && isSpeaking ? '멈추기' : '읽어주기'}
                  >
                    {speakingMessageIndex === i && isSpeaking ? '🔇' : '🔊'}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="px-3 py-2.5"
          style={{ borderTop: '1px solid var(--border-color)' }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="사주에 대해 질문해보세요..."
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              disabled={loading}
            />
            {isSpeechSupported && (
              <button
                type="button"
                onClick={handleMicToggle}
                disabled={loading}
                className={`px-2.5 py-2.5 rounded-xl text-sm transition-all ${isListening ? 'animate-pulse' : 'hover-scale'} disabled:opacity-40 disabled:cursor-not-allowed`}
                style={{
                  background: isListening ? 'rgba(239, 68, 68, 0.18)' : 'var(--bg-secondary)',
                  color: isListening ? '#ef4444' : 'var(--text-muted)',
                  border: `1px solid ${isListening ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)'}`,
                  boxShadow: isListening ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                }}
                aria-label={isListening ? '음성 입력 중지' : '음성 입력 시작'}
                title={isListening ? '음성 입력 중지' : '음성 입력'}
              >
                🎤
              </button>
            )}
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-medium hover-scale transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: input.trim() ? 'var(--accent)' : 'var(--bg-secondary)',
                color: input.trim() ? 'var(--accent-text)' : 'var(--text-muted)',
              }}
            >
              {loading ? '···' : '전송'}
            </button>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setInput('') }}
              className="w-full text-xs mt-2 py-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              대화 초기화
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

declare global {
  interface BrowserSpeechRecognitionConstructor {
    new (): BrowserSpeechRecognition
  }

  interface BrowserSpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null
    onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    start: () => void
    stop: () => void
    abort: () => void
  }

  interface BrowserSpeechRecognitionResultList {
    length: number
    [index: number]: BrowserSpeechRecognitionResult
  }

  interface BrowserSpeechRecognitionResult {
    isFinal: boolean
    [index: number]: BrowserSpeechRecognitionAlternative
  }

  interface BrowserSpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }

  interface BrowserSpeechRecognitionEvent extends Event {
    resultIndex: number
    results: BrowserSpeechRecognitionResultList
  }

  interface BrowserSpeechRecognitionErrorEvent extends Event {
    error: 'no-speech' | 'audio-capture' | 'not-allowed' | string
  }

  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
  }
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean
  /** Maximum listening duration in ms (default: 60000 = 60s) */
  maxDuration?: number
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { continuous = true, maxDuration = 60_000 } = options
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Whether the user explicitly wants to be listening (vs. browser auto-stop). */
  const wantListeningRef = useRef(false)

  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  }, [])

  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') {
      return
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) {
      return
    }

    const recognition = new SpeechRecognitionClass()
    recognition.lang = 'ko-KR'
    recognition.continuous = continuous
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let finalChunk = ''
      let interimChunk = ''

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const value = result[0]?.transcript.trim()
        if (!value) {
          continue
        }

        if (result.isFinal) {
          finalChunk += `${value} `
        } else {
          interimChunk += `${value} `
        }
      }

      if (finalChunk) {
        setTranscript((prev) => `${prev} ${finalChunk}`.trim())
      }

      setInterimTranscript(interimChunk.trim())
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'not-allowed') {
        recognition.stop()
      }
      setIsListening(false)
      setInterimTranscript('')
    }

    recognition.onend = () => {
      setInterimTranscript('')
      // Auto-restart if the user still wants to listen (browser stops on silence)
      if (wantListeningRef.current) {
        try {
          recognition.start()
          return
        } catch {
          // Failed to restart — fall through and mark as stopped
        }
      }
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      wantListeningRef.current = false
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.abort()
      recognitionRef.current = null
    }
  }, [continuous, isSupported])

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition || isListening) {
      return
    }

    try {
      setInterimTranscript('')
      wantListeningRef.current = true
      recognition.start()
      setIsListening(true)

      // Auto-stop after maxDuration
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        wantListeningRef.current = false
        recognition.stop()
        setIsListening(false)
        setInterimTranscript('')
      }, maxDuration)
    } catch {
      wantListeningRef.current = false
      setIsListening(false)
    }
  }, [isListening, maxDuration])

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) {
      return
    }

    wantListeningRef.current = false
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    recognition.stop()
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}

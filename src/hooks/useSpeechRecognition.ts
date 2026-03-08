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
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { continuous = false } = options
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)

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
      setIsListening(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition

    return () => {
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
      recognition.start()
      setIsListening(true)
    } catch {
      setIsListening(false)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) {
      return
    }

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

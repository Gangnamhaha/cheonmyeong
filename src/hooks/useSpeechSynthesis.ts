'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const unlockedRef = useRef(false)

  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance)
  }, [])

  const isIOS = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    return /iPhone|iPad|iPod/.test(navigator.userAgent)
  }, [])

  // Detect mobile device (set via useEffect to avoid SSR hydration mismatch)
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') {
      return
    }

    const synth = window.speechSynthesis

    const selectKoreanVoice = () => {
      const voices = synth.getVoices()
      if (voices.length === 0) {
        return
      }

      const koreanVoice =
        voices.find((item) => item.lang.toLowerCase() === 'ko-kr')
        ?? voices.find((item) => item.lang.toLowerCase().startsWith('ko'))
        ?? null

      setVoice(koreanVoice)
    }

    selectKoreanVoice()
    synth.addEventListener('voiceschanged', selectKoreanVoice)

    return () => {
      synth.removeEventListener('voiceschanged', selectKoreanVoice)
      synth.cancel()
      utteranceRef.current = null
      if (keepAliveRef.current) clearInterval(keepAliveRef.current)
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }, [isSupported])

  const clearKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current)
      keepAliveRef.current = null
    }
  }, [])

  /**
   * Unlock TTS for mobile browsers.
   * Must be called inside a user gesture handler (click/tap).
   * Speaks a short utterance to satisfy the browser's autoplay
   * policy so subsequent programmatic speak() calls work.
   */
  const unlock = useCallback(() => {
    if (!isSupported || typeof window === 'undefined' || unlockedRef.current) {
      return
    }

    const synth = window.speechSynthesis
    // Use actual pronounceable text — empty/space text is ignored by many TTS engines
    const utterance = new SpeechSynthesisUtterance('.')
    utterance.lang = 'ko-KR'
    utterance.volume = 0.01
    utterance.rate = 5
    if (voice) utterance.voice = voice
    utterance.onend = () => { unlockedRef.current = true }
    utterance.onerror = () => { unlockedRef.current = true }
    synth.speak(utterance)
  }, [isSupported, voice])

  const stop = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') {
      return
    }

    window.speechSynthesis.cancel()
    utteranceRef.current = null
    clearKeepAlive()
    setIsSpeaking(false)
    setIsPaused(false)
  }, [isSupported, clearKeepAlive])

  const speak = useCallback((text: string) => {
    if (!isSupported || typeof window === 'undefined') {
      return
    }

    const normalized = text.trim()
    if (!normalized) {
      return
    }

    const synth = window.speechSynthesis
    // Only cancel if there's active/pending speech.
    // Chrome Android bug: calling cancel() when idle can block the next speak().
    if (synth.speaking || synth.pending) {
      synth.cancel()
    }
    clearKeepAlive()

    const utterance = new SpeechSynthesisUtterance(normalized)
    utterance.lang = 'ko-KR'
    utterance.rate = 1.0
    utterance.pitch = 1.0

    if (voice) {
      utterance.voice = voice
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      utteranceRef.current = null
      clearKeepAlive()
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      utteranceRef.current = null
      clearKeepAlive()
    }

    utteranceRef.current = utterance
    synth.speak(utterance)

    // iOS workaround: OS pauses long utterances after ~15s.
    // Periodically pause+resume to keep the speech alive.
    if (isIOS) {
      keepAliveRef.current = setInterval(() => {
        if (synth.speaking && !synth.paused) {
          synth.pause()
          synth.resume()
        }
      }, 10000)
    }
  }, [isSupported, voice, isIOS, clearKeepAlive])

  const pause = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') {
      return
    }

    const synth = window.speechSynthesis
    if (!synth.speaking || synth.paused) {
      return
    }

    synth.pause()
    setIsPaused(true)
  }, [isSupported])

  const resume = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') {
      return
    }

    const synth = window.speechSynthesis
    if (!synth.paused) {
      return
    }

    synth.resume()
    setIsPaused(false)
  }, [isSupported])

  return {
    isSpeaking,
    isPaused,
    isSupported,
    isMobile,
    speak,
    stop,
    pause,
    resume,
    unlock,
  }
}

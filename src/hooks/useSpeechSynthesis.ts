'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance)
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
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }, [isSupported])

  const stop = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') {
      return
    }

    window.speechSynthesis.cancel()
    utteranceRef.current = null
    setIsSpeaking(false)
    setIsPaused(false)
  }, [isSupported])

  const speak = useCallback((text: string) => {
    if (!isSupported || typeof window === 'undefined') {
      return
    }

    const normalized = text.trim()
    if (!normalized) {
      return
    }

    const synth = window.speechSynthesis
    synth.cancel()

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
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      utteranceRef.current = null
    }

    utteranceRef.current = utterance
    synth.speak(utterance)
  }, [isSupported, voice])

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
    speak,
    stop,
    pause,
    resume,
  }
}

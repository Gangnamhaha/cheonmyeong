'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Split long text into speakable chunks at sentence boundaries.
 * Mobile TTS engines silently fail on long utterances (~200-300 char limit on some devices).
 * All chunks are queued synchronously via synth.speak() to stay within user gesture context.
 */
function splitIntoChunks(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text]

  const sentences = text.split(/(?<=[.!?。\n])\s*/).filter(s => s.trim())
  if (sentences.length === 0) return [text]

  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if (current && (current.length + sentence.length) > maxLength) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current += (current ? ' ' : '') + sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())

  return chunks.length > 0 ? chunks : [text]
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  // Chrome GC bug: utterances get garbage-collected while speaking if not referenced,
  // causing onend to never fire. Keep ALL active utterances in a persistent ref.
  const activeUtterancesRef = useRef<SpeechSynthesisUtterance[]>([])
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const unlockedRef = useRef(false)
  // Reactive unlock state — drives re-renders so auto-narration useEffects
  // can gate on mobile TTS readiness.
  const [isUnlocked, setIsUnlocked] = useState(false)

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
      if (synth.speaking) synth.pause()
      synth.cancel()
      utteranceRef.current = null
      activeUtterancesRef.current = []
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
    utterance.onend = () => { unlockedRef.current = true; setIsUnlocked(true) }
    utterance.onerror = () => { unlockedRef.current = true; setIsUnlocked(true) }
    synth.speak(utterance)
  }, [isSupported, voice])

  const stop = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') {
      return
    }

    const synth = window.speechSynthesis
    // Pause before cancel prevents Chrome from hanging the TTS engine
    if (synth.speaking) synth.pause()
    synth.cancel()
    utteranceRef.current = null
    activeUtterancesRef.current = []
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

    // Mobile TTS engines silently fail on long text (~200-300 char limit).
    // Split into sentence-boundary chunks and queue all synchronously
    // so every synth.speak() call stays within the user gesture context.
    const chunks = splitIntoChunks(normalized, 200)

    // Chrome GC bug: store ALL utterances in a persistent ref to prevent
    // garbage collection while speaking (which kills onend callbacks).
    const utterances: SpeechSynthesisUtterance[] = []

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.lang = 'ko-KR'
      utterance.rate = 1.0
      utterance.pitch = 1.0

      if (voice) {
        utterance.voice = voice
      }

      // First chunk — mark speaking started + TTS unlocked
      if (index === 0) {
        utterance.onstart = () => {
          setIsSpeaking(true)
          setIsPaused(false)
          // If speak() succeeds, TTS is unlocked for this session
          if (!unlockedRef.current) {
            unlockedRef.current = true
            setIsUnlocked(true)
          }
        }
      }

      // Last chunk — mark speaking finished and release refs
      if (index === chunks.length - 1) {
        utterance.onend = () => {
          setIsSpeaking(false)
          setIsPaused(false)
          utteranceRef.current = null
          activeUtterancesRef.current = []
          clearKeepAlive()
        }
        utteranceRef.current = utterance
      }

      utterance.onerror = (e) => {
        // 'interrupted' / 'canceled' are normal when stop() is called
        if (e.error === 'interrupted' || e.error === 'canceled') return
        setIsSpeaking(false)
        setIsPaused(false)
        utteranceRef.current = null
        activeUtterancesRef.current = []
        clearKeepAlive()
      }

      utterances.push(utterance)
      synth.speak(utterance)
    })

    // Prevent GC of queued utterances
    activeUtterancesRef.current = utterances

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
    isUnlocked,
    speak,
    stop,
    pause,
    resume,
    unlock,
  }
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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
  // causing onend to never fire. Keep the active utterance in a persistent ref.
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const unlockedRef = useRef(false)
  // Monotonic session counter — each speak()/stop() increments it.
  // Sequential chunk playback checks this to abort stale chains.
  const speakSessionRef = useRef(0)
  // Reactive unlock state — drives re-renders so auto-narration useEffects
  // can gate on mobile TTS readiness.
  const [isUnlocked, setIsUnlocked] = useState(false)

  // Detect browser capabilities via useEffect to avoid SSR hydration mismatch.
  // SSR renders with false → client useEffect sets true → clean re-render.
  const [isSupported, setIsSupported] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setIsSupported(Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance))
    setIsIOS(/iPhone|iPad|iPod/.test(navigator.userAgent))
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
      speakSessionRef.current++
      if (synth.speaking) synth.pause()
      synth.cancel()
      utteranceRef.current = null
      activeUtteranceRef.current = null
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

    // Invalidate any ongoing sequential chunk chain
    speakSessionRef.current++
    const synth = window.speechSynthesis
    // Pause before cancel prevents Chrome from hanging the TTS engine
    if (synth.speaking) synth.pause()
    synth.cancel()
    utteranceRef.current = null
    activeUtteranceRef.current = null
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
    // Split into sentence-boundary chunks.
    const chunks = splitIntoChunks(normalized, 200)

    // New session — invalidates any previous sequential chain.
    const session = ++speakSessionRef.current

    // Sequential chunk playback: speak ONE chunk at a time, advance in onend.
    // Mobile browsers have limited speechSynthesis queue capacity —
    // queuing many utterances at once causes silent failure on Android/iOS.
    const speakChunk = (index: number) => {
      // Abort if session changed (stop() or new speak() was called)
      if (speakSessionRef.current !== session) return

      // All chunks finished — natural end
      if (index >= chunks.length) {
        setIsSpeaking(false)
        setIsPaused(false)
        utteranceRef.current = null
        activeUtteranceRef.current = null
        clearKeepAlive()
        return
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index])
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

      // Advance to next chunk on completion
      utterance.onend = () => {
        speakChunk(index + 1)
      }

      utterance.onerror = (e) => {
        // 'interrupted' / 'canceled' are normal when stop() is called
        if (e.error === 'interrupted' || e.error === 'canceled') return
        setIsSpeaking(false)
        setIsPaused(false)
        utteranceRef.current = null
        activeUtteranceRef.current = null
        clearKeepAlive()
      }

      // Chrome GC bug: keep active utterance referenced to prevent
      // garbage collection (which kills onend callbacks).
      activeUtteranceRef.current = utterance
      utteranceRef.current = utterance
      synth.speak(utterance)
    }

    // Start the first chunk (within user gesture context if applicable)
    speakChunk(0)

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

'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OHENG_COLORS } from '@/lib/oheng'
import { GENRE_CONFIGS, mapSajuToMusic, type MusicGenre, type SajuMusicInput, type SajuMusicParams } from '@/lib/saju-music'
import { SajuMusicEngine } from '@/lib/saju-music-engine'

type StoredResult = Partial<SajuMusicInput>

const STORAGE_KEYS = [
  'sajuhae-full-result',
  'sajuhae_full_result',
  'sajuhae-last-result',
  'sajuhae_result',
  'sajuResult',
  'fullResult',
] as const

const ELEMENTS = ['목', '화', '토', '금', '수'] as const

const GENRES = (Object.entries(GENRE_CONFIGS) as Array<[MusicGenre, (typeof GENRE_CONFIGS)[MusicGenre]]>).map(([id, config]) => ({
  id,
  ...config,
}))

function isMusicInput(value: unknown): value is SajuMusicInput {
  if (!value || typeof value !== 'object') return false
  const target = value as StoredResult
  return Boolean(target.saju && target.oheng && target.ilganStrength && target.yongsin && target.sipsin)
}

function parseStoredValue(raw: string | null): unknown {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getStoredSajuInput(): SajuMusicInput | null {
  if (typeof window === 'undefined') return null

  for (const key of STORAGE_KEYS) {
    const fromLocal = parseStoredValue(window.localStorage.getItem(key))
    if (isMusicInput(fromLocal)) return fromLocal

    const fromSession = parseStoredValue(window.sessionStorage.getItem(key))
    if (isMusicInput(fromSession)) return fromSession
  }

  return null
}

function createAiPrompt(params: SajuMusicParams): string {
  const parts = params.movements
    .map((movement) => `${movement.ageRange} ${movement.name.replace(/^\S+\s*/, '')}: ${movement.description}`)
    .join(' ')
  return `Korean traditional inspired cinematic ambient music, pentatonic melody, ${params.overall.mood}, key ${params.overall.key}, tempo ${params.overall.tempo} BPM. ${parts}`
}

export default function SajuMusicClient() {
  const engineRef = useRef<SajuMusicEngine | null>(null)
  const previousGenreRef = useRef<MusicGenre>('ambient')

  const [musicInput, setMusicInput] = useState<SajuMusicInput | null>(null)
  const [loadingInput, setLoadingInput] = useState(true)
  const [currentMovementIndex, setCurrentMovementIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [volume, setVolume] = useState(0.85)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>('ambient')

  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    const stored = getStoredSajuInput()
    setMusicInput(stored)
    setLoadingInput(false)
  }, [])

  const musicParams = useMemo(() => {
    if (!musicInput) return null
    return mapSajuToMusic(musicInput, selectedGenre)
  }, [musicInput, selectedGenre])

  const currentMovement = musicParams?.movements[currentMovementIndex] ?? null
  const progressPercent = totalDuration > 0 ? Math.min(100, (progress / totalDuration) * 100) : 0

  useEffect(() => {
    if (!musicParams) return
    setTotalDuration(musicParams.movements.reduce((sum, movement) => sum + movement.duration, 0))
  }, [musicParams])

  useEffect(() => {
    return () => {
      engineRef.current?.destroy()
      engineRef.current = null
    }
  }, [])

  const startComposition = useCallback(async () => {
    if (!musicParams) return

    setAudioError(null)
    if (!engineRef.current) {
      engineRef.current = new SajuMusicEngine()
    }

    try {
      await engineRef.current.play(musicParams, {
        onMovementChange: (index) => {
          setCurrentMovementIndex(index)
        },
        onProgress: (time, total) => {
          setProgress(time)
          setTotalDuration(total)
        },
        onComplete: () => {
          setIsRunning(false)
          setProgress(totalDuration)
          setCurrentMovementIndex(3)
        },
      })
      engineRef.current.setVolume(volume)
      setIsRunning(true)
      setProgress(0)
      setCurrentMovementIndex(0)
    } catch {
      setAudioError('브라우저 오디오 초기화에 실패했습니다. 사운드 권한을 확인해 주세요.')
      setIsRunning(false)
    }
  }, [musicParams, totalDuration, volume])

  useEffect(() => {
    if (previousGenreRef.current === selectedGenre) return
    previousGenreRef.current = selectedGenre
    if (!isRunning) return

    engineRef.current?.stop()
    setIsRunning(false)
    startComposition().catch(() => {
      setAudioError('장르 변경 중 재생 재시작에 실패했습니다.')
    })
  }, [isRunning, selectedGenre, startComposition])

  const handlePlayPause = useCallback(async () => {
    if (!musicParams) return

    if (!engineRef.current || !engineRef.current.isPlaying) {
      await startComposition()
      return
    }

    const running = await engineRef.current.togglePause()
    setIsRunning(running)
  }, [musicParams, startComposition])

  const handleVolumeChange = useCallback((next: number) => {
    setVolume(next)
    engineRef.current?.setVolume(next)
  }, [])

  const handleGenerateAiMusic = useCallback(async () => {
    if (!musicParams || aiLoading) return
    setAiLoading(true)
    setAiError(null)
    setAiAudioUrl(null)

    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: createAiPrompt(musicParams),
          duration: Math.round(Math.min(30, Math.max(12, totalDuration / 4))),
        }),
      })

      const data = (await response.json()) as { url?: string; error?: string }
      if (!response.ok || !data.url) {
        setAiError(data.error ?? 'AI 음악 생성 중 오류가 발생했습니다.')
        return
      }

      setAiAudioUrl(data.url)
    } catch {
      setAiError('AI 음악 생성 요청 중 네트워크 오류가 발생했습니다.')
    } finally {
      setAiLoading(false)
    }
  }, [aiLoading, musicParams, totalDuration])

  if (loadingInput) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-5xl animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          사주 데이터를 확인하고 있습니다...
        </div>
      </main>
    )
  }

  if (!musicInput || !musicParams) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
        <div className="mx-auto max-w-5xl space-y-6 rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_20%_0%,rgba(245,158,11,0.2),rgba(15,23,42,0.95)_45%),linear-gradient(160deg,#020617,#0f172a)] p-7 md:p-10">
          <h1 className="font-serif-kr text-3xl font-black text-amber-300 md:text-4xl">나의 사주 음악</h1>
          <p className="text-sm leading-relaxed text-slate-300 md:text-base">
            나의 사주 음악은 사주팔자 분석 결과를 4개의 인생 악장으로 바꾸어 들려주는 기능입니다. 오행 분포, 일간 강약,
            용신 방향, 인생성장 해석을 바탕으로 초년부터 말년까지의 흐름을 소리로 풀어내기 때문에 먼저 기본 사주 분석 결과가
            필요합니다. 아직 결과가 저장되지 않았다면 무료 사주 풀이를 먼저 진행해 주세요. 분석이 끝난 뒤 이 페이지로 돌아오면
            개인 맞춤 사운드와 AI 고품질 음악 기능을 바로 사용할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/saju/free" className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300">
              무료 사주 분석 시작하기
            </Link>
            <Link href="/" className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-200 hover:border-amber-400 hover:text-amber-300">
              메인 사주 페이지
            </Link>
            <Link href="/fortune/today" className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-200 hover:border-amber-400 hover:text-amber-300">
              오늘의 운세 보기
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_15%_0%,rgba(56,189,248,0.18),rgba(15,23,42,0.95)_40%),radial-gradient(circle_at_85%_15%,rgba(245,158,11,0.16),rgba(15,23,42,0.95)_45%),linear-gradient(140deg,#020617,#0f172a)] p-6 md:p-10">
          <p className="text-xs tracking-[0.3em] text-slate-400">SAJUHAE SOUND RITUAL</p>
          <h1 className="mt-3 font-serif-kr text-3xl font-black text-amber-300 md:text-5xl">나의 사주 음악</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
            내 사주의 리듬은 단순한 배경음이 아니라 삶의 밀도와 변화의 방향을 들려주는 지표입니다. 사주해의 나의 사주 음악은
            오행의 균형과 편중, 일간의 강약, 용신의 보완 방향, 그리고 인생성장 해석에서 읽히는 심리적 전환점을 사운드로 재구성해
            초년, 청년, 중년, 말년의 4악장으로 연결합니다. 각 악장은 해당 시기와 주(년주, 월주, 일주, 시주)의 기운을 중심으로
            템포와 음역, 패턴 밀도, 명암을 달리해 구성되며, 결핍 오행이 확인되는 경우에는 여백이 강조된 구간을 배치해 비움의
            감각을 표현합니다. 들을수록 내 흐름의 강점과 공백을 감각적으로 체감할 수 있고, 일상의 결정 속에서 어떤 에너지를
            채우고 어떤 과몰입을 줄여야 하는지 방향을 잡는 데 도움을 받을 수 있습니다.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 md:p-7">
          <h2 className="font-serif-kr text-xl font-bold text-slate-100 md:text-2xl">장르 선택</h2>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
            {GENRES.map((genre) => {
              const selected = selectedGenre === genre.id
              return (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`group flex min-w-[220px] flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition-all duration-300 md:min-w-[250px] md:flex-1 ${
                    selected
                      ? 'scale-[1.02] border-amber-300/80 bg-amber-300/10 shadow-[0_0_24px_rgba(245,158,11,0.28)]'
                      : 'border-slate-700 bg-slate-950/50 hover:border-slate-500 hover:bg-slate-900/70'
                  }`}
                >
                  <span className="text-2xl">{genre.icon}</span>
                  <span className={`font-bold ${selected ? 'text-amber-200' : 'text-slate-100'}`}>{genre.name}</span>
                  <span className={`text-xs leading-relaxed ${selected ? 'text-amber-100/80' : 'text-slate-400'}`}>{genre.description}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif-kr text-xl font-bold text-slate-100 md:text-2xl">4악장 인생 타임라인</h2>
            <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
              {musicParams.genreConfig.name} · Key {musicParams.overall.key} · {musicParams.overall.tempo} BPM
            </span>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-700">
            <div className="flex h-16 w-full">
              {musicParams.movements.map((movement, index) => {
                const color = OHENG_COLORS[movement.element] ?? '#94a3b8'
                const active = index === currentMovementIndex
                return (
                  <div
                    key={`${movement.pillar}-${movement.ageRange}`}
                    className={`relative flex flex-1 flex-col justify-center px-3 text-xs transition-all ${active ? 'scale-[1.01]' : ''}`}
                    style={{
                      background: `linear-gradient(145deg, ${color}66, rgba(15,23,42,0.72))`,
                      boxShadow: active ? `inset 0 0 28px ${color}66` : 'none',
                    }}
                  >
                    <span className="font-semibold text-slate-100">{movement.pillar}</span>
                    <span className="text-[11px] text-slate-200/90">{movement.ageRange}</span>
                    {active && <span className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-amber-200" />}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
              <p className="text-xs tracking-widest text-slate-400">현재 악장</p>
              <h3 className="text-xl font-bold text-amber-300">{currentMovement?.name}</h3>
              <p className="text-sm text-slate-300">{currentMovement?.description}</p>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 md:grid-cols-4">
                <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                  <p className="text-slate-400">템포</p>
                  <p className="mt-1 font-semibold text-slate-100">{currentMovement?.tempo} BPM</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                  <p className="text-slate-400">오행</p>
                  <p className="mt-1 font-semibold text-slate-100">{currentMovement?.element}</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                  <p className="text-slate-400">강도</p>
                  <p className="mt-1 font-semibold text-slate-100">{Math.round((currentMovement?.intensity ?? 0) * 100)}%</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                  <p className="text-slate-400">분위기</p>
                  <p className="mt-1 font-semibold text-slate-100">{musicParams.overall.mood}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950/30 p-5">
              <p className="text-xs tracking-widest text-slate-400">오행 밸런스</p>
              <div className="flex items-center justify-between gap-2">
                {ELEMENTS.map((element) => {
                  const color = OHENG_COLORS[element]
                  const isCurrent = currentMovement?.element === element
                  const count = musicInput.oheng.counts[element]
                  return (
                    <div key={element} className="flex flex-col items-center gap-2">
                      <span
                        className={`h-12 w-12 rounded-full border text-lg font-bold leading-[3rem] text-center transition-all ${isCurrent ? 'scale-110' : ''}`}
                        style={{
                          backgroundColor: `${color}26`,
                          borderColor: isCurrent ? '#fcd34d' : `${color}99`,
                          boxShadow: isCurrent ? `0 0 20px ${color}` : 'none',
                          color: color,
                        }}
                      >
                        {element}
                      </span>
                      <span className="text-xs text-slate-300">{count}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-slate-400">
                균형 상태: <span className="font-semibold text-slate-200">{musicInput.oheng.balance}</span> · 용신:
                <span className="ml-1 font-semibold text-amber-300">{musicInput.yongsin.yongsin}</span>
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-4 rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
              <button
                onClick={() => {
                  handlePlayPause().catch(() => {
                    setAudioError('오디오 재생 제어에 실패했습니다.')
                  })
                }}
                className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-300/60 bg-gradient-to-br from-amber-300 to-amber-500 text-2xl text-slate-950 shadow-[0_0_26px_rgba(245,158,11,0.45)] transition-transform hover:scale-105"
              >
                {isRunning ? '⏸' : '▶'}
              </button>

              <div className="w-full">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{Math.floor(progress)}초</span>
                  <span>{Math.floor(totalDuration)}초</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-sky-400 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <label className="flex w-full items-center gap-3 text-sm text-slate-300">
                <span className="shrink-0">볼륨</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => handleVolumeChange(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700"
                />
                <span className="w-10 text-right text-xs text-slate-400">{Math.round(volume * 100)}%</span>
              </label>
            </div>
            {audioError && <p className="text-sm text-red-300">{audioError}</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif-kr text-xl font-bold text-slate-100">AI 고품질 음악</h2>
            <button
              onClick={() => {
                handleGenerateAiMusic().catch(() => {
                  setAiError('AI 음악 생성 요청에 실패했습니다.')
                })
              }}
              disabled={aiLoading}
              className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading ? '생성 중...' : '🎵 AI 고품질 음악 생성'}
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            실시간 Web Audio 합성 버전은 즉시 재생할 수 있고, AI 고품질 음악 생성은 보다 풍성한 텍스처와 길어진 여운을 제공합니다.
            다만 외부 모델 서버 상태와 API 키 설정 여부에 따라 생성 가능 여부가 달라질 수 있습니다. AI 생성이 불가능한 경우에도 기본
            사주 음악은 계속 이용할 수 있으니, 오늘의 감정 정리나 집중 루틴에서 먼저 실시간 버전을 활용해 보세요.
          </p>
          {aiError && <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{aiError}</p>}
          {aiAudioUrl && (
            <div className="mt-4 space-y-3 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4">
              <p className="text-sm font-semibold text-emerald-200">AI 음악이 준비되었습니다.</p>
              <audio controls className="w-full" src={aiAudioUrl}>
                브라우저가 오디오 재생을 지원하지 않습니다.
              </audio>
              <a
                href={aiAudioUrl}
                download="sajuhae-my-saju-music.mp3"
                className="inline-flex rounded-lg border border-emerald-300/60 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/20"
              >
                다운로드
              </a>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="font-serif-kr text-xl font-bold text-amber-300 md:text-2xl">사주 음악 활용 가이드</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-300">
            <p>
              이 기능은 단순한 배경음 재생 페이지가 아니라, 내 사주의 구조를 감각적으로 이해하기 위한 해석 도구입니다. 예를 들어
              오행이 편중된 경우 특정 악장의 밀도와 압력이 높게 나타나는데, 이 구간은 내가 일상에서 과도하게 쓰는 에너지 패턴을
              직관적으로 인지하는 데 도움을 줍니다. 반대로 결핍 구간은 악기 밀도와 타격감을 줄여 의도적인 공백을 만들기 때문에,
              어떤 요소를 채워야 균형이 살아나는지 몸으로 느끼기 쉬워집니다.
            </p>
            <p>
              초년 악장은 환경의 영향과 기초 습관, 청년 악장은 확장과 도전, 중년 악장은 선택의 무게와 책임, 말년 악장은 통합과
              정리의 의미를 담아 설계했습니다. 용신 요소가 등장하는 악장에는 밝기와 선명도를 높여 전환의 포인트를 강조했으니,
              해당 구간에서 내가 실제로 힘을 얻는 행동 조건을 떠올려 보세요. 하루를 시작할 때는 전체를 1회 들으며 오늘의 리듬을
              맞추고, 중요한 의사결정 전에는 현재 체감되는 악장을 중심으로 짧게 반복 재생하면 감정 과열을 줄이고 중심을 잡는 데
              유용합니다. 이 페이지는 명리학 해석을 대신 단정하지 않으며, 내 패턴을 관찰하고 선택의 우선순위를 조율하도록 돕는
              보조 도구로 설계되었습니다.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              무료 사주 메인 분석
            </Link>
            <Link href="/fortune/today" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              오늘의 운세
            </Link>
            <Link href="/gunghap" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              궁합 분석
            </Link>
            <Link href="/pricing" className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-amber-400 hover:text-amber-300">
              프리미엄 요금제
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

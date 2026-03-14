import type { IlganStrength } from './ilgan-strength'
import type { OhengResult } from './oheng'
import type { SajuResult } from './saju'
import type { SipsinResult } from './sipsin'
import type { YongsinResult } from './yongsin'

export type MoodType = 'mystical' | 'dramatic' | 'warm' | 'intense' | 'serene' | 'hopeful'

export type MusicGenre =
  | 'ambient'
  | 'traditional'
  | 'piano'
  | 'electronic'
  | 'orchestra'
  | 'lofi'
  | 'nature'

export interface GenreConfig {
  name: string
  description: string
  icon: string
  padWaveform: OscillatorType
  melodyWaveform: OscillatorType
  tempoMultiplier: number
  reverbDecay: number
  delayTime: number
  delayFeedback: number
  filterType: BiquadFilterType
  filterFreq: number
  noteLength: { min: number; max: number }
  percussionStyle: 'soft' | 'crisp' | 'none' | 'heavy' | 'shuffle'
  padDetune: number
  melodyOctaveRange: [number, number]
  swingAmount: number
}

export const GENRE_CONFIGS: Record<MusicGenre, GenreConfig> = {
  ambient: {
    name: '명상 앰비언트',
    description: '고요한 패드와 넓은 공간감으로 내면의 흐름을 느낍니다',
    icon: '🌊',
    padWaveform: 'triangle',
    melodyWaveform: 'sine',
    tempoMultiplier: 1,
    reverbDecay: 2.8,
    delayTime: 0.35,
    delayFeedback: 0.35,
    filterType: 'lowpass',
    filterFreq: 1200,
    noteLength: { min: 0.3, max: 1.2 },
    percussionStyle: 'soft',
    padDetune: 5,
    melodyOctaveRange: [0, 1],
    swingAmount: 0,
  },
  traditional: {
    name: '한국 전통 국악',
    description: '가야금과 대금의 울림을 연상시키는 동양적 선율',
    icon: '🏛️',
    padWaveform: 'sine',
    melodyWaveform: 'triangle',
    tempoMultiplier: 0.85,
    reverbDecay: 3.5,
    delayTime: 0.5,
    delayFeedback: 0.2,
    filterType: 'bandpass',
    filterFreq: 800,
    noteLength: { min: 0.4, max: 1.8 },
    percussionStyle: 'soft',
    padDetune: 12,
    melodyOctaveRange: [0, 2],
    swingAmount: 0.15,
  },
  piano: {
    name: '피아노 발라드',
    description: '부드러운 피아노 터치로 감성을 전달합니다',
    icon: '🎹',
    padWaveform: 'sine',
    melodyWaveform: 'sine',
    tempoMultiplier: 0.9,
    reverbDecay: 2.2,
    delayTime: 0.22,
    delayFeedback: 0.18,
    filterType: 'lowpass',
    filterFreq: 3000,
    noteLength: { min: 0.15, max: 0.6 },
    percussionStyle: 'none',
    padDetune: 2,
    melodyOctaveRange: [0, 2],
    swingAmount: 0.05,
  },
  electronic: {
    name: '일렉트로닉',
    description: '신스웨이브와 펄스가 만드는 미래지향적 사운드',
    icon: '⚡',
    padWaveform: 'sawtooth',
    melodyWaveform: 'square',
    tempoMultiplier: 1.25,
    reverbDecay: 1.5,
    delayTime: 0.18,
    delayFeedback: 0.4,
    filterType: 'lowpass',
    filterFreq: 2000,
    noteLength: { min: 0.08, max: 0.35 },
    percussionStyle: 'crisp',
    padDetune: 8,
    melodyOctaveRange: [0, 3],
    swingAmount: 0,
  },
  orchestra: {
    name: '오케스트라',
    description: '웅장한 현악과 관악이 인생의 서사시를 연주합니다',
    icon: '🎻',
    padWaveform: 'triangle',
    melodyWaveform: 'triangle',
    tempoMultiplier: 0.8,
    reverbDecay: 3.2,
    delayTime: 0.3,
    delayFeedback: 0.15,
    filterType: 'lowpass',
    filterFreq: 1800,
    noteLength: { min: 0.25, max: 1 },
    percussionStyle: 'heavy',
    padDetune: 3,
    melodyOctaveRange: [0, 2],
    swingAmount: 0,
  },
  lofi: {
    name: '로파이 힙합',
    description: '따뜻한 비트와 빈티지 텍스처의 편안한 사운드',
    icon: '☕',
    padWaveform: 'triangle',
    melodyWaveform: 'sine',
    tempoMultiplier: 0.75,
    reverbDecay: 1.8,
    delayTime: 0.28,
    delayFeedback: 0.25,
    filterType: 'lowpass',
    filterFreq: 900,
    noteLength: { min: 0.12, max: 0.5 },
    percussionStyle: 'shuffle',
    padDetune: 15,
    melodyOctaveRange: [0, 1],
    swingAmount: 0.3,
  },
  nature: {
    name: '자연의 소리',
    description: '바람, 물, 새소리와 어우러지는 치유의 사운드스케이프',
    icon: '🌿',
    padWaveform: 'sine',
    melodyWaveform: 'sine',
    tempoMultiplier: 0.7,
    reverbDecay: 4,
    delayTime: 0.6,
    delayFeedback: 0.3,
    filterType: 'lowpass',
    filterFreq: 600,
    noteLength: { min: 0.5, max: 2 },
    percussionStyle: 'none',
    padDetune: 20,
    melodyOctaveRange: [0, 1],
    swingAmount: 0.1,
  },
}

export interface SajuMusicInput {
  oheng: OhengResult
  ilganStrength: IlganStrength
  yongsin: YongsinResult
  saju: SajuResult
  sipsin: SipsinResult
}

export interface Movement {
  name: string
  ageRange: string
  pillar: string
  element: string
  tempo: number
  baseFreq: number
  scale: number[]
  mood: MoodType
  intensity: number
  duration: number
  description: string
}

export interface SajuMusicParams {
  genre: MusicGenre
  genreConfig: GenreConfig
  overall: {
    tempo: number
    key: string
    scale: 'major' | 'minor' | 'pentatonic'
    mood: string
  }
  movements: [Movement, Movement, Movement, Movement]
}

const PENTATONIC_RATIOS = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3]

const ELEMENT_TO_KEY: Record<string, { key: string; baseFreq: number; mood: MoodType }> = {
  목: { key: 'G', baseFreq: 196, mood: 'hopeful' },
  화: { key: 'D', baseFreq: 146.83, mood: 'intense' },
  토: { key: 'C', baseFreq: 130.81, mood: 'warm' },
  금: { key: 'F', baseFreq: 174.61, mood: 'serene' },
  수: { key: 'A', baseFreq: 220, mood: 'mystical' },
}

const MOVEMENT_INFO = [
  { name: '🌱 뿌리를 내리는 시기', ageRange: '0~20세', pillar: '년주' },
  { name: '🔥 세상을 배우는 시기', ageRange: '21~40세', pillar: '월주' },
  { name: '⛰️ 중심을 세우는 시기', ageRange: '41~60세', pillar: '일주' },
  { name: '🌌 지혜를 남기는 시기', ageRange: '61세~', pillar: '시주' },
] as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function mapTempoFromStrength(score: number): number {
  if (score >= 5) {
    return Math.round(120 + Math.min(20, score - 5) * 4)
  }
  if (score <= -5) {
    return Math.round(80 - Math.min(20, Math.abs(score) - 5) * 4)
  }

  if (score >= 0) {
    return Math.round(100 + (score / 5) * 10)
  }

  return Math.round(100 + (score / 5) * 10)
}

function moodFromBalanceAndStrength(balance: OhengResult['balance'], score: number): string {
  if (balance === '균형') return '조화로운 명상'
  if (score >= 3) return '강렬한 추진력'
  if (score <= -3) return '고요한 회복'
  return '변화와 균형의 여정'
}

function getMovementElement(saju: SajuResult, index: 0 | 1 | 2 | 3): string {
  if (index === 0) return saju.yearPillar.element
  if (index === 1) return saju.monthPillar.element
  if (index === 2) return saju.dayPillar.element
  return saju.hourPillar.element
}

function getDominantAndMissingElements(oheng: OhengResult): { dominant: string; missing: string | null } {
  const entries = Object.entries(oheng.counts) as Array<[string, number]>
  const sorted = [...entries].sort((a, b) => b[1] - a[1])
  const dominant = sorted[0]?.[0] ?? oheng.dominant
  const missing = entries.find((entry) => entry[1] === 0)?.[0] ?? null
  return { dominant, missing }
}

function resolveVoidMovementIndex(
  movementElements: string[],
  missing: string | null,
  weakElement: string,
): number | null {
  if (missing) {
    const missingIndex = movementElements.findIndex((element) => element === missing)
    if (missingIndex >= 0) return missingIndex
  }

  const weakIndex = movementElements.findIndex((element) => element === weakElement)
  return weakIndex >= 0 ? weakIndex : null
}

export function mapSajuToMusic(input: SajuMusicInput, genre: MusicGenre = 'ambient'): SajuMusicParams {
  const { oheng, ilganStrength, yongsin, saju } = input
  const genreConfig = GENRE_CONFIGS[genre]

  const baseOverallTempo = clamp(mapTempoFromStrength(ilganStrength.score), 60, 140)
  const overallTempo = clamp(Math.round(baseOverallTempo * genreConfig.tempoMultiplier), 56, 168)
  const dominantElementConfig = ELEMENT_TO_KEY[oheng.dominant] ?? ELEMENT_TO_KEY.토
  const { dominant, missing } = getDominantAndMissingElements(oheng)

  const movementElements: string[] = [
    getMovementElement(saju, 0),
    getMovementElement(saju, 1),
    getMovementElement(saju, 2),
    getMovementElement(saju, 3),
  ]

  const voidMovementIndex =
    oheng.balance === '결핍' ? resolveVoidMovementIndex(movementElements, missing, oheng.weak) : null

  const baseIntensities = [0.62, 0.7, 0.76, 0.68]

  const movements = movementElements.map((element, index) => {
    const movementInfo = MOVEMENT_INFO[index]
    const config = ELEMENT_TO_KEY[element] ?? ELEMENT_TO_KEY.토

    let intensity = baseIntensities[index]

    if (oheng.balance === '편중' && element === dominant) {
      intensity += 0.16
    }

    const yongsinBoost = element === yongsin.yongsin ? 0.1 : 0
    intensity += yongsinBoost

    const isVoid = voidMovementIndex === index
    if (isVoid) {
      intensity = Math.max(0.34, intensity - 0.24)
    }

    intensity = clamp(intensity, 0.25, 1)

    const tempoOffset = (index - 1) * 4
    const baseTempo = clamp(baseOverallTempo + tempoOffset + Math.round((intensity - 0.6) * 18), 56, 148)
    const tempo = clamp(Math.round(baseTempo * genreConfig.tempoMultiplier), 52, 176)
    const duration = isVoid ? 20 : 24 + (index % 2 === 0 ? 2 : 0)

    const descriptionParts = [
      `${movementInfo.pillar}의 ${element} 기운이 삶의 리듬을 이끕니다.`,
      element === yongsin.yongsin
        ? `용신(${yongsin.yongsin})의 밝은 조율이 더해져 방향성이 선명해집니다.`
        : `현재 구간은 내면 정리와 선택의 밀도를 높여 주는 흐름입니다.`,
    ]

    if (isVoid) {
      descriptionParts.push(
        missing
          ? `${missing} 기운의 결핍을 반영해 여백이 강조된 희소한 선율로 구성됩니다.`
          : `${oheng.weak} 기운의 공백을 표현하기 위해 음표 간격을 넓혀 비움의 감각을 만듭니다.`,
      )
    }

    return {
      name: movementInfo.name,
      ageRange: movementInfo.ageRange,
      pillar: movementInfo.pillar,
      element,
      tempo,
      baseFreq: config.baseFreq,
      scale: PENTATONIC_RATIOS,
      mood: config.mood,
      intensity,
      duration,
      description: descriptionParts.join(' '),
    }
  }) as [Movement, Movement, Movement, Movement]

  return {
    genre,
    genreConfig,
    overall: {
      tempo: overallTempo,
      key: dominantElementConfig.key,
      scale: 'pentatonic',
      mood: moodFromBalanceAndStrength(oheng.balance, ilganStrength.score),
    },
    movements,
  }
}

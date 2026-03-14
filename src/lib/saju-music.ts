import type { IlganStrength } from './ilgan-strength'
import type { OhengResult } from './oheng'
import type { SajuResult } from './saju'
import type { SipsinResult } from './sipsin'
import type { YongsinResult } from './yongsin'

export type MoodType = 'mystical' | 'dramatic' | 'warm' | 'intense' | 'serene' | 'hopeful'

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

export function mapSajuToMusic(input: SajuMusicInput): SajuMusicParams {
  const { oheng, ilganStrength, yongsin, saju } = input

  const overallTempo = clamp(mapTempoFromStrength(ilganStrength.score), 60, 140)
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
    const tempo = clamp(overallTempo + tempoOffset + Math.round((intensity - 0.6) * 18), 56, 148)
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
    overall: {
      tempo: overallTempo,
      key: dominantElementConfig.key,
      scale: 'pentatonic',
      mood: moodFromBalanceAndStrength(oheng.balance, ilganStrength.score),
    },
    movements,
  }
}

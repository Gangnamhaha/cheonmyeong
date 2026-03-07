import { SAJU_MANUAL } from '@/data/saju-manual'
import type { FullSajuResult } from './saju'
import type { SipsinName } from './sipsin'

export interface TraditionalEntry {
  original: string
  plain: string
}

export interface TraditionalInterpretation {
  personality: TraditionalEntry[]
  career: TraditionalEntry[]
  health: TraditionalEntry[]
  dayPillar: TraditionalEntry[]
  fortune: TraditionalEntry[]
  yongsinAdvice: TraditionalEntry[]
  general: TraditionalEntry[]
}

type SipsinGroup = '비겁' | '식상' | '재성' | '관성' | '인성'

const SIPSIN_GROUP_MAP: Record<SipsinGroup, SipsinName[]> = {
  '비겁': ['비견', '겁재'],
  '식상': ['식신', '상관'],
  '재성': ['편재', '정재'],
  '관성': ['편관', '정관'],
  '인성': ['편인', '정인'],
}

const SIPSIN_ORDER: SipsinGroup[] = ['비겁', '식상', '재성', '관성', '인성']
const EMPTY_RESULT: TraditionalInterpretation = {
  personality: [] as TraditionalEntry[],
  career: [] as TraditionalEntry[],
  health: [] as TraditionalEntry[],
  dayPillar: [] as TraditionalEntry[],
  fortune: [] as TraditionalEntry[],
  yongsinAdvice: [] as TraditionalEntry[],
  general: [] as TraditionalEntry[],
}

function pickDominantSipsinGroup(summary: Record<SipsinName, number>): SipsinGroup {
  let dominant: SipsinGroup = '비겁'
  let maxCount = -1

  for (const group of SIPSIN_ORDER) {
    const names = SIPSIN_GROUP_MAP[group]
    const count = names.reduce((sum, name) => sum + (summary[name] ?? 0), 0)
    if (count > maxCount) {
      maxCount = count
      dominant = group
    }
  }

  return dominant
}

function getStrongWeakElements(result: FullSajuResult): { strong: Set<string>; weak: Set<string> } {
  const values = Object.values(result.oheng.counts)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const strong = new Set<string>()
  const weak = new Set<string>()

  for (const [element, count] of Object.entries(result.oheng.counts)) {
    if (count === max) strong.add(element)
    if (count === min) weak.add(element)
  }

  return { strong, weak }
}

function matchesEntry(
  tags: string[],
  profile: {
    dayElement: string
    strength: string
    gender: 'male' | 'female'
    dominantSipsin: SipsinGroup
    yongsin: string
    strongElements: Set<string>
    weakElements: Set<string>
  }
): boolean {
  return tags.every((tag) => {
    if (tag.startsWith('category:')) return true

    if (tag.startsWith('dayElement:')) {
      return profile.dayElement === tag.slice('dayElement:'.length)
    }
    if (tag.startsWith('strength:')) {
      return profile.strength === tag.slice('strength:'.length)
    }
    if (tag.startsWith('gender:')) {
      return profile.gender === tag.slice('gender:'.length)
    }
    if (tag.startsWith('sipsin:')) {
      return profile.dominantSipsin === tag.slice('sipsin:'.length)
    }
    if (tag.startsWith('yongsin:')) {
      return profile.yongsin === tag.slice('yongsin:'.length)
    }
    if (tag.startsWith('oheng:')) {
      const value = tag.slice('oheng:'.length)
      if (value.endsWith('多')) {
        return profile.strongElements.has(value.slice(0, -1))
      }
      if (value.endsWith('약')) {
        return profile.weakElements.has(value.slice(0, -1))
      }
      return false
    }

    return true
  })
}

function makeEntry(condition: string, text: string, plainText: string): TraditionalEntry {
  return {
    original: `${condition} ${text}`.trim(),
    plain: plainText || `${condition} ${text}`.trim(),
  }
}

function pushLimited(target: TraditionalEntry[], value: TraditionalEntry, max = 5) {
  if (target.length >= max) return
  if (target.some((e) => e.original === value.original)) return
  target.push(value)
}

export function getTraditionalInterpretation(
  result: FullSajuResult,
  gender: 'male' | 'female'
): TraditionalInterpretation {
  if (!result) return { ...EMPTY_RESULT }

  const dominantSipsin = pickDominantSipsinGroup(result.sipsin.summary)
  const { strong, weak } = getStrongWeakElements(result)
  const profile = {
    dayElement: result.saju.dayPillar.element,
    strength: result.ilganStrength.strength,
    gender,
    dominantSipsin,
    yongsin: result.yongsin.yongsin,
    strongElements: strong,
    weakElements: weak,
  }

  const output: TraditionalInterpretation = {
    personality: [] as TraditionalEntry[],
    career: [] as TraditionalEntry[],
    health: [] as TraditionalEntry[],
    dayPillar: [] as TraditionalEntry[],
    fortune: [] as TraditionalEntry[],
    yongsinAdvice: [] as TraditionalEntry[],
    general: [] as TraditionalEntry[],
  }

  for (const chapter of SAJU_MANUAL) {
    for (const entry of chapter.entries) {
      if (!matchesEntry(entry.tags, profile)) continue
      const item = makeEntry(entry.condition, entry.text, entry.plainText)

      if (chapter.chapter >= 1 && chapter.chapter <= 5) {
        pushLimited(output.personality, item)
      } else if (chapter.chapter === 6) {
        pushLimited(output.career, item)
      } else if (chapter.chapter === 7) {
        pushLimited(output.health, item)
      } else if (chapter.chapter >= 12 && chapter.chapter <= 16) {
        pushLimited(output.dayPillar, item)
      } else if (chapter.chapter === 9 || chapter.chapter === 11) {
        pushLimited(output.fortune, item)
      } else if (chapter.chapter === 17) {
        pushLimited(output.yongsinAdvice, item)
      } else {
        pushLimited(output.general, item)
      }
    }
  }

  return output
}

export function toTraditionalContextText(result: TraditionalInterpretation, maxChars = 500): string {
  const entries = [
    ...result.personality,
    ...result.dayPillar,
    ...result.career,
    ...result.health,
    ...result.fortune,
    ...result.yongsinAdvice,
    ...result.general,
  ]
  const merged = entries.map((e) => e.plain).join(' | ').trim()
  if (!merged) return ''
  return merged.length > maxChars ? `${merged.slice(0, maxChars)}...` : merged
}

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
  children: TraditionalEntry[]
  relationship: TraditionalEntry[]
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

const MAX_PER_CATEGORY = 8

const EMPTY_RESULT: TraditionalInterpretation = {
  personality: [],
  career: [],
  health: [],
  dayPillar: [],
  fortune: [],
  yongsinAdvice: [],
  children: [],
  relationship: [],
  general: [],
}

/**
 * 사주에 존재하는 모든 십신 그룹을 반환 (count > 0)
 */
function getPresentSipsinGroups(summary: Record<SipsinName, number>): Set<SipsinGroup> {
  const present = new Set<SipsinGroup>()
  for (const group of SIPSIN_ORDER) {
    const names = SIPSIN_GROUP_MAP[group]
    const count = names.reduce((sum, name) => sum + (summary[name] ?? 0), 0)
    if (count > 0) present.add(group)
  }
  return present
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

/**
 * 의미 있는 태그(category: 제외)가 1개 이상 있는지 검사
 */
function hasMeaningfulTags(tags: string[]): boolean {
  return tags.some((tag) => !tag.startsWith('category:'))
}

/**
 * 엔트리가 사용자 프로필에 매칭되는지 검사
 * - sipsin 매칭: 사주에 존재하는 모든 십신 그룹과 비교 (dominant만이 아님)
 * - 의미 있는 태그가 없는 엔트리는 제외 (무차별 매칭 방지)
 */
function matchesEntry(
  tags: string[],
  profile: {
    dayElement: string
    strength: string
    gender: 'male' | 'female'
    presentSipsins: Set<SipsinGroup>
    yongsin: string
    strongElements: Set<string>
    weakElements: Set<string>
  }
): boolean {
  // 의미 있는 태그가 없으면 무시 (누구에게나 매칭되는 엔트리 방지)
  if (!hasMeaningfulTags(tags)) return false

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
      // 사주에 해당 십신 그룹이 존재하면 매칭 (dominant만이 아닌 전체)
      return profile.presentSipsins.has(tag.slice('sipsin:'.length) as SipsinGroup)
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

function pushLimited(target: TraditionalEntry[], value: TraditionalEntry, max = MAX_PER_CATEGORY) {
  if (target.length >= max) return
  if (target.some((e) => e.original === value.original)) return
  target.push(value)
}

// 궁합 전용 챕터 (개인 해석에서 제외)
const GUNGHAP_CHAPTERS = new Set([19, 20])

export function getTraditionalInterpretation(
  result: FullSajuResult,
  gender: 'male' | 'female'
): TraditionalInterpretation {
  if (!result) return { ...EMPTY_RESULT }

  const presentSipsins = getPresentSipsinGroups(result.sipsin.summary)
  const { strong, weak } = getStrongWeakElements(result)
  const profile = {
    dayElement: result.saju.dayPillar.element,
    strength: result.ilganStrength.strength,
    gender,
    presentSipsins,
    yongsin: result.yongsin.yongsin,
    strongElements: strong,
    weakElements: weak,
  }

  const output: TraditionalInterpretation = {
    personality: [],
    career: [],
    health: [],
    dayPillar: [],
    fortune: [],
    yongsinAdvice: [],
    children: [],
    relationship: [],
    general: [],
  }

  for (const chapter of SAJU_MANUAL) {
    // 궁합 챕터는 개인 해석에서 제외
    if (GUNGHAP_CHAPTERS.has(chapter.chapter)) continue

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
      } else if (chapter.chapter === 10) {
        pushLimited(output.children, item)
      } else if (chapter.chapter === 18) {
        pushLimited(output.relationship, item)
      } else {
        // Ch8(형충역마), Ch21(학업), Ch22(약신), Ch23(기타), Ch24(오행)
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
    ...result.children,
    ...result.relationship,
    ...result.general,
  ]
  const merged = entries.map((e) => e.plain).join(' | ').trim()
  if (!merged) return ''
  return merged.length > maxChars ? `${merged.slice(0, maxChars)}...` : merged
}

const fs = require('fs')
const path = require('path')

const INPUT = 'C:/saju/해설서.md'
const OUTPUT = 'C:/saju/cheonmyeong/src/data/saju-manual.ts'

const ELEMENT_MAP = {
  木: '목', 火: '화', 土: '토', 金: '금', 水: '수',
  목: '목', 화: '화', 토: '토', 금: '금', 수: '수',
  Wood: '목', Fire: '화', Earth: '토', Metal: '금', Water: '수',
}

const CHAPTER_BASE_TAGS = {
  1: ['sipsin:식상'],
  2: ['sipsin:인성'],
  3: ['sipsin:재성'],
  4: ['sipsin:관성'],
  5: ['sipsin:비겁'],
  6: ['category:career'],
  7: ['category:health'],
  8: ['category:general'],
  9: ['category:fortune'],
  10: ['category:children'],
  11: ['category:fortune'],
  12: ['dayElement:목'],
  13: ['dayElement:화'],
  14: ['dayElement:토'],
  15: ['dayElement:금'],
  16: ['dayElement:수'],
  17: ['category:general'],
  18: ['category:general'],
  19: ['category:compatibility'],
  20: ['category:compatibility'],
  21: ['category:general'],
  22: ['category:general'],
  23: ['category:general'],
  24: ['category:general'],
}

function dedupe(arr) {
  return [...new Set(arr)]
}

function normalizeSpace(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function cleanCondition(raw) {
  return normalizeSpace(
    raw
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/[()]/g, '')
      .replace(/\\/g, '')
  )
}

function cleanText(raw) {
  return normalizeSpace(
    raw
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\/g, '')
      .replace(/^[“"']+\s*/, '')
  )
}

function mapElement(token) {
  return ELEMENT_MAP[token] || null
}

function detectTags(condition) {
  const tags = []

  // day element
  if (/(木日柱|木일주|木日|甲|乙)/.test(condition)) tags.push('dayElement:목')
  if (/(火日柱|火일주|丙|丁)/.test(condition)) tags.push('dayElement:화')
  if (/(土일주|土日柱|戊|己)/.test(condition)) tags.push('dayElement:토')
  if (/(金일주|金日柱|辛|○일주|○日)/.test(condition)) tags.push('dayElement:금')
  if (/(水일주|水日柱|壬|癸)/.test(condition)) tags.push('dayElement:수')

  // strength
  if (/(신강|신왕)/.test(condition)) tags.push('strength:신강')
  if (/신약/.test(condition)) tags.push('strength:신약')

  // gender
  if (/男子/.test(condition)) tags.push('gender:male')
  if (/女子|女子/.test(condition)) tags.push('gender:female')

  // sipsin
  if (/(食傷|식상)/.test(condition)) tags.push('sipsin:식상')
  if (/(印受|인수|인성)/.test(condition)) tags.push('sipsin:인성')
  if (/(財|재성)/.test(condition)) tags.push('sipsin:재성')
  if (/(官|관성|偏官|正官)/.test(condition)) tags.push('sipsin:관성')
  if (/(比劫|비겁)/.test(condition)) tags.push('sipsin:비겁')

  // yongsin patterns
  const yongsinMatchers = [
    /([木火土金水목화토금수]|Wood|Fire|Earth|Metal|Water)\s*用神/gi,
    /용신\s*([木火土金水목화토금수]|Wood|Fire|Earth|Metal|Water)/gi,
  ]

  for (const matcher of yongsinMatchers) {
    let match = matcher.exec(condition)
    while (match) {
      const element = mapElement(match[1])
      if (element) tags.push(`yongsin:${element}`)
      match = matcher.exec(condition)
    }
  }

  // dominant/weak element patterns
  const manyMatcher = /([木火土金水목화토금수]|Wood|Fire|Earth|Metal|Water)\s*多/gi
  let many = manyMatcher.exec(condition)
  while (many) {
    const element = mapElement(many[1])
    if (element) tags.push(`oheng:${element}多`)
    many = manyMatcher.exec(condition)
  }

  const weakMatcher = /([木火土金水목화토금수]|Wood|Fire|Earth|Metal|Water)\s*약/gi
  let weak = weakMatcher.exec(condition)
  while (weak) {
    const element = mapElement(weak[1])
    if (element) tags.push(`oheng:${element}약`)
    weak = weakMatcher.exec(condition)
  }

  return dedupe(tags)
}

function parseManual(md) {
  const lines = md.split(/\r?\n/)
  const chapters = []
  let currentChapter = null
  let currentEntry = null

  function pushEntry() {
    if (!currentChapter || !currentEntry) return
    if (!currentEntry.condition && !currentEntry.text) return

    currentEntry.condition = normalizeSpace(currentEntry.condition)
    currentEntry.text = normalizeSpace(currentEntry.text)
    if (!currentEntry.condition || !currentEntry.text) return

    const chapterTags = CHAPTER_BASE_TAGS[currentChapter.chapter] || ['category:general']
    const entryTags = detectTags(currentEntry.condition)
    currentEntry.tags = dedupe([...chapterTags, ...entryTags])

    currentChapter.entries.push(currentEntry)
    currentEntry = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const chapterMatch = line.match(/(?:<[^>]+>\s*)?제\s*(\d+)장\s*(.+)$/)
    if (chapterMatch) {
      pushEntry()
      if (currentChapter) chapters.push(currentChapter)
      currentChapter = {
        chapter: Number(chapterMatch[1]),
        title: normalizeSpace(chapterMatch[2]),
        entries: [],
      }
      continue
    }

    if (!currentChapter) continue

    const conditionStartMatch = line.match(/^\\\((.+?)(?:\\\)|$)(.*)$/)
    if (conditionStartMatch) {
      pushEntry()
      const condition = cleanCondition(conditionStartMatch[1])
      const textPart = cleanText(conditionStartMatch[2] || '')
      currentEntry = {
        condition,
        text: textPart,
        tags: [],
      }
      continue
    }

    if (!currentEntry) {
      continue
    }

    const continuation = cleanText(line)
    if (continuation) {
      currentEntry.text = normalizeSpace(`${currentEntry.text} ${continuation}`)
    }
  }

  pushEntry()
  if (currentChapter) chapters.push(currentChapter)
  return chapters
}

function main() {
  const md = fs.readFileSync(INPUT, 'utf8')
  const chapters = parseManual(md)

  const output = `export interface ManualEntry {\n  condition: string\n  text: string\n  tags: string[]\n}\n\nexport interface ManualChapter {\n  chapter: number\n  title: string\n  entries: ManualEntry[]\n}\n\nexport const SAJU_MANUAL: ManualChapter[] = ${JSON.stringify(chapters, null, 2)}\n`

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, output, 'utf8')
  console.log(`Generated ${OUTPUT} with ${chapters.length} chapters.`)
}

main()

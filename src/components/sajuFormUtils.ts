import type { HistoryEntry } from './HistoryPanel'

export const YEARS = Array.from({ length: 151 }, (_, i) => 1900 + i)
export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
export const HOURS = Array.from({ length: 24 }, (_, i) => i)
export const MINUTES = [0, 15, 30, 45]

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function parseBirthDateTime(text: string) {
  const result: {
    year?: number
    month?: number
    day?: number
    hour?: number
    minute?: number
    gender?: 'male' | 'female'
    calendarType?: 'solar' | 'lunar'
  } = {}
  const s = text.replace(/\s+/g, ' ').trim()

  const y4 = s.match(/(\d{4})\s*년/)
  if (y4) {
    const y = parseInt(y4[1])
    if (y >= 1900 && y <= 2050) result.year = y
  } else {
    const y2 = s.match(/(\d{2})\s*년/)
    if (y2) {
      let y = parseInt(y2[1])
      y += y < 50 ? 2000 : 1900
      if (y >= 1900 && y <= 2050) result.year = y
    }
  }

  const mm = s.match(/(\d{1,2})\s*월/)
  if (mm) {
    const m = parseInt(mm[1])
    if (m >= 1 && m <= 12) result.month = m
  }

  const dd = s.match(/(\d{1,2})\s*일/)
  if (dd) {
    const d = parseInt(dd[1])
    if (d >= 1 && d <= 31) result.day = d
  }

  const hh = s.match(/(\d{1,2})\s*시/)
  if (hh) {
    const h = parseInt(hh[1])
    if (h >= 0 && h <= 23) result.hour = h
  }

  const mi = s.match(/(\d{1,2})\s*분/)
  if (mi) {
    const m = parseInt(mi[1])
    const rounded = Math.round(m / 15) * 15
    result.minute = rounded >= 60 ? 0 : rounded
  }

  if (/남자|남성/.test(s)) result.gender = 'male'
  else if (/여자|여성/.test(s)) result.gender = 'female'

  if (/음력/.test(s)) result.calendarType = 'lunar'
  else if (/양력/.test(s)) result.calendarType = 'solar'

  return result
}

function generateStars(count: number) {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: (i * 7919 + 13) % 100,
      y: (i * 6271 + 37) % 100,
      size: (i % 7 === 0 ? 'large' : 'small') as 'small' | 'large',
      duration: 2 + (i % 5) * 0.8,
      delay: (i % 8) * 0.5,
    })
  }
  return stars
}
export const STARS = generateStars(60)

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 9) return '상쾌한 아침, 오늘의 운명을 살펴볼까요?'
  if (h >= 9 && h < 12) return '좋은 오전이에요. 사주해가 기다리고 있어요.'
  if (h >= 12 && h < 14) return '점심 시간, 잠깐 운세를 들여다볼까요?'
  if (h >= 14 && h < 18) return '오후의 여유, 사주로 내일을 준비하세요.'
  if (h >= 18 && h < 21) return '해 질 녘, 별빛 아래 운명을 읽어봅니다.'
  return 'AI 해석을 읽으신 후 직접 채팅창에서 물어보실 수 있어요!'
}

export const QUOTES = [
  { text: '命은 하늘이 주고, 運은 내가 만든다.', hanja: '天命人運' },
  { text: '음양이 조화로우면 만사형통이라.', hanja: '陰陽調和' },
  { text: '오행의 균형이 곧 삶의 균형이니라.', hanja: '五行均衡' },
  { text: '사주를 알면 때를 알고, 때를 알면 길이 보인다.', hanja: '知時見路' },
  { text: '용신을 얻으면 흉이 길로 변하나니.', hanja: '得用化吉' },
  { text: '대운이 바뀌면 인생도 바뀌느니라.', hanja: '運轉乾坤' },
  { text: '천간은 하늘의 뜻, 지지는 땅의 이치라.', hanja: '天意地理' },
  { text: '십신의 조화 속에 인연의 비밀이 있느니라.', hanja: '十神秘緣' },
  { text: '재물은 오행의 흐름을 따라 온다.', hanja: '財隨行流' },
  { text: '신강하면 나아가고, 신약하면 기다려라.', hanja: '强進弱待' },
  { text: '희신이 도우면 어려움도 기회가 되리라.', hanja: '喜助轉機' },
  { text: '궁합은 서로의 부족함을 채우는 것이니라.', hanja: '合補不足' },
]

export function getDailyQuote() {
  const day = Math.floor(Date.now() / (24 * 60 * 60 * 1000))
  return QUOTES[day % QUOTES.length]
}

export const FEATURES = [
  { icon: '🏛️', title: '사주팔자 분석', desc: '생년월일시를 기반으로 천간·지지 팔자를 정밀 계산합니다' },
  { icon: '🤖', title: 'AI 맞춤 해석', desc: '명리학 전문 AI가 당신의 사주를 성격, 연애, 직업, 재물 등 카테고리별로 풀어드립니다' },
  { icon: '📊', title: '오행·십신·용신', desc: '오행 분포도, 십신 관계도, 용신 분석까지 한눈에 확인하세요' },
  { icon: '🌟', title: '대운·세운·월운', desc: '10년 대운의 흐름과 올해 세운, 이달의 월운을 분석합니다' },
  { icon: '💬', title: 'AI 사주 상담', desc: '사주에 대해 궁금한 점을 AI 전문가에게 자유롭게 질문하세요' },
  { icon: '💑', title: '궁합 분석', desc: '두 사람의 사주를 비교하고 AI가 궁합을 풀어드립니다' },
]

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('sajuhae-history')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveHistory(entry: HistoryEntry) {
  try {
    const existing = getHistory()
    const updated = [
      entry,
      ...existing.filter(e => !(e.year === entry.year && e.month === entry.month && e.day === entry.day && e.hour === entry.hour)),
    ].slice(0, 5)
    localStorage.setItem('sajuhae-history', JSON.stringify(updated))
  } catch {
    // ignore
  }
}

export function getAnalysisCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    return parseInt(localStorage.getItem('sajuhae-count') || '0', 10)
  } catch {
    return 0
  }
}

export function incrementAnalysisCount() {
  try {
    const count = getAnalysisCount() + 1
    localStorage.setItem('sajuhae-count', String(count))
  } catch {
    // ignore
  }
}

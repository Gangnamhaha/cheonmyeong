'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SearchItem {
  title: string
  description: string
  path: string
  category: string
  keywords: string[]
}

const SEARCH_ITEMS: SearchItem[] = [
  { title: '무료 사주 분석', description: 'AI 사주팔자 분석', path: '/', category: '사주', keywords: ['사주', '팔자', '분석', '무료', 'AI'] },
  { title: '궁합 분석', description: '두 사람의 사주 궁합', path: '/gunghap', category: '궁합', keywords: ['궁합', '연애', '결혼', '커플'] },
  { title: '무료 궁합', description: '무료 사주 궁합 분석', path: '/gunghap/free', category: '궁합', keywords: ['무료', '궁합'] },
  { title: '오늘의 운세', description: '오늘 하루 운세', path: '/fortune/today', category: '운세', keywords: ['오늘', '운세', '일일'] },
  { title: '2026년 운세', description: '올해 전체 운세', path: '/fortune/2026', category: '운세', keywords: ['2026', '올해', '운세'] },
  { title: '봄 운세', description: '2026년 봄 운세', path: '/fortune/2026/spring', category: '운세', keywords: ['봄', '운세'] },
  { title: '여름 운세', description: '2026년 여름 운세', path: '/fortune/2026/summer', category: '운세', keywords: ['여름', '운세'] },
  { title: '가을 운세', description: '2026년 가을 운세', path: '/fortune/2026/fall', category: '운세', keywords: ['가을', '운세'] },
  { title: '겨울 운세', description: '2026년 겨울 운세', path: '/fortune/2026/winter', category: '운세', keywords: ['겨울', '운세'] },
  { title: 'MBTI 궁합', description: 'MBTI 성격 유형별 궁합', path: '/tools/mbti', category: '도구', keywords: ['MBTI', '성격', '유형'] },
  { title: '혈액형 궁합', description: '혈액형별 궁합 분석', path: '/tools/bloodtype', category: '도구', keywords: ['혈액형', 'A형', 'B형', 'O형', 'AB형'] },
  { title: '이름 풀이', description: '한글 이름 획수 분석', path: '/tools/name', category: '도구', keywords: ['이름', '획수', '작명'] },
  { title: '나의 사주 음악', description: '사주 기반 맞춤 음악', path: '/saju/music', category: '특별', keywords: ['음악', '사주', '멜로디'] },
  { title: '사주 입문 가이드', description: '사주팔자의 기본 개념', path: '/guide/saju-basics', category: '가이드', keywords: ['입문', '기초', '배우기'] },
  { title: '오행 가이드', description: '오행의 의미와 관계', path: '/guide/oheng', category: '가이드', keywords: ['오행', '목', '화', '토', '금', '수'] },
  { title: '띠별 운세', description: '12띠별 운세 보기', path: '/fortune/ddi/rat', category: '운세', keywords: ['띠', '쥐', '소', '호랑이', '토끼'] },
  { title: '별자리 운세', description: '12별자리 운세', path: '/fortune/zodiac/aries', category: '운세', keywords: ['별자리', '양자리', '처녀자리'] },
  { title: '요금제', description: '구독 및 이용권 요금', path: '/pricing', category: '서비스', keywords: ['요금', '가격', '구독', '프리미엄'] },
  { title: '고객 문의', description: '문의 및 피드백', path: '/inquiry', category: '서비스', keywords: ['문의', '고객', '피드백', '연락'] },
  { title: '블로그', description: '사주 관련 글 모음', path: '/blog', category: '콘텐츠', keywords: ['블로그', '글', '정보'] },
  { title: '무료 사주 풀이', description: '무료 AI 사주 분석', path: '/saju/free', category: '사주', keywords: ['무료', '사주', '풀이'] },
]

const POPULAR_PATHS = ['/', '/gunghap', '/fortune/today', '/fortune/2026', '/tools/mbti', '/saju/music']

function matchesSearch(item: SearchItem, query: string): boolean {
  const q = query.toLowerCase()
  return item.title.toLowerCase().includes(q)
    || item.description.toLowerCase().includes(q)
    || item.keywords.some((k) => k.toLowerCase().includes(q))
    || item.category.toLowerCase().includes(q)
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const searchResults = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return []
    return SEARCH_ITEMS.filter((item) => matchesSearch(item, trimmed))
  }, [query])

  const popularItems = useMemo(
    () => POPULAR_PATHS.map((path) => SEARCH_ITEMS.find((item) => item.path === path)).filter((item): item is SearchItem => Boolean(item)),
    [],
  )

  const groupedPopularItems = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {}
    for (const item of popularItems) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return Object.entries(groups)
  }, [popularItems])

  useEffect(() => {
    if (!isOpen) return
    setSelectedIndex(0)
    const timer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (!searchResults.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % searchResults.length)
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length)
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        const selected = searchResults[selectedIndex]
        if (!selected) return
        router.push(selected.path)
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, router, searchResults, selectedIndex])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="전체 검색"
    >
      <div className="h-full w-full max-w-4xl mx-auto px-4 py-6 md:py-10 flex flex-col">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="px-4 md:px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <span className="text-lg">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="기능, 페이지, 키워드를 검색하세요..."
              className="flex-1 bg-transparent text-base md:text-lg focus:outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2.5 py-1.5 text-xs"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
            >
              ESC
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-4 md:p-6">
            {query.trim() ? (
              <>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  검색 결과 {searchResults.length}개
                </p>
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((item, index) => {
                      const isSelected = index === selectedIndex
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(index)}
                          onClick={() => {
                            router.push(item.path)
                            onClose()
                          }}
                          className="w-full text-left rounded-xl px-3.5 py-3 transition-all"
                          style={{
                            background: isSelected ? 'var(--bg-secondary)' : 'transparent',
                            border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-color)'}`,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className="text-[10px] rounded-full px-2 py-0.5"
                              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                            >
                              {item.category}
                            </span>
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {item.title}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {item.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl px-4 py-6 text-center" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>검색 결과가 없습니다.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  인기 기능
                </p>
                {groupedPopularItems.map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {category}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {items.map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => {
                            router.push(item.path)
                            onClose()
                          }}
                          className="rounded-xl p-3 text-left hover-scale"
                          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                        >
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {item.title}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {item.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

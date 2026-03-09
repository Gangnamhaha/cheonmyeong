'use client'

import { useState, useEffect } from 'react'

interface ActivityItem {
  city: string
  name: string
  action: string
  timeAgo: string
}

const CITIES = ['서울', '부산', '인천', '대구', '대전', '광주', '수원', '성남', '고양', '용인', '청주', '전주']
const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']
const ACTIONS = [
  '사주 분석을 받았습니다',
  '궁합 분석을 확인했습니다',
  '프리미엄 리포트를 구매했습니다',
  '오늘의 운세를 확인했습니다',
  '대운 분석을 조회했습니다',
  '십신 해석을 읽었습니다',
]

const ACTIVITY_POOL: ActivityItem[] = Array.from({ length: 15 }, (_, i) => ({
  city: CITIES[Math.floor(Math.random() * CITIES.length)],
  name: SURNAMES[Math.floor(Math.random() * SURNAMES.length)] + '○○',
  action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
  timeAgo: `${Math.floor(Math.random() * 50) + 1}분 전`,
}))

export default function SocialProof() {
  const [counter, setCounter] = useState(47382)
  const [activityIndex, setActivityIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => prev + Math.floor(Math.random() * 3) + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Activity rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex(prev => (prev + 1) % ACTIVITY_POOL.length)
      setIsVisible(false)
      setTimeout(() => setIsVisible(true), 300)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const currentActivity = ACTIVITY_POOL[activityIndex]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
      {/* Counter with pulse animation */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-slate-300">지금까지</span>
          <span className="text-lg font-bold text-amber-300 animate-pulse">
            {counter.toLocaleString()}명
          </span>
          <span className="text-sm text-slate-300">이 사주를 확인했어요</span>
        </div>
      </div>

      {/* Activity feed */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-xs text-slate-400 mb-2">최근 활동</div>
        <div
          className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="text-amber-300 font-medium">{currentActivity.city} {currentActivity.name}</span>
            님이 <span className="text-slate-400">{currentActivity.timeAgo}</span> {currentActivity.action}
          </p>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-2 pt-2">
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700">
          <span className="text-xs">🔒</span>
          <span className="text-xs text-slate-300">개인정보 보호</span>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700">
          <span className="text-xs">⚡</span>
          <span className="text-xs text-slate-300">즉시 결과 확인</span>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700">
          <span className="text-xs">🎯</span>
          <span className="text-xs text-slate-300">AI 맞춤 분석</span>
        </div>
      </div>
    </div>
  )
}

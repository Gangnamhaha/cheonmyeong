'use client'

import { useEffect, useState, useRef } from 'react'

export function useCountUp(
  target: number,
  duration: number = 800,
  startOnMount: boolean = true
): number {
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!startOnMount || startedRef.current) return
    if (target === 0) {
      setValue(0)
      return
    }
    startedRef.current = true

    const startTime = performance.now()
    const startVal = 0

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startVal + (target - startVal) * eased)
      setValue(current)
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [target, duration, startOnMount])

  return value
}

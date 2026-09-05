'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

/**
 * Counts up to a numeric target when scrolled into view.
 * Accepts decorated values — "12,000+", "4.9", "15", "24/7" — by splitting the
 * string into prefix + number + suffix and animating only the number, keeping
 * the original decimal precision and thousands separators.
 */
export default function AnimatedCounter({
  value,
  duration = 1600,
  className,
}: {
  value: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()

  const match = value.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/)
  const prefix = match?.[1] ?? ''
  const numeric = match?.[2] ?? ''
  const suffix = match?.[3] ?? ''

  const target = Number(numeric.replace(/,/g, ''))
  const decimals = numeric.includes('.') ? numeric.split('.')[1].length : 0
  const animatable = Boolean(match) && Number.isFinite(target) && target > 0

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!animatable) return
    if (reduce || !inView) {
      if (reduce) setCurrent(target)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutExpo — quick start, gentle settle: reads as "counting up"
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCurrent(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [animatable, inView, reduce, target, duration])

  if (!animatable) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    )
  }

  const formatted = current.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

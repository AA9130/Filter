'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Counts up to a numeric target when scrolled into view.
 *
 * THE IMPORTANT PART IS THE INITIAL STATE. This component used to initialise at
 * zero and count up once an IntersectionObserver fired, which meant the
 * prerendered HTML contained `<span>0+</span>` where the content said `12,000+`.
 * Every crawler that does not execute JavaScript — which includes most AI
 * retrieval agents — read "0+ Happy customers", "0 Emirates covered" and "0.0
 * Average rating" as the site's own statement about itself. A rendering crawler
 * was not much better off: a headless render that never scrolls never trips the
 * observer, so the zero stood there too.
 *
 * So the final value is the initial value, and the count-up is added on top:
 *  · Server and first client render output the real number. There is no state
 *    in which the wrong number exists in the DOM.
 *  · The animation only runs if, at mount, the element is still BELOW the fold.
 *    Something the reader is already looking at is not re-animated from zero —
 *    which would be exactly the flash of wrong content this exists to prevent.
 *  · Reduced motion, no IntersectionObserver, or JavaScript disabled: the
 *    number is simply correct and static.
 *
 * The decoration is allowed to be conditional. The fact is not.
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

  // Accepts decorated values — "12,000+", "4.9", "15" — by splitting into
  // prefix + number + suffix and animating only the number, preserving decimal
  // precision and thousands separators.
  const match = value.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/)
  const prefix = match?.[1] ?? ''
  const numeric = match?.[2] ?? ''
  const suffix = match?.[3] ?? ''

  const target = Number(numeric.replace(/,/g, ''))
  const decimals = numeric.includes('.') ? numeric.split('.')[1].length : 0
  const animatable = Boolean(match) && Number.isFinite(target) && target > 0

  /** Starts at the answer. Only an in-flight animation ever moves it. */
  const [displayed, setDisplayed] = useState(target)

  useEffect(() => {
    const el = ref.current
    if (!el || !animatable) return

    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    // Already visible: leave the number alone. Animating it now would show the
    // reader a value change that never should have happened.
    if (el.getBoundingClientRect().top < window.innerHeight) return

    let frame = 0
    let cancelled = false

    const run = () => {
      const start = performance.now()
      setDisplayed(0)

      const tick = (now: number) => {
        if (cancelled) return
        const progress = Math.min((now - start) / duration, 1)
        // easeOutExpo — quick start, gentle settle: reads as "counting up"
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
        setDisplayed(progress === 1 ? target : target * eased)
        if (progress < 1) frame = requestAnimationFrame(tick)
      }

      frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        run()
      },
      { rootMargin: '0px 0px -60px 0px' },
    )

    observer.observe(el)

    return () => {
      cancelled = true
      observer.disconnect()
      cancelAnimationFrame(frame)
      // Whatever interrupted us, the number left behind must be the real one.
      setDisplayed(target)
    }
  }, [animatable, target, duration])

  if (!animatable) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    )
  }

  const formatted = displayed.toLocaleString('en-US', {
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

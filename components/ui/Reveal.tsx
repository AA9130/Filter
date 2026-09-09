'use client'

import { useEffect, useRef, type ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  /** Stagger helper — delay in seconds. */
  delay?: number
  from?: 'bottom' | 'left' | 'right' | 'none'
  className?: string
  as?: 'div' | 'li' | 'article' | 'section' | 'span'
}

/**
 * Scroll-triggered entrance.
 *
 * The animation itself is pure CSS (see [data-reveal] in globals.css); this
 * component only decides *when* to flip the attribute. All instances share ONE
 * IntersectionObserver — the page has ~100 revealed elements, and giving each
 * its own animation library instance cost more hydration time than every other
 * script on the page combined.
 *
 * Elements are unobserved once shown, so the observer's work shrinks as the
 * visitor scrolls.
 */
let sharedObserver: IntersectionObserver | null = null

function getObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null
  if (sharedObserver) return sharedObserver

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.setAttribute('data-revealed', '')
        sharedObserver?.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -80px 0px' },
  )

  return sharedObserver
}

export default function Reveal({
  children,
  delay = 0,
  from = 'bottom',
  className,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Tells the inline guard in app/layout.tsx that hydration happened, so it
    // leaves `data-js` in place. If no Reveal ever mounts — a failed chunk, a
    // hydration error — the guard disarms the reveal CSS and the page shows
    // rather than staying blank.
    document.documentElement.setAttribute('data-reveal-ready', '')

    const observer = getObserver()
    // No observer support: show immediately rather than leaving content hidden
    if (!observer) {
      el.setAttribute('data-revealed', '')
      return
    }

    observer.observe(el)
    return () => observer.unobserve(el)
  }, [])

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal={from}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  )
}

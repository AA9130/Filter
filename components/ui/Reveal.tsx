'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { springDefault } from '@/lib/motion'

type RevealProps = {
  children: ReactNode
  /** Stagger helper — delay in seconds. */
  delay?: number
  /** Direction the element travels in from. */
  from?: 'bottom' | 'left' | 'right' | 'none'
  className?: string
  /** Render as a different element (e.g. 'li', 'article'). */
  as?: 'div' | 'li' | 'article' | 'section' | 'span'
}

const offsets = {
  bottom: { y: 28, x: 0 },
  left: { y: 0, x: -32 },
  right: { y: 0, x: 32 },
  none: { y: 0, x: 0 },
}

/**
 * Scroll-triggered entrance. Settles on a critically damped spring rather than
 * a fixed-duration curve: nothing overshoots, because nothing here was thrown —
 * the bounce is reserved for motion the user's own gesture put in flight.
 */
export default function Reveal({
  children,
  delay = 0,
  from = 'bottom',
  className,
  as = 'div',
}: RevealProps) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as]
  const offset = offsets[from]

  // Reduced motion keeps the meaning (a fade) and drops the travel
  if (reduce) {
    return (
      <MotionTag
        data-reveal
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.2, delay }}
      >
        {children}
      </MotionTag>
    )
  }

  return (
    <MotionTag
      data-reveal
      className={className}
      initial={{ opacity: 0, y: offset.y, x: offset.x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ ...springDefault, delay }}
    >
      {children}
    </MotionTag>
  )
}

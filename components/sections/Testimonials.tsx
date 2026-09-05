'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import StarRating from '@/components/ui/StarRating'
import type { Testimonial } from '@/lib/content'
import { springMomentum, springDefault, project, GESTURE_THRESHOLD_PX } from '@/lib/motion'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 7000

export default function Testimonials({
  testimonials,
  rating,
  reviewCount,
}: {
  testimonials: Testimonial[]
  rating: string
  reviewCount: string
}) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [index, setIndex] = useState(0)
  const [perView, setPerView] = useState(1)
  const [paused, setPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const reduce = useReducedMotion()

  const x = useMotionValue(0)
  // The slide pitch has to be state, not a ref: drag constraints are resolved
  // at render, and a stale 0 collapses them to a zero-width range — the cards
  // would then barely follow the finger even though the landing looked right.
  const [pitch, setPitch] = useState(0)

  const pages = Math.max(1, testimonials.length - perView + 1)

  /** Measure a real slide rather than assuming, so gaps and breakpoints agree. */
  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const first = track.children[0] as HTMLElement | undefined
    const second = track.children[1] as HTMLElement | undefined
    if (!first) return
    const measured = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth
    setPitch(measured)
    setPerView(Math.max(1, Math.round(track.offsetWidth / (measured || 1))))
  }, [])

  useLayoutEffect(() => {
    measure()
    const observer = new ResizeObserver(measure)
    if (trackRef.current) observer.observe(trackRef.current)
    return () => observer.disconnect()
  }, [measure])

  /** Animations always start from the live on-screen value, never the target. */
  const goTo = useCallback(
    (next: number, velocity = 0) => {
      const clamped = Math.max(0, Math.min(pages - 1, next))
      setIndex(clamped)
      animate(x, -clamped * pitch, reduce ? { duration: 0 } : { ...springMomentum, velocity })
    },
    [pages, pitch, reduce, x],
  )

  const next = useCallback(() => goTo((index + 1) % pages), [goTo, index, pages])
  const prev = useCallback(() => goTo((index - 1 + pages) % pages), [goTo, index, pages])

  // Keep position honest when the viewport resizes mid-view
  useEffect(() => {
    x.set(-index * pitch)
  }, [perView, pitch, index, x])

  useEffect(() => {
    if (paused || dragging || reduce || pages < 2) return
    const timer = setInterval(() => goTo((index + 1) % pages), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [paused, dragging, reduce, pages, index, goTo])

  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      setDragging(false)

      // Land where the throw is heading, not where the finger let go — this is
      // what lets a short flick travel a long way, like native scroll.
      const projected = x.get() + project(info.velocity.x)
      const target = Math.round(-projected / (pitch || 1))

      // A gesture too small to be a swipe is treated as a tap on the card
      if (
        Math.abs(info.offset.x) < GESTURE_THRESHOLD_PX &&
        Math.abs(info.velocity.x) < 100
      ) {
        goTo(index)
        return
      }

      goTo(target, info.velocity.x)
    },
    [goTo, index, pitch, x],
  )

  return (
    <section id="testimonials" className="section bg-white">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            align="left"
            eyebrow="Testimonials"
            title={`Rated ${rating}/5 by UAE households and businesses`}
            subtitle="Real feedback from customers across the Emirates — apartments, villas, offices and commercial kitchens."
            className="lg:max-w-2xl"
          />

          <Reveal delay={0.1} className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-soft">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-ink">{rating} / 5</p>
                <p className="text-[0.6875rem] text-ink-muted">{reviewCount} reviews</p>
              </div>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={prev}
                disabled={index === 0}
                aria-label="Previous testimonials"
                className="press grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-ink hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                disabled={index >= pages - 1}
                aria-label="Next testimonials"
                className="press grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-ink hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </Reveal>
        </div>

        <div
          className="mt-12 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <motion.ul
            ref={trackRef}
            style={{ x }}
            drag={reduce ? false : 'x'}
            dragConstraints={{ left: -(pages - 1) * pitch, right: 0 }}
            // Resistance past the first and last card, rather than a dead stop
            dragElastic={0.12}
            dragMomentum={false}
            dragDirectionLock
            onDragStart={() => setDragging(true)}
            onDragEnd={handleDragEnd}
            className={cn(
              'flex touch-pan-y gap-5',
              !reduce && (dragging ? 'cursor-grabbing' : 'cursor-grab'),
            )}
            aria-live="polite"
          >
            {testimonials.map((t) => (
              <li
                key={t.name}
                className="w-[85%] shrink-0 sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
              >
                <figure className="flex h-full select-none flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <StarRating rating={t.rating} />
                    <Quote className="h-7 w-7 text-brand-100" />
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-aqua-500 text-sm font-bold text-white"
                    >
                      {t.name
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-ink">{t.name}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{t.location}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[0.6875rem] font-medium text-brand-600">
                        {t.role}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </motion.ul>

          {/* Progress dots double as the drag affordance's read-out */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={index === i}
                className="press grid h-6 place-items-center px-0.5"
              >
                <motion.span
                  animate={{ width: index === i ? 32 : 8 }}
                  transition={springDefault}
                  className={cn(
                    'block h-2 rounded-full',
                    index === i ? 'bg-brand-600' : 'bg-slate-300 hover:bg-brand-300',
                  )}
                />
              </button>
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-ink-muted sm:hidden">
            Swipe to read more reviews
          </p>
        </div>
      </div>
    </section>
  )
}

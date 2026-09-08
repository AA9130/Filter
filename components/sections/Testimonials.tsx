'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Quote } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import StarRating from '@/components/ui/StarRating'
import type { Testimonial } from '@/lib/content'
import { cn } from '@/lib/utils'

/**
 * Scroll-snap carousel.
 *
 * The scrolling is the browser's own: `scroll-snap-type` plus `overflow-x`
 * gives real touch momentum, rubber-banding at the ends and snap-to-card for
 * free — the platform's physics, tuned per device, with no animation library
 * and no drag handling of our own. It also works with a trackpad, a mouse
 * wheel, arrow keys and a screen reader, which a custom drag never did.
 *
 * The only JavaScript here moves the scroll position when the arrows or dots
 * are used, and reads it back to light the right dot.
 *
 * `testimonials` arrives already filtered by the content seam: an entry only
 * appears once the `testimonials_authentic` claim is verified AND that entry
 * has a public review URL or a recorded consent date. With none verified the
 * array is empty and the whole section renders nothing — which is the correct
 * output. Unverifiable named testimonials are the E-E-A-T signal most likely to
 * be read as fabricated, and no Review or AggregateRating markup is emitted
 * either.
 */
export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [index, setIndex] = useState(0)
  const [perView, setPerView] = useState(1)

  const pages = Math.max(1, testimonials.length - perView + 1)

  // Read the scroll position back, rAF-throttled so a fast flick cannot queue
  // up more work than the compositor can drain.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0

    const sync = () => {
      frame = 0
      const first = track.children[0] as HTMLElement | undefined
      const second = track.children[1] as HTMLElement | undefined
      if (!first) return
      const pitch = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth
      if (!pitch) return
      setIndex(Math.round(track.scrollLeft / pitch))
      setPerView(Math.max(1, Math.round(track.clientWidth / pitch)))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync)
    }

    sync()
    track.addEventListener('scroll', onScroll, { passive: true })
    const observer = new ResizeObserver(sync)
    observer.observe(track)

    return () => {
      track.removeEventListener('scroll', onScroll)
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const goTo = useCallback((next: number) => {
    const track = trackRef.current
    if (!track) return
    const first = track.children[0] as HTMLElement | undefined
    const second = track.children[1] as HTMLElement | undefined
    if (!first) return
    const pitch = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth
    track.scrollTo({ left: next * pitch, behavior: 'smooth' })
  }, [])

  // Nothing verified to show: render nothing at all.
  if (testimonials.length === 0) return null

  return (
    <section id="testimonials" className="section bg-white">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            align="left"
            eyebrow="Testimonials"
            title="What customers say"
            subtitle="Feedback from customers across the Emirates — apartments, villas, offices and commercial kitchens."
            className="lg:max-w-2xl"
          />

          <Reveal delay={0.1} className="flex shrink-0 items-center gap-3">
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => goTo(Math.max(0, index - 1))}
                disabled={index === 0}
                aria-label="Previous testimonials"
                className="press grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-ink hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(Math.min(pages - 1, index + 1))}
                disabled={index >= pages - 1}
                aria-label="Next testimonials"
                className="press grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-ink hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </Reveal>
        </div>

        <ul
          ref={trackRef}
          className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth pb-2"
          tabIndex={0}
          aria-label="Customer testimonials"
        >
          {testimonials.map((t) => (
            <li
              key={t.id}
              className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
            >
              <figure className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-6 shadow-soft">
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
                    {t.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
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
        </ul>

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
              <span
                className={cn(
                  'block h-2 rounded-full transition-all duration-300',
                  index === i ? 'w-8 bg-brand-600' : 'w-2 bg-slate-300 hover:bg-brand-300',
                )}
              />
            </button>
          ))}
        </div>

        <p className="mt-3 text-center text-xs text-ink-muted sm:hidden">
          Swipe to read more reviews
        </p>
      </div>
    </section>
  )
}

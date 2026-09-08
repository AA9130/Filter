'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, MessageCircle, Clock, MapPin, ChevronRight } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { navLinks, site, whatsappLink } from '@/lib/site'
import { springs, spring, project, rubberband, GESTURE_THRESHOLD_PX } from '@/lib/motion'
import { cn } from '@/lib/utils'

const FALLBACK_PANEL_WIDTH = 360

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const panelRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef(FALLBACK_PANEL_WIDTH)
  const xRef = useRef(FALLBACK_PANEL_WIDTH)
  const cancelRef = useRef<(() => void) | null>(null)
  const dragRef = useRef<{ startX: number; startPanelX: number; lastX: number; lastT: number; v: number } | null>(null)

  /**
   * The panel position is written straight to the DOM, never held in React
   * state. A drag produces a value every frame; routing that through a
   * re-render would re-run the whole header sixty times a second for a
   * transform the compositor could have handled alone.
   */
  const applyX = useCallback((value: number) => {
    xRef.current = value
    const width = widthRef.current
    const panel = panelRef.current
    const scrim = scrimRef.current
    if (panel) panel.style.transform = `translate3d(${value}px,0,0)`
    if (scrim) {
      // The scrim tracks the sheet 1:1 the whole way, not just at the end
      scrim.style.opacity = String(Math.max(0, Math.min(1, 1 - value / width)))
      scrim.style.pointerEvents = value < width - 1 ? 'auto' : 'none'
    }
    if (panel) {
      const closed = value >= width - 1
      panel.style.pointerEvents = closed ? 'none' : 'auto'
      if (closed) panel.setAttribute('inert', '')
      else panel.removeAttribute('inert')
    }
  }, [])

  const measure = useCallback(() => {
    const width = panelRef.current?.offsetWidth
    if (width) widthRef.current = width
  }, [])

  const settleTo = useCallback(
    (target: number, velocity = 0) => {
      cancelRef.current?.()
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) {
        applyX(target)
        return
      }
      cancelRef.current = spring({
        from: xRef.current,
        to: target,
        velocity,
        ...springs.drawer,
        onUpdate: applyX,
      })
    },
    [applyX],
  )

  const openDrawer = useCallback(() => {
    measure()
    setOpen(true)
    settleTo(0)
  }, [measure, settleTo])

  const closeDrawer = useCallback(
    (velocity = 0) => {
      setOpen(false)
      settleTo(widthRef.current, velocity)
    },
    [settleTo],
  )

  useLayoutEffect(() => {
    measure()
    applyX(widthRef.current)
  }, [measure, applyX])

  useEffect(() => {
    const onResize = () => {
      measure()
      if (!open) applyX(widthRef.current)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measure, applyX, open])

  // --- Gesture ---------------------------------------------------------------
  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    // Grabbing cancels whatever the sheet was doing, so a closing drawer can be
    // caught mid-flight and thrown back open.
    cancelRef.current?.()
    dragRef.current = {
      startX: event.clientX,
      startPanelX: xRef.current,
      lastX: event.clientX,
      lastT: event.timeStamp,
      v: 0,
    }
  }, [])

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag) return

      const dx = event.clientX - drag.startX
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        if (Math.abs(dx) < GESTURE_THRESHOLD_PX) return
        event.currentTarget.setPointerCapture(event.pointerId)
      }

      // Velocity from the last two samples, which is what the release needs
      const dt = event.timeStamp - drag.lastT
      if (dt > 0) drag.v = ((event.clientX - drag.lastX) / dt) * 1000
      drag.lastX = event.clientX
      drag.lastT = event.timeStamp

      let next = drag.startPanelX + dx
      // Past the open edge the sheet resists progressively rather than stopping
      if (next < 0) next = -rubberband(-next, widthRef.current)
      applyX(next)
    },
    [applyX],
  )

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag) return
      dragRef.current = null
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      // Land where the throw is heading, not where the finger stopped
      const projected = xRef.current + project(drag.v)
      if (projected > widthRef.current / 2) closeDrawer(drag.v)
      else {
        setOpen(true)
        settleTo(0, drag.v)
      }
    },
    [closeDrawer, settleTo],
  )

  // Solid, shadowed header once the user scrolls past the hero top
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close on navigation
  useEffect(() => {
    setOpen(false)
    settleTo(widthRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Escape closes, matching the dismiss path
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeDrawer])

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Utility strip — reinforces coverage + hours above the fold */}
      <div className="hidden bg-brand-950 text-brand-100 lg:block">
        <div className="container-page flex h-10 items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-aqua-300" />
              Serving all 7 Emirates
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-aqua-300" />
              24-hour emergency call-out
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href={site.emailHref} className="transition-colors hover:text-white">
              {site.email}
            </a>
            <span className="text-brand-300/50">|</span>
            <span className="font-medium text-white">Free water test &amp; demo</span>
          </div>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-[background-color,box-shadow] duration-300',
          scrolled ? 'material-chrome material-edge shadow-soft' : 'bg-white lg:material-chrome',
        )}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                    active ? 'text-brand-700' : 'text-ink-soft hover:text-brand-700',
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand-600 to-aqua-500" />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Phone — the highest-intent action, always visible */}
            <a
              href={site.phone.href}
              data-analytics="call-click-header"
              className="group hidden items-center gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-brand-50 md:flex"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <Phone className="h-4 w-4" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-ink-muted">
                  Call 24/7
                </span>
                <span className="text-sm font-bold text-ink">{site.phone.display}</span>
              </span>
            </a>

            {/* Compact call button — keeps the phone one tap away on mobile,
                where the full number block above is hidden */}
            <a
              href={site.phone.href}
              data-analytics="call-click-header-mobile"
              aria-label={`Call ${site.name} on ${site.phone.display}`}
              className="press grid h-11 w-11 place-items-center rounded-xl bg-cta-500 text-white shadow-[0_8px_20px_-10px_rgb(234_88_12/0.9)] md:hidden"
            >
              <Phone className="h-5 w-5" />
            </a>

            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="whatsapp-click-header"
              className="btn-whatsapp !px-4 !py-2.5"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => (open ? closeDrawer() : openDrawer())}
              className="press grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-ink hover:bg-slate-50 lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Scrim — dims to focus, and follows the sheet continuously */}
      <div
        ref={scrimRef}
        onClick={() => closeDrawer()}
        aria-hidden="true"
        style={{ opacity: 0, pointerEvents: 'none' }}
        // Above the header (z-50) and the sticky call bar (z-50): a modal task
        // dims everything behind it, and a light surface must never be left
        // sitting on top of the dimmed layer.
        className="fixed inset-0 z-[55] bg-ink/40 backdrop-blur-sm lg:hidden"
      />

      {/* Drawer — enters and leaves along the same path, and is grabbable at
          any point in that journey, including mid-animation. */}
      <div
        id="mobile-menu"
        ref={panelRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        // `pan-y` hands vertical scrolling to the browser and keeps horizontal
        // gestures for the sheet. Inertness follows the panel's real position,
        // not the intent to close, so a closing sheet stays grabbable.
        className="fixed right-0 top-0 z-[60] flex h-full w-[86%] max-w-sm touch-pan-y flex-col overflow-y-auto bg-white shadow-2xl lg:hidden"
      >
        {/* Grab handle — tells the user this surface is draggable */}
        <div
          aria-hidden="true"
          className="absolute left-1.5 top-1/2 h-16 w-1 -translate-y-1/2 rounded-full bg-slate-200"
        />

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <Logo />
          <button
            type="button"
            onClick={() => closeDrawer()}
            className="press grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-ink"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-5 py-4" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'press flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold',
                    pathname === link.href
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink hover:bg-slate-50',
                  )}
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3">
            <a href={site.phone.href} className="btn-cta btn-lg w-full">
              <Phone className="h-5 w-5" />
              Call {site.phone.display}
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp btn-lg w-full"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp Us
            </a>
          </div>

          <div className="mt-6 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
            <p className="font-semibold">Free water test &amp; demo</p>
            <p className="mt-1 text-brand-800/80">
              TDS and hardness measured at your tap, across all 7 Emirates. No call-out fee.
            </p>
          </div>
        </nav>
      </div>
    </>
  )
}

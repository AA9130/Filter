'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'framer-motion'
import { Menu, X, Phone, MessageCircle, Clock, MapPin, ChevronRight } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { navLinks, site, whatsappLink } from '@/lib/site'
import { springDrawer, springSnappy, project } from '@/lib/motion'
import { cn } from '@/lib/utils'

const FALLBACK_PANEL_WIDTH = 360

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const reduce = useReducedMotion()

  const panelRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef(FALLBACK_PANEL_WIDTH)
  // Drag constraints are resolved at render, so the width has to be state,
  // not just a ref that imperative code reads.
  const [panelWidth, setPanelWidth] = useState(FALLBACK_PANEL_WIDTH)

  /**
   * The drawer is never unmounted. Keeping it in the tree is what lets a user
   * grab it mid-close and throw it back open — an animation the interface
   * refuses to hand back is the thing that reads as "computer", not "material".
   */
  const x = useMotionValue(FALLBACK_PANEL_WIDTH)

  // Scrim opacity tracks the sheet position 1:1 the whole way through the drag,
  // rather than fading only once the gesture has been classified.
  const scrimOpacity = useTransform(x, (value) =>
    Math.max(0, Math.min(1, 1 - value / widthRef.current)),
  )
  const [interactive, setInteractive] = useState(false)
  useMotionValueEvent(x, 'change', (value) => {
    setInteractive(value < widthRef.current - 1)
  })

  const measure = useCallback(() => {
    const width = panelRef.current?.offsetWidth
    if (width) {
      widthRef.current = width
      setPanelWidth(width)
    }
  }, [])

  useLayoutEffect(() => {
    measure()
    x.set(widthRef.current)
  }, [measure, x])

  useEffect(() => {
    const onResize = () => {
      measure()
      if (!open) x.set(widthRef.current)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measure, open, x])

  const openDrawer = useCallback(() => {
    measure()
    setOpen(true)
    animate(x, 0, reduce ? { duration: 0 } : springDrawer)
  }, [measure, reduce, x])

  /** `velocity` hands the finger's speed to the spring so there is no seam. */
  const closeDrawer = useCallback(
    (velocity = 0) => {
      setOpen(false)
      animate(x, widthRef.current, reduce ? { duration: 0 } : { ...springDrawer, velocity })
    },
    [reduce, x],
  )

  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      // Land on where the throw is going, not where the finger left off.
      const projected = x.get() + project(info.velocity.x)
      const shouldClose = projected > widthRef.current / 2

      if (shouldClose) {
        closeDrawer(info.velocity.x)
        return
      }

      // Where the sheet comes to rest is the truth, not the last intent. A user
      // who catches a closing drawer and throws it back open has re-opened it —
      // `open` has to agree, or the button label, aria-expanded and the body
      // scroll lock all end up describing a drawer that is no longer there.
      setOpen(true)
      animate(x, 0, { ...springDrawer, velocity: info.velocity.x })
    },
    [closeDrawer, x],
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
    animate(x, widthRef.current, reduce ? { duration: 0 } : springDrawer)
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
                    <motion.span
                      layoutId="nav-active"
                      transition={springSnappy}
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand-600 to-aqua-500"
                    />
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
      <motion.div
        style={{ opacity: scrimOpacity }}
        onClick={() => closeDrawer()}
        aria-hidden="true"
        className={cn(
          // Above the header (z-50) and the sticky call bar (z-50): a modal
          // task dims everything behind it, and a light surface must never be
          // left sitting on top of the dimmed layer.
          'fixed inset-0 z-[55] bg-ink/40 backdrop-blur-sm lg:hidden',
          interactive ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      />

      {/* Drawer — enters and leaves along the same path, and is grabbable at
          any point in that journey, including mid-animation. */}
      <motion.div
        id="mobile-menu"
        ref={panelRef}
        style={{ x }}
        drag={reduce ? false : 'x'}
        dragConstraints={{ left: 0, right: panelWidth }}
        // Small elasticity past the open edge: resistance that builds, so the
        // boundary reads as a limit rather than a wall.
        dragElastic={0.06}
        dragMomentum={false}
        dragDirectionLock
        onDragEnd={handleDragEnd}
        // Inert follows the panel's real position, not the intent to close.
        // Keying it to `open` would revoke pointer events the instant a close
        // began — leaving a sheet that is still on screen but can no longer be
        // grabbed, which is exactly the animation-you-cannot-take-back problem.
        inert={!interactive}
        className={cn(
          'fixed right-0 top-0 z-[60] flex h-full w-[86%] max-w-sm flex-col overflow-y-auto bg-white shadow-2xl lg:hidden',
          interactive ? 'pointer-events-auto' : 'pointer-events-none',
        )}
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
              Certified technicians across all 7 Emirates. 24-hour emergency support.
            </p>
          </div>
        </nav>
      </motion.div>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, ArrowUp, X, Phone } from 'lucide-react'
import { site, whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from '@/lib/site'
import { cn } from '@/lib/utils'

/**
 * Always-visible WhatsApp entry point, a back-to-top control, and a one-time
 * nudge bubble.
 *
 * Both enter and exit are plain CSS transitions on always-mounted elements:
 * keeping them in the tree and toggling opacity/scale gives the same in-and-out
 * motion an animation library's presence wrapper provides, at no JS cost.
 * `pointer-events` follows visibility so hidden controls are never clickable.
 */
export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false)
  const [nudge, setNudge] = useState(false)
  const [nudgeDismissed, setNudgeDismissed] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (nudgeDismissed) return
    const timer = setTimeout(() => setNudge(true), 6000)
    return () => clearTimeout(timer)
  }, [nudgeDismissed])

  const dismissNudge = () => {
    setNudge(false)
    setNudgeDismissed(true)
  }

  return (
    <div className="pointer-events-none fixed bottom-[5.5rem] right-4 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        aria-hidden={!showTop}
        tabIndex={showTop ? 0 : -1}
        className={cn(
          'press grid h-11 w-11 place-items-center rounded-full border border-slate-200 material-panel text-brand-700 shadow-card',
          'transition-all duration-300 hover:bg-brand-50',
          showTop
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-2 scale-90 opacity-0',
        )}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      {/* Nudge bubble — grows from the button it belongs to */}
      <div
        aria-hidden={!nudge}
        className={cn(
          'relative w-[17rem] origin-bottom-right rounded-2xl rounded-br-sm border border-slate-200 bg-white p-4 shadow-card',
          'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          nudge
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100 blur-0'
            : 'pointer-events-none translate-y-2 scale-90 opacity-0 blur-sm',
        )}
      >
        <button
          type="button"
          onClick={dismissNudge}
          tabIndex={nudge ? 0 : -1}
          className="press absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-ink-muted hover:bg-slate-100"
          aria-label="Dismiss message"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <p className="pr-6 text-sm font-semibold text-ink">Need clean water today?</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
          Send us a message — we reply in minutes and can often visit the same day.
        </p>
        <div className="mt-3 flex gap-2">
          <a
            href={whatsappLink(WHATSAPP_DEFAULT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismissNudge}
            tabIndex={nudge ? 0 : -1}
            data-analytics="whatsapp-click-nudge"
            className="btn-whatsapp flex-1 !px-3 !py-2 !text-xs"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
          <a
            href={site.phone.href}
            onClick={dismissNudge}
            tabIndex={nudge ? 0 : -1}
            data-analytics="call-click-nudge"
            className="btn-outline !px-3 !py-2 !text-xs"
          >
            <Phone className="h-3.5 w-3.5" />
            Call
          </a>
        </div>
      </div>

      {/* Floating WhatsApp button */}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismissNudge}
        data-analytics="whatsapp-click-float"
        aria-label="Chat with us on WhatsApp"
        className="press pointer-events-auto relative grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_12px_30px_-8px_rgb(37_211_102/0.7)] hover:scale-105 md:h-16 md:w-16"
      >
        <span className="absolute inset-0 animate-ripple rounded-full bg-whatsapp/50" aria-hidden="true" />
        <MessageCircle className="relative h-7 w-7 md:h-8 md:w-8" />
      </a>
    </div>
  )
}

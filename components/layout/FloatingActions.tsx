'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, ArrowUp, X, Phone } from 'lucide-react'
import { site, whatsappLink, WHATSAPP_DEFAULT_MESSAGE } from '@/lib/site'
import { springDefault, springDrawer } from '@/lib/motion'

/**
 * Always-visible WhatsApp entry point plus a back-to-top control.
 * On first scroll a small nudge bubble opens once to invite the chat, then
 * stays dismissed for the session.
 */
export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false)
  const [nudge, setNudge] = useState(false)
  const [nudgeDismissed, setNudgeDismissed] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
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
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={springDefault}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="press pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-slate-200 material-panel text-brand-700 shadow-card hover:bg-brand-50"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Nudge bubble */}
      <AnimatePresence>
        {nudge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 8, filter: 'blur(8px)' }}
            transition={springDrawer}
            // Anchored to the button it belongs to, so the spatial relationship
            // between trigger and content is never in question
            style={{ transformOrigin: 'bottom right' }}
            className="pointer-events-auto relative w-[17rem] rounded-2xl rounded-br-sm border border-slate-200 bg-white p-4 shadow-card"
          >
            <button
              type="button"
              onClick={dismissNudge}
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
                data-analytics="whatsapp-click-nudge"
                className="btn-whatsapp flex-1 !px-3 !py-2 !text-xs"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
              <a
                href={site.phone.href}
                onClick={dismissNudge}
                data-analytics="call-click-nudge"
                className="btn-outline !px-3 !py-2 !text-xs"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

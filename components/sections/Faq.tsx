'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, MessageCircle } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import type { Faq as FaqItem } from '@/lib/content'
import { whatsappLink } from '@/lib/site'
import { springDefault, springSnappy } from '@/lib/motion'
import { cn } from '@/lib/utils'

export default function Faq({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="section bg-slate-50">
      <div className="container-page">
        <SectionHeading
          eyebrow="FAQs"
          title="Straight answers about water filtration in the UAE"
          subtitle="Still unsure about something? Send us a WhatsApp message — we answer honestly, even when the answer is that you do not need to buy anything."
        />

        <div className="mx-auto mt-14 max-w-3xl space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <Reveal key={faq.q} delay={Math.min(i * 0.04, 0.2)}>
                <div
                  className={cn(
                    'overflow-hidden rounded-2xl border bg-white transition-colors',
                    isOpen ? 'border-brand-200 shadow-soft' : 'border-slate-200/80',
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      className="press flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                    >
                      <span
                        className={cn(
                          'text-sm font-bold sm:text-base',
                          isOpen ? 'text-brand-700' : 'text-ink',
                        )}
                      >
                        {faq.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={springSnappy}
                        className={cn(
                          'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-200',
                          isOpen ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft',
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </motion.span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={springDefault}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft sm:px-6 sm:pb-6">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 text-center">
            <a
              href={whatsappLink('Hi, I have a question about water filtration:')}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="whatsapp-click-faq"
              className="btn-whatsapp btn-lg"
            >
              <MessageCircle className="h-5 w-5" />
              Ask us anything on WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

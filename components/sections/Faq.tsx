import Link from 'next/link'
import { Plus, MessageCircle, ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import type { Faq as FaqItem } from '@/lib/content'
import { whatsappLink } from '@/lib/site'

/**
 * Native <details> accordion — a server component with no JavaScript at all.
 *
 * The browser already implements disclosure, including the keyboard and
 * screen-reader semantics, and `name` makes the group exclusive so opening one
 * closes the others. Dropping to the platform primitive removed a client
 * component, its share of hydration, and the duplicate copy of every question
 * and answer that had to be serialized to the browser as props.
 *
 * Answers live in the markup whether or not the details element is open, which
 * is what makes them available to a crawler that does not click. Each item
 * carries its FAQ id as an anchor, so a link like /faqs#ro-leaking lands on the
 * question rather than the top of the page.
 */
export default function Faq({
  faqs,
  heading = 'Straight answers about water filtration in the UAE',
  subtitle = 'Still unsure about something? Send us a WhatsApp message — we answer honestly, even when the answer is that you do not need to buy anything.',
  seeAllHref,
  /** Heading level for each question. `h3` under an `h2` section heading. */
  as: QuestionHeading = 'h3',
}: {
  faqs: FaqItem[]
  heading?: string
  subtitle?: string
  seeAllHref?: string
  as?: 'h2' | 'h3'
}) {
  if (faqs.length === 0) return null

  return (
    <section id="faq" className="section bg-slate-50">
      <div className="container-page">
        <SectionHeading eyebrow="FAQs" title={heading} subtitle={subtitle} />

        <div className="mx-auto mt-14 max-w-3xl space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={faq.id} delay={Math.min(i * 0.04, 0.2)}>
              <details
                id={faq.id}
                name="faq"
                open={i === 0}
                className="faq-item scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-colors"
              >
                <summary className="press flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5">
                  <QuestionHeading className="text-sm font-bold sm:text-base">
                    {faq.q}
                  </QuestionHeading>
                  <span
                    aria-hidden="true"
                    className="faq-marker grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-ink-soft transition-all duration-300"
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="faq-answer px-5 pb-5 text-sm leading-relaxed text-ink-soft sm:px-6 sm:pb-6">
                  {faq.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={whatsappLink('Hi, I have a question about water filtration:')}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics="whatsapp-click-faq"
              className="btn-whatsapp btn-lg"
            >
              <MessageCircle aria-hidden="true" className="h-5 w-5" />
              Ask us anything on WhatsApp
            </a>
            {seeAllHref && (
              <Link href={seeAllHref} className="btn-outline btn-lg">
                Read all FAQs
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

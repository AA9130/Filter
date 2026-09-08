import { Phone, MessageCircle, Clock, Droplets } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { site, whatsappLink } from '@/lib/site'

/** High-contrast mid/end-page conversion block. */
export default function CtaBanner({
  title = 'Water tasting off? Filter overdue? Call us today.',
  subtitle = 'Trained technicians across all 7 Emirates, manufacturer-supplied parts, and a fixed written price before we start. Same-day slots are usually available in Dubai, Abu Dhabi and Sharjah.',
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-aqua-600 py-14 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-light bg-grid opacity-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 animate-float rounded-full bg-white/10 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-aqua-300/20 blur-3xl"
      />

      <div className="container-page relative">
        <Reveal>
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                <Droplets className="h-3.5 w-3.5" />
                Free water test included
              </span>
              <h2 className="mt-5 text-2xl leading-tight text-white sm:text-3xl lg:text-[2.5rem]">
                {title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-brand-50/90 sm:text-base">
                {subtitle}
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-aqua-100">
                <Clock className="h-4 w-4" />
                Emergency line answered 24 hours a day
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
              <a
                href={site.phone.href}
                data-analytics="call-click-banner"
                className="btn-cta btn-lg group whitespace-nowrap"
              >
                <Phone className="h-5 w-5 transition-transform group-hover:rotate-12" />
                <span className="flex flex-col items-start leading-tight">
                  <span>Call Now</span>
                  <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-white/80">
                    {site.phone.display}
                  </span>
                </span>
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics="whatsapp-click-banner"
                className="btn-whatsapp btn-lg whitespace-nowrap"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

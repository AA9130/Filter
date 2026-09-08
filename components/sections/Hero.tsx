import Photo from '@/components/ui/Photo'
import Link from 'next/link'
import {
  Phone,
  MessageCircle,
  Clock,
  BadgeCheck,
  Gift,
  Droplets,
  ArrowRight,
} from 'lucide-react'
import { site, whatsappLink } from '@/lib/site'
import { images } from '@/lib/images'

/**
 * Trust indicators, each traceable to a publishable claim in
 * content/claims.json: `emergency_line_24h`, `free_water_test` and
 * `technicians_trained`. The third used to read "Certified Technicians /
 * Municipality standards", which asserted a certification and a regulatory
 * compliance the business has not evidenced — see claims
 * `technicians_certified` and `dubai_municipality_compliant`.
 */
const trustIndicators = [
  { icon: Clock, label: '24hr Emergency Line', sub: 'Answered every day' },
  { icon: Gift, label: 'Free Water Test', sub: 'On site, no obligation' },
  { icon: BadgeCheck, label: 'Trained Technicians', sub: 'Diagnose and repair on site' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-radial pt-14 lg:pt-20">
      {/* Decorative layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-light bg-grid opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-aqua-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl"
      />

      <div className="container-page relative pb-20 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy column */}
          <div>
            <div className="animate-fade-up">
              <span className="eyebrow-dark">
                <Droplets className="h-3.5 w-3.5" />
                All 7 Emirates · Same-day service
              </span>
            </div>

            <h1
              className="mt-6 animate-fade-up text-4xl leading-[1.08] text-white sm:text-5xl lg:text-[3.5rem]"
              style={{ animationDelay: '0.09s' }}
            >
              Pure Water, Healthy Life
              <span className="mt-2 block text-gradient">
                UAE&apos;s Trusted Water Filter Experts
              </span>
            </h1>

            <p
              className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-brand-100/90"
              style={{ animationDelay: '0.18s' }}
            >
              Installation, maintenance &amp; repair services across all Emirates. RO systems,
              whole-house filtration, softeners and UV — supplied, fitted and serviced by trained
              technicians who measure your water before recommending anything, and charge what they
              quote.
            </p>

            {/* Primary CTAs */}
            <div
              className="mt-9 flex animate-fade-up flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: '0.27s' }}
            >
              <a
                href={site.phone.href}
                data-analytics="call-click-hero"
                className="btn-cta btn-lg group"
                aria-label={`Call ${site.name} on ${site.phone.display}`}
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
                data-analytics="whatsapp-click-hero"
                className="btn-whatsapp btn-lg group"
              >
                <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="flex flex-col items-start leading-tight">
                  <span>WhatsApp Us</span>
                  <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-white/80">
                    Replies in minutes
                  </span>
                </span>
              </a>
            </div>

            <p
              className="mt-4 animate-fade-up text-sm text-brand-200/80"
              style={{ animationDelay: '0.36s' }}
            >
              Or{' '}
              <Link
                href="/contact#quote"
                className="font-semibold text-aqua-300 underline decoration-aqua-400/40 underline-offset-4 transition-colors hover:text-white"
              >
                book a free water test
              </Link>{' '}
              — no obligation, no pressure.
            </p>

            {/* Trust indicators */}
            <ul
              className="mt-10 grid animate-fade-up grid-cols-1 gap-3 sm:grid-cols-3 sm:items-stretch"
              style={{ animationDelay: '0.45s' }}
            >
              {trustIndicators.map(({ icon: Icon, label, sub }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur transition-colors hover:border-aqua-400/30 hover:bg-white/[0.1]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-aqua-400/15 text-aqua-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="text-[0.8125rem] font-bold leading-snug text-white sm:text-sm">
                      {label}
                    </span>
                    <span className="mt-0.5 text-[0.6875rem] leading-snug text-brand-200/80">
                      {sub}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual column */}
          <div className="relative animate-fade-up lg:pl-6" style={{ animationDelay: '0.15s' }}>
            <div className="relative overflow-hidden rounded-4xl border border-white/15 shadow-glow">
              <Photo
                src={images.heroFamily}
                alt="Family pouring a glass of clean filtered drinking water in a modern UAE kitchen"
                width={1200}
                height={1400}
                priority
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="h-[26rem] w-full object-cover sm:h-[32rem] lg:h-[34rem]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-brand-950/75 via-brand-950/10 to-transparent"
              />

              {/*
                This was a rating card reading "4.9/5 — from 12,000+ UAE
                households". Both figures are unverified claims, so the space
                now carries the offer instead, which is a stronger call to
                action than a rating nobody can check.
              */}
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-card backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-ink">
                      Free on-site water test
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      We measure your TDS and hardness at your own tap and show you the reading
                      — then quote in writing, or tell you that you need nothing.
                    </p>
                  </div>
                  <Link
                    href="/contact#quote"
                    className="hidden shrink-0 items-center gap-1 text-xs font-bold text-brand-700 hover:text-cta-600 sm:inline-flex"
                  >
                    Book it
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating stat chips */}
            <div
              className="absolute -left-2 top-8 hidden animate-fade-up rounded-2xl border border-slate-200 bg-white p-3.5 shadow-card sm:block lg:-left-6"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-eco-100 text-eco-600">
                  <Droplets className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="text-lg font-extrabold text-ink">95&ndash;99%</p>
                  <p className="text-[0.6875rem] font-medium text-ink-muted">
                    Typical RO TDS rejection
                  </p>
                </div>
              </div>
            </div>

            <div
              className="absolute -right-2 top-1/3 hidden animate-fade-up rounded-2xl border border-slate-200 bg-white p-3.5 shadow-card sm:block lg:-right-4"
              style={{ animationDelay: '0.75s' }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cta-100 text-cta-600">
                  <Clock className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="text-lg font-extrabold text-ink">~1 hr</p>
                  <p className="text-[0.6875rem] font-medium text-ink-muted">
                    Typical under-sink install
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider into the next section */}
      <div aria-hidden="true" className="pointer-events-none relative -mb-px">
        <svg viewBox="0 0 1440 80" className="block h-12 w-full sm:h-16" preserveAspectRatio="none">
          <path
            d="M0 40c180-34 360-34 540 0s360 34 540 0 360-34 360-34V80H0V40Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  )
}

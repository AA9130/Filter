'use client'

import Photo from '@/components/ui/Photo'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Phone,
  MessageCircle,
  Clock,
  BadgeCheck,
  Gift,
  Star,
  Droplets,
  ArrowRight,
} from 'lucide-react'
import { site, whatsappLink } from '@/lib/site'
import { images } from '@/lib/images'

const trustIndicators = [
  { icon: Clock, label: '24hr Service', sub: 'Emergency call-outs' },
  { icon: Gift, label: 'Free Demo', sub: 'On-site water test' },
  { icon: BadgeCheck, label: 'Certified Technicians', sub: 'Municipality standards' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

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
          <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.09 }}>
            <motion.div variants={fadeUp} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <span className="eyebrow-dark">
                <Droplets className="h-3.5 w-3.5" />
                All 7 Emirates · Same-day service
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-4xl leading-[1.08] text-white sm:text-5xl lg:text-[3.5rem]"
            >
              Pure Water, Healthy Life
              <span className="mt-2 block text-gradient">
                UAE&apos;s Trusted Water Filter Experts
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100/90"
            >
              Installation, maintenance &amp; repair services across all Emirates. RO systems,
              whole-house filtration, softeners and UV — supplied, fitted and serviced by certified
              technicians who arrive on time and charge what they quote.
            </motion.p>

            {/* Primary CTAs */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
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
            </motion.div>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              className="mt-4 text-sm text-brand-200/80"
            >
              Or{' '}
              <Link
                href="/contact#quote"
                className="font-semibold text-aqua-300 underline decoration-aqua-400/40 underline-offset-4 transition-colors hover:text-white"
              >
                book a free water test
              </Link>{' '}
              — no obligation, no pressure.
            </motion.p>

            {/* Trust indicators */}
            <motion.ul
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-stretch"
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
            </motion.ul>
          </motion.div>

          {/* Visual column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative lg:pl-6"
          >
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

              {/* Rating card */}
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-card backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-1.5 text-sm font-bold text-ink">
                        {site.stats.rating}/5
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-soft">
                      From {site.stats.customers} UAE households &amp; businesses
                    </p>
                  </div>
                  <Link
                    href="/#testimonials"
                    className="hidden shrink-0 items-center gap-1 text-xs font-bold text-brand-700 hover:text-cta-600 sm:inline-flex"
                  >
                    Reviews
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating stat chips */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute -left-2 top-8 hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-card sm:block lg:-left-6"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-eco-100 text-eco-600">
                  <Droplets className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="text-lg font-extrabold text-ink">99%</p>
                  <p className="text-[0.6875rem] font-medium text-ink-muted">TDS reduction</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="absolute -right-2 top-1/3 hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-card sm:block lg:-right-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-cta-100 text-cta-600">
                  <Clock className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="text-lg font-extrabold text-ink">60 min</p>
                  <p className="text-[0.6875rem] font-medium text-ink-muted">Typical install</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
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

import Photo from '@/components/ui/Photo'

import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import StatsStrip from '@/components/sections/StatsStrip'
import { icon } from '@/lib/icons'
import type { Reason, PublishedStat } from '@/lib/content'
import { images } from '@/lib/images'

export default function WhyChooseUs({
  reasons,
  stats,
}: {
  reasons: Reason[]
  /** Verified figures only. Empty is the normal state — see StatsStrip. */
  stats: PublishedStat[]
}) {
  return (
    <section id="why-us" className="section relative overflow-hidden bg-slate-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-light bg-grid opacity-40"
      />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="The details that make a filtration company worth keeping"
          subtitle="Anyone can sell you a filter. Reliable aftercare, honest advice and genuine parts are what keep your water clean for years."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Reasons */}
          <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {reasons.map((reason, i) => {
              const Icon = icon(reason.icon)
              return (
                <Reveal as="li" key={reason.title} delay={(i % 2) * 0.08}>
                  <div className="group card card-hover h-full">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600/10 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-base font-bold">{reason.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{reason.body}</p>
                  </div>
                </Reveal>
              )
            })}
          </ul>

          {/* Image + stats */}
          <div className="lg:col-span-5">
            <Reveal from="right">
              <div className="relative overflow-hidden rounded-3xl shadow-card">
                <Photo
                  src={images.technician}
                  alt="AquaPure technician servicing a reverse osmosis water purifier under a kitchen sink"
                  width={1200}
                  height={900}
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="h-72 w-full object-cover sm:h-80"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-aqua-300">
                    Our promise
                  </p>
                  <p className="mt-1.5 text-lg font-bold leading-snug text-white">
                    Fixed quotes in AED. No call-out fees. No surprise charges when the technician
                    arrives.
                  </p>
                </div>
              </div>
            </Reveal>

            <StatsStrip stats={stats} />
          </div>
        </div>
      </div>
    </section>
  )
}

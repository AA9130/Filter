import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import PageHero from '@/components/sections/PageHero'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import Process from '@/components/sections/Process'
import AmcPlans from '@/components/sections/AmcPlans'
import CtaBanner from '@/components/sections/CtaBanner'
import TrustBar from '@/components/sections/TrustBar'
import { icon } from '@/lib/icons'
import { getServices, getAmcPlans, getProcessSteps, getTrustBadges } from '@/lib/content'
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Water Filter Services in UAE — Installation, AMC, Repair & Filter Replacement',
  description:
    'Complete water filter services across the UAE: RO installation, whole-house filtration, water softeners, UV systems, filter replacement, AMC plans, 24-hour repairs and system relocation. Certified technicians in all 7 Emirates.',
  path: '/services',
  keywords: [
    'water filter service Dubai',
    'RO installation UAE',
    'water filter AMC Dubai',
    'water purifier repair Sharjah',
  ],
})

export default async function ServicesPage() {
  const [services, plans, steps, badges] = await Promise.all([
    getServices(), getAmcPlans(), getProcessSteps(), getTrustBadges(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Services', path: '/services' },
            ]),
          ),
        }}
      />

      <PageHero
        breadcrumb="Services"
        eyebrow="Our Services"
        title="Every water filtration service you need, from one certified team"
        subtitle="Supply, installation, scheduled maintenance, emergency repair and relocation — for apartments, villas, offices, restaurants and labour accommodation anywhere in the UAE."
      />

      <TrustBar badges={badges} />

      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Browse"
            title="Choose the service you need"
            subtitle="Each one has its own page with what is included, what it costs and how quickly we can get to you."
          />

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const Icon = icon(service.icon)
              return (
                <Reveal as="li" key={service.slug} delay={(i % 3) * 0.06} className="h-full">
                  <Link
                    href={`/services/${service.slug}`}
                    className="group card card-hover flex h-full flex-col"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-aqua-100 text-brand-700 transition-all duration-300 group-hover:from-brand-600 group-hover:to-aqua-500 group-hover:text-white">
                        <Icon className="h-7 w-7" />
                      </span>
                      {service.highlight && (
                        <span className="rounded-full bg-cta-50 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-cta-700">
                          {service.highlight}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-5 text-lg font-bold leading-snug transition-colors group-hover:text-brand-700">
                      {service.title}
                    </h2>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{service.short}</p>

                    <ul className="mt-4 flex-1 space-y-2">
                      {service.bullets.slice(0, 2).map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-sm text-ink-soft">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-eco-500" />
                          {bullet}
                        </li>
                      ))}
                    </ul>

                    <span className="link-arrow mt-5">
                      View service details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      <CtaBanner
        title="Book a certified technician — most areas same day"
        subtitle="Tell us the emirate and the problem. We confirm the slot and the price before we set off."
      />
      <Process steps={steps} />
      <AmcPlans plans={plans} />
    </>
  )
}

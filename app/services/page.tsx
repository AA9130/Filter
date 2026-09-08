import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import PageHero from '@/components/sections/PageHero'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import Process from '@/components/sections/Process'
import AmcPlans from '@/components/sections/AmcPlans'
import CtaBanner from '@/components/sections/CtaBanner'
import ServiceAreas from '@/components/sections/ServiceAreas'
import Credentials from '@/components/sections/Credentials'
import { icon } from '@/lib/icons'
import { getServices, getAmcPlans, getProcessSteps, getCredentials, getLocations } from '@/lib/content'
import { buildMetadata, breadcrumbJsonLd, collectionJsonLd, jsonLdGraph } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Water Filter Services in the UAE',
  description:
    'Water filtration services across all seven Emirates: RO purifiers, whole-house filtration, softeners, UV, filter replacement, repairs and AMC.',
  path: '/services',
})

export default async function ServicesPage() {
  const [services, plans, steps, credentials, locations] = await Promise.all([
    getServices(), getAmcPlans(), getProcessSteps(), getCredentials(), getLocations(),
  ])

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            breadcrumbJsonLd(crumbs),
            collectionJsonLd({
              name: 'AquaPure UAE water filtration services',
              description:
                'Installation, servicing, repair and maintenance of water treatment systems across the UAE.',
              path: '/services',
              items: services.map((s) => ({ name: s.title, path: `/services/${s.slug}` })),
            }),
          ),
        }}
      />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow="Our Services"
        title="Every water filtration service, from one team"
        subtitle="Supply, installation, scheduled maintenance, emergency repair and relocation — for apartments, villas, offices, restaurants and accommodation blocks anywhere in the UAE. Every job starts with a water test, because the right system is the one your reading justifies."
      />

      <Credentials credentials={credentials} />

      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Browse"
            title="Choose the service you need"
            subtitle="Each has its own page: what the service involves, who needs it, how it works, what maintenance it brings, what goes wrong and what drives the cost."
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
        title="Book a technician — same day in most of Dubai, Abu Dhabi and Sharjah"
        subtitle="Tell us the emirate and the problem. We confirm the slot, and the quotation is fixed and in writing before work starts."
      />
      <Process steps={steps} />
      <AmcPlans plans={plans} />
      <ServiceAreas locations={locations} />
    </>
  )
}

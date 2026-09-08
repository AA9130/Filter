import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Truck, Droplet, ArrowRight } from 'lucide-react'
import PageHero from '@/components/sections/PageHero'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import Credentials from '@/components/sections/Credentials'
import CtaBanner from '@/components/sections/CtaBanner'
import Faq from '@/components/sections/Faq'
import { getLocations, getCredentials, getFaqsByIds } from '@/lib/content'
import {
  buildMetadata, breadcrumbJsonLd, collectionJsonLd, faqJsonLd, jsonLdGraph,
} from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Water Filter Services by Emirate',
  description:
    'Where AquaPure works: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain — areas covered and typical response times.',
  path: '/locations',
})

const LOCATION_FAQ_IDS = ['coverage-emirates', 'emergency-repairs', 'tanker-water', 'villa-filter'] as const

export default async function LocationsPage() {
  const [locations, credentials, faqs] = await Promise.all([
    getLocations(),
    getCredentials(),
    getFaqsByIds(LOCATION_FAQ_IDS),
  ])

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/locations' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            breadcrumbJsonLd(crumbs),
            collectionJsonLd({
              name: 'AquaPure UAE service locations',
              description: 'Water filtration coverage across all seven Emirates.',
              path: '/locations',
              items: locations.map((l) => ({
                name: `Water filter services in ${l.name}`,
                path: `/locations/${l.slug}`,
              })),
            }),
            faqJsonLd(faqs, '/locations'),
          ),
        }}
      />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow="Service Locations"
        title="Where we work — all seven Emirates"
        subtitle="Teams are based in Dubai, Abu Dhabi and Sharjah, with scheduled routes covering the northern Emirates. Each page below covers what is genuinely different about that emirate, not the same paragraph with the name changed."
      />

      <Credentials credentials={credentials} />

      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Choose your emirate"
            title="Coverage, response times and what differs locally"
            subtitle="Property mix, water supply and the jobs we are actually called out for vary considerably between emirates — which is why the recommendation does too."
          />

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location, i) => (
              <Reveal as="li" key={location.slug} delay={(i % 3) * 0.06} className="h-full">
                <Link
                  href={`/locations/${location.slug}`}
                  className="group card card-hover flex h-full flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-aqua-100 text-brand-700 transition-all duration-300 group-hover:from-brand-600 group-hover:to-aqua-500 group-hover:text-white">
                      <MapPin aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-eco-50 px-2.5 py-1 text-[0.6875rem] font-bold text-eco-700">
                      <Truck aria-hidden="true" className="h-3 w-3" />
                      {location.responseTime}
                    </span>
                  </div>

                  <h2 className="mt-5 text-lg font-bold leading-snug transition-colors group-hover:text-brand-700">
                    {location.name}
                  </h2>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-soft">
                    {location.propertyMix.split('. ')[0]}.
                  </p>

                  <p className="mt-4 flex items-start gap-2 text-xs text-ink-muted">
                    <Droplet aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>Supplied by {location.utility}</span>
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                    {location.areas.slice(0, 6).join(' · ')}
                  </p>

                  <span className="link-arrow mt-5">
                    Services in {location.name}
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBanner
        title="Not sure whether we reach your area?"
        subtitle="Send your location on WhatsApp and we will confirm coverage and the next available slot for your specific area."
      />

      <Faq faqs={faqs} heading="Coverage questions" seeAllHref="/faqs" />
    </>
  )
}

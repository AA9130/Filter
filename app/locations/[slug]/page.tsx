import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Truck, Phone, MessageCircle, Droplet, ArrowRight } from 'lucide-react'
import Photo from '@/components/ui/Photo'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import Credentials from '@/components/sections/Credentials'
import AnswerBlock from '@/components/sections/AnswerBlock'
import ProseSections from '@/components/sections/ProseSections'
import RelatedLinks from '@/components/sections/RelatedLinks'
import Faq from '@/components/sections/Faq'
import CtaBanner from '@/components/sections/CtaBanner'
import { icon } from '@/lib/icons'
import { site, whatsappLink } from '@/lib/site'
import {
  getLocation, getLocations, getBusiness, getCredentials, getFaqsByIds,
  getServicesBySlugs, getProductsBySlugs, getGuidesBySlugs,
} from '@/lib/content'
import {
  buildMetadata, breadcrumbJsonLd, locationServiceJsonLd, faqJsonLd, jsonLdGraph,
} from '@/lib/seo'
import type { Section } from '@/lib/content'

/**
 * The location template.
 *
 * The thing this template is designed to make impossible is the doorway page:
 * seven URLs with one paragraph and the emirate name swapped. So it renders
 * only fields that are genuinely per-emirate — the distributing utility, the
 * property mix, the supply notes, the requests we actually get there, and the
 * local engineering considerations — and there is no generic body text to fall
 * back on. A location added to content/locations.json without real local
 * content produces a visibly thin page, which is the correct feedback.
 */

export async function generateStaticParams() {
  const locations = await getLocations()
  return locations.map(({ slug }) => ({ slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const location = await getLocation(slug)
  if (!location) return {}

  return buildMetadata({
    title: location.metaTitle,
    description: location.metaDescription,
    path: `/locations/${location.slug}`,
    image: location.image,
  })
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const location = await getLocation(slug)
  if (!location) notFound()

  const [business, credentials, faqs, services, products, guides, siblings] = await Promise.all([
    getBusiness(),
    getCredentials(),
    getFaqsByIds(location.faqIds),
    getServicesBySlugs(location.priorityServices),
    getProductsBySlugs(location.priorityProducts),
    getGuidesBySlugs(location.relatedGuides),
    getLocations(),
  ])

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/locations' },
    { name: location.name, path: `/locations/${location.slug}` },
  ]

  const sections: Section[] = [
    { heading: `Property types in ${location.name}`, paragraphs: [location.propertyMix] },
    { heading: `Water supply in ${location.name}`, paragraphs: location.supply },
    { heading: `What we are called out for in ${location.name}`, list: location.commonRequests },
    { heading: `Local considerations in ${location.name}`, list: location.localConsiderations },
  ]

  const directAnswer = `${location.intro} Typical response in ${location.name} is ${location.responseTime.toLowerCase()}. ${location.responseNote}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            locationServiceJsonLd(location, business),
            breadcrumbJsonLd(crumbs),
            faqJsonLd(faqs, `/locations/${location.slug}`),
          ),
        }}
      />

      <section className="relative overflow-hidden bg-hero-radial pb-0 pt-12 sm:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid-light bg-grid opacity-[0.07]"
        />
        <div className="container-page relative">
          <Breadcrumbs items={crumbs} />

          <div className="mt-7 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="eyebrow-dark">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                {location.name} · {location.responseTime}
              </span>
              <h1 className="mt-5 text-3xl leading-[1.1] text-white sm:text-4xl lg:text-5xl">
                Water Filter &amp; RO Services in {location.name}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-brand-100/90 sm:text-lg">
                {location.intro}
              </p>

              <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
                  <dt className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-aqua-300">
                    <Truck aria-hidden="true" className="h-3.5 w-3.5" />
                    Typical response
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-white">{location.responseTime}</dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur">
                  <dt className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-aqua-300">
                    <Droplet aria-hidden="true" className="h-3.5 w-3.5" />
                    Water supplied by
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-white">{location.utility}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={site.phone.href} data-analytics="call-click-location" className="btn-cta btn-lg">
                  <Phone aria-hidden="true" className="h-5 w-5" />
                  Call {site.phone.display}
                </a>
                <a
                  href={whatsappLink(
                    `Hi, I'm in ${location.name}. Please arrange a water test and quotation.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp-click-location"
                  className="btn-whatsapp btn-lg"
                >
                  <MessageCircle aria-hidden="true" className="h-5 w-5" />
                  WhatsApp Us
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-glow">
              <Photo
                src={location.image}
                alt={`Water filtration service across ${location.name}, United Arab Emirates`}
                width={1200}
                height={800}
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="h-64 w-full object-cover sm:h-80"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-brand-950/70 to-transparent"
              />
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="pointer-events-none relative -mb-px mt-12">
          <svg viewBox="0 0 1440 60" className="block h-10 w-full" preserveAspectRatio="none">
            <path d="M0 30c240-26 480-26 720 0s480 26 720 0V60H0V30Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      <AnswerBlock
        question={`Does AquaPure cover ${location.name}?`}
        answer={directAnswer}
        facts={[
          `Areas covered: ${location.areas.join(', ')}`,
          `Typical response: ${location.responseTime.toLowerCase()} — ${location.responseNote}`,
          `Mains water is distributed by ${location.utility}`,
          'Free on-site water test and a fixed written quotation in AED, with no call-out fee',
        ]}
      />

      <Credentials credentials={credentials} />

      {/* Areas served */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <SectionHeading
            eyebrow="Areas covered"
            title={`Where we work in ${location.name}`}
            subtitle="Not on the list? Send your location on WhatsApp and we will confirm coverage and timing for your specific area."
          />
          <ul className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-2.5">
            {location.areas.map((area) => (
              <li
                key={area}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-soft shadow-soft"
              >
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The locally specific body */}
      <section className="section bg-white">
        <div className="container-page">
          <ProseSections sections={sections} />
        </div>
      </section>

      {/* Services in this emirate */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <SectionHeading
            eyebrow="Services"
            title={`What we do most in ${location.name}`}
            subtitle="Ordered by what customers in this emirate actually ask for."
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const Icon = icon(service.icon)
              return (
                <Reveal as="li" key={service.slug} delay={(i % 3) * 0.06} className="h-full">
                  <Link
                    href={`/services/${service.slug}`}
                    className="group card card-hover flex h-full flex-col"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <Icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-base font-bold leading-snug transition-colors group-hover:text-brand-700">
                      {service.title} in {location.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                      {service.short}
                    </p>
                    <span className="link-arrow mt-4">
                      View service
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      <CtaBanner
        title={`Book a free water test in ${location.name}`}
        subtitle={`${location.responseNote} We measure TDS and hardness at your tap, then quote in writing — with no call-out fee.`}
      />

      <Faq faqs={faqs} heading={`Questions from customers in ${location.name}`} seeAllHref="/faqs" />

      <RelatedLinks
        heading={`More for ${location.name}`}
        groups={[
          {
            label: 'Equipment we fit here',
            items: products.map((product) => ({
              name: product.name,
              href: `/products/${product.slug}`,
              description: product.blurb,
              icon: 'package-check',
            })),
          },
          {
            label: 'Guides relevant to this emirate',
            items: guides.map((guide) => ({
              name: guide.title,
              href: `/guides/${guide.slug}`,
              description: guide.primaryQuestion,
              icon: 'droplets',
            })),
          },
          {
            label: 'Other emirates we cover',
            items: siblings
              .filter((other) => other.slug !== location.slug)
              .map((other) => ({
                name: `Water filter services in ${other.name}`,
                href: `/locations/${other.slug}`,
                description: `${other.responseTime} — ${other.areas.slice(0, 4).join(', ')} and more.`,
                icon: 'map-pin',
              })),
          },
        ]}
      />
    </>
  )
}

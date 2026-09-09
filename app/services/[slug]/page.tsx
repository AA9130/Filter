import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Check, Phone, MessageCircle, AlertTriangle } from 'lucide-react'
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
import ServiceAreas from '@/components/sections/ServiceAreas'
import { icon } from '@/lib/icons'
import { site, whatsappLink } from '@/lib/site'
import {
  getService, getServices, getBusiness, getLocations, getCredentials,
  getFaqsByIds, getServicesBySlugs, getProductsBySlugs, getGuidesBySlugs,
} from '@/lib/content'
import { buildMetadata, breadcrumbJsonLd, serviceJsonLd, faqJsonLd, jsonLdGraph } from '@/lib/seo'
import type { Section } from '@/lib/content'

/** Every service is a static page at build time. */
export async function generateStaticParams() {
  const services = await getServices()
  return services.map(({ slug }) => ({ slug }))
}

/** Unknown slugs 404 instead of rendering — no soft-404s for Google to index. */
export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) return {}

  return buildMetadata({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/services/${service.slug}`,
    image: service.image,
  })
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) notFound()

  const [business, locations, credentials, faqs, relatedServices, relatedProducts, relatedGuides] =
    await Promise.all([
      getBusiness(),
      getLocations(),
      getCredentials(),
      getFaqsByIds(service.faqIds),
      getServicesBySlugs(service.relatedServices),
      getProductsBySlugs(service.relatedProducts),
      getGuidesBySlugs(service.relatedGuides),
    ])

  const Icon = icon(service.icon)

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: service.title, path: `/services/${service.slug}` },
  ]

  /**
   * The page body, assembled from the service's structured content into the
   * order a reader's questions actually arrive in: what it is, who needs it,
   * how it works, why, what it costs to keep, what goes wrong, how to choose,
   * and what is specific to the UAE. Every service page follows this order, so
   * a crawler learns the shape once and a reader never has to hunt.
   */
  const sections: Section[] = [
    { heading: `What ${service.title.toLowerCase()} actually involves`, paragraphs: service.whatItIs },
    { heading: 'Who needs this', list: service.whoNeedsIt },
    { heading: 'Benefits', list: service.benefits },
    { heading: 'Maintenance it will need', list: service.maintenance },
    { heading: 'What to consider when choosing', list: service.choosingFactors },
    { heading: 'UAE-specific considerations', paragraphs: service.uaeContext },
    { heading: 'What it costs', paragraphs: [service.pricingNote] },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            serviceJsonLd(service, business),
            breadcrumbJsonLd(crumbs),
            faqJsonLd(faqs, `/services/${service.slug}`),
          ),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-radial pb-0 pt-12 sm:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid-light bg-grid opacity-[0.07]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-aqua-500/20 blur-3xl"
        />

        <div className="container-page relative">
          <Breadcrumbs items={crumbs} />

          <div className="mt-7 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="eyebrow-dark">
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                {service.highlight ?? 'All seven Emirates'}
              </span>
              <h1 className="mt-5 text-3xl leading-[1.1] text-white sm:text-4xl lg:text-5xl">
                {service.h1}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-brand-100/90 sm:text-lg">
                {service.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={site.phone.href}
                  data-analytics="call-click-service"
                  className="btn-cta btn-lg"
                  aria-label={`Call ${site.name} on ${site.phone.display}`}
                >
                  <Phone aria-hidden="true" className="h-5 w-5" />
                  Call {site.phone.display}
                </a>
                <a
                  href={whatsappLink(
                    `Hi, I'm interested in ${service.title}. Please share details and arrange a water test.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp-click-service"
                  className="btn-whatsapp btn-lg"
                >
                  <MessageCircle aria-hidden="true" className="h-5 w-5" />
                  WhatsApp Us
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-glow">
              <Photo
                src={service.image}
                alt={`Water treatment equipment of the kind involved in ${service.title.toLowerCase()}`}
                width={1200}
                height={800}
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="h-64 w-full object-cover sm:h-80"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-brand-950/60 to-transparent"
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

      <AnswerBlock answer={service.directAnswer} facts={service.keyFacts} />

      <Credentials credentials={credentials} />

      {/* What's included */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <SectionHeading
            eyebrow="What's included"
            title={`What you get with ${service.title.toLowerCase()}`}
            subtitle="No vague packages — this is what the technician does when they arrive."
          />

          <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {service.bullets.map((bullet, i) => (
              <Reveal as="li" key={bullet} delay={(i % 2) * 0.06}>
                <div className="card flex h-full items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-eco-100"
                  >
                    <Check className="h-3.5 w-3.5 text-eco-600" />
                  </span>
                  <p className="text-sm leading-relaxed text-ink-soft">{bullet}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title="Step by step" />
          <ol className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2">
            {service.howItWorks.map((step, i) => (
              <Reveal as="li" key={step.step} delay={(i % 2) * 0.06}>
                <div className="card h-full">
                  <span className="text-sm font-extrabold text-gradient-brand">{step.step}</span>
                  <h3 className="mt-2 text-base font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* The structured body */}
      <section className="section bg-white pt-0">
        <div className="container-page">
          <ProseSections sections={sections} />
        </div>
      </section>

      {/* Common problems — the diagnostic table */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <SectionHeading
            eyebrow="Common problems"
            title="What goes wrong, and what fixes it"
            subtitle="The faults we actually get called out for — with the cause, because a fault with an explanation does not repeat."
          />
          <ul className="mx-auto mt-12 max-w-4xl space-y-4">
            {service.commonProblems.map((problem, i) => (
              <Reveal as="li" key={problem.problem} delay={Math.min(i * 0.05, 0.2)}>
                <div className="card">
                  <h3 className="flex items-start gap-2.5 text-base font-bold">
                    <AlertTriangle
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-cta-500"
                    />
                    {problem.problem}
                  </h3>
                  <dl className="mt-3 space-y-2 text-sm leading-relaxed">
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-ink">Cause:</dt>
                      <dd className="text-ink-soft">{problem.cause}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-ink">Fix:</dt>
                      <dd className="text-ink-soft">{problem.fix}</dd>
                    </div>
                  </dl>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <ServiceAreas locations={locations} />

      <CtaBanner
        title={`Need ${service.title.toLowerCase()}?`}
        subtitle="Tell us the emirate and the problem. The water test and the quotation are free, and there is no call-out fee."
      />

      <Faq
        faqs={faqs}
        heading={`${service.title} — questions we are asked`}
        seeAllHref="/faqs"
      />

      <RelatedLinks
        groups={[
          {
            label: 'Related services',
            items: relatedServices.map((item) => ({
              name: item.title,
              href: `/services/${item.slug}`,
              description: item.short,
              icon: item.icon,
            })),
          },
          {
            label: 'Equipment we fit for this',
            items: relatedProducts.map((item) => ({
              name: item.name,
              href: `/products/${item.slug}`,
              description: item.blurb,
              icon: 'package-check',
            })),
          },
          {
            label: 'Guides on this topic',
            items: relatedGuides.map((item) => ({
              name: item.title,
              href: `/guides/${item.slug}`,
              description: item.primaryQuestion,
              icon: 'droplets',
            })),
          },
        ]}
      />
    </>
  )
}

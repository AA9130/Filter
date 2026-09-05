import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, ChevronRight, Phone, MessageCircle } from 'lucide-react'
import Photo from '@/components/ui/Photo'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'
import TrustBar from '@/components/sections/TrustBar'
import Process from '@/components/sections/Process'
import Faq from '@/components/sections/Faq'
import CtaBanner from '@/components/sections/CtaBanner'
import ServiceAreas from '@/components/sections/ServiceAreas'
import { icon } from '@/lib/icons'
import { site, whatsappLink } from '@/lib/site'
import {
  getService, getServices, getRelatedServices, getBusiness, getEmirates,
  getFaqs, getProcessSteps, getTrustBadges,
} from '@/lib/content'
import { buildMetadata, breadcrumbJsonLd, serviceJsonLd, faqJsonLd } from '@/lib/seo'

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
    keywords: [service.title.toLowerCase(), `${service.title.toLowerCase()} Dubai`],
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

  const [related, business, emirates, faqs, steps, badges] = await Promise.all([
    getRelatedServices(slug), getBusiness(), getEmirates(),
    getFaqs(), getProcessSteps(), getTrustBadges(),
  ])

  const Icon = icon(service.icon)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd({
              name: service.title,
              description: service.description,
              slug: service.slug,
              business,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Services', path: '/services' },
              { name: service.title, path: `/services/${service.slug}` },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
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
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-brand-200">
              <li>
                <Link href="/" className="transition-colors hover:text-white">Home</Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
              <li>
                <Link href="/services" className="transition-colors hover:text-white">Services</Link>
              </li>
              <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
              <li className="text-white">{service.title}</li>
            </ol>
          </nav>

          <div className="mt-7 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="eyebrow-dark">
                <Icon className="h-3.5 w-3.5" />
                {service.highlight ?? 'UAE-wide service'}
              </span>
              <h1 className="mt-5 text-3xl leading-[1.1] text-white sm:text-4xl lg:text-5xl">
                {service.title}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-brand-100/90 sm:text-lg">
                {service.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={site.phone.href} data-analytics="call-click-service" className="btn-cta btn-lg">
                  <Phone className="h-5 w-5" />
                  Call {site.phone.display}
                </a>
                <a
                  href={whatsappLink(
                    `Hi, I'm interested in ${service.title}. Please share details and pricing.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp-click-service"
                  className="btn-whatsapp btn-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Us
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-glow">
              <Photo
                src={service.image}
                alt={`${service.title} — technician at work in the UAE`}
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

      <TrustBar badges={badges} />

      {/* What's included */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="What's included"
            title={`What you get with ${service.title.toLowerCase()}`}
            subtitle="No vague packages — here is exactly what our technicians do when they arrive."
          />

          <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {service.bullets.map((bullet, i) => (
              <Reveal as="li" key={bullet} delay={(i % 2) * 0.06}>
                <div className="card flex h-full items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-eco-100">
                    <Check className="h-3.5 w-3.5 text-eco-600" />
                  </span>
                  <p className="text-sm leading-relaxed text-ink-soft">{bullet}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <Process steps={steps} />
      <ServiceAreas emirates={emirates} />

      <CtaBanner
        title={`Need ${service.title.toLowerCase()}? We can usually come today.`}
        subtitle="Certified technicians, genuine parts on the van and a fixed price before we start."
      />

      {/* Internal linking — keeps crawlers moving through the service set */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading eyebrow="Related services" title="You might also need" />
          <ul className="mt-12 grid gap-5 sm:grid-cols-3">
            {related.map((item, i) => {
              const RelatedIcon = icon(item.icon)
              return (
                <Reveal as="li" key={item.slug} delay={i * 0.07} className="h-full">
                  <Link href={`/services/${item.slug}`} className="group card card-hover flex h-full flex-col">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <RelatedIcon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-base font-bold">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{item.short}</p>
                    <span className="link-arrow mt-4">
                      Learn more
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      <Faq faqs={faqs} />
    </>
  )
}

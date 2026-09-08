import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Check, Phone, MessageCircle, Info } from 'lucide-react'
import Photo from '@/components/ui/Photo'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import Credentials from '@/components/sections/Credentials'
import AnswerBlock from '@/components/sections/AnswerBlock'
import ProseSections from '@/components/sections/ProseSections'
import RelatedLinks from '@/components/sections/RelatedLinks'
import AmcPlans from '@/components/sections/AmcPlans'
import CtaBanner from '@/components/sections/CtaBanner'
import Faq from '@/components/sections/Faq'
import { site, whatsappLink } from '@/lib/site'
import {
  getProduct, getProducts, getRelatedProducts, getAmcPlans, getCredentials,
  getFaqsByIds, getServicesBySlugs, getGuidesBySlugs, getLocationsBySlugs,
} from '@/lib/content'
import {
  buildMetadata, breadcrumbJsonLd, productJsonLd, faqJsonLd, jsonLdGraph,
} from '@/lib/seo'
import type { Section } from '@/lib/content'

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map(({ slug }) => ({ slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}

  return buildMetadata({
    title: product.metaTitle,
    description: product.metaDescription,
    path: `/products/${product.slug}`,
    image: product.image,
  })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const [related, plans, credentials, faqs, services, guides, locations] = await Promise.all([
    getRelatedProducts(slug),
    getAmcPlans(),
    getCredentials(),
    getFaqsByIds(product.faqIds),
    getServicesBySlugs(product.relatedServices),
    getGuidesBySlugs(product.relatedGuides),
    getLocationsBySlugs(product.relatedLocations),
  ])

  const quoteMessage = `Hi, I would like a quote for the ${product.name}. My location is:`

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: product.name, path: `/products/${product.slug}` },
  ]

  const sections: Section[] = [
    { heading: 'Who this suits', list: product.whoItSuits },
    { heading: 'How it is fitted', paragraphs: product.howItFits },
    { heading: 'Maintenance it will need', list: product.maintenance },
    { heading: 'Things to consider before buying', list: product.considerations },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            productJsonLd(product),
            breadcrumbJsonLd(crumbs),
            faqJsonLd(faqs, `/products/${product.slug}`),
          ),
        }}
      />

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
              <span className="eyebrow-dark">{product.badge ?? product.category}</span>
              <h1 className="mt-5 text-3xl leading-[1.1] text-white sm:text-4xl lg:text-5xl">
                {product.h1}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-brand-100/90 sm:text-lg">
                {product.blurb}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={site.phone.href}
                  data-analytics="call-click-product"
                  className="btn-cta btn-lg"
                  aria-label={`Call ${site.name} on ${site.phone.display}`}
                >
                  <Phone aria-hidden="true" className="h-5 w-5" />
                  Call {site.phone.display}
                </a>
                <a
                  href={whatsappLink(quoteMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp-click-product"
                  className="btn-whatsapp btn-lg"
                >
                  <MessageCircle aria-hidden="true" className="h-5 w-5" />
                  Get a quote
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-glow">
              <Photo
                src={product.image}
                alt={`${product.name} — ${product.category.toLowerCase()} installed by AquaPure UAE`}
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

      <AnswerBlock answer={product.directAnswer} facts={product.keyFacts} />

      <Credentials credentials={credentials} />

      {/* Features */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <SectionHeading
            eyebrow="What it does"
            title={`${product.name} — features`}
            subtitle="What the unit actually provides, in plain terms."
          />

          <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {product.features.map((feature, i) => (
              <Reveal as="li" key={feature} delay={(i % 2) * 0.06}>
                <div className="card flex h-full items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-eco-100"
                  >
                    <Check className="h-3.5 w-3.5 text-eco-600" />
                  </span>
                  <p className="text-sm leading-relaxed text-ink-soft">{feature}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          {/*
            Why there is no specification table. Publishing capacities and
            dimensions we have not confirmed per model would be inventing
            product specifications — see claim `published_pricing` and §47 of
            the content policy. The honest version is to say what determines
            them and when they are confirmed.
          */}
          <div className="mx-auto mt-8 flex max-w-4xl items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
            <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            <p className="text-sm leading-relaxed text-ink-soft">{product.specNote}</p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <ProseSections sections={sections} />
        </div>
      </section>

      <AmcPlans plans={plans} />

      <CtaBanner
        title={`Interested in the ${product.name}?`}
        subtitle="The water test decides whether this is the right unit for your property. It is free, on site, and carries no obligation."
      />

      <Faq faqs={faqs} heading="Questions about this system" seeAllHref="/faqs" />

      <RelatedLinks
        groups={[
          {
            label: 'Other systems to consider',
            items: related.map((item) => ({
              name: item.name,
              href: `/products/${item.slug}`,
              description: item.blurb,
              icon: 'package-check',
            })),
          },
          {
            label: 'Services for this system',
            items: services.map((service) => ({
              name: service.title,
              href: `/services/${service.slug}`,
              description: service.short,
              icon: service.icon,
            })),
          },
          {
            label: 'Guides that cover this choice',
            items: guides.map((guide) => ({
              name: guide.title,
              href: `/guides/${guide.slug}`,
              description: guide.primaryQuestion,
              icon: 'droplets',
            })),
          },
          {
            label: 'Where we fit it',
            items: locations.map((location) => ({
              name: `Water filter services in ${location.name}`,
              href: `/locations/${location.slug}`,
              description: `${location.responseTime} — ${location.areas.slice(0, 4).join(', ')} and more.`,
              icon: 'map-pin',
            })),
          },
        ]}
      />
    </>
  )
}

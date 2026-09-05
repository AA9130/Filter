import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, ChevronRight, Phone, MessageCircle } from 'lucide-react'
import Photo from '@/components/ui/Photo'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'
import TrustBar from '@/components/sections/TrustBar'
import AmcPlans from '@/components/sections/AmcPlans'
import CtaBanner from '@/components/sections/CtaBanner'
import Faq from '@/components/sections/Faq'
import { site, whatsappLink } from '@/lib/site'
import {
  getProduct, getProducts, getRelatedProducts, getBusiness, getAmcPlans,
  getFaqs, getTrustBadges,
} from '@/lib/content'
import { buildMetadata, breadcrumbJsonLd, productJsonLd } from '@/lib/seo'

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
    keywords: [product.name.toLowerCase(), `${product.category.toLowerCase()} UAE`],
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

  const [related, business, plans, faqs, badges] = await Promise.all([
    getRelatedProducts(slug), getBusiness(), getAmcPlans(), getFaqs(), getTrustBadges(),
  ])

  const quoteMessage = `Hi, I would like a quote for the ${product.name}. My location is:`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productJsonLd({
              name: product.name,
              description: product.blurb,
              slug: product.slug,
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
              { name: 'Products', path: '/products' },
              { name: product.name, path: `/products/${product.slug}` },
            ]),
          ),
        }}
      />

      <section className="relative overflow-hidden bg-hero-radial pb-0 pt-12 sm:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid-light bg-grid opacity-[0.07]"
        />
        <div className="container-page relative">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-brand-200">
              <li><Link href="/" className="transition-colors hover:text-white">Home</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
              <li><Link href="/products" className="transition-colors hover:text-white">Products</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
              <li className="text-white">{product.name}</li>
            </ol>
          </nav>

          <div className="mt-7 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="eyebrow-dark">{product.category}</span>
              <h1 className="mt-5 text-3xl leading-[1.1] text-white sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-brand-100/90">{product.blurb}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink(quoteMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp-click-product"
                  className="btn-whatsapp btn-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  Request a Quote
                </a>
                <a href={site.phone.href} data-analytics="call-click-product" className="btn-cta btn-lg">
                  <Phone className="h-5 w-5" />
                  Call {site.phone.display}
                </a>
              </div>
              <p className="mt-4 text-sm text-brand-200/80">
                Quoted per property after a free water test. Installation and a full leak test
                are always included.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-glow">
              <Photo
                src={product.image}
                alt={`${product.name} — ${product.category} system installed in the UAE`}
                width={1200}
                height={800}
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="h-64 w-full object-cover sm:h-80"
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

      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading eyebrow="Specification" title="What is included" />
          <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {product.features.map((feature, i) => (
              <Reveal as="li" key={feature} delay={(i % 2) * 0.06}>
                <div className="card flex h-full items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-eco-100">
                    <Check className="h-3.5 w-3.5 text-eco-600" />
                  </span>
                  <p className="text-sm leading-relaxed text-ink-soft">{feature}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBanner
        title={`Want the ${product.name} fitted this week?`}
        subtitle="Send us a photo of your existing setup and we will confirm the fit, the price and the slot."
      />

      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading eyebrow="Related products" title="Other systems to consider" />
          <ul className="mt-12 grid gap-5 sm:grid-cols-3">
            {related.map((item, i) => (
              <Reveal as="li" key={item.slug} delay={i * 0.07} className="h-full">
                <Link
                  href={`/products/${item.slug}`}
                  className="group card card-hover flex h-full flex-col overflow-hidden !p-0"
                >
                  <Photo
                    src={item.image}
                    alt={item.name}
                    width={600}
                    height={400}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-bold leading-snug">{item.name}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{item.category}</p>
                    <span className="link-arrow mt-4">
                      View details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <AmcPlans plans={plans} />
      <Faq faqs={faqs} />
    </>
  )
}

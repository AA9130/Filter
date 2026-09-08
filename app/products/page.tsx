import type { Metadata } from 'next'

import PageHero from '@/components/sections/PageHero'
import Products from '@/components/sections/Products'
import Credentials from '@/components/sections/Credentials'
import AmcPlans from '@/components/sections/AmcPlans'
import CtaBanner from '@/components/sections/CtaBanner'
import Faq from '@/components/sections/Faq'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import { icon } from '@/lib/icons'
import {
  getProducts, getAmcPlans, getFaqsByIds, getCredentials, getBuyingGuide,
} from '@/lib/content'
import { buildMetadata, breadcrumbJsonLd, collectionJsonLd, faqJsonLd, jsonLdGraph } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'RO Systems, Softeners & Villa Filters — Supplied and Installed',
  description:
    'RO water purifiers, whole-villa filtration, automatic water softeners, self-cleaning pre-filters and disinfection units supplied, installed and serviced across the UAE. Free water test and a fixed written quotation.',
  path: '/products',
})

/** Chosen for the decisions this page is actually helping with. */
const PRODUCT_FAQ_IDS = ['apartment-purifier', 'villa-filter', 'tank-vs-tankless', 'whole-house-needed', 'ro-installation-cost'] as const

export default async function ProductsPage() {
  const [products, plans, faqs, credentials, buyingGuide] = await Promise.all([
    getProducts(), getAmcPlans(), getFaqsByIds(PRODUCT_FAQ_IDS), getCredentials(), getBuyingGuide(),
  ])

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            breadcrumbJsonLd(crumbs),
            collectionJsonLd({
              name: 'AquaPure UAE water treatment systems',
              description:
                'Drinking-water and whole-property treatment systems supplied, installed and serviced across the UAE.',
              path: '/products',
              items: products.map((p) => ({ name: p.name, path: `/products/${p.slug}` })),
            }),
            faqJsonLd(faqs, '/products'),
          ),
        }}
      />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow="Products & Systems"
        title="Water treatment systems for UAE conditions"
        subtitle="The equipment we install and service every day, for apartments, villas and commercial premises. Which one suits your property is decided by a water test, not a catalogue — and the quotation is fixed, written and in AED before anything is ordered."
      />

      <Credentials credentials={credentials} />
      <Products products={products} grouped heading="Drinking water and whole-villa systems we supply, fit and service" />

      {/* Buying guide */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <SectionHeading
            eyebrow="Buying Guide"
            title="Which system does your property actually need?"
            subtitle="Match the symptom to the solution. If you are still unsure, our free on-site water test settles it in ten minutes."
          />

          <ul className="mt-14 grid gap-5 sm:grid-cols-2">
            {buyingGuide.map((item, i) => {
              const Icon = icon(item.icon)
              return (
                <Reveal as="li" key={item.title} delay={(i % 2) * 0.08}>
                  <div className="card card-hover flex h-full gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-aqua-500 text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      <CtaBanner
        title="Get a fixed quote for your property today"
        subtitle="Send us a photo of your existing setup on WhatsApp and we will tell you what fits, what it costs and when we can install it."
      />
      <AmcPlans plans={plans} />
      <Faq faqs={faqs} heading="Choosing between these systems" seeAllHref="/faqs" />
    </>
  )
}

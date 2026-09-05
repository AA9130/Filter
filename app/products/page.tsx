import type { Metadata } from 'next'

import PageHero from '@/components/sections/PageHero'
import Products from '@/components/sections/Products'
import TrustBar from '@/components/sections/TrustBar'
import AmcPlans from '@/components/sections/AmcPlans'
import CtaBanner from '@/components/sections/CtaBanner'
import Faq from '@/components/sections/Faq'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import { icon } from '@/lib/icons'
import {
  getProducts, getAmcPlans, getFaqs, getTrustBadges, getBuyingGuide,
} from '@/lib/content'
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'RO Systems, Water Softeners & Whole House Filters — Supply & Install UAE',
  description:
    'RO water purifiers, whole-house filtration, automatic water softeners, UV sterilizers and genuine filter cartridges supplied and installed across the UAE. Free water test and a fixed written quotation.',
  path: '/products',
  keywords: [
    'RO system Dubai',
    'water softener UAE',
    'whole house water filter Abu Dhabi',
    'UV water sterilizer Dubai',
    'water filter cartridge UAE',
  ],
})

export default async function ProductsPage() {
  const [products, plans, faqs, badges, buyingGuide] = await Promise.all([
    getProducts(), getAmcPlans(), getFaqs(), getTrustBadges(), getBuyingGuide(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
            ]),
          ),
        }}
      />

      <PageHero
        breadcrumb="Products"
        eyebrow="Products & Systems"
        title="Water treatment systems built for UAE water conditions"
        subtitle="Domestic and commercial equipment we install and service every day — with honest AED pricing that already includes professional installation."
      />

      <TrustBar badges={badges} />
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
      <Faq faqs={faqs} />
    </>
  )
}

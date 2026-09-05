import type { Metadata } from 'next'
import { Droplets, Gauge, ThermometerSun, Building2 } from 'lucide-react'
import PageHero from '@/components/sections/PageHero'
import Products from '@/components/sections/Products'
import TrustBar from '@/components/sections/TrustBar'
import AmcPlans from '@/components/sections/AmcPlans'
import CtaBanner from '@/components/sections/CtaBanner'
import Faq from '@/components/sections/Faq'
import ContactSection from '@/components/sections/ContactSection'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'RO Systems, Water Softeners & Whole House Filters — Prices in AED',
  description:
    'Buy and install RO water purifiers, whole-house filtration, automatic water softeners, UV sterilizers and genuine filter cartridges in the UAE. Prices from AED 690, professional installation included.',
  path: '/products',
  keywords: [
    'RO system price Dubai',
    'water softener price UAE',
    'whole house water filter Abu Dhabi',
    'UV water sterilizer Dubai',
    'water filter cartridge UAE',
  ],
})

const buyingGuide = [
  {
    icon: Droplets,
    title: 'High TDS (above 300 ppm)',
    body: 'Reverse osmosis is the only practical fix. Choose a 6 or 7-stage RO with a mineral cartridge so the water still tastes good after purification.',
  },
  {
    icon: Gauge,
    title: 'Hard water & limescale',
    body: 'White marks on taps and glass, scale in the kettle, dry skin after showering — that is hardness. An automatic softener treats the whole property.',
  },
  {
    icon: ThermometerSun,
    title: 'Chlorine smell or bad taste',
    body: 'A whole-house carbon stage removes chlorine, taste and odour at the point of entry, so every shower and tap in the building benefits.',
  },
  {
    icon: Building2,
    title: 'Roof tank or tanker supply',
    body: 'Where water sits in storage, add UV sterilisation. It neutralises bacteria and viruses without chemicals and needs only an annual lamp change.',
  },
]

export default function ProductsPage() {
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

      <TrustBar />
      <Products />

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
              const Icon = item.icon
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
      <AmcPlans />
      <Faq />
      <ContactSection />
    </>
  )
}

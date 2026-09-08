import Hero from '@/components/sections/Hero'
import Credentials from '@/components/sections/Credentials'
import ServicesGrid from '@/components/sections/ServicesGrid'
import WhyChooseUs from '@/components/sections/WhyChooseUs'
import Process from '@/components/sections/Process'
import ServiceAreas from '@/components/sections/ServiceAreas'
import Products from '@/components/sections/Products'
import AmcPlans from '@/components/sections/AmcPlans'
import Testimonials from '@/components/sections/Testimonials'
import Faq from '@/components/sections/Faq'
import CtaBanner from '@/components/sections/CtaBanner'
import ContactSection from '@/components/sections/ContactSection'
import RelatedLinks from '@/components/sections/RelatedLinks'
import {
  getBusiness, getServices, getProducts, getAmcPlans, getLocations,
  getTestimonials, getFaqsByIds, getReasons, getProcessSteps, getCredentials,
  getPublishedStats, getGuides,
} from '@/lib/content'
import { faqJsonLd, breadcrumbJsonLd, jsonLdGraph, reviewJsonLd } from '@/lib/seo'

/**
 * The homepage answers one question for a crawler and an answer engine: what is
 * this business, where does it operate, and what does it do? Everything below
 * the hero exists to make that extractable — the services grid, the coverage
 * grid linking into every location page, and a FAQ set chosen for the questions
 * people actually search rather than the questions we would like to answer.
 */

/** The homepage FAQ set: the highest-intent questions, named explicitly so the
 *  visible accordion and the FAQPage schema can never diverge. */
const HOME_FAQ_IDS = [
  'uae-tap-water-safe',
  'need-ro-in-dubai',
  'how-often-replace-filters',
  'ro-installation-cost',
  'coverage-emirates',
  'ro-vs-uv',
  'emergency-repairs',
  'water-test-free',
] as const

export default async function HomePage() {
  const [
    business, services, products, plans, locations,
    testimonials, faqs, reasons, steps, credentials, stats, guides,
  ] = await Promise.all([
    getBusiness(), getServices(), getProducts(), getAmcPlans(), getLocations(),
    getTestimonials(), getFaqsByIds(HOME_FAQ_IDS), getReasons(), getProcessSteps(),
    getCredentials(), getPublishedStats(), getGuides(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            breadcrumbJsonLd([{ name: 'Home', path: '/' }]),
            faqJsonLd(faqs, '/'),
            reviewJsonLd(testimonials),
          ),
        }}
      />

      <Hero />
      <Credentials credentials={credentials} />
      <ServicesGrid services={services} limit={6} />
      <WhyChooseUs reasons={reasons} stats={stats} />
      <CtaBanner />
      <Process steps={steps} />
      <ServiceAreas locations={locations} />
      <Products products={products} limit={3} />
      <AmcPlans plans={plans} />
      <Testimonials testimonials={testimonials} />
      <Faq faqs={faqs} seeAllHref="/faqs" />

      <RelatedLinks
        heading="Answers to the questions people ask before they buy"
        subtitle="Written by the technicians who install and repair these systems, and kept free of figures we cannot evidence."
        groups={[
          {
            label: 'Guides',
            items: guides.slice(0, 6).map((guide) => ({
              name: guide.title,
              href: `/guides/${guide.slug}`,
              description: guide.primaryQuestion,
              icon: 'droplets',
            })),
          },
        ]}
      />

      <ContactSection
        business={business}
        services={services.map(({ slug, title }) => ({ slug, title }))}
        emirates={locations.map(({ name }) => ({ name }))}
      />
    </>
  )
}

import Hero from '@/components/sections/Hero'
import TrustBar from '@/components/sections/TrustBar'
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
import {
  getBusiness, getServices, getProducts, getAmcPlans, getEmirates,
  getTestimonials, getFaqs, getReasons, getProcessSteps, getTrustBadges,
} from '@/lib/content'
import { faqJsonLd } from '@/lib/seo'

export default async function HomePage() {
  const [
    business, services, products, plans, emirates,
    testimonials, faqs, reasons, steps, badges,
  ] = await Promise.all([
    getBusiness(), getServices(), getProducts(), getAmcPlans(), getEmirates(),
    getTestimonials(), getFaqs(), getReasons(), getProcessSteps(), getTrustBadges(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />

      <Hero rating={business.stats.rating} customers={business.stats.customers} />
      <TrustBar badges={badges} />
      <ServicesGrid services={services} limit={6} />
      <WhyChooseUs reasons={reasons} stats={business.stats} />
      <CtaBanner />
      <Process steps={steps} />
      <ServiceAreas emirates={emirates} />
      <Products products={products} limit={3} />
      <AmcPlans plans={plans} />
      <Testimonials
        testimonials={testimonials}
        rating={business.stats.rating}
        reviewCount={business.stats.reviewCount}
      />
      <Faq faqs={faqs} />
      <ContactSection
        business={business}
        services={services.map(({ slug, title }) => ({ slug, title }))}
        emirates={emirates.map(({ name }) => ({ name }))}
      />
    </>
  )
}

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
import { faqs } from '@/lib/content'
import { faqJsonLd } from '@/lib/seo'

export default function HomePage() {
  return (
    <>
      {/* FAQ rich-result markup for the questions rendered below */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />

      <Hero />
      <TrustBar />
      <ServicesGrid limit={6} />
      <WhyChooseUs />
      <CtaBanner />
      <Process />
      <ServiceAreas />
      <Products limit={3} />
      <AmcPlans />
      <Testimonials />
      <Faq />
      <ContactSection />
    </>
  )
}

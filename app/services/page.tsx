import type { Metadata } from 'next'
import Photo from '@/components/ui/Photo'
import { Check, Phone, MessageCircle } from 'lucide-react'
import PageHero from '@/components/sections/PageHero'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import Process from '@/components/sections/Process'
import AmcPlans from '@/components/sections/AmcPlans'
import CtaBanner from '@/components/sections/CtaBanner'
import ContactSection from '@/components/sections/ContactSection'
import TrustBar from '@/components/sections/TrustBar'
import { services } from '@/lib/content'
import { site, whatsappLink } from '@/lib/site'
import { images } from '@/lib/images'
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const metadata: Metadata = buildMetadata({
  title: 'Water Filter Services in UAE — Installation, AMC, Repair & Filter Replacement',
  description:
    'Complete water filter services across the UAE: RO installation, whole-house filtration, water softeners, UV systems, filter replacement, AMC plans, 24-hour repairs and system relocation. Certified technicians in all 7 Emirates.',
  path: '/services',
  keywords: [
    'water filter service Dubai',
    'RO installation UAE',
    'water filter AMC Dubai',
    'water purifier repair Sharjah',
    'water filter relocation UAE',
  ],
})

const sectionImages = [
  images.plumbingWork,
  images.kitchenTap,
  images.cleanWater,
  images.labTest,
  images.waterDrop,
  images.filterCartridge,
  images.technician,
  images.commercial,
  images.heroGlass,
  images.roSystem,
]

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Services', path: '/services' },
            ]),
          ),
        }}
      />

      <PageHero
        breadcrumb="Services"
        eyebrow="Our Services"
        title="Every water filtration service you need, from one certified team"
        subtitle="Supply, installation, scheduled maintenance, emergency repair and relocation — for apartments, villas, offices, restaurants and labour accommodation anywhere in the UAE."
      />

      <TrustBar />

      {/* Detailed service blocks */}
      <div className="bg-white">
        <div className="container-page section !pt-16">
          <SectionHeading
            eyebrow="In Detail"
            title="What each service actually includes"
            subtitle="No vague packages. Here is exactly what our technicians do when they arrive at your property."
          />

          <div className="mt-16 space-y-16 lg:space-y-24">
            {services.map((service, i) => {
              const Icon = service.icon
              const flipped = i % 2 === 1

              return (
                <article
                  key={service.slug}
                  id={service.slug}
                  className="scroll-mt-28"
                >
                  <div
                    className={cn(
                      'grid items-center gap-8 lg:grid-cols-2 lg:gap-14',
                      flipped && 'lg:[&>*:first-child]:order-2',
                    )}
                  >
                    <Reveal from={flipped ? 'right' : 'left'}>
                      <div className="relative overflow-hidden rounded-3xl shadow-card">
                        <Photo
                          src={sectionImages[i % sectionImages.length]}
                          alt={`${service.title} — AquaPure UAE service in progress`}
                          width={1200}
                          height={800}
                          loading="lazy"
                          sizes="(max-width: 1024px) 100vw, 48vw"
                          className="h-64 w-full object-cover sm:h-80"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-tr from-brand-950/45 to-transparent"
                        />
                        <span className="absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-2xl bg-white/95 text-brand-700 shadow-lg backdrop-blur">
                          <Icon className="h-6 w-6" />
                        </span>
                      </div>
                    </Reveal>

                    <Reveal from={flipped ? 'left' : 'right'} delay={0.08}>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
                            Service {String(i + 1).padStart(2, '0')}
                          </span>
                          {service.highlight && (
                            <span className="rounded-full bg-cta-50 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-cta-700">
                              {service.highlight}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-2xl leading-tight sm:text-3xl">{service.title}</h3>
                        <p className="mt-4 text-base leading-relaxed text-ink-soft">
                          {service.description}
                        </p>

                        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                          {service.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-2.5 text-sm text-ink-soft">
                              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-eco-100">
                                <Check className="h-3 w-3 text-eco-600" />
                              </span>
                              {bullet}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                          <a
                            href={site.phone.href}
                            data-analytics="call-click-service"
                            className="btn-cta"
                          >
                            <Phone className="h-4 w-4" />
                            Book this service
                          </a>
                          <a
                            href={whatsappLink(
                              `Hi, I'm interested in ${service.title}. Please share details and pricing.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-analytics="whatsapp-click-service"
                            className="btn-outline"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Ask a question
                          </a>
                        </div>
                      </div>
                    </Reveal>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>

      <CtaBanner
        title="Book a certified technician — most areas same day"
        subtitle="Tell us the emirate and the problem. We confirm the slot and the price before we set off."
      />
      <Process />
      <AmcPlans />
      <ContactSection />
    </>
  )
}

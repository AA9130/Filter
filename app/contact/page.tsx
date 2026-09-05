import type { Metadata } from 'next'
import { Phone, MessageCircle, Zap, CalendarCheck, Wrench } from 'lucide-react'
import PageHero from '@/components/sections/PageHero'
import ContactSection from '@/components/sections/ContactSection'
import ServiceAreas from '@/components/sections/ServiceAreas'
import Faq from '@/components/sections/Faq'
import TrustBar from '@/components/sections/TrustBar'
import Reveal from '@/components/ui/Reveal'
import { site, whatsappLink } from '@/lib/site'
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'
import { getFaqs, getBusiness, getServices, getEmirates, getTrustBadges } from '@/lib/content'

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us — Water Filter Service Across the UAE, 24 Hours',
  description:
    'Call or WhatsApp AquaPure UAE for water filter installation, servicing, filter replacement or emergency repair. Same-day slots in Dubai, Abu Dhabi and Sharjah; 24-hour emergency line.',
  path: '/contact',
  keywords: [
    'water filter service near me',
    'water purifier repair Dubai contact',
    'emergency water filter repair UAE',
  ],
})

const quickActions = [
  {
    icon: Zap,
    title: 'Emergency repair',
    body: 'Leaking housing, burst fitting or no water flow at all? This is a priority call-out, 24 hours a day.',
    label: 'Call the emergency line',
    href: site.phone.href,
    style: 'btn-cta',
    external: false,
  },
  {
    icon: CalendarCheck,
    title: 'Free demo & water test',
    body: 'A technician visits, tests your TDS and hardness in front of you and leaves a written quote in AED.',
    label: 'Book on WhatsApp',
    href: whatsappLink('Hi, I would like to book the free water test and demo. My location is:'),
    style: 'btn-whatsapp',
    external: true,
  },
  {
    icon: Wrench,
    title: 'Filter replacement due',
    body: 'Tell us your system model or send a photo — we bring the right genuine cartridges on the first visit.',
    label: 'Send a photo on WhatsApp',
    href: whatsappLink('Hi, my filters are due for replacement. Here is a photo of my system:'),
    style: 'btn-brand',
    external: true,
  },
]

export default async function ContactPage() {
  const [faqs, business, services, emirates, badges] = await Promise.all([
    getFaqs(), getBusiness(), getServices(), getEmirates(), getTrustBadges(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Contact', path: '/contact' },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />

      <PageHero
        breadcrumb="Contact"
        eyebrow="Contact Us"
        title="Get clean water sorted today — call, WhatsApp or send the form"
        subtitle="Our lines are answered by technicians, not a call centre. Same-day slots are usually available in Dubai, Abu Dhabi and Sharjah."
      />

      {/* Quick routes by intent */}
      <section className="bg-white pt-14">
        <div className="container-page">
          <ul className="grid gap-5 lg:grid-cols-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon
              return (
                <Reveal as="li" key={action.title} delay={i * 0.08}>
                  <div className="card card-hover flex h-full flex-col">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h2 className="mt-4 text-lg font-bold">{action.title}</h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{action.body}</p>
                    <a
                      href={action.href}
                      {...(action.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className={`${action.style} mt-5 w-full`}
                    >
                      {action.external ? (
                        <MessageCircle className="h-4 w-4" />
                      ) : (
                        <Phone className="h-4 w-4" />
                      )}
                      {action.label}
                    </a>
                  </div>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      <ContactSection
        business={business}
        services={services.map(({ slug, title }) => ({ slug, title }))}
        emirates={emirates.map(({ name }) => ({ name }))}
      />
      <TrustBar badges={badges} />
      <ServiceAreas emirates={emirates} />
      <Faq faqs={faqs} />
    </>
  )
}

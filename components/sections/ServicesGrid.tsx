import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import { services } from '@/lib/content'
import { site, whatsappLink } from '@/lib/site'

export default function ServicesGrid({
  limit,
  showAllLink = true,
}: {
  limit?: number
  showAllLink?: boolean
}) {
  const list = limit ? services.slice(0, limit) : services

  return (
    <section id="services" className="section relative bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our Services"
          title="Complete water filtration solutions, start to finish"
          subtitle="One team for supply, installation, servicing and emergency repair — for apartments, villas, offices and commercial kitchens anywhere in the UAE."
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((service, i) => {
            const Icon = service.icon
            return (
              <Reveal
                as="li"
                key={service.slug}
                delay={(i % 3) * 0.08}
                className="h-full"
              >
                <Link
                  href={`/services#${service.slug}`}
                  id={service.slug}
                  className="group card card-hover flex h-full scroll-mt-28 flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-aqua-100 text-brand-700 transition-all duration-300 group-hover:from-brand-600 group-hover:to-aqua-500 group-hover:text-white group-hover:shadow-lg">
                      <Icon className="h-7 w-7" />
                    </span>
                    {service.highlight && (
                      <span className="rounded-full bg-cta-50 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-cta-700">
                        {service.highlight}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 text-lg font-bold leading-snug transition-colors group-hover:text-brand-700">
                    {service.title}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-soft">
                    {service.short}
                  </p>

                  <span className="link-arrow mt-5">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </ul>

        {/* Inline conversion prompt */}
        <Reveal delay={0.1}>
          <div className="mt-12 overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-r from-brand-50 via-white to-aqua-100/50 p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-xl font-bold sm:text-2xl">
                  Not sure which system your water needs?
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
                  We will test your TDS and hardness at your property, free of charge, and recommend
                  only what the reading justifies — then quote you a fixed price in AED.
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
                <a href={site.phone.href} className="btn-cta whitespace-nowrap">
                  <Phone className="h-4 w-4" />
                  Book free test
                </a>
                <a
                  href={whatsappLink('Hi, I would like to book a free water test and demo. My location is:')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline whitespace-nowrap"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {showAllLink && (
          <Reveal delay={0.15}>
            <div className="mt-10 text-center">
              <Link href="/services" className="btn-brand btn-lg">
                Explore all services in detail
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

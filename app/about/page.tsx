import type { Metadata } from 'next'
import Photo from '@/components/ui/Photo'
import { Check } from 'lucide-react'
import PageHero from '@/components/sections/PageHero'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import WhyChooseUs from '@/components/sections/WhyChooseUs'
import ServiceAreas from '@/components/sections/ServiceAreas'
import Testimonials from '@/components/sections/Testimonials'
import CtaBanner from '@/components/sections/CtaBanner'
import TrustBar from '@/components/sections/TrustBar'
import { icon } from '@/lib/icons'
import {
  getAbout, getBusiness, getTrustBadges, getReasons, getEmirates, getTestimonials,
} from '@/lib/content'
import { images } from '@/lib/images'
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'About Us — Certified Water Filtration Specialists in the UAE',
  description:
    'AquaPure UAE has installed and maintained water filtration systems across all seven Emirates for over 15 years. Licensed, insured, Dubai Municipality compliant technicians serving 12,000+ customers.',
  path: '/about',
  keywords: ['water filter company Dubai', 'water treatment company UAE', 'licensed water filter technicians'],
})

export default async function AboutPage() {
  const [about, business, badges, reasons, emirates, testimonials] = await Promise.all([
    getAbout(), getBusiness(), getTrustBadges(), getReasons(), getEmirates(), getTestimonials(),
  ])

  const stats = [
    { value: business.stats.customers, label: 'Customers served' },
    { value: `${business.stats.years}+`, label: 'Years in the UAE' },
    { value: business.stats.emirates, label: 'Emirates covered' },
    { value: '24/7', label: 'Emergency support' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'About', path: '/about' },
            ]),
          ),
        }}
      />

      <PageHero
        breadcrumb="About"
        eyebrow="About Us"
        title="15 years keeping UAE water clean — one property at a time"
        subtitle="We are a licensed Dubai-based water treatment company with mobile teams in every Emirate. Filtration is all we do, and we have been doing it since 2010."
      />

      <TrustBar badges={badges} />

      {/* Story */}
      <section className="section bg-white">
        <div className="container-page">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal from="left">
              <div className="relative">
                <div className="overflow-hidden rounded-3xl shadow-card">
                  <Photo
                    src={images.teamAbout}
                    alt="AquaPure UAE technician team preparing water filtration equipment for installation"
                    width={1200}
                    height={900}
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    className="h-80 w-full object-cover sm:h-96"
                  />
                </div>
                <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-gradient-to-br from-brand-700 to-aqua-500 p-5 text-white shadow-lift sm:block">
                  <p className="text-3xl font-extrabold leading-none">
                    <AnimatedCounter value={business.stats.years} />+
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-brand-100">
                    Years in the UAE
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal from="right">
              <div>
                <span className="eyebrow">Our Story</span>
                <h2 className="mt-5 text-3xl leading-tight sm:text-4xl">
                  Built on repeat customers, not one-off sales
                </h2>
                <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-soft">
                  {about.story.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>

                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {badges.map((badge) => (
                    <li key={badge.label} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-eco-100">
                        <Check className="h-3 w-3 text-eco-600" />
                      </span>
                      <span>
                        <span className="font-semibold text-ink">{badge.label}</span>
                        <span className="block text-xs text-ink-muted">{badge.sub}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Stats */}
          <Reveal delay={0.1}>
            <dl className="mt-16 grid grid-cols-2 gap-4 rounded-3xl bg-gradient-to-br from-brand-900 to-brand-950 p-8 lg:grid-cols-4 lg:p-10">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dd className="text-3xl font-extrabold text-white sm:text-4xl">
                    <AnimatedCounter value={stat.value} />
                  </dd>
                  <dt className="mt-2 text-xs font-medium uppercase tracking-wider text-brand-200 sm:text-sm">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <SectionHeading
            eyebrow="How We Work"
            title="Four things we refuse to compromise on"
            subtitle="These are the reasons customers stay with us for a decade and recommend us to their neighbours."
          />

          <ul className="mt-14 grid gap-5 sm:grid-cols-2">
            {about.values.map((value, i) => {
              const Icon = icon(value.icon)
              return (
                <Reveal as="li" key={value.title} delay={(i % 2) * 0.08}>
                  <div className="card card-hover h-full">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold">{value.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{value.body}</p>
                  </div>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Timeline */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Milestones"
            title="How we grew across the Emirates"
          />

          <ol className="mx-auto mt-14 max-w-3xl">
            {about.milestones.map((milestone, i) => (
              <Reveal as="li" key={milestone.year} delay={i * 0.06}>
                <div className="relative flex gap-5 pb-8 last:pb-0">
                  {/* Connector */}
                  {i < about.milestones.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[1.6875rem] top-14 h-[calc(100%-3.5rem)] w-px bg-gradient-to-b from-brand-300 to-brand-100"
                    />
                  )}
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-700 to-aqua-500 text-sm font-extrabold text-white shadow-soft">
                    {milestone.year}
                  </span>
                  <div className="pt-2">
                    <h3 className="text-base font-bold">{milestone.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{milestone.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <WhyChooseUs reasons={reasons} stats={business.stats} />
      <ServiceAreas emirates={emirates} />
      <Testimonials
        testimonials={testimonials}
        rating={business.stats.rating}
        reviewCount={business.stats.reviewCount}
      />
      <CtaBanner
        title="Ready to have your water tested — free?"
        subtitle="No obligation and no sales pressure. We test, we explain the numbers, and you decide in your own time."
      />
    </>
  )
}

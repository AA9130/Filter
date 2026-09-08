import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, Clock, Globe2, MapPin, Phone, Mail } from 'lucide-react'
import Photo from '@/components/ui/Photo'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'
import PageHero from '@/components/sections/PageHero'
import Credentials from '@/components/sections/Credentials'
import StatsStrip from '@/components/sections/StatsStrip'
import WhyChooseUs from '@/components/sections/WhyChooseUs'
import ServiceAreas from '@/components/sections/ServiceAreas'
import Testimonials from '@/components/sections/Testimonials'
import CtaBanner from '@/components/sections/CtaBanner'
import RelatedLinks from '@/components/sections/RelatedLinks'
import { icon } from '@/lib/icons'
import { site } from '@/lib/site'
import {
  getAbout, getBusiness, getCredentials, getReasons, getLocations, getTestimonials,
  getPublishedStats, getServices, getAuthors,
} from '@/lib/content'
import { isPublishable } from '@/lib/claims'
import { buildMetadata, breadcrumbJsonLd, jsonLdGraph, reviewJsonLd } from '@/lib/seo'

/**
 * The About page carries the E-E-A-T load, which is exactly why it is the page
 * most tempting to invent things on.
 *
 * What it therefore does NOT contain: a founding year, a number of years in
 * business, a customer count, a rating, a licence claim, or any certification.
 * Every one of those was on the previous version and none of them has evidence
 * on file — see content/claims.json. The company history is still in
 * content/about.json, gated behind `years_in_business`, and appears here the
 * moment the trade-licence date is recorded.
 *
 * What it contains instead is the thing that is both true and actually
 * persuasive: specific, checkable technical expertise. "We measure static
 * pressure before quoting, because a starved membrane fails early" is a claim a
 * reader can test on their next call-out, and it is worth more than a badge.
 */

export const metadata: Metadata = buildMetadata({
  title: 'About AquaPure UAE',
  description:
    'AquaPure UAE installs, services and repairs water filtration systems across all seven Emirates. What we do, and how we specify a system.',
  path: '/about',
})

export default async function AboutPage() {
  const [about, business, credentials, reasons, locations, testimonials, stats, services, authors] =
    await Promise.all([
      getAbout(), getBusiness(), getCredentials(), getReasons(), getLocations(),
      getTestimonials(), getPublishedStats(), getServices(), getAuthors(),
    ])

  const showHistory = isPublishable(about.history.claimId)
  const team = authors[0]

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(breadcrumbJsonLd(crumbs), reviewJsonLd(testimonials)),
        }}
      />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow="About Us"
        title="Water filtration is all we do"
        subtitle="AquaPure UAE installs, services and repairs drinking-water and whole-property treatment systems across all seven Emirates. Every recommendation starts from a reading taken at your own tap."
      />

      <Credentials credentials={credentials} />

      {/* Who we are */}
      <section className="section bg-white">
        <div className="container-page">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <SectionHeading
                align="left"
                eyebrow="Who we are"
                title="A service business that happens to sell equipment"
              />
              <p className="mt-8 text-base leading-relaxed text-ink">{about.intro}</p>
              {about.story.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-5 text-base leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}

              <StatsStrip stats={stats} />

              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="card">
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
                    <Building2 aria-hidden="true" className="h-4 w-4" />
                    Legal name
                  </dt>
                  <dd className="mt-2 text-sm text-ink-soft">{business.legalName}</dd>
                </div>
                <div className="card">
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
                    <MapPin aria-hidden="true" className="h-4 w-4" />
                    Based in
                  </dt>
                  <dd className="mt-2 text-sm text-ink-soft">
                    {business.address.street}, {business.address.city},{' '}
                    {business.address.countryName}
                  </dd>
                </div>
                <div className="card">
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
                    <Globe2 aria-hidden="true" className="h-4 w-4" />
                    Languages
                  </dt>
                  <dd className="mt-2 text-sm text-ink-soft">{business.languages.join(', ')}</dd>
                </div>
                <div className="card">
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
                    <Clock aria-hidden="true" className="h-4 w-4" />
                    Hours
                  </dt>
                  <dd className="mt-2 space-y-1 text-sm text-ink-soft">
                    {business.hours.map((entry) => (
                      <span key={entry.days} className="block">
                        {entry.days}: {entry.time}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-5">
              <Reveal from="right">
                <div className="overflow-hidden rounded-3xl shadow-card">
                  <Photo
                    src="/images/teamAbout.jpg"
                    alt="AquaPure UAE technicians preparing a water filtration installation"
                    width={1200}
                    height={900}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="h-72 w-full object-cover sm:h-96"
                  />
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-6 rounded-3xl border border-brand-100 bg-brand-50/60 p-6">
                  <h2 className="text-base font-bold">Contact us directly</h2>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li>
                      <a
                        href={site.phone.href}
                        className="flex items-center gap-2.5 font-semibold text-brand-700 hover:text-cta-600"
                      >
                        <Phone aria-hidden="true" className="h-4 w-4" />
                        {site.phone.display}
                      </a>
                    </li>
                    <li>
                      <a
                        href={site.emailHref}
                        className="flex items-center gap-2.5 font-semibold text-brand-700 hover:text-cta-600"
                      >
                        <Mail aria-hidden="true" className="h-4 w-4" />
                        {site.email}
                      </a>
                    </li>
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise — the substantive part */}
      <section className="section bg-slate-50">
        <div className="container-page">
          <SectionHeading
            eyebrow="Expertise"
            title="What we actually know how to do"
            subtitle="Specific enough to be checked on your next call-out, which is the only kind of claim worth making."
          />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {about.expertise.map((item, i) => {
              const Icon = icon(item.icon)
              return (
                <Reveal as="li" key={item.title} delay={(i % 3) * 0.06} className="h-full">
                  <div className="card h-full">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-aqua-500 text-white">
                      <Icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-base font-bold leading-snug">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
                  </div>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      {/* How we work */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="How we work"
            title="The four rules the business runs on"
          />
          <ul className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2">
            {about.values.map((value, i) => {
              const Icon = icon(value.icon)
              return (
                <Reveal as="li" key={value.title} delay={(i % 2) * 0.07} className="h-full">
                  <div className="card card-hover flex h-full gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold">{value.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{value.body}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      {/* The technical team */}
      {team && (
        <section className="section bg-slate-50">
          <div className="container-page">
            <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="text-xl font-bold">{team.name}</h2>
              <p className="mt-1 text-sm font-semibold text-brand-700">{team.jobTitle}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{team.bio}</p>
              <h3 className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                Areas of practice
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {team.expertise.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-ink-soft"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-ink-muted">
                Guides on this site are written by this team. Where a named individual can be
                attributed, they are credited by name — we do not invent expert bylines.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Company history — only once the founding date is on record */}
      {showHistory && (
        <section className="section bg-white">
          <div className="container-page">
            <SectionHeading eyebrow="History" title="How the company grew" />
            <ol className="mx-auto mt-14 max-w-3xl space-y-6">
              {about.history.milestones.map((milestone, i) => (
                <Reveal as="li" key={milestone.year} delay={i * 0.06}>
                  <div className="flex gap-5">
                    <span className="shrink-0 rounded-xl bg-brand-50 px-3 py-2 text-sm font-extrabold text-brand-700">
                      {milestone.year}
                    </span>
                    <div>
                      <h3 className="text-base font-bold">{milestone.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        {milestone.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      <WhyChooseUs reasons={reasons} stats={stats} />
      <ServiceAreas locations={locations} />
      <Testimonials testimonials={testimonials} />

      <CtaBanner
        title="Have your water measured before you buy anything"
        subtitle="The on-site test and the written quotation are free, with no call-out fee — including when the recommendation is that you need nothing."
      />

      <RelatedLinks
        heading="What we do"
        groups={[
          {
            label: 'Services',
            items: services.slice(0, 6).map((service) => ({
              name: service.title,
              href: `/services/${service.slug}`,
              description: service.short,
              icon: service.icon,
            })),
          },
        ]}
      />

      <section className="section-tight bg-white">
        <div className="container-page text-center">
          <Link href="/contact" className="link-arrow">
            Contact AquaPure UAE
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle, Plus } from 'lucide-react'
import PageHero from '@/components/sections/PageHero'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import CtaBanner from '@/components/sections/CtaBanner'
import Credentials from '@/components/sections/Credentials'
import { whatsappLink } from '@/lib/site'
import { getFaqs, getCredentials, getServices, getLocations, getGuides } from '@/lib/content'
import {
  buildMetadata, breadcrumbJsonLd, faqJsonLd, collectionJsonLd, jsonLdGraph,
} from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Water Filtration FAQs for the UAE',
  description:
    'Answers to what UAE households ask about water filtration: is tap water safe, do I need RO, replacement intervals, costs, RO vs UV, limescale, leaks.',
  path: '/faqs',
})

/**
 * The full FAQ set, grouped by category.
 *
 * Two deliberate choices. Every question here has a real answer — the previous
 * FAQ set had eight entries and this has thirty, and the constraint that made
 * that worth doing is that an unanswered question is not published at all
 * (`validateAll` rejects an empty `a`). And every answer is in the markup
 * whether or not the disclosure is open, so a crawler that does not click still
 * reads all of them.
 *
 * FAQPage markup is emitted because the questions and answers are genuinely
 * visible on this page. Marking up questions that are not on the page is a
 * manual-action risk, not a shortcut.
 */

const CATEGORY_LABELS: Record<string, { title: string; blurb: string }> = {
  'water-quality': {
    title: 'Water quality in the UAE',
    blurb: 'What is actually in UAE tap water, and what changes it between the plant and your glass.',
  },
  choosing: {
    title: 'Choosing a system',
    blurb: 'Which treatment addresses which complaint — and where money gets wasted.',
  },
  installation: {
    title: 'Installation',
    blurb: 'What the job involves, how long it takes and what approval you may need.',
  },
  maintenance: {
    title: 'Maintenance and servicing',
    blurb: 'Intervals, what fails silently, and what a maintenance contract actually buys.',
  },
  troubleshooting: {
    title: 'Faults and troubleshooting',
    blurb: 'Leaks, low pressure and taste changes — with the cause, not just the fix.',
  },
  pricing: {
    title: 'Pricing',
    blurb: 'Why no price is published, and what you get instead.',
  },
  service: {
    title: 'Our service',
    blurb: 'Coverage, emergency response, other brands and relocation.',
  },
}

const CATEGORY_ORDER = [
  'water-quality', 'choosing', 'installation', 'maintenance', 'troubleshooting', 'pricing', 'service',
]

export default async function FaqsPage() {
  const [faqs, credentials, services, locations, guides] = await Promise.all([
    getFaqs(), getCredentials(), getServices(), getLocations(), getGuides(),
  ])

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'FAQs', path: '/faqs' },
  ]

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    meta: CATEGORY_LABELS[category] ?? { title: category, blurb: '' },
    items: faqs.filter((faq) => faq.category === category),
  })).filter((group) => group.items.length > 0)

  /** Resolve a FAQ's cross-references into links, so each answer is a route
   *  into the cluster rather than a dead end. */
  const linksFor = (faq: (typeof faqs)[number]) => [
    ...(faq.relatedServices ?? []).flatMap((slug) => {
      const service = services.find((s) => s.slug === slug)
      return service ? [{ label: service.title, href: `/services/${service.slug}` }] : []
    }),
    ...(faq.relatedGuides ?? []).flatMap((slug) => {
      const guide = guides.find((g) => g.slug === slug)
      return guide ? [{ label: guide.title, href: `/guides/${guide.slug}` }] : []
    }),
    ...(faq.relatedLocations ?? []).slice(0, 3).flatMap((slug) => {
      const location = locations.find((l) => l.slug === slug)
      return location ? [{ label: location.name, href: `/locations/${location.slug}` }] : []
    }),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            breadcrumbJsonLd(crumbs),
            faqJsonLd(faqs, '/faqs'),
            collectionJsonLd({
              name: 'Water filtration FAQs for the UAE',
              description: 'Answers to the questions UAE households ask about water treatment.',
              path: '/faqs',
              items: grouped.map((group) => ({
                name: group.meta.title,
                path: `/faqs#${group.category}`,
              })),
            }),
          ),
        }}
      />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow="FAQs"
        title="Water filtration questions, answered properly"
        subtitle={`${faqs.length} questions across water quality, choosing a system, installation, maintenance, faults, pricing and our service. Every one has a real answer — including the ones where the answer is that you do not need to buy anything.`}
      />

      <Credentials credentials={credentials} />

      {/* Category jump list — the page is long, so make it navigable */}
      <section className="section-tight bg-white">
        <div className="container-page">
          <nav aria-label="FAQ categories" className="mx-auto max-w-4xl">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-brand-600">
              Jump to a topic
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {grouped.map((group) => (
                <li key={group.category}>
                  <a
                    href={`#${group.category}`}
                    className="inline-block rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-soft shadow-soft transition-colors hover:border-brand-200 hover:text-brand-700"
                  >
                    {group.meta.title}
                    <span className="ml-1.5 text-xs text-ink-muted">({group.items.length})</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {grouped.map((group, groupIndex) => (
        <section
          key={group.category}
          id={group.category}
          className={
            (groupIndex % 2 === 0 ? 'section bg-slate-50' : 'section bg-white') + ' scroll-mt-20'
          }
        >
          <div className="container-page">
            <SectionHeading
              eyebrow={`${group.items.length} question${group.items.length === 1 ? '' : 's'}`}
              title={group.meta.title}
              subtitle={group.meta.blurb}
            />

            <div className="mx-auto mt-12 max-w-3xl space-y-3">
              {group.items.map((faq, i) => {
                const links = linksFor(faq)
                return (
                  <Reveal key={faq.id} delay={Math.min(i * 0.04, 0.2)}>
                    <details
                      id={faq.id}
                      open={i === 0}
                      className="faq-item scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-colors"
                    >
                      <summary className="press flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5">
                        <h3 className="text-sm font-bold sm:text-base">{faq.q}</h3>
                        <span
                          aria-hidden="true"
                          className="faq-marker grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-ink-soft transition-all duration-300"
                        >
                          <Plus className="h-4 w-4" />
                        </span>
                      </summary>
                      <div className="faq-answer px-5 pb-5 sm:px-6 sm:pb-6">
                        <p className="text-sm leading-relaxed text-ink-soft">{faq.a}</p>
                        {links.length > 0 && (
                          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-ink-muted">
                            <span className="font-semibold">More on this:</span>
                            {links.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="rounded-md bg-brand-50 px-2 py-1 font-medium text-brand-700 transition-colors hover:bg-brand-100"
                              >
                                {link.label}
                              </Link>
                            ))}
                          </p>
                        )}
                      </div>
                    </details>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
      ))}

      <section className="section bg-white">
        <div className="container-page text-center">
          <h2 className="text-xl font-bold sm:text-2xl">Question not here?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Send it on WhatsApp. We answer honestly, including when the honest answer is that you do
            not need to buy anything.
          </p>
          <a
            href={whatsappLink('Hi, I have a question about water filtration:')}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics="whatsapp-click-faqs"
            className="btn-whatsapp btn-lg mt-8"
          >
            <MessageCircle aria-hidden="true" className="h-5 w-5" />
            Ask us on WhatsApp
          </a>
        </div>
      </section>

      <CtaBanner
        title="Or have it measured instead of guessed"
        subtitle="A technician tests your TDS and hardness at your own tap, free of charge, and tells you what the reading actually justifies."
      />
    </>
  )
}

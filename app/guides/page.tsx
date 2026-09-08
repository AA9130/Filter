import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CalendarCheck } from 'lucide-react'
import PageHero from '@/components/sections/PageHero'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import Photo from '@/components/ui/Photo'
import CtaBanner from '@/components/sections/CtaBanner'
import { getGuides } from '@/lib/content'
import { buildMetadata, breadcrumbJsonLd, collectionJsonLd, jsonLdGraph } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Water Filtration Guides for the UAE',
  description:
    'Practical guides on water treatment in the UAE: RO vs UV, RO vs softener, tank vs tankless, filter replacement intervals, limescale, TDS, leaks and low pressure. Written by the technicians who fit and repair these systems.',
  path: '/guides',
})

/** Guide categories, in the order a reader's questions tend to arrive. */
const CATEGORY_LABELS: Record<string, string> = {
  'water-quality': 'Water quality',
  comparison: 'Comparisons',
  buying: 'Choosing a system',
  problem: 'Problems and faults',
  troubleshooting: 'Problems and faults',
  'how-to': 'How to',
  maintenance: 'Maintenance',
}

const CATEGORY_ORDER = ['water-quality', 'comparison', 'buying', 'problem', 'how-to', 'maintenance']

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function GuidesPage() {
  const guides = await getGuides()

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
  ]

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category] ?? category,
    items: guides.filter((guide) => guide.category === category),
  })).filter((group) => group.items.length > 0)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            breadcrumbJsonLd(crumbs),
            collectionJsonLd({
              name: 'Water filtration guides for the UAE',
              description:
                'Guides on choosing, running and repairing water treatment systems in UAE conditions.',
              path: '/guides',
              items: guides.map((g) => ({ name: g.title, path: `/guides/${g.slug}` })),
            }),
          ),
        }}
      />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow="Guides"
        title="Straight answers about water treatment in the UAE"
        subtitle="Written by the technicians who install and repair these systems. No prices we cannot stand behind, no water-quality figures we have not measured, and the honest answer where the honest answer is that you do not need to buy anything."
      />

      {grouped.map((group, groupIndex) => (
        <section
          key={group.category}
          className={groupIndex % 2 === 0 ? 'section bg-white' : 'section bg-slate-50'}
        >
          <div className="container-page">
            <SectionHeading eyebrow={group.label} title={group.label} align="left" />

            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((guide, i) => (
                <Reveal as="li" key={guide.slug} delay={(i % 3) * 0.06} className="h-full">
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="group card card-hover flex h-full flex-col !p-0 overflow-hidden"
                  >
                    <Photo
                      src={guide.image}
                      alt=""
                      aria-hidden="true"
                      width={800}
                      height={420}
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-36 w-full object-cover"
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="text-base font-bold leading-snug transition-colors group-hover:text-brand-700">
                        {guide.title}
                      </h2>
                      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-soft">
                        {guide.primaryQuestion}
                      </p>
                      <p className="mt-4 flex items-center gap-1.5 text-[0.6875rem] text-ink-muted">
                        <CalendarCheck aria-hidden="true" className="h-3.5 w-3.5" />
                        Updated <time dateTime={guide.updated}>{formatDate(guide.updated)}</time>
                      </p>
                      <span className="link-arrow mt-3">
                        Read the guide
                        <ArrowRight
                          aria-hidden="true"
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <CtaBanner
        title="Still not sure what your water needs?"
        subtitle="A technician measures TDS and hardness at your tap, free of charge, and tells you which of these guides applies to you."
      />
    </>
  )
}

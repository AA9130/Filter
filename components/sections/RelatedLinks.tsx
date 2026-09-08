import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import { icon } from '@/lib/icons'

export type RelatedGroup = {
  /** Group label, e.g. "Related services". */
  label: string
  items: Array<{
    name: string
    href: string
    description: string
    /** Icon key from lib/icons. Falls back to a neutral mark. */
    icon?: string
  }>
}

/**
 * The internal-linking surface.
 *
 * Every service, product, location and guide page ends with this, populated
 * from the explicit `related*` arrays in the content — which are
 * reference-checked at build, so a link here can never point at a page that
 * does not exist.
 *
 * Explicit relationships rather than "you might also like" heuristics: the
 * point of internal linking on a site this size is to state how the topics
 * actually relate — RO connects to UV because they are complementary, and to
 * filter replacement because that is what owning one involves — so a crawler
 * builds the same topical graph a reader would. Random related links produce a
 * crawlable site with no shape.
 */
export default function RelatedLinks({
  groups,
  heading = 'Where to go next',
  subtitle,
}: {
  groups: RelatedGroup[]
  heading?: string
  subtitle?: string
}) {
  const populated = groups.filter((group) => group.items.length > 0)
  if (populated.length === 0) return null

  return (
    <section className="section bg-white" aria-label="Related pages">
      <div className="container-page">
        <SectionHeading eyebrow="Keep reading" title={heading} subtitle={subtitle} />

        <div className="mt-12 space-y-12">
          {populated.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-brand-600">
                {group.label}
              </h3>
              <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, i) => {
                  const Icon = icon(item.icon ?? 'droplets')
                  return (
                    <Reveal as="li" key={item.href} delay={(i % 3) * 0.06} className="h-full">
                      <Link href={item.href} className="group card card-hover flex h-full flex-col">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <h4 className="mt-4 text-base font-bold leading-snug transition-colors group-hover:text-brand-700">
                          {item.name}
                        </h4>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                          {item.description}
                        </p>
                        <span className="link-arrow mt-4">
                          Read more
                          <ArrowRight
                            aria-hidden="true"
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </Link>
                    </Reveal>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

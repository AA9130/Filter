import Photo from '@/components/ui/Photo'
import { Check, ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import type { Product } from '@/lib/content'
import { whatsappLink } from '@/lib/site'

export default function Products({
  products,
  limit,
  /** Split the grid into one block per category (Drinking / Villa). */
  grouped = false,
  heading = 'Systems sized for UAE water — supplied, fitted and serviced',
}: {
  products: Product[]
  limit?: number
  grouped?: boolean
  heading?: string
}) {
  const list = limit ? products.slice(0, limit) : products

  // Preserve the order categories first appear in the content file, so the
  // owner controls the running order by reordering products.json.
  const groups = grouped
    ? list.reduce<{ category: string; items: Product[] }[]>((acc, product) => {
        const existing = acc.find((g) => g.category === product.category)
        if (existing) existing.items.push(product)
        else acc.push({ category: product.category, items: [product] })
        return acc
      }, [])
    : [{ category: '', items: list }]

  return (
    <section id="products" className="section bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Products & Systems"
          title={heading}
          subtitle="Supplied, fitted and serviced by one team — every installation includes a leak test and a walkthrough of how to use and maintain your system."
        />

        {groups.map((group, groupIndex) => (
          <div key={group.category || 'all'} className={groupIndex === 0 ? 'mt-14' : 'mt-16'}>
            {grouped && (
              <Reveal>
                <div className="mb-8 flex items-center gap-4">
                  <h3 className="text-xl font-bold sm:text-2xl">{group.category}</h3>
                  <span className="h-px flex-1 bg-gradient-to-r from-brand-200 to-transparent" />
                  <span className="text-sm text-ink-muted">
                    {group.items.length} system{group.items.length === 1 ? '' : 's'}
                  </span>
                </div>
              </Reveal>
            )}

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((product, i) => (
            <Reveal as="li" key={product.slug} delay={(i % 3) * 0.08} className="h-full">
              <article
                id={product.slug}
                className="group flex h-full scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-lift"
              >
                <div className="relative overflow-hidden bg-slate-100">
                  <Photo
                    src={product.image}
                    alt={`${product.name} — ${product.category.toLowerCase()} water treatment equipment`}
                    width={900}
                    height={600}
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Redundant once the grid is split by category */}
                  {!grouped && (
                    <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-brand-700 backdrop-blur">
                      {product.category}
                    </span>
                  )}
                  {product.badge && (
                    <span className="absolute right-3 top-3 rounded-lg bg-cta-500 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-white shadow">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold leading-snug">{product.name}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{product.blurb}</p>

                  <ul className="mt-4 flex-1 space-y-2">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-ink-soft">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-eco-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={whatsappLink(
                      `Hi, I would like a quote for the ${product.name}. My location is:`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics="whatsapp-click-product"
                    className="btn-brand mt-5 w-full group/btn"
                  >
                    Request Quote
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </article>
              </Reveal>
            ))}
            </ul>
          </div>
        ))}

        <Reveal delay={0.1}>
          <p className="mt-10 text-center text-sm text-ink-muted">
            Every property is different, so we quote after a free on-site water test — a fixed
            written price in AED, with installation included and no call-out fee.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

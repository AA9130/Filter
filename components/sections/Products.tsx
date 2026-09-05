import Photo from '@/components/ui/Photo'
import { Check, ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import { products } from '@/lib/content'
import { whatsappLink } from '@/lib/site'

export default function Products({ limit }: { limit?: number }) {
  const list = limit ? products.slice(0, limit) : products

  return (
    <section id="products" className="section bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Products & Systems"
          title="Systems sized for UAE water — supplied, fitted and serviced"
          subtitle="Every price includes professional installation, a leak test and a walkthrough of how to use and maintain your system."
        />

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((product, i) => (
            <Reveal as="li" key={product.slug} delay={(i % 3) * 0.08} className="h-full">
              <article
                id={product.slug}
                className="group flex h-full scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-lift"
              >
                <div className="relative overflow-hidden bg-slate-100">
                  <Photo
                    src={product.image}
                    alt={`${product.name} — ${product.category} water treatment system installed in the UAE`}
                    width={900}
                    height={600}
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-brand-700 backdrop-blur">
                    {product.category}
                  </span>
                  {product.badge && (
                    <span className="absolute right-3 top-3 rounded-lg bg-cta-500 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-white shadow">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold leading-snug">{product.name}</h3>
                  <p className="mt-1.5 text-lg font-extrabold text-brand-700">{product.price}</p>
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
                      `Hi, I would like a quote for the ${product.name} (${product.price}). My location is:`,
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

        <Reveal delay={0.1}>
          <p className="mt-10 text-center text-sm text-ink-muted">
            All prices in UAE Dirhams (AED), inclusive of standard installation. Final pricing
            confirmed after the free on-site water test.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

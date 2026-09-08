import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CalendarCheck, ShieldCheck, User } from 'lucide-react'
import Photo from '@/components/ui/Photo'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import AnswerBlock from '@/components/sections/AnswerBlock'
import ProseSections from '@/components/sections/ProseSections'
import RelatedLinks from '@/components/sections/RelatedLinks'
import Faq from '@/components/sections/Faq'
import CtaBanner from '@/components/sections/CtaBanner'
import {
  getGuide, getGuides, getAuthor, getFaqsByIds,
  getServicesBySlugs, getProductsBySlugs, getGuidesBySlugs, getLocationsBySlugs,
} from '@/lib/content'
import { buildMetadata, breadcrumbJsonLd, guideJsonLd, faqJsonLd, jsonLdGraph } from '@/lib/seo'

/**
 * The guide template.
 *
 * Guides carry real authorship and real dates. `updated` is the last date the
 * content materially changed and nothing else — there is no build step that
 * refreshes it, because a dateModified that moves on every deploy is a signal
 * that stops meaning anything, and it is the specific tell of a site trying to
 * look maintained rather than being maintained.
 *
 * `lastFactVerified` is tracked separately from `updated`: a typo fix changes
 * one, re-checking the technical claims changes the other. They are different
 * facts about the page and collapsing them loses the useful one.
 */

export async function generateStaticParams() {
  const guides = await getGuides()
  return guides.map(({ slug }) => ({ slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) return {}
  const author = await getAuthor(guide.author)

  return buildMetadata({
    title: guide.metaTitle,
    description: guide.metaDescription,
    path: `/guides/${guide.slug}`,
    image: guide.image,
    type: 'article',
    published: guide.published,
    modified: guide.updated,
    authorName: author?.name,
  })
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) notFound()

  const author = await getAuthor(guide.author)
  if (!author) notFound()

  const [faqs, services, products, locations, relatedGuides] = await Promise.all([
    getFaqsByIds(guide.faqIds),
    getServicesBySlugs(guide.relatedServices),
    getProductsBySlugs(guide.relatedProducts),
    getLocationsBySlugs(guide.relatedLocations),
    getGuidesBySlugs(guide.relatedGuides),
  ])

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: guide.title, path: `/guides/${guide.slug}` },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            guideJsonLd(guide, author),
            breadcrumbJsonLd(crumbs),
            faqJsonLd(faqs, `/guides/${guide.slug}`),
          ),
        }}
      />

      <article>
        <section className="relative overflow-hidden bg-hero-radial pb-0 pt-12 sm:pt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-grid-light bg-grid opacity-[0.07]"
          />
          <div className="container-page relative">
            <Breadcrumbs items={crumbs} />

            <div className="mt-7 max-w-3xl">
              <span className="eyebrow-dark">{guide.category.replace(/-/g, ' ')}</span>
              <h1 className="mt-5 text-3xl leading-[1.1] text-white sm:text-4xl lg:text-[2.75rem]">
                {guide.h1}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-brand-100/90 sm:text-lg">
                {guide.primaryQuestion}
              </p>

              <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-brand-200">
                <li className="flex items-center gap-2">
                  <User aria-hidden="true" className="h-4 w-4 text-aqua-300" />
                  <span>
                    By <span className="font-semibold text-white">{author.name}</span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CalendarCheck aria-hidden="true" className="h-4 w-4 text-aqua-300" />
                  <span>
                    Updated <time dateTime={guide.updated}>{formatDate(guide.updated)}</time>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="h-4 w-4 text-aqua-300" />
                  <span>
                    Facts checked{' '}
                    <time dateTime={guide.lastFactVerified}>
                      {formatDate(guide.lastFactVerified)}
                    </time>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div aria-hidden="true" className="pointer-events-none relative -mb-px mt-12">
            <svg viewBox="0 0 1440 60" className="block h-10 w-full" preserveAspectRatio="none">
              <path d="M0 30c240-26 480-26 720 0s480 26 720 0V60H0V30Z" fill="#ffffff" />
            </svg>
          </div>
        </section>

        <AnswerBlock
          question={guide.primaryQuestion}
          answer={guide.directAnswer}
          facts={guide.keyFacts}
        />

        <section className="section bg-white pt-4">
          <div className="container-page">
            <div className="mx-auto mb-14 max-w-4xl overflow-hidden rounded-3xl shadow-card">
              <Photo
                src={guide.image}
                alt={guide.h1}
                width={1200}
                height={630}
                sizes="(max-width: 896px) 100vw, 896px"
                className="h-56 w-full object-cover sm:h-72"
              />
            </div>

            <ProseSections sections={guide.sections} comparison={guide.comparison} />

            {guide.verdict && (
              <div className="mx-auto mt-14 max-w-4xl rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50/70 to-aqua-100/40 p-6 sm:p-8">
                <h2 className="text-lg font-bold">The short version</h2>
                <p className="mt-3 text-base leading-relaxed text-ink">{guide.verdict}</p>
              </div>
            )}

            {/* Authorship, stated plainly. An organisational author is honest
                where no named individual can be attributed; inventing a named
                expert is the E-E-A-T signal most likely to be read as fake. */}
            <aside className="mx-auto mt-14 max-w-4xl rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <h2 className="text-base font-bold">About the author</h2>
              <p className="mt-1 text-sm font-semibold text-brand-700">
                {author.name} — {author.jobTitle}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{author.bio}</p>
              {author.expertise.length > 0 && (
                <>
                  <h3 className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                    Areas of practice
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {author.expertise.map((item) => (
                      <li
                        key={item}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-ink-soft"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </aside>
          </div>
        </section>

        <Faq faqs={faqs} heading="Related questions" seeAllHref="/faqs" />

        <CtaBanner
          title="Want this measured at your own tap?"
          subtitle="The on-site water test and the written quotation are free, with no call-out fee — including when the answer is that you need nothing."
        />

        <RelatedLinks
          groups={[
            {
              label: 'Services this relates to',
              items: services.map((service) => ({
                name: service.title,
                href: `/services/${service.slug}`,
                description: service.short,
                icon: service.icon,
              })),
            },
            {
              label: 'Equipment mentioned',
              items: products.map((product) => ({
                name: product.name,
                href: `/products/${product.slug}`,
                description: product.blurb,
                icon: 'package-check',
              })),
            },
            {
              label: 'Where this applies',
              items: locations.map((location) => ({
                name: `Water filter services in ${location.name}`,
                href: `/locations/${location.slug}`,
                description: `${location.responseTime} — ${location.areas.slice(0, 4).join(', ')} and more.`,
                icon: 'map-pin',
              })),
            },
            {
              label: 'Related guides',
              items: relatedGuides.map((item) => ({
                name: item.title,
                href: `/guides/${item.slug}`,
                description: item.primaryQuestion,
                icon: 'droplets',
              })),
            },
          ]}
        />
      </article>
    </>
  )
}

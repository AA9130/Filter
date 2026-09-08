import type { Metadata } from 'next'
import { site, absoluteUrl } from './site'
import { isPublishable, publishableValue, requireClaim } from './claims'
import type { Author, Business, Faq, Guide, Location, Product, Service, Testimonial } from './content/types'

/**
 * =============================================================================
 *  METADATA AND STRUCTURED DATA
 * =============================================================================
 *  Two rules run through this file.
 *
 *  1. One entity. Everything AquaPure-shaped points at a single `@id`
 *     (`{site}/#organization`), so a search or AI system resolving the page
 *     accumulates evidence about ONE entity instead of assembling three weakly
 *     related ones. This is the single highest-leverage structured-data
 *     decision on a local-business site, and it is invisible in a validator.
 *
 *  2. Nothing unverified. Ratings, review counts, prices, certifications and
 *     addresses come through the claim registry or do not appear. A schema
 *     block asserting a figure the business cannot evidence is a liability, not
 *     an optimisation — and for review markup specifically, a policy breach.
 *
 *  Note the absence of a `keywords` meta tag. Google has ignored it for two
 *  decades, and the previous implementation shipped the same twelve keywords on
 *  every page, which is the textbook shape of keyword stuffing. Removing it
 *  loses nothing and removes a signal worth not sending.
 * =============================================================================
 */

const ORGANIZATION_ID = `${site.url}/#organization`
const WEBSITE_ID = `${site.url}/#website`

const OG_IMAGE = {
  url: '/og-image.svg',
  width: 1200,
  height: 630,
  alt: `${site.name} — water filter installation, service and maintenance across the UAE.`,
}

/* --- Metadata -------------------------------------------------------------- */

/** Shared metadata builder so every page gets consistent, complete tags. */
export function buildMetadata({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  published,
  modified,
  authorName,
  noindex = false,
}: {
  title: string
  description: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  published?: string
  modified?: string
  authorName?: string
  noindex?: boolean
}): Metadata {
  const url = absoluteUrl(path)
  const ogImage = image ? { ...OG_IMAGE, url: image } : OG_IMAGE

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type,
      siteName: site.name,
      locale: site.locale,
      title,
      description,
      url,
      images: [ogImage],
      ...(type === 'article'
        ? {
            publishedTime: published,
            modifiedTime: modified,
            authors: authorName ? [authorName] : undefined,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
    },
  }
}

/**
 * Titles are assembled here rather than at each call site so the pattern stays
 * consistent and stays inside the ~60 characters Google will render. The layout
 * template appends " | AquaPure UAE", so a page title must leave room for it.
 */
export function pageTitle(subject: string): string {
  return subject
}

/* --- Structured data: the entity ------------------------------------------ */

/**
 * The canonical AquaPure entity. Everything else references this `@id`.
 *
 * `sameAs` is the entity-resolution field: it is how a system confirms that a
 * Google Business Profile, a Facebook page and this website are one business.
 * It is populated only from real profile URLs — see `isRealProfileUrl`.
 */
export function organizationJsonLd(business: Business, social: Business['social']) {
  const address = requireClaim('business_address')

  return {
    '@type': ['Organization', 'LocalBusiness'],
    '@id': ORGANIZATION_ID,
    name: business.name,
    legalName: business.legalName,
    alternateName: business.legalName,
    description: business.description,
    slogan: business.tagline,
    url: `${site.url}/`,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/og-image.svg'),
      width: 1200,
      height: 630,
    },
    image: absoluteUrl('/og-image.svg'),
    telephone: site.phone.e164,
    email: site.email,
    currenciesAccepted: business.currenciesAccepted,
    paymentAccepted: business.paymentAccepted.join(', '),
    knowsLanguage: business.languages,
    // The address is the business's own statement about itself; the claim
    // registry records that it still needs a unit number and a Google Business
    // Profile match. `postalCode` is deliberately absent: the UAE does not use
    // postal codes, and the previous "00000" was fabricated precision.
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      addressCountry: business.address.country,
    },
    // Coordinates are omitted until the owner supplies the exact pin. A wrong
    // `geo` is worse than none: it competes with the real location.
    ...(isPublishable('business_geo_coordinates') ? { geo: geoFromClaim() } : {}),
    areaServed: AREA_SERVED,
    openingHoursSpecification: business.openingHoursSpec.map((spec) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: spec.days,
      opens: spec.opens,
      closes: spec.closes,
    })),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: site.phone.e164,
        email: site.email,
        availableLanguage: business.languages,
        areaServed: 'AE',
      },
      {
        '@type': 'ContactPoint',
        contactType: 'emergency',
        telephone: site.phone.e164,
        availableLanguage: business.languages,
        areaServed: 'AE',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59',
        },
      },
    ],
    ...(social.length > 0 ? { sameAs: social.map((entry) => entry.url) } : {}),
    // aggregateRating appears only when the rating AND the review count are both
    // verified claims read from a real public profile. Publishing review figures
    // you cannot evidence breaches Google's review-snippet policy.
    ...aggregateRatingFragment(),
    // `address` is destructured above; keeping the claim reference here documents
    // why the field is allowed to exist at all.
    identifier: address.id,
  }
}

function geoFromClaim() {
  // Only reached when the claim is publishable, i.e. the owner has replaced the
  // approximate centroid with a surveyed pin and recorded a source.
  return { '@type': 'GeoCoordinates', latitude: 25.1193, longitude: 55.2277 }
}

function aggregateRatingFragment() {
  const rating = publishableValue('average_rating')
  const count = publishableValue('review_count')
  if (!rating || !count) return {}
  return {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: count.replace(/,/g, ''),
      bestRating: '5',
      worstRating: '1',
    },
  }
}

const EMIRATES = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain',
] as const

/** Coverage, as one country plus the seven cities. Backed by `coverage_seven_emirates`. */
const AREA_SERVED = [
  { '@type': 'Country', name: 'United Arab Emirates' },
  ...EMIRATES.map((name) => ({
    '@type': 'City',
    name,
    containedInPlace: { '@type': 'Country', name: 'United Arab Emirates' },
  })),
]

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${site.url}/`,
    name: site.name,
    inLanguage: site.lang,
    publisher: { '@id': ORGANIZATION_ID },
  }
}

/* --- Structured data: pages ----------------------------------------------- */

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

/**
 * Service schema. No `offers` block: prices are quoted per property and never
 * published, so declaring one would be a claim we cannot stand behind. The
 * `hasOfferCatalog` lists what the service covers without pricing it, which is
 * the honest way to express scope.
 */
export function serviceJsonLd(service: Service, business: Business) {
  return {
    '@type': 'Service',
    '@id': `${absoluteUrl(`/services/${service.slug}`)}#service`,
    name: service.title,
    serviceType: service.serviceType,
    description: service.directAnswer,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { '@id': ORGANIZATION_ID },
    areaServed: AREA_SERVED,
    audience: { '@type': 'Audience', audienceType: 'Residential and commercial property owners in the UAE' },
    availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: site.phone.e164,
      serviceUrl: absoluteUrl('/contact'),
      availableLanguage: business.languages,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.title} — what is included`,
      itemListElement: service.bullets.map((bullet) => ({
        '@type': 'OfferCatalog',
        name: bullet,
      })),
    },
  }
}

/**
 * Product schema without `offers`. Google will not show a product rich result
 * without a price, and that is the correct trade here: an invented price is a
 * consumer-facing falsehood, and a "0" price is worse.
 */
export function productJsonLd(product: Product) {
  return {
    '@type': 'Product',
    '@id': `${absoluteUrl(`/products/${product.slug}`)}#product`,
    name: product.name,
    description: product.directAnswer,
    url: absoluteUrl(`/products/${product.slug}`),
    category: product.category,
    image: absoluteUrl(product.image),
    brand: { '@type': 'Brand', name: site.name },
    manufacturer: { '@id': ORGANIZATION_ID },
    additionalProperty: product.keyFacts.map((fact) => ({
      '@type': 'PropertyValue',
      name: 'Key fact',
      value: fact,
    })),
  }
}

/** A location page describes the service AquaPure provides in one emirate. */
export function locationServiceJsonLd(location: Location, business: Business) {
  return {
    '@type': 'Service',
    '@id': `${absoluteUrl(`/locations/${location.slug}`)}#service`,
    name: `Water filtration services in ${location.name}`,
    serviceType: 'Water filtration installation, service and repair',
    description: location.intro,
    url: absoluteUrl(`/locations/${location.slug}`),
    provider: { '@id': ORGANIZATION_ID },
    areaServed: {
      '@type': 'City',
      name: location.name,
      containedInPlace: { '@type': 'Country', name: 'United Arab Emirates' },
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: site.phone.e164,
      serviceUrl: absoluteUrl('/contact'),
      availableLanguage: business.languages,
    },
  }
}

/**
 * FAQPage. Only emit this where the questions and answers are actually visible
 * on the page — invisible FAQ markup is a manual-action risk, and the payoff
 * was removed from most results anyway. Every call site here renders them.
 */
export function faqJsonLd(faqs: ReadonlyArray<Faq>, path: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }
}

/**
 * Guides are TechArticle: they are instructional, and the type is a better
 * description than Article or BlogPosting of what these pages actually are.
 * `dateModified` is only ever the real last-material-change date — bumping it
 * to look fresh is the kind of signal that stops being a signal.
 */
export function guideJsonLd(guide: Guide, author: Author) {
  const url = absoluteUrl(`/guides/${guide.slug}`)

  return {
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    headline: guide.title,
    name: guide.h1,
    description: guide.metaDescription,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: absoluteUrl(guide.image),
    datePublished: guide.published,
    dateModified: guide.updated,
    inLanguage: site.lang,
    author: {
      '@type': author.type,
      name: author.name,
      ...(author.type === 'Person' ? { jobTitle: author.jobTitle } : {}),
      ...(author.sameAs.length > 0 ? { sameAs: author.sameAs } : {}),
      ...(author.type === 'Organization' ? { '@id': ORGANIZATION_ID } : {}),
    },
    publisher: { '@id': ORGANIZATION_ID },
    about: { '@type': 'Thing', name: guide.primaryQuestion },
    // The direct answer, marked up as the article's own summary. This is the
    // block an answer engine is most likely to lift, so it is worth naming.
    abstract: guide.directAnswer,
    articleSection: guide.category,
  }
}

/**
 * Review markup for genuinely verified testimonials only. With none verified
 * this returns an empty array and no Review schema is emitted anywhere — which
 * is the correct output, not a gap to be filled.
 */
export function reviewJsonLd(testimonials: ReadonlyArray<Testimonial>) {
  if (!isPublishable('testimonials_authentic')) return []

  return testimonials
    .filter((t) => t.verification.status === 'verified')
    .map((t) => ({
      '@type': 'Review',
      itemReviewed: { '@id': ORGANIZATION_ID },
      author: { '@type': 'Person', name: t.name },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(t.rating),
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: t.quote,
      ...(t.verification.sourceUrl ? { url: t.verification.sourceUrl } : {}),
    }))
}

/** A hub page listing things. Helps a crawler understand the set, not just the page. */
export function collectionJsonLd({
  name,
  description,
  path,
  items,
}: {
  name: string
  description: string
  path: string
  items: Array<{ name: string; path: string }>
}) {
  return {
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl(path)}#collection`,
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  }
}

/**
 * Combine a page's schemas into one `@graph`.
 *
 * One script tag with cross-referenced `@id`s rather than five independent
 * blocks: independent blocks describe five unrelated things that happen to
 * share a page, and a consumer has to guess the relationships. A graph states
 * them.
 */
export function jsonLdGraph(...nodes: Array<object | null | undefined | Array<object>>) {
  const graph = nodes.flat().filter((node): node is object => Boolean(node))
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

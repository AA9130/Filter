import servicesJson from '@/content/services.json'
import productsJson from '@/content/products.json'
import locationsJson from '@/content/locations.json'
import guidesJson from '@/content/guides.json'
import faqsJson from '@/content/faqs.json'
import amcPlansJson from '@/content/amc-plans.json'
import testimonialsJson from '@/content/testimonials.json'
import credentialsJson from '@/content/credentials.json'
import reasonsJson from '@/content/reasons.json'
import processJson from '@/content/process.json'
import buyingGuideJson from '@/content/buying-guide.json'
import businessJson from '@/content/business.json'
import aboutJson from '@/content/about.json'
import authorsJson from '@/content/authors.json'
import queriesJson from '@/content/queries.json'

import { resolveImage } from '@/lib/images'
import { isPublishable, publishableValue } from '@/lib/claims'
import { isRealProfileUrl } from '@/lib/site'
import { validateAll, validateObject, validateReferences, validateComparisons } from './schema'
import type {
  About, AmcPlan, Author, Business, Credential, Faq, Guide, GuideItem, Location,
  ProcessStep, Product, PublishedStat, Reason, SearchQuery, Service, Testimonial,
} from './types'

/**
 * =============================================================================
 *  THE CONTENT SEAM — the only module that knows where content comes from.
 * =============================================================================
 *  Components never import content. Pages call these functions and pass the
 *  result down as props. That single rule is what makes the source swappable:
 *  to move to a CMS, change the bodies of these functions and nothing else.
 *
 *  Today: local JSON, validated at build, statically inlined (zero runtime cost).
 *  Tomorrow: `await fetch(CMS_URL, { next: { revalidate: 300 } })` — same
 *  signatures, so no page or component changes.
 *
 *  This seam is also where claim gating happens. Content whose backing claim is
 *  unverified is filtered out HERE, once, rather than in each component — so a
 *  new page cannot forget to check and cannot publish an unverified figure.
 *
 *  Keep every return value JSON-serializable. Content that contains React
 *  components cannot cross into a CMS, a database, or a client component.
 * =============================================================================
 */

/* --- Load and shape-validate ---------------------------------------------- */

const services = validateAll<Service>('content/services.json', servicesJson, {
  strings: ['slug', 'icon', 'title', 'serviceType', 'short', 'description', 'image', 'h1',
    'directAnswer', 'pricingNote', 'metaTitle', 'metaDescription'],
  arrays: ['bullets', 'keyFacts', 'whatItIs', 'uaeContext'],
  objectArrays: {
    whoNeedsIt: ['title', 'body'],
    howItWorks: ['step', 'title', 'body'],
    benefits: ['title', 'body'],
    maintenance: ['title', 'body'],
    commonProblems: ['problem', 'cause', 'fix'],
    choosingFactors: ['title', 'body'],
  },
  icons: ['icon'],
  images: ['image'],
}).map((service) => ({ ...service, image: resolveImage(service.image) }))

const products = validateAll<Product>('content/products.json', productsJson, {
  strings: ['slug', 'name', 'category', 'image', 'blurb', 'h1', 'directAnswer', 'specNote',
    'metaTitle', 'metaDescription'],
  arrays: ['features', 'keyFacts', 'howItFits'],
  objectArrays: {
    whoItSuits: ['title', 'body'],
    maintenance: ['title', 'body'],
    considerations: ['title', 'body'],
  },
  // Operating limits are optional: they exist only where manufacturer
  // documentation is on file (see docs/EQUIPMENT-DATA.md), and a product
  // without any is more honest than a product with invented ones.
  optionalObjectArrays: { operatingLimits: ['label', 'value'] },
  pairs: [['operatingLimits', 'limitsNote']],
  images: ['image'],
}).map((product) => ({ ...product, image: resolveImage(product.image, 'roSystem') }))

const locations = validateAll<Location>('content/locations.json', locationsJson, {
  strings: ['name', 'slug', 'utility', 'responseTime', 'responseNote', 'image', 'intro',
    'propertyMix', 'metaTitle', 'metaDescription'],
  arrays: ['areas', 'supply'],
  objectArrays: {
    commonRequests: ['title', 'body'],
    localConsiderations: ['title', 'body'],
  },
  images: ['image'],
}).map((location) => ({ ...location, image: resolveImage(location.image, 'dubaiSkyline') }))

const guides = validateAll<Guide>('content/guides.json', guidesJson, {
  strings: ['slug', 'title', 'h1', 'category', 'image', 'searchIntent', 'primaryQuestion',
    'metaTitle', 'metaDescription', 'directAnswer', 'author'],
  arrays: ['keyFacts'],
  objectArrays: { sections: ['heading'] },
  images: ['image'],
  dates: ['published', 'updated', 'lastFactVerified'],
}).map((guide) => ({ ...guide, image: resolveImage(guide.image, 'labTest') }))

const faqs = validateAll<Faq>('content/faqs.json', faqsJson, {
  strings: ['id', 'q', 'a', 'category'],
  dates: ['lastVerified'],
})

const amcPlans = validateAll<AmcPlan>('content/amc-plans.json', amcPlansJson, {
  strings: ['name', 'tagline'],
  arrays: ['features'],
})

const processSteps = validateAll<ProcessStep>('content/process.json', processJson, {
  strings: ['step', 'title', 'body'],
})

const buyingGuide = validateAll<GuideItem>('content/buying-guide.json', buyingGuideJson, {
  strings: ['icon', 'title', 'body'],
  icons: ['icon'],
})

const allCredentials = validateAll<Credential>('content/credentials.json', credentialsJson, {
  strings: ['claimId', 'label', 'sub', 'icon'],
  icons: ['icon'],
  claims: ['claimId'],
})

const allReasons = validateAll<Reason>('content/reasons.json', reasonsJson, {
  strings: ['claimId', 'icon', 'title', 'body'],
  icons: ['icon'],
  claims: ['claimId'],
})

const allTestimonials = validateAll<Testimonial>(
  'content/testimonials.json',
  (testimonialsJson as { items: unknown[] }).items,
  { strings: ['id', 'name', 'location', 'role', 'quote', 'service'] },
)

const authors = validateAll<Author>(
  'content/authors.json',
  (authorsJson as { authors: unknown[] }).authors,
  { strings: ['id', 'type', 'name', 'jobTitle', 'bio'], arrays: ['expertise'] },
)

const searchQueries = validateAll<SearchQuery>(
  'content/queries.json',
  (queriesJson as { queries: unknown[] }).queries,
  { strings: ['id', 'query', 'intent'] },
)

const business = validateObject<Business>('content/business.json', businessJson, [
  'name', 'legalName', 'tagline', 'shortDescription', 'description', 'entityType',
  'address', 'languages', 'hours', 'openingHoursSpec', 'social',
])

const about = validateObject<About>('content/about.json', aboutJson, [
  'intro', 'story', 'expertise', 'values', 'history',
])

/* --- Cross-collection reference integrity --------------------------------- */

const serviceSlugs = new Set(services.map((s) => s.slug))
const productSlugs = new Set(products.map((p) => p.slug))
const locationSlugs = new Set(locations.map((l) => l.slug))
const guideSlugs = new Set(guides.map((g) => g.slug))
const faqIds = new Set(faqs.map((f) => f.id))
const authorIds = new Set(authors.map((a) => a.id))

const REFS = {
  relatedServices: serviceSlugs,
  relatedProducts: productSlugs,
  relatedLocations: locationSlugs,
  relatedGuides: guideSlugs,
  faqIds,
}

validateReferences('content/services.json', services, REFS)
validateReferences('content/products.json', products, REFS)
validateReferences('content/guides.json', guides, REFS)
validateReferences('content/faqs.json', faqs, REFS)
validateReferences('content/locations.json', locations, {
  priorityServices: serviceSlugs,
  priorityProducts: productSlugs,
  relatedGuides: guideSlugs,
  faqIds,
})
validateComparisons('content/guides.json', guides)

// Guide authorship: `author` and `reviewer` are single ids rather than arrays,
// so `validateReferences` does not apply and they are checked directly.
for (const guide of guides) {
  if (!authorIds.has(guide.author)) {
    throw new Error(
      `[content] content/guides.json → "${guide.slug}": author "${guide.author}" is not in content/authors.json`,
    )
  }
  if (guide.reviewer && !authorIds.has(guide.reviewer)) {
    throw new Error(
      `[content] content/guides.json → "${guide.slug}": reviewer "${guide.reviewer}" is not in content/authors.json`,
    )
  }
}

/* --- Claim gating, applied once ------------------------------------------- */

/** Only trust signals whose backing claim is verified or self-asserted. */
const credentials = allCredentials.filter((c) => isPublishable(c.claimId))
const reasons = allReasons.filter((r) => isPublishable(r.claimId))

/**
 * A testimonial publishes only when BOTH gates open: the collective claim that
 * the testimonials are genuine, and this individual entry's own verification.
 * Two gates rather than one because "we have consent on file for these six"
 * and "this specific quote is attributable" are different assertions.
 */
const testimonials = isPublishable('testimonials_authentic')
  ? allTestimonials.filter((t) => t.verification.status === 'verified')
  : []

/** Figures that survived verification. Empty is the normal state, not an error. */
const publishedStats: PublishedStat[] = (
  [
    { claimId: 'customers_served', label: 'UAE households & businesses served' },
    { claimId: 'years_in_business', label: 'Years in business' },
    { claimId: 'average_rating', label: 'Average customer rating' },
    { claimId: 'review_count', label: 'Customer reviews' },
  ] as const
).flatMap(({ claimId, label }) => {
  const value = publishableValue(claimId)
  return value ? [{ claimId, value, label }] : []
})

/** Social profiles that actually identify AquaPure. Bare domains are dropped. */
const socialProfiles = business.social.filter((entry) => isRealProfileUrl(entry.url))

/* --- Accessors -------------------------------------------------------------
   Async on purpose: a CMS-backed implementation will need to await, and callers
   written against these signatures will not have to change when it does. */

export async function getServices(): Promise<Service[]> {
  return services
}
export async function getService(slug: string): Promise<Service | undefined> {
  return services.find((s) => s.slug === slug)
}
export async function getProducts(): Promise<Product[]> {
  return products
}
export async function getProduct(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug)
}
export async function getLocations(): Promise<Location[]> {
  return locations
}
export async function getLocation(slug: string): Promise<Location | undefined> {
  return locations.find((l) => l.slug === slug)
}
export async function getGuides(): Promise<Guide[]> {
  return guides
}
export async function getGuide(slug: string): Promise<Guide | undefined> {
  return guides.find((g) => g.slug === slug)
}
export async function getFaqs(): Promise<Faq[]> {
  return faqs
}
export async function getAuthor(id: string): Promise<Author | undefined> {
  return authors.find((a) => a.id === id)
}
export async function getAuthors(): Promise<Author[]> {
  return authors
}
export async function getAmcPlans(): Promise<AmcPlan[]> {
  return amcPlans
}
export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials
}
export async function getCredentials(): Promise<Credential[]> {
  return credentials
}
export async function getReasons(): Promise<Reason[]> {
  return reasons
}
export async function getProcessSteps(): Promise<ProcessStep[]> {
  return processSteps
}
export async function getBuyingGuide(): Promise<GuideItem[]> {
  return buyingGuide
}
export async function getBusiness(): Promise<Business> {
  return business
}
export async function getAbout(): Promise<About> {
  return about
}
export async function getPublishedStats(): Promise<PublishedStat[]> {
  return publishedStats
}
export async function getSocialProfiles(): Promise<Business['social']> {
  return socialProfiles
}
export async function getSearchQueries(): Promise<SearchQuery[]> {
  return searchQueries
}

/* --- Selection helpers ----------------------------------------------------- */

/** FAQs named by a page, in the order the page named them. */
export async function getFaqsByIds(ids: readonly string[]): Promise<Faq[]> {
  return ids.flatMap((id) => {
    const faq = faqs.find((f) => f.id === id)
    return faq ? [faq] : []
  })
}

export async function getServicesBySlugs(slugs: readonly string[]): Promise<Service[]> {
  return slugs.flatMap((slug) => {
    const service = services.find((s) => s.slug === slug)
    return service ? [service] : []
  })
}

export async function getProductsBySlugs(slugs: readonly string[]): Promise<Product[]> {
  return slugs.flatMap((slug) => {
    const product = products.find((p) => p.slug === slug)
    return product ? [product] : []
  })
}

export async function getGuidesBySlugs(slugs: readonly string[]): Promise<Guide[]> {
  return slugs.flatMap((slug) => {
    const guide = guides.find((g) => g.slug === slug)
    return guide ? [guide] : []
  })
}

export async function getLocationsBySlugs(slugs: readonly string[]): Promise<Location[]> {
  return slugs.flatMap((slug) => {
    const location = locations.find((l) => l.slug === slug)
    return location ? [location] : []
  })
}

/** Siblings for internal linking — never returns the current page. */
export async function getRelatedServices(slug: string, count = 3): Promise<Service[]> {
  const explicit = services.find((s) => s.slug === slug)?.relatedServices ?? []
  const picked = await getServicesBySlugs(explicit.slice(0, count))
  if (picked.length >= count) return picked

  // Fall back to the next siblings in file order, so a service with few
  // explicit relations still gives crawlers somewhere to go.
  const index = services.findIndex((s) => s.slug === slug)
  const seen = new Set([slug, ...picked.map((s) => s.slug)])
  for (let i = 1; i < services.length && picked.length < count; i++) {
    const candidate = services[(index + i) % services.length]
    if (seen.has(candidate.slug)) continue
    picked.push(candidate)
    seen.add(candidate.slug)
  }
  return picked
}

export async function getRelatedProducts(slug: string, count = 3): Promise<Product[]> {
  const index = products.findIndex((p) => p.slug === slug)
  if (index === -1) return products.slice(0, count)
  return Array.from({ length: Math.min(count, products.length - 1) }, (_, i) =>
    products[(index + i + 1) % products.length],
  )
}

export type * from './types'

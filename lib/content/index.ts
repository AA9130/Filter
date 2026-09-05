import servicesJson from '@/content/services.json'
import productsJson from '@/content/products.json'
import amcPlansJson from '@/content/amc-plans.json'
import emiratesJson from '@/content/emirates.json'
import testimonialsJson from '@/content/testimonials.json'
import faqsJson from '@/content/faqs.json'
import reasonsJson from '@/content/reasons.json'
import processJson from '@/content/process.json'
import trustBadgesJson from '@/content/trust-badges.json'
import buyingGuideJson from '@/content/buying-guide.json'
import businessJson from '@/content/business.json'
import aboutJson from '@/content/about.json'

import { resolveImage } from '@/lib/images'
import { validateAll, validateObject } from './schema'
import type {
  About, AmcPlan, Business, Emirate, Faq, GuideItem, ProcessStep, Product,
  Reason, Service, Testimonial, TrustBadge,
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
 *  Keep every return value JSON-serializable. Content that contains React
 *  components cannot cross into a CMS, a database, or a client component.
 * =============================================================================
 */

// Image keys are resolved here — the one place that adapts stored content into
// what the app renders. Components receive a path they can pass straight to
// next/image; a raw key can never leak into a page again.
const services = validateAll<Service>('content/services.json', servicesJson, {
  strings: ['slug', 'icon', 'title', 'short', 'description', 'image', 'metaTitle', 'metaDescription'],
  arrays: ['bullets'],
  icons: ['icon'],
  images: ['image'],
}).map((service) => ({ ...service, image: resolveImage(service.image) }))

const products = validateAll<Product>('content/products.json', productsJson, {
  strings: ['slug', 'name', 'category', 'image', 'blurb', 'metaTitle', 'metaDescription'],
  arrays: ['features'],
  images: ['image'],
}).map((product) => ({ ...product, image: resolveImage(product.image, 'roSystem') }))

const amcPlans = validateAll<AmcPlan>('content/amc-plans.json', amcPlansJson, {
  strings: ['name', 'tagline'],
  arrays: ['features'],
})

const emirates = validateAll<Emirate>('content/emirates.json', emiratesJson, {
  strings: ['name', 'slug', 'response'],
  arrays: ['areas'],
})

const testimonials = validateAll<Testimonial>('content/testimonials.json', testimonialsJson, {
  strings: ['name', 'location', 'role', 'quote'],
})

const faqs = validateAll<Faq>('content/faqs.json', faqsJson, { strings: ['q', 'a'] })

const reasons = validateAll<Reason>('content/reasons.json', reasonsJson, {
  strings: ['icon', 'title', 'body'],
  icons: ['icon'],
})

const processSteps = validateAll<ProcessStep>('content/process.json', processJson, {
  strings: ['step', 'title', 'body'],
})

const trustBadges = validateAll<TrustBadge>('content/trust-badges.json', trustBadgesJson, {
  strings: ['label', 'sub'],
})

const buyingGuide = validateAll<GuideItem>('content/buying-guide.json', buyingGuideJson, {
  strings: ['icon', 'title', 'body'],
  icons: ['icon'],
})

const business = validateObject<Business>('content/business.json', businessJson, [
  'name', 'legalName', 'tagline', 'description', 'address', 'hours', 'stats',
])

const about = validateObject<About>('content/about.json', aboutJson, [
  'story', 'values', 'milestones',
])

/* --- Accessors -------------------------------------------------------------
   Async on purpose: a CMS-backed implementation will need to await, and callers
   written against these signatures will not have to change when it does. */

export async function getServices(): Promise<Service[]> {
  return services
}

export async function getService(slug: string): Promise<Service | undefined> {
  return services.find((s) => s.slug === slug)
}

/** Siblings for internal linking — never returns the current page. */
export async function getRelatedServices(slug: string, count = 3): Promise<Service[]> {
  const index = services.findIndex((s) => s.slug === slug)
  if (index === -1) return services.slice(0, count)
  return Array.from({ length: Math.min(count, services.length - 1) }, (_, i) =>
    services[(index + i + 1) % services.length],
  )
}

export async function getProducts(): Promise<Product[]> {
  return products
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug)
}

export async function getRelatedProducts(slug: string, count = 3): Promise<Product[]> {
  const index = products.findIndex((p) => p.slug === slug)
  if (index === -1) return products.slice(0, count)
  return Array.from({ length: Math.min(count, products.length - 1) }, (_, i) =>
    products[(index + i + 1) % products.length],
  )
}

export async function getAmcPlans(): Promise<AmcPlan[]> {
  return amcPlans
}
export async function getEmirates(): Promise<Emirate[]> {
  return emirates
}
export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials
}
export async function getFaqs(): Promise<Faq[]> {
  return faqs
}
export async function getReasons(): Promise<Reason[]> {
  return reasons
}
export async function getProcessSteps(): Promise<ProcessStep[]> {
  return processSteps
}
export async function getTrustBadges(): Promise<TrustBadge[]> {
  return trustBadges
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

export type * from './types'

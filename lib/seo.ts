import type { Metadata } from 'next'
import { site } from './site'
import type { Business } from './content/types'

const OG_IMAGE = {
  url: '/og-image.svg',
  width: 1200,
  height: 630,
  alt: `${site.name} — water filter installation, service & AMC across the UAE.`,
}

/** Shared metadata builder so every page gets consistent, complete tags. */
export function buildMetadata({
  title,
  description,
  path = '/',
  keywords = [],
}: {
  title: string
  description: string
  path?: string
  keywords?: string[]
}): Metadata {
  const url = `${site.url}${path}`

  return {
    title,
    description,
    keywords: [
      'water filter UAE',
      'water filter installation Dubai',
      'RO system Dubai',
      'water purifier service Abu Dhabi',
      'water filter replacement Sharjah',
      'water softener UAE',
      'whole house water filter Dubai',
      'UV water sterilizer UAE',
      'water purifier AMC Dubai',
      'water filter repair near me',
      'RO membrane replacement UAE',
      'commercial RO plant UAE',
      ...keywords,
    ],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: 'en_AE',
      title,
      description,
      url,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
    },
  }
}

/** LocalBusiness structured data — drives Google local rich results. */
export function localBusinessJsonLd(business: Business) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HVACBusiness'],
    '@id': `${site.url}/#business`,
    name: business.name,
    legalName: business.legalName,
    description: business.description,
    url: site.url,
    telephone: `+${site.phone.raw}`,
    email: site.email,
    image: `${site.url}/og-image.svg`,
    currenciesAccepted: 'AED',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.address.latitude,
      longitude: business.address.longitude,
    },
    areaServed: [
      'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain',
    ].map((name) => ({
      '@type': 'City',
      name,
      containedInPlace: { '@type': 'Country', name: 'United Arab Emirates' },
    })),
    openingHoursSpecification: business.openingHoursSpec.map((spec) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: spec.days,
      opens: spec.opens,
      closes: spec.closes,
    })),
    // aggregateRating intentionally omitted: publishing review figures you
    // cannot evidence breaches Google's review-snippet policy. Add it back
    // once you have real, verifiable counts.
    sameAs: Object.values(business.social),
  }
}

/** Service page schema — one per service URL. */
export function serviceJsonLd({
  name, description, slug, business,
}: { name: string; description: string; slug: string; business: Business }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType: name,
    url: `${site.url}/services/${slug}`,
    provider: { '@type': 'LocalBusiness', '@id': `${site.url}/#business`, name: business.name },
    areaServed: {
      '@type': 'Country',
      name: 'United Arab Emirates',
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: `+${site.phone.raw}`,
      serviceUrl: `${site.url}/contact`,
    },
  }
}

/**
 * Product page schema. No `offers` block: prices are quoted per property and
 * never published, so declaring a price in structured data would be a claim we
 * cannot stand behind.
 */
export function productJsonLd({
  name, description, slug, business,
}: {
  name: string
  description: string
  slug: string
  business: Business
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url: `${site.url}/products/${slug}`,
    brand: { '@type': 'Brand', name: business.name },
  }
}

export function faqJsonLd(faqs: ReadonlyArray<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  }
}

import type { Metadata } from 'next'
import { site } from './site'

const OG_IMAGE = {
  url: '/og-image.svg',
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}. Water filter installation, service & AMC across the UAE.`,
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

/** LocalBusiness + Service structured data for rich results in local search. */
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HVACBusiness'],
    '@id': `${site.url}/#business`,
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    telephone: `+${site.phone.raw}`,
    email: site.email,
    image: `${site.url}/og-image.svg`,
    priceRange: 'AED 120 – AED 12,000',
    currenciesAccepted: 'AED',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: 25.1193, longitude: 55.2277 },
    areaServed: [
      'Dubai',
      'Abu Dhabi',
      'Sharjah',
      'Ajman',
      'Ras Al Khaimah',
      'Fujairah',
      'Umm Al Quwain',
    ].map((name) => ({ '@type': 'City', name, containedInPlace: { '@type': 'Country', name: 'United Arab Emirates' } })),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '08:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Friday',
        opens: '14:00',
        closes: '21:00',
      },
    ],
    // aggregateRating intentionally omitted: publishing review figures you
    // cannot evidence breaches Google's review-snippet policy. Add it back
    // once you have real, verifiable counts.
    sameAs: Object.values(site.social),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Water Filtration Services',
      itemListElement: [
        'Water Filter Installation',
        'RO Water Purifier Systems',
        'Whole House Filtration Systems',
        'Water Softeners',
        'UV Sterilizer Systems',
        'Filter Replacement & Spare Parts',
        'Annual Maintenance Contracts (AMC)',
        'Repair & Troubleshooting',
        'Water Filter System Relocation',
        'Free Demo & Consultation',
      ].map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name, areaServed: 'United Arab Emirates' },
      })),
    },
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

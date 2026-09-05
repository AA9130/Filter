/** Shapes of the editable content. Everything here must stay JSON-serializable. */

export type Service = {
  slug: string
  icon: string
  title: string
  short: string
  description: string
  bullets: string[]
  highlight?: string
  image: string
  metaTitle: string
  metaDescription: string
}

export type Product = {
  slug: string
  name: string
  category: string
  image: string
  blurb: string
  features: string[]
  badge?: string
  metaTitle: string
  metaDescription: string
}

export type AmcPlan = {
  name: string
  tagline: string
  features: string[]
  excluded: string[]
  featured: boolean
}

export type Emirate = {
  name: string
  slug: string
  areas: string[]
  response: string
}

export type Testimonial = {
  name: string
  location: string
  role: string
  rating: number
  quote: string
}

export type Faq = { q: string; a: string }
export type Reason = { icon: string; title: string; body: string }
export type ProcessStep = { step: string; title: string; body: string }
export type TrustBadge = { label: string; sub: string }
export type GuideItem = { icon: string; title: string; body: string }

export type Business = {
  name: string
  legalName: string
  tagline: string
  description: string
  address: {
    street: string
    city: string
    region: string
    country: string
    countryName: string
    postalCode: string
    latitude: number
    longitude: number
    mapQuery: string
  }
  hours: { days: string; time: string }[]
  openingHoursSpec: { days: string[]; opens: string; closes: string }[]
  social: Record<string, string>
  stats: {
    customers: string
    emirates: string
    years: string
    rating: string
    reviewCount: string
  }
}

export type About = {
  story: string[]
  values: { icon: string; title: string; body: string }[]
  milestones: { year: string; title: string; body: string }[]
}

/** Shapes of the editable content. Everything here must stay JSON-serializable. */

/* --- Shared building blocks ------------------------------------------------ */

/** A titled paragraph. The unit most of the authored content is made of. */
export type Point = { title: string; body: string }

/** A `Point` that carries an icon key from lib/icons. */
export type IconPoint = Point & { icon: string }

/** A numbered step in a process. */
export type Step = { step: string; title: string; body: string }

/** A diagnosable fault: what you see, why it happens, what fixes it. */
export type Problem = { problem: string; cause: string; fix: string }

/** A side-by-side table. Every row must have one value per column. */
/**
 * One feed-water or duty limit for a class of equipment.
 *
 * Deliberately not a product specification. `value` is the published limit of
 * representative equipment of this type, taken from manufacturer
 * documentation; what it tells a reader is whether the water at their property
 * is inside the envelope the technology needs. See Product.limitsNote.
 */
export type Limit = { label: string; value: string; note?: string }

export type Comparison = {
  caption: string
  columns: string[]
  rows: Array<{ label: string; values: string[] }>
}

/** One block of a guide body. `slot: 'comparison'` renders the guide's table. */
export type Section = {
  heading: string
  paragraphs?: string[]
  list?: Point[]
  slot?: 'comparison'
}

/* --- Collections ----------------------------------------------------------- */

export type Service = {
  slug: string
  icon: string
  title: string
  /** Plain-language service type, used for schema.org `serviceType`. */
  serviceType: string
  short: string
  description: string
  bullets: string[]
  highlight?: string
  image: string
  /** Page heading. Kept separate from `title` so navigation labels stay short
   *  while the H1 can carry the search intent. */
  h1: string
  /** The GEO answer block: the extractable answer to the page's question. */
  directAnswer: string
  keyFacts: string[]
  whatItIs: string[]
  whoNeedsIt: Point[]
  howItWorks: Step[]
  benefits: Point[]
  maintenance: Point[]
  commonProblems: Problem[]
  choosingFactors: Point[]
  uaeContext: string[]
  /** What drives cost. Never a figure — see claim `published_pricing`. */
  pricingNote: string
  relatedServices: string[]
  relatedProducts: string[]
  relatedGuides: string[]
  faqIds: string[]
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
  h1: string
  directAnswer: string
  keyFacts: string[]
  whoItSuits: Point[]
  howItFits: string[]
  maintenance: Point[]
  considerations: Point[]
  /** Why no specification table is published. */
  specNote: string
  /**
   * Feed-water and duty limits for this class of equipment. Optional: present
   * only where manufacturer documentation is on file — see docs/EQUIPMENT-DATA.md.
   */
  operatingLimits?: Limit[]
  /** Where the limits come from and what they are not. Required with them. */
  limitsNote?: string
  relatedServices: string[]
  relatedGuides: string[]
  relatedLocations: string[]
  faqIds: string[]
  metaTitle: string
  metaDescription: string
}

export type Location = {
  name: string
  slug: string
  /** The real distributing utility. Named, not linked — see docs/KNOWLEDGE-BASE.md. */
  utility: string
  responseTime: string
  responseNote: string
  image: string
  areas: string[]
  intro: string
  propertyMix: string
  supply: string[]
  commonRequests: Point[]
  localConsiderations: Point[]
  priorityServices: string[]
  priorityProducts: string[]
  relatedGuides: string[]
  faqIds: string[]
  metaTitle: string
  metaDescription: string
}

export type Guide = {
  slug: string
  title: string
  h1: string
  category: string
  image: string
  searchIntent: string
  primaryQuestion: string
  metaTitle: string
  metaDescription: string
  directAnswer: string
  keyFacts: string[]
  sections: Section[]
  comparison?: Comparison
  verdict?: string
  relatedServices: string[]
  relatedProducts: string[]
  relatedLocations: string[]
  relatedGuides: string[]
  faqIds: string[]
  author: string
  reviewer: string
  published: string
  updated: string
  lastFactVerified: string
}

export type Faq = {
  /**
   * Blocked claims this answer names in order to explain them, never to assert
   * them. Screening forgives the mention only where the required scoping
   * language is present — see DISCUSSABLE_CLAIMS in lib/claims.ts.
   */
  discussesClaims?: string[]
  id: string
  q: string
  a: string
  category: string
  relatedServices?: string[]
  relatedProducts?: string[]
  relatedLocations?: string[]
  relatedGuides?: string[]
  source?: string
  lastVerified: string
}

export type AmcPlan = {
  name: string
  tagline: string
  features: string[]
  excluded: string[]
  featured: boolean
}

/** A trust signal, gated by the claim that backs it. */
export type Credential = {
  claimId: string
  label: string
  sub: string
  icon: string
}

/** A reason to choose us, gated by the claim that backs it. */
export type Reason = {
  claimId: string
  icon: string
  title: string
  body: string
}

export type ProcessStep = Step
export type GuideItem = { icon: string; title: string; body: string }

export type Testimonial = {
  id: string
  name: string
  location: string
  role: string
  rating: number
  quote: string
  service: string
  verification: {
    status: 'verified' | 'unverified'
    sourceUrl: string
    consentRecordedOn: string
  }
}

export type Author = {
  id: string
  type: 'Person' | 'Organization'
  name: string
  jobTitle: string
  bio: string
  expertise: string[]
  credentials: string[]
  sameAs: string[]
}

export type Business = {
  name: string
  legalName: string
  tagline: string
  shortDescription: string
  description: string
  entityType: string
  address: {
    street: string
    city: string
    region: string
    country: string
    countryName: string
    mapQuery: string
  }
  languages: string[]
  hours: { days: string; time: string }[]
  openingHoursSpec: { days: string[]; opens: string; closes: string }[]
  paymentAccepted: string[]
  currenciesAccepted: string
  social: { platform: string; url: string }[]
}

export type About = {
  intro: string
  story: string[]
  expertise: IconPoint[]
  values: IconPoint[]
  history: {
    claimId: string
    intro: string
    milestones: { year: string; title: string; body: string }[]
  }
}

/** A tracked search query. Metrics stay null until a real source fills them. */
export type SearchQuery = {
  id: string
  query: string
  intent: string
  location: string | null
  service: string | null
  product: string | null
  problem: string | null
  priority: number
  searchVolume: number | null
  currentRank: number | null
  aiVisibility: number | null
  competitorPresence: number | null
  contentExists: boolean
  contentUrl: string | null
  lastChecked: string | null
}

/** A stat that survived claim verification. Absent when the claim has not. */
export type PublishedStat = { claimId: string; value: string; label: string }

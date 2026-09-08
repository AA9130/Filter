import type { ClaimStatus } from '@/lib/claims'

/**
 * =============================================================================
 *  AI CONTENT PIPELINE — types
 * =============================================================================
 *  The pipeline this describes is deliberately NOT keyword → LLM → publish.
 *  That shape produces plausible text about a business, which is precisely the
 *  failure this whole codebase is arranged to prevent: a generator that has
 *  read the marketing copy will happily assert "12,000+ customers" on forty new
 *  pages, and nothing downstream will stop it.
 *
 *  Instead:
 *    query → intent → entities → retrieval → brief → draft
 *          → fact / claim / SEO / GEO / quality validation
 *          → human approval → publish
 *
 *  The load-bearing stages are retrieval and validation. Retrieval decides what
 *  the model is allowed to know; validation decides what survives. Generation
 *  is the easy part and the least important.
 * =============================================================================
 */

export type Intent =
  | 'informational'
  | 'commercial-investigation'
  | 'transactional'
  | 'troubleshooting'
  | 'navigational'
  | 'local'

/** What kind of page a topic wants to become. */
export type PageKind = 'guide' | 'service' | 'product' | 'location' | 'faq'

export type ExtractedEntities = {
  /** The single thing the page is about. */
  primary: string
  services: string[]
  products: string[]
  locations: string[]
  /** Problems and symptoms named in the query, e.g. "limescale". */
  problems: string[]
  /** Technologies named or implied: ro, uv, softener, carbon, sediment. */
  technologies: string[]
}

/** What retrieval found in the canonical knowledge for this topic. */
export type RetrievedKnowledge = {
  services: Array<{ slug: string; title: string; directAnswer: string; url: string }>
  products: Array<{ slug: string; name: string; directAnswer: string; url: string }>
  locations: Array<{ slug: string; name: string; intro: string; url: string }>
  guides: Array<{ slug: string; title: string; directAnswer: string; url: string }>
  faqs: Array<{ id: string; q: string; a: string }>
  /** Claims the draft is permitted to assert, with their evidence. */
  allowedClaims: Array<{ id: string; claim: string; status: ClaimStatus; source: string }>
  /** Claims that must not appear, so the brief can say so explicitly. */
  forbiddenClaims: Array<{ id: string; claim: string; status: ClaimStatus; reason: string }>
}

/** Where existing content already covers, partly covers, or misses the topic. */
export type CoverageAnalysis = {
  /** An existing page that already answers this. Then the action is not "write". */
  exactMatch: string | null
  /** Pages that partially cover it — candidates for extension over creation. */
  partial: Array<{ url: string; title: string; overlap: number }>
  /** What a new page would have to add that no existing page does. */
  gap: string
  recommendation: 'create' | 'extend' | 'skip'
}

/** The instruction set a generator receives. Nothing outside this is licensed. */
export type ContentBrief = {
  queryId: string
  topic: string
  pageKind: PageKind
  primaryIntent: Intent
  secondaryIntents: Intent[]
  primaryEntity: string
  relatedEntities: string[]
  targetLocation: string | null
  targetService: string | null
  questionsToAnswer: string[]
  /** Facts the draft must include, drawn from retrieved knowledge. */
  factsRequired: string[]
  /** Claim ids the draft may assert. Anything else is a validation failure. */
  claimsAllowed: string[]
  /** Claim ids that must not appear, with the reason, so the brief is teachable. */
  claimsForbidden: Array<{ id: string; reason: string }>
  internalLinks: Array<{ url: string; anchor: string; why: string }>
  schemaType: string
  title: string
  metaDescription: string
  recommendedSections: string[]
  coverage: CoverageAnalysis
  createdAt: string
}

/** A generated draft, in the same structured shape the site renders. */
export type ContentDraft = {
  briefQueryId: string
  slug: string
  title: string
  h1: string
  metaTitle: string
  metaDescription: string
  directAnswer: string
  keyFacts: string[]
  sections: Array<{ heading: string; paragraphs?: string[]; list?: Array<{ title: string; body: string }> }>
  faqIds: string[]
  relatedServices: string[]
  relatedProducts: string[]
  relatedLocations: string[]
  relatedGuides: string[]
  /** Which generator produced this, so a bad batch can be traced. */
  provenance: { generator: string; model: string | null; createdAt: string }
}

export type Severity = 'error' | 'warning'

export type ValidationIssue = {
  validator: 'fact' | 'claim' | 'seo' | 'geo' | 'quality'
  severity: Severity
  code: string
  message: string
  /** Where in the draft, when locatable. */
  at?: string
}

export type ValidationReport = {
  passed: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  /** GEO answerability, 0–100. Diagnostic, never a publish gate on its own. */
  geoScore: number
  checkedAt: string
}

export type ApprovalStatus = 'draft' | 'awaiting-review' | 'changes-requested' | 'approved' | 'published' | 'rejected'

/** One item of work moving through the pipeline. Persisted as JSON. */
export type PipelineRecord = {
  id: string
  queryId: string
  status: ApprovalStatus
  brief: ContentBrief
  draft: ContentDraft | null
  validation: ValidationReport | null
  /** Who approved, and when. Never auto-filled — that is the whole point. */
  review: { by: string; at: string; notes: string } | null
  publishedUrl: string | null
  history: Array<{ at: string; event: string; detail?: string }>
}

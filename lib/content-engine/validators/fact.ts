import { getServices, getProducts, getLocations, getGuides, getFaqs } from '@/lib/content'
import type { ContentDraft, ValidationIssue } from '../types'

/**
 * Fact validation: does everything the draft points at actually exist?
 *
 * This is the unglamorous half of not making things up. A generator that
 * invents a service — "AquaPure's borewell treatment division" — or links to
 * /services/water-ionizer produces a page that reads correctly and is wrong in
 * a way no prose screen detects. The check is a set membership test against the
 * canonical content, and it is the cheapest reliability win in the pipeline.
 */
export async function validateFacts(draft: ContentDraft): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = []

  const [services, products, locations, guides, faqs] = await Promise.all([
    getServices(), getProducts(), getLocations(), getGuides(), getFaqs(),
  ])

  const sets = {
    relatedServices: { valid: new Set(services.map((s) => s.slug)), label: 'service' },
    relatedProducts: { valid: new Set(products.map((p) => p.slug)), label: 'product' },
    relatedLocations: { valid: new Set(locations.map((l) => l.slug)), label: 'location' },
    relatedGuides: { valid: new Set(guides.map((g) => g.slug)), label: 'guide' },
    faqIds: { valid: new Set(faqs.map((f) => f.id)), label: 'FAQ' },
  } as const

  for (const [field, { valid, label }] of Object.entries(sets)) {
    const refs = draft[field as keyof ContentDraft] as string[] | undefined
    if (!Array.isArray(refs)) continue
    for (const ref of refs) {
      if (!valid.has(ref)) {
        issues.push({
          validator: 'fact',
          severity: 'error',
          code: 'UNKNOWN_REFERENCE',
          at: field,
          message: `References the ${label} "${ref}", which does not exist. Either it was invented, or the content it referred to was renamed.`,
        })
      }
    }
  }

  // A service or location named in prose but absent from the canonical content
  // is the other half of the same failure: the page describes something the
  // business does not offer.
  const body = [
    draft.directAnswer,
    ...draft.keyFacts,
    ...draft.sections.flatMap((section) => [
      ...(section.paragraphs ?? []),
      ...(section.list ?? []).flatMap((point) => [point.title, point.body]),
    ]),
  ].join(' ')

  const INVENTED_SERVICE_PATTERNS: Array<{ pattern: RegExp; what: string }> = [
    { pattern: /\bborewell\b/i, what: 'borewell treatment' },
    { pattern: /\bswimming pool\b/i, what: 'pool water treatment' },
    { pattern: /\bwater delivery\b/i, what: 'water delivery' },
    { pattern: /\btank cleaning\b/i, what: 'water tank cleaning' },
    { pattern: /\bbottled water\b/i, what: 'bottled water supply' },
    { pattern: /\bplumbing repairs?\b/i, what: 'general plumbing' },
    { pattern: /\bfinanc(?:e|ing)\b|\binstal?ments?\b/i, what: 'finance or instalment plans' },
    { pattern: /\bwarrant(?:y|ies)\s+of\s+\d/i, what: 'a specific warranty term' },
    { pattern: /\bfree\s+(?:installation|delivery|cartridges?)\b/i, what: 'a free-installation or free-parts offer' },
  ]

  for (const { pattern, what } of INVENTED_SERVICE_PATTERNS) {
    const match = body.match(pattern)
    if (!match) continue
    issues.push({
      validator: 'fact',
      severity: 'error',
      code: 'UNSUPPORTED_OFFERING',
      message: `Mentions ${what} (${JSON.stringify(match[0])}), which is not in content/services.json and is not an offering the site documents. Add it to the canonical content if it is real, or remove it.`,
    })
  }

  return issues
}

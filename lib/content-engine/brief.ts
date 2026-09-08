import { classifyIntent, extractEntities, inferPageKind } from './intent'
import { retrieveKnowledge, analyseCoverage } from './retrieval'
import type { ContentBrief, PageKind, RetrievedKnowledge, Intent } from './types'

/**
 * Brief construction.
 *
 * The brief is the contract. Everything the generator is permitted to assert is
 * in it, and the validators check the draft against it rather than against a
 * vague notion of quality. That is what makes the pipeline auditable: given a
 * published page, you can retrieve the brief it was written from and see
 * exactly which facts it was licensed to use.
 */

/** Section skeletons per page kind, in the order a reader's questions arrive. */
const SECTION_TEMPLATES: Record<PageKind, string[]> = {
  guide: [
    'Direct answer',
    'Key facts',
    'What is actually going on',
    'How to tell which situation you are in',
    'What the options are, and what each trades',
    'What to do about it',
    'UAE-specific considerations',
    'Related questions',
  ],
  service: [
    'Direct answer',
    'Key facts',
    'What the service involves',
    'Who needs it',
    'How it works, step by step',
    'Benefits',
    'Maintenance it will need',
    'Common problems and their causes',
    'What to consider when choosing',
    'UAE-specific considerations',
    'What drives the cost',
    'FAQs',
  ],
  product: [
    'Direct answer',
    'Key facts',
    'Features',
    'Who it suits',
    'How it is fitted',
    'Maintenance',
    'Things to consider before buying',
    'FAQs',
  ],
  location: [
    'Direct answer',
    'Key facts',
    'Areas covered',
    'Property types in this emirate',
    'Water supply locally',
    'What we are called out for here',
    'Local considerations',
    'Services most requested here',
    'FAQs',
  ],
  faq: ['Question', 'Answer', 'Related pages'],
}

const SCHEMA_BY_KIND: Record<PageKind, string> = {
  guide: 'TechArticle',
  service: 'Service',
  product: 'Product',
  location: 'Service',
  faq: 'FAQPage',
}

/**
 * Questions a page of this kind and intent must answer. This is the GEO
 * checklist expressed as an instruction rather than as a post-hoc score — it is
 * far more effective to tell a writer "answer how much" than to mark them down
 * for not having.
 */
function questionsFor(topic: string, kind: PageKind, intent: Intent): string[] {
  const base = [
    `What is ${topic}?`,
    `Who needs ${topic}, and who does not?`,
    `How does it work?`,
    `Why does it matter in the UAE specifically?`,
  ]

  const byIntent: Partial<Record<Intent, string[]>> = {
    troubleshooting: [
      'What is the most likely cause?',
      'What should the reader check first, cheapest cause first?',
      'What can they safely do themselves, and what should they not?',
      'When should they stop and call someone?',
    ],
    'commercial-investigation': [
      'What are the options, and what does each one trade away?',
      'Which option suits which situation?',
      'What determines the cost, given that no price is published?',
      'What should make the reader sceptical of a recommendation?',
    ],
    transactional: [
      'What exactly is included?',
      'How long does it take?',
      'What happens on the visit?',
      'How does the reader book it, and what does it cost them to ask?',
    ],
    informational: [
      'What is the short, correct answer?',
      'What do people commonly get wrong about this?',
      'What does the reader need to measure or check to know for sure?',
    ],
    local: [
      'Is this service available in that area, and how quickly?',
      'What is different about water or property there?',
      'Who supplies the water locally?',
    ],
  }

  const byKind: Partial<Record<PageKind, string[]>> = {
    service: ['What maintenance does it bring?', 'What goes wrong, and why?'],
    product: ['What are its limits?', 'What does it not do?'],
    location: ['Which areas are covered?'],
  }

  return [...new Set([...base, ...(byIntent[intent] ?? []), ...(byKind[kind] ?? [])])]
}

/** Internal links, with the reason each belongs. A link with no stated reason
 *  is the kind that gets added because "three related links" was the target. */
function linksFrom(knowledge: RetrievedKnowledge): ContentBrief['internalLinks'] {
  return [
    ...knowledge.services.map((s) => ({
      url: `/services/${s.slug}`,
      anchor: s.title,
      why: 'The service that addresses what this page describes.',
    })),
    ...knowledge.products.map((p) => ({
      url: `/products/${p.slug}`,
      anchor: p.name,
      why: 'Equipment relevant to the recommendation.',
    })),
    ...knowledge.locations.map((l) => ({
      url: `/locations/${l.slug}`,
      anchor: `Water filter services in ${l.name}`,
      why: 'The emirate this page is about or most relevant to.',
    })),
    ...knowledge.guides.map((g) => ({
      url: `/guides/${g.slug}`,
      anchor: g.title,
      why: 'Adjacent question a reader of this page usually asks next.',
    })),
  ].slice(0, 12)
}

/** Facts the draft must include. Drawn only from retrieved knowledge, so a
 *  required fact is by construction one the site can already stand behind. */
function factsFrom(knowledge: RetrievedKnowledge): string[] {
  const technical = knowledge.allowedClaims
    .filter((claim) => claim.id.startsWith('ro_') || claim.id.startsWith('uv_') || claim.id.startsWith('uae_') || claim.id.startsWith('storage_'))
    .map((claim) => claim.claim)

  const operational = knowledge.allowedClaims
    .filter((claim) => ['coverage_seven_emirates', 'free_water_test', 'fixed_written_quote'].includes(claim.id))
    .map((claim) => claim.claim)

  return [...technical, ...operational]
}

export async function buildBrief({
  queryId,
  query,
  targetLocation = null,
  targetService = null,
}: {
  queryId: string
  query: string
  targetLocation?: string | null
  targetService?: string | null
}): Promise<ContentBrief> {
  const { primary: primaryIntent, secondary: secondaryIntents } = classifyIntent(query)
  const entities = extractEntities(query)
  const pageKind = inferPageKind(query, primaryIntent, entities)

  const [knowledge, coverage] = await Promise.all([
    retrieveKnowledge(query, entities),
    analyseCoverage(query, entities),
  ])

  const topic = entities.primary

  return {
    queryId,
    topic: query,
    pageKind,
    primaryIntent,
    secondaryIntents,
    primaryEntity: topic,
    relatedEntities: [
      ...entities.technologies,
      ...entities.problems,
      ...entities.services,
      ...entities.products,
    ].filter((entity) => entity !== topic),
    targetLocation: targetLocation ?? entities.locations[0] ?? null,
    targetService: targetService ?? entities.services[0] ?? null,
    questionsToAnswer: questionsFor(topic, pageKind, primaryIntent),
    factsRequired: factsFrom(knowledge),
    claimsAllowed: knowledge.allowedClaims.map((claim) => claim.id),
    claimsForbidden: knowledge.forbiddenClaims.map((claim) => ({
      id: claim.id,
      reason: claim.reason,
    })),
    internalLinks: linksFrom(knowledge),
    schemaType: SCHEMA_BY_KIND[pageKind],
    // Title and description are seeded, not final: they are what a human edits.
    // Generating them and treating them as done is how sites end up with forty
    // titles of identical shape.
    title: query.charAt(0).toUpperCase() + query.slice(1),
    metaDescription: `${query.charAt(0).toUpperCase() + query.slice(1)} — answered for UAE properties by AquaPure UAE.`,
    recommendedSections: SECTION_TEMPLATES[pageKind],
    coverage,
    createdAt: new Date().toISOString(),
  }
}

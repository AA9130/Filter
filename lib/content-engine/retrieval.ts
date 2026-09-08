import {
  getServices, getProducts, getLocations, getGuides, getFaqs,
} from '@/lib/content'
import { publishableClaims, blockedClaims } from '@/lib/claims'
import { absoluteUrl } from '@/lib/site'
import type { CoverageAnalysis, ExtractedEntities, RetrievedKnowledge } from './types'

/**
 * Knowledge retrieval — the stage that decides what a generator is allowed to
 * know.
 *
 * This is the most important stage in the pipeline, and it is easy to
 * under-build. If a generator is handed the query and nothing else, it answers
 * from its training data, which contains a great deal of plausible water-
 * treatment marketing and nothing at all about AquaPure. It will then invent a
 * customer count, a certification and a price range, because those are what
 * pages like this normally contain.
 *
 * So retrieval hands over three things: the canonical content that already
 * exists, the claims that may be asserted WITH their evidence, and — explicitly
 * — the claims that may not, with the reason. The last of those is what turns
 * "do not make things up" from a hope into an instruction the draft can be
 * checked against.
 */

function scoreOverlap(haystack: string, needles: string[]): number {
  if (needles.length === 0) return 0
  const text = haystack.toLowerCase()
  const hits = needles.filter((needle) => text.includes(needle.toLowerCase())).length
  return hits / needles.length
}

export async function retrieveKnowledge(
  query: string,
  entities: ExtractedEntities,
): Promise<RetrievedKnowledge> {
  const [services, products, locations, guides, faqs] = await Promise.all([
    getServices(), getProducts(), getLocations(), getGuides(), getFaqs(),
  ])

  const terms = [
    entities.primary,
    ...entities.technologies,
    ...entities.problems,
    ...query.toLowerCase().split(/\s+/).filter((word) => word.length > 4),
  ]

  const relevantServices = services
    .filter((s) => entities.services.includes(s.slug) || scoreOverlap(`${s.title} ${s.directAnswer}`, terms) > 0.15)
    .slice(0, 5)

  const relevantProducts = products
    .filter((p) => entities.products.includes(p.slug) || scoreOverlap(`${p.name} ${p.directAnswer}`, terms) > 0.15)
    .slice(0, 5)

  const relevantLocations = locations
    .filter((l) => entities.locations.includes(l.slug))
    .slice(0, 7)

  const relevantGuides = guides
    .filter((g) => scoreOverlap(`${g.title} ${g.primaryQuestion} ${g.directAnswer}`, terms) > 0.12)
    .slice(0, 6)

  const relevantFaqs = faqs
    .filter((f) => scoreOverlap(`${f.q} ${f.a}`, terms) > 0.12)
    .slice(0, 10)

  return {
    services: relevantServices.map((s) => ({
      slug: s.slug, title: s.title, directAnswer: s.directAnswer,
      url: absoluteUrl(`/services/${s.slug}`),
    })),
    products: relevantProducts.map((p) => ({
      slug: p.slug, name: p.name, directAnswer: p.directAnswer,
      url: absoluteUrl(`/products/${p.slug}`),
    })),
    locations: relevantLocations.map((l) => ({
      slug: l.slug, name: l.name, intro: l.intro,
      url: absoluteUrl(`/locations/${l.slug}`),
    })),
    guides: relevantGuides.map((g) => ({
      slug: g.slug, title: g.title, directAnswer: g.directAnswer,
      url: absoluteUrl(`/guides/${g.slug}`),
    })),
    faqs: relevantFaqs.map((f) => ({ id: f.id, q: f.q, a: f.a })),

    allowedClaims: publishableClaims().map((c) => ({
      id: c.id, claim: c.claim, status: c.status, source: c.source,
    })),

    // Handed over on purpose. A generator told only what it may say will fill
    // the gaps; a generator told what it must not say, and why, has something
    // to refuse with.
    forbiddenClaims: blockedClaims().map((c) => ({
      id: c.id,
      claim: c.claim,
      status: c.status,
      reason:
        c.status === 'prohibited'
          ? 'Never publishable — this is a prohibited category, not an unverified fact.'
          : `Status is "${c.status}". No evidence is on file, so this must not appear in any form, including paraphrased or as an approximation.`,
    })),
  }
}

/**
 * Coverage analysis: does this already exist?
 *
 * The most valuable output of a content pipeline is often "do not write this".
 * A new page that overlaps an existing one splits its own signals and competes
 * with it, so a topic already answered returns `skip`, and one partly answered
 * returns `extend` with the page to extend. Only a genuine gap returns
 * `create`.
 */
export async function analyseCoverage(
  query: string,
  entities: ExtractedEntities,
): Promise<CoverageAnalysis> {
  const [services, products, locations, guides, faqs] = await Promise.all([
    getServices(), getProducts(), getLocations(), getGuides(), getFaqs(),
  ])

  type Candidate = { url: string; title: string; text: string }
  const candidates: Candidate[] = [
    ...guides.map((g) => ({
      url: `/guides/${g.slug}`, title: g.title,
      text: `${g.title} ${g.primaryQuestion} ${g.directAnswer} ${g.keyFacts.join(' ')}`,
    })),
    ...services.map((s) => ({
      url: `/services/${s.slug}`, title: s.title,
      text: `${s.title} ${s.serviceType} ${s.directAnswer} ${s.keyFacts.join(' ')}`,
    })),
    ...products.map((p) => ({
      url: `/products/${p.slug}`, title: p.name,
      text: `${p.name} ${p.category} ${p.directAnswer}`,
    })),
    ...locations.map((l) => ({
      url: `/locations/${l.slug}`, title: l.name,
      text: `${l.name} ${l.intro} ${l.areas.join(' ')}`,
    })),
    ...faqs.map((f) => ({ url: `/faqs#${f.id}`, title: f.q, text: `${f.q} ${f.a}` })),
  ]

  /**
   * Terms are weighted by how rare they are across the site, not counted
   * equally.
   *
   * Counting equally does not work here and the failure is instructive: for
   * "RO vs UV water purifier" the only long words are "water" and "purifier",
   * both of which appear on every page of a water-filtration site — so five
   * unrelated guides scored 100% and the analysis was worthless. Inverse
   * document frequency fixes it by making "purifier" nearly free and
   * "limescale", "tankless" or "membrane" decisive, which is the right
   * behaviour: a topic is identified by its uncommon words.
   */
  /**
   * Two-character tokens are kept on purpose. In this domain the most
   * discriminating terms in the language are acronyms — RO, UV, TDS, AMC — and
   * a `length > 3` filter drops every one of them, which is why "RO vs UV
   * water purifier" was reduced to {water, purifier} and matched everything.
   *
   * Nothing is lost by keeping them: IDF already discounts common words far
   * more accurately than a length cutoff can, because "the" and "and" appear in
   * every document and score near zero on their own.
   */
  const tokens = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((word) => word.length > 1)

  const documents = candidates.map((candidate) => new Set(tokens(candidate.text)))

  const idf = (term: string): number => {
    const df = documents.filter((doc) => doc.has(term)).length
    // +1 on both sides so a term in every document scores near zero rather
    // than exactly zero, and an unseen term does not divide by zero.
    return Math.log((documents.length + 1) / (df + 1))
  }

  /**
   * The query's own words, plus the technology and problem names it implies.
   *
   * Deliberately NOT expanded with the slugs of matched services and products.
   * That expansion looks helpful and is circular: it injects the exact
   * vocabulary of the pages being compared against, so whichever page the
   * entity extractor matched scores as a perfect topical fit. It made
   * "RO vs UV water purifier" resolve to /services/uv-water-purification
   * rather than to the guide that actually answers it.
   */
  const queryTerms = [
    ...tokens(query),
    ...tokens([...entities.technologies, ...entities.problems].join(' ')),
  ]

  const weights = new Map<string, number>()
  for (const term of queryTerms) {
    if (!weights.has(term)) weights.set(term, idf(term))
  }
  const totalWeight = [...weights.values()].reduce((a, b) => a + b, 0)

  /**
   * The title is scored against the words the user actually typed, while the
   * body is scored against those plus the concepts they imply.
   *
   * The asymmetry is the point. A page's title should contain the query's own
   * language — that is what makes it recognisably the page for that query. Its
   * body should cover the underlying concept, whether or not it uses the same
   * words. Scoring the title against the expanded concept set penalises every
   * title for not restating its own synonyms.
   */
  const titleWeights = new Map<string, number>()
  for (const term of tokens(query)) {
    if (!titleWeights.has(term)) titleWeights.set(term, idf(term))
  }
  const titleTotal = [...titleWeights.values()].reduce((a, b) => a + b, 0)

  /**
   * Overlap is symmetric — the F1 of two coverages, not one.
   *
   * One-directional coverage ("do the query's terms appear on the page?") is
   * not enough, and the failure is again instructive: for "shower filter UAE",
   * the words *shower*, *filter* and *UAE* each appear somewhere in the
   * softener guide, so it scored 100% for a topic it does not cover at all.
   *
   * The missing half is the other direction: is the PAGE about the query? A
   * page whose own title is largely unexplained by the query is a page about
   * something else that happens to contain the words. Requiring both makes
   * "already covered" mean what it says.
   */
  const scored = candidates
    .map((candidate, i) => {
      const doc = documents[i]

      let matched = 0
      for (const [term, weight] of weights) {
        if (doc.has(term)) matched += weight
      }
      const queryCoverage = totalWeight === 0 ? 0 : matched / totalWeight

      /**
       * How much of the query's distinctiveness the TITLE itself carries.
       *
       * Measured as query-terms-in-title over all query terms, not as
       * title-terms-explained-by-query. The latter is the obvious formulation
       * and it is wrong: a title like "Tank vs tankless RO: which suits your
       * kitchen?" carries the topic perfectly and is then penalised for the
       * words "which", "suits" and "kitchen" — so a well-written title scores
       * worse than a bland one.
       */
      const titleTerms = new Set(tokens(candidate.title))
      let titleSignal = 0
      for (const [term, weight] of titleWeights) {
        if (titleTerms.has(term)) titleSignal += weight
      }
      const titleCoverage = titleTotal === 0 ? 0 : titleSignal / titleTotal

      const overlap =
        queryCoverage + titleCoverage === 0
          ? 0
          : (2 * queryCoverage * titleCoverage) / (queryCoverage + titleCoverage)

      return { url: candidate.url, title: candidate.title, overlap: Number(overlap.toFixed(3)) }
    })
    .filter((c) => c.overlap > 0.2)
    .sort((a, b) => b.overlap - a.overlap)

  const best = scored[0]
  const exactMatch = best && best.overlap >= 0.7 ? best.url : null
  const partial = scored.slice(0, 5)

  const recommendation: CoverageAnalysis['recommendation'] = exactMatch
    ? 'skip'
    : best && best.overlap >= 0.45
      ? 'extend'
      : 'create'

  const gap = exactMatch
    ? `Already answered at ${exactMatch}. Writing a second page would split its signals and compete with it.`
    : recommendation === 'extend'
      ? `Partly covered by ${best.url} (${Math.round(best.overlap * 100)}% weighted term overlap). A new page needs to answer something that page does not, or the work belongs in that page.`
      : `No existing page covers "${query}" for ${entities.primary}. A new page would be the first to answer it.`

  return { exactMatch, partial, gap, recommendation }
}

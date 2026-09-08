import type { ContentBrief, ContentDraft } from './types'

/**
 * Draft generation, behind an adapter.
 *
 * Deliberately provider-agnostic and deliberately not wired to an API key in
 * this repository. Two reasons.
 *
 * A key committed to a repository is a key that leaks, and this pipeline's
 * whole value is that its output is checked before publication — a checked
 * pipeline you can run is worth more than an unchecked one that runs itself.
 *
 * More importantly: the interesting engineering here is the brief and the
 * validators, not the call to the model. Anything that satisfies `Generator`
 * plugs in — a hosted model, a local one, or a person with a text editor. The
 * `templateGenerator` below is the last of those made mechanical, and it is
 * what lets the whole pipeline be exercised in CI with no network.
 *
 * To add a real model provider, implement `Generator` in a new file, read the
 * key from `process.env`, and pass it to `runPipeline`. Do not add it here.
 */

export type Generator = {
  name: string
  model: string | null
  generate(brief: ContentBrief): Promise<ContentDraft>
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .slice(0, 8)
    .join('-')
}

/**
 * The scaffold generator.
 *
 * It produces a structurally complete draft with the brief's sections, its
 * required facts, and its internal links — and with each section's body left as
 * an explicit instruction to the writer rather than as invented prose.
 *
 * This is a deliberate choice over generating plausible filler locally. A
 * scaffold that says "answer this here" fails the quality validator's
 * thin-content check and cannot be mistaken for finished work. Plausible filler
 * passes review by looking finished, which is the failure this pipeline exists
 * to prevent.
 */
export const templateGenerator: Generator = {
  name: 'template-scaffold',
  model: null,

  async generate(brief: ContentBrief): Promise<ContentDraft> {
    const sections = brief.recommendedSections
      .filter((heading) => !['Direct answer', 'Key facts', 'FAQs', 'Related questions', 'Question', 'Answer', 'Related pages'].includes(heading))
      .map((heading) => ({
        heading,
        paragraphs: [
          `TODO(writer): ${heading} — for "${brief.topic}". This scaffold is intentionally unwritten so it cannot be mistaken for finished copy.`,
        ],
      }))

    return {
      briefQueryId: brief.queryId,
      slug: slugify(brief.topic),
      title: brief.title,
      h1: brief.title,
      metaTitle: brief.title,
      metaDescription: brief.metaDescription,
      directAnswer: `TODO(writer): the extractable answer to "${brief.topic}", in 2–4 sentences, stating the answer first. Facts available: ${brief.factsRequired.slice(0, 2).join(' | ')}`,
      keyFacts: brief.factsRequired.slice(0, 4),
      sections,
      faqIds: [],
      relatedServices: brief.internalLinks
        .filter((link) => link.url.startsWith('/services/'))
        .map((link) => link.url.replace('/services/', '')),
      relatedProducts: brief.internalLinks
        .filter((link) => link.url.startsWith('/products/'))
        .map((link) => link.url.replace('/products/', '')),
      relatedLocations: brief.internalLinks
        .filter((link) => link.url.startsWith('/locations/'))
        .map((link) => link.url.replace('/locations/', '')),
      relatedGuides: brief.internalLinks
        .filter((link) => link.url.startsWith('/guides/'))
        .map((link) => link.url.replace('/guides/', '')),
      provenance: {
        generator: templateGenerator.name,
        model: null,
        createdAt: new Date().toISOString(),
      },
    }
  },
}

/**
 * The prompt a model-backed generator should send.
 *
 * Exported separately from any provider so it can be reviewed, diffed and
 * tested on its own. The forbidden-claims block is the load-bearing part: a
 * model told only what it may say will fill the gaps, and a model told what it
 * must not say — with the reason — has something to refuse with.
 */
export function buildPrompt(brief: ContentBrief): string {
  return [
    `You are writing for AquaPure UAE, a water filtration company serving all seven Emirates.`,
    ``,
    `TOPIC: ${brief.topic}`,
    `PAGE TYPE: ${brief.pageKind}`,
    `PRIMARY INTENT: ${brief.primaryIntent}`,
    `PRIMARY ENTITY: ${brief.primaryEntity}`,
    brief.targetLocation ? `TARGET EMIRATE: ${brief.targetLocation}` : '',
    ``,
    `QUESTIONS THIS PAGE MUST ANSWER:`,
    ...brief.questionsToAnswer.map((question) => `  - ${question}`),
    ``,
    `SECTIONS, IN THIS ORDER:`,
    ...brief.recommendedSections.map((section) => `  - ${section}`),
    ``,
    `FACTS YOU MAY STATE (these are the only company facts on file):`,
    ...brief.factsRequired.map((fact) => `  - ${fact}`),
    ``,
    `YOU MUST NOT STATE ANY OF THE FOLLOWING, IN ANY FORM — not paraphrased,`,
    `not approximated, not hedged, not "up to", not as a range:`,
    ...brief.claimsForbidden.map((claim) => `  - [${claim.id}] ${claim.reason}`),
    ``,
    `HARD RULES:`,
    `  - No prices, price ranges or "starting from" figures. Quotations are given on site.`,
    `  - No customer counts, ratings, review counts, or years in business.`,
    `  - No certifications, licences, insurance or regulatory approvals.`,
    `  - No TDS or hardness figure for any emirate. Values are measured at the property.`,
    `  - No superlatives about AquaPure (best, leading, number one, top-rated).`,
    `  - No health or medical outcomes attributed to water treatment.`,
    `  - If you do not have a fact, say what determines it instead of estimating it.`,
    `  - Open with the answer. Do not open with context, importance, or "in today's world".`,
    ``,
    `INTERNAL LINKS TO WORK IN NATURALLY:`,
    ...brief.internalLinks.map((link) => `  - ${link.url} ("${link.anchor}") — ${link.why}`),
    ``,
    `Return JSON matching the ContentDraft type: slug, title, h1, metaTitle,`,
    `metaDescription, directAnswer, keyFacts[], sections[{heading, paragraphs[], list[{title, body}]}],`,
    `faqIds[], relatedServices[], relatedProducts[], relatedLocations[], relatedGuides[].`,
  ]
    .filter(Boolean)
    .join('\n')
}

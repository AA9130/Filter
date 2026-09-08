import type { ContentDraft, ValidationIssue } from '../types'

/**
 * Quality validation: the tells of generated filler.
 *
 * These checks exist because the failure mode of an LLM content pipeline is not
 * incorrect text. It is text that is correct, fluent, and says nothing — the
 * paragraph that opens "In today's fast-paced world, water quality has become
 * increasingly important for homeowners across the UAE." A human reviewer
 * notices that on page one and stops noticing it by page twelve, which is
 * exactly when a batch of forty is being reviewed.
 *
 * So the machine checks the things that do not tire: filler openings, repeated
 * paragraphs, keyword density, and sentences that carry no information.
 */

/** Openings and phrases that reliably indicate padding rather than content. */
const FILLER_PHRASES = [
  /\bin today'?s (?:fast[- ]paced |modern |digital )?world\b/i,
  /\bin this (?:comprehensive |ultimate )?(?:article|guide|blog post),? we(?:'ll| will)\b/i,
  /\bwhen it comes to\b/i,
  /\bit(?:'s| is) (?:important|essential|crucial|vital) to (?:note|understand|remember)\b/i,
  /\bplays? a (?:vital|crucial|key|significant) role\b/i,
  /\bat the end of the day\b/i,
  /\bthe bottom line is\b/i,
  /\blook no further\b/i,
  /\byour (?:one[- ]stop|go[- ]to) (?:shop|solution|destination)\b/i,
  /\bwe pride ourselves\b/i,
  /\bstate[- ]of[- ]the[- ]art\b/i,
  /\bcutting[- ]edge\b/i,
  /\bwe understand that\b/i,
  /\bdon'?t hesitate to (?:contact|reach out)\b/i,
  /\bfeel free to\b/i,
  /\brest assured\b/i,
  /\bunlock the (?:power|potential|secret)\b/i,
  /\bin conclusion\b/i,
  /\bmoreover,\s/i,
  /\bfurthermore,\s/i,
  /\bdelve into\b/i,
  /\bnavigate the (?:complex |challenging )?(?:world|landscape) of\b/i,
  /\bever[- ]evolving\b/i,
  /\bpeace of mind\b/i,
]

/** Words whose repetition is the signature of keyword stuffing on this site. */
const STUFFING_CANDIDATES = [
  'water filter', 'water purifier', 'ro system', 'reverse osmosis',
  'dubai', 'uae', 'water filtration', 'aquapure', 'water softener',
]

const MIN_WORDS = 350
const MAX_KEYWORD_DENSITY = 0.022

function words(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean)
}

export function validateQuality(draft: ContentDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const error = (code: string, message: string, at?: string) =>
    issues.push({ validator: 'quality', severity: 'error', code, message, at })
  const warn = (code: string, message: string, at?: string) =>
    issues.push({ validator: 'quality', severity: 'warning', code, message, at })

  const paragraphs = [
    draft.directAnswer,
    ...draft.keyFacts,
    ...draft.sections.flatMap((section) => [
      ...(section.paragraphs ?? []),
      ...(section.list ?? []).map((point) => point.body),
    ]),
  ]
  const body = paragraphs.join('\n')
  const wordList = words(body)

  if (wordList.length < MIN_WORDS) {
    warn('THIN_CONTENT', `The draft is ${wordList.length} words. Under ${MIN_WORDS} rarely answers a question properly — though a genuinely short answer beats a padded one, so confirm rather than pad.`)
  }

  // Placeholder markers. A scaffold or a half-finished draft must not be able
  // to pass validation, because a draft that validates is indistinguishable
  // from finished work at review time — which is exactly how filler ships.
  const PLACEHOLDER = /\bTODO\b|\bTBD\b|\bFIXME\b|\[insert\b|\bLorem ipsum\b|\bXXX\b|\{\{.*?\}\}/i
  const placeholder = body.match(PLACEHOLDER) ?? draft.h1.match(PLACEHOLDER) ?? draft.metaTitle.match(PLACEHOLDER)
  if (placeholder) {
    error('PLACEHOLDER_TEXT', `Contains unfinished placeholder text: ${JSON.stringify(placeholder[0])}. The draft is not written yet.`)
  }

  for (const pattern of FILLER_PHRASES) {
    const match = body.match(pattern)
    if (!match) continue
    error('FILLER_PHRASE', `Contains generated filler: ${JSON.stringify(match[0])}. Rewrite the sentence to say something specific, or delete it.`)
  }

  // Repeated paragraphs. The signature of a batch generator looping, and the
  // reason the previous README in this repository was fourteen megabytes.
  const seen = new Map<string, number>()
  for (const paragraph of paragraphs) {
    const normalised = paragraph.trim().toLowerCase().replace(/\s+/g, ' ')
    if (normalised.length < 40) continue
    seen.set(normalised, (seen.get(normalised) ?? 0) + 1)
  }
  for (const [paragraph, count] of seen) {
    if (count > 1) {
      error('DUPLICATE_PARAGRAPH', `A paragraph appears ${count} times: "${paragraph.slice(0, 80)}…"`)
    }
  }

  // Near-duplicate paragraph openings — the same failure, one word later.
  const openings = new Map<string, number>()
  for (const paragraph of paragraphs) {
    const opening = words(paragraph).slice(0, 6).join(' ')
    if (opening.length < 20) continue
    openings.set(opening, (openings.get(opening) ?? 0) + 1)
  }
  for (const [opening, count] of openings) {
    if (count > 1) {
      warn('REPEATED_OPENING', `${count} paragraphs begin "${opening}…". Vary the structure or merge them.`)
    }
  }

  // Keyword density. Not because density is a ranking factor — it has not been
  // for a very long time — but because a page that says "water filter Dubai"
  // twenty times reads as written for a machine, and both readers and
  // spam classifiers notice.
  if (wordList.length >= 100) {
    const text = wordList.join(' ')
    for (const phrase of STUFFING_CANDIDATES) {
      const occurrences = text.split(phrase).length - 1
      if (occurrences < 4) continue
      const density = (occurrences * phrase.split(' ').length) / wordList.length
      if (density > MAX_KEYWORD_DENSITY) {
        error('KEYWORD_STUFFING', `"${phrase}" appears ${occurrences} times in ${wordList.length} words (${(density * 100).toFixed(1)}%). Use pronouns and synonyms; the phrase does not need repeating to be understood.`)
      }
    }
  }

  // A section whose body says nothing beyond restating its own heading.
  draft.sections.forEach((section, i) => {
    const sectionBody = [...(section.paragraphs ?? []), ...(section.list ?? []).map((p) => p.body)].join(' ')
    if (!sectionBody.trim()) return
    const headingWords = new Set(words(section.heading))
    const bodyWords = words(sectionBody)
    if (bodyWords.length < 25) {
      warn('SECTION_THIN', `sections[${i}] ("${section.heading}") has ${bodyWords.length} words.`, `sections[${i}]`)
      return
    }
    const novel = bodyWords.filter((word) => !headingWords.has(word) && word.length > 3)
    if (new Set(novel).size / bodyWords.length < 0.25) {
      warn('SECTION_RESTATES_HEADING', `sections[${i}] ("${section.heading}") largely restates its own heading.`, `sections[${i}]`)
    }
  })

  return issues
}

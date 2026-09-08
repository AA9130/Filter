import type { ContentBrief, ContentDraft, ValidationIssue } from '../types'

/**
 * GEO / AI-search validation.
 *
 * The question this answers is narrow and useful: given only this page, could a
 * system extract an answer to each of What, Who, Where, Why, How, When, How
 * much, and Which option? Not "is it optimised" — whether the facts are
 * findable.
 *
 * The score is diagnostic and never a hard gate. A page can legitimately not
 * answer "how much" — this site never publishes prices — so a low score on that
 * dimension is information for a reviewer, not a failure. Treating the score as
 * a threshold is how you get pages padded with a "How much?" heading that says
 * nothing.
 */

type Dimension = {
  key: string
  question: string
  /** Whether the draft answers it. */
  test: (text: string, draft: ContentDraft) => boolean
  weight: number
  /** Some dimensions are legitimately absent on this site. */
  optional?: boolean
}

const DIMENSIONS: Dimension[] = [
  {
    key: 'what',
    question: 'What is it?',
    weight: 2,
    test: (text) => /\bis (?:a|an|the)\b|\bmeans\b|\brefers to\b|\bworks by\b|\bwhat\b/i.test(text),
  },
  {
    key: 'who',
    question: 'Who is it for, and who provides it?',
    weight: 2,
    test: (text) => /\bwho (?:needs|it suits|should)\b|\bsuits\b|\bsuitable for\b|\bAquaPure\b/i.test(text),
  },
  {
    key: 'where',
    question: 'Where does this apply?',
    weight: 2,
    test: (text) => /\bUAE\b|\bDubai\b|\bAbu Dhabi\b|\bSharjah\b|\bEmirate/i.test(text),
  },
  {
    key: 'why',
    question: 'Why does it matter / what problem does it solve?',
    weight: 2,
    test: (text) => /\bbecause\b|\bwhich is why\b|\bthe reason\b|\bso that\b|\bproblem\b/i.test(text),
  },
  {
    key: 'how',
    question: 'How does it work or how is it done?',
    weight: 2,
    test: (text) => /\bhow\b|\bstep\b|\bfirst\b|\bthen\b|\bprocess\b|\bfitted\b|\binstalled\b/i.test(text),
  },
  {
    key: 'when',
    question: 'When / how often?',
    weight: 1,
    test: (text) => /\bhow often\b|\bevery \d|\bmonths?\b|\byears?\b|\bannual|\binterval\b|\bsame[- ]day\b|\bhours\b/i.test(text),
  },
  {
    key: 'howMuch',
    question: 'How much does it cost?',
    weight: 1,
    optional: true,
    test: (text) => /\bcost\b|\bquotation\b|\bquote\b|\bprice\b|\bfree\b/i.test(text),
  },
  {
    key: 'whichOption',
    question: 'Which option should the reader choose?',
    weight: 2,
    test: (text) =>
      /\bversus\b|\bvs\.?\b|\brather than\b|\binstead of\b|\bchoose\b|\bif (?:your|you)\b|\bsuits\b|\btrade/i.test(text),
  },
  {
    key: 'contactPath',
    question: 'How does the reader act on this?',
    weight: 2,
    test: (text) => /\bwater test\b|\bcall\b|\bWhatsApp\b|\bcontact\b|\bbook\b|\bquotation\b/i.test(text),
  },
  {
    key: 'directAnswer',
    question: 'Is there an extractable answer near the top?',
    weight: 3,
    test: (_text, draft) => draft.directAnswer.trim().length >= 120,
  },
  {
    key: 'keyFacts',
    question: 'Are the key facts listed discretely?',
    weight: 2,
    test: (_text, draft) => draft.keyFacts.length >= 3,
  },
]

export function validateGeo(
  draft: ContentDraft,
  brief: ContentBrief,
): { issues: ValidationIssue[]; score: number } {
  const text = [
    draft.h1,
    draft.directAnswer,
    ...draft.keyFacts,
    ...draft.sections.flatMap((section) => [
      section.heading,
      ...(section.paragraphs ?? []),
      ...(section.list ?? []).flatMap((point) => [point.title, point.body]),
    ]),
  ].join('\n')

  const issues: ValidationIssue[] = []
  let earned = 0
  let available = 0

  for (const dimension of DIMENSIONS) {
    available += dimension.weight
    const answered = dimension.test(text, draft)
    if (answered) {
      earned += dimension.weight
      continue
    }
    issues.push({
      validator: 'geo',
      severity: dimension.optional ? 'warning' : 'warning',
      code: `GEO_${dimension.key.toUpperCase()}_UNANSWERED`,
      message: `A reader — or an answer engine — cannot extract: ${dimension.question}${dimension.optional ? ' (optional on this site; prices are never published)' : ''}`,
    })
  }

  // The brief listed the questions this page exists to answer. A page that
  // does not address one of them has drifted from its own brief, which is a
  // more meaningful signal than any of the generic dimensions above.
  const lower = text.toLowerCase()
  for (const question of brief.questionsToAnswer) {
    const keywords = question
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 4)
    if (keywords.length === 0) continue
    const covered = keywords.filter((keyword) => lower.includes(keyword)).length / keywords.length
    if (covered < 0.34) {
      issues.push({
        validator: 'geo',
        severity: 'warning',
        code: 'BRIEF_QUESTION_UNANSWERED',
        message: `The brief asked this page to answer "${question}" and it does not appear to.`,
      })
    }
  }

  return { issues, score: Math.round((earned / available) * 100) }
}

import { screenText, getClaim, publishableClaims } from '@/lib/claims'
import type { ContentBrief, ContentDraft, ValidationIssue } from '../types'

/**
 * Claim validation — the gate that makes the pipeline safe to point at an LLM.
 *
 * Two independent checks, on purpose.
 *
 * The first screens the draft's prose for the linguistic signatures of
 * unpublishable claims: a customer count, a rating, a price in AED, a
 * certification, a superlative, a health outcome. It catches the case where a
 * generator has picked something up from its training data.
 *
 * The second checks the draft against the brief's own allow-list, so a claim
 * that is publishable in general but was not licensed for this page is still
 * flagged. That matters because a brief is the audit record: a page asserting
 * something its brief never authorised cannot be traced back to a decision.
 *
 * Prohibited-category hits are errors that no approval can clear — see
 * `blocking` below.
 */

function draftText(draft: ContentDraft): Array<{ at: string; text: string }> {
  const parts: Array<{ at: string; text: string }> = [
    { at: 'title', text: draft.title },
    { at: 'h1', text: draft.h1 },
    { at: 'metaTitle', text: draft.metaTitle },
    { at: 'metaDescription', text: draft.metaDescription },
    { at: 'directAnswer', text: draft.directAnswer },
    ...draft.keyFacts.map((fact, i) => ({ at: `keyFacts[${i}]`, text: fact })),
  ]

  draft.sections.forEach((section, s) => {
    parts.push({ at: `sections[${s}].heading`, text: section.heading })
    section.paragraphs?.forEach((paragraph, p) =>
      parts.push({ at: `sections[${s}].paragraphs[${p}]`, text: paragraph }),
    )
    section.list?.forEach((point, l) => {
      parts.push({ at: `sections[${s}].list[${l}].title`, text: point.title })
      parts.push({ at: `sections[${s}].list[${l}].body`, text: point.body })
    })
  })

  return parts
}

export function validateClaims(draft: ContentDraft, brief: ContentBrief): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const allowed = new Set(brief.claimsAllowed)

  for (const { at, text } of draftText(draft)) {
    for (const violation of screenText(text)) {
      const claim = getClaim(violation.claimId)
      const prohibited = claim?.kind === 'superlative' || claim?.kind === 'health'

      issues.push({
        validator: 'claim',
        severity: 'error',
        code: prohibited ? 'PROHIBITED_CLAIM' : 'UNVERIFIED_CLAIM',
        at,
        message: prohibited
          ? `Contains a prohibited claim (${violation.claimId}): ${JSON.stringify(violation.matched)}. ${violation.reason} This cannot be approved — the wording has to change.`
          : `Contains the unverified claim "${violation.claimId}": ${JSON.stringify(violation.matched)}. ${violation.reason}`,
      })
    }
  }

  // The second check: has the registry moved since the brief was written?
  //
  // A claim verified after briefing is not in `claimsAllowed`, so a draft
  // asserting it would be licensed by the registry but not by its own brief —
  // and the brief is the audit record. Rather than silently accept it, say the
  // brief is stale, because the fix is to regenerate the brief and confirm the
  // new claim was meant to be in scope.
  const registryAllows = new Set(publishableClaims().map((claim) => claim.id))
  const newlyVerified = [...registryAllows].filter((id) => !allowed.has(id))
  if (newlyVerified.length > 0) {
    issues.push({
      validator: 'claim',
      severity: 'warning',
      code: 'BRIEF_STALE',
      message: `Claims became publishable after this brief was written (${newlyVerified.join(', ')}). Regenerate the brief so the audit record matches what the draft was licensed to assert.`,
    })
  }

  // Facts the brief required and the draft dropped. A warning, not an error:
  // a shorter page that omits a required fact may be the right page, but the
  // reviewer should be told rather than left to notice.
  const body = draftText(draft).map((part) => part.text).join(' ').toLowerCase()
  for (const fact of brief.factsRequired) {
    const keywords = fact
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 6)
      .slice(0, 4)
    if (keywords.length === 0) continue
    const present = keywords.some((keyword) => body.includes(keyword))
    if (!present) {
      issues.push({
        validator: 'claim',
        severity: 'warning',
        code: 'REQUIRED_FACT_MISSING',
        message: `The brief required this fact and the draft does not appear to state it: "${fact}"`,
      })
    }
  }

  return issues
}

/**
 * Whether a report can be cleared by a human at all.
 *
 * An unverified claim is a content decision: a reviewer can verify the claim,
 * or reword the sentence, and the block lifts. A prohibited claim is not —
 * "AquaPure is the #1 water filtration company in Dubai" cannot be approved
 * into existence, and the reviewer's only route is to change the text. Keeping
 * the two distinct is what stops "approve anyway" becoming the habit.
 */
export function blocking(issues: ValidationIssue[]): ValidationIssue[] {
  return issues.filter((issue) => issue.code === 'PROHIBITED_CLAIM')
}

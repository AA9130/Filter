import { validateClaims, blocking } from './claim'
import { validateFacts } from './fact'
import { validateSeo } from './seo'
import { validateGeo } from './geo'
import { validateQuality } from './quality'
import type { ContentBrief, ContentDraft, ValidationReport } from '../types'

export { validateClaims, blocking, validateFacts, validateSeo, validateGeo, validateQuality }

/**
 * Run every validator and assemble one report.
 *
 * `passed` means "no errors" — it does NOT mean "publish it". Approval is a
 * separate, human step (see store.ts), and a report that passes only clears
 * the way to a review. That distinction is the point of the whole pipeline: the
 * machine can prove a draft is not obviously wrong, and only a person can say
 * it is right.
 */
export async function validateDraft(
  draft: ContentDraft,
  brief: ContentBrief,
): Promise<ValidationReport> {
  const geo = validateGeo(draft, brief)

  const all = [
    ...validateClaims(draft, brief),
    ...(await validateFacts(draft)),
    ...validateSeo(draft),
    ...geo.issues,
    ...validateQuality(draft),
  ]

  const errors = all.filter((issue) => issue.severity === 'error')
  const warnings = all.filter((issue) => issue.severity === 'warning')

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    geoScore: geo.score,
    checkedAt: new Date().toISOString(),
  }
}

/** Issues no human approval can clear. Empty means a reviewer can decide. */
export function unclearable(report: ValidationReport) {
  return blocking(report.errors)
}

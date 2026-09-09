import registry from '@/content/claims.json'

/**
 * =============================================================================
 *  CLAIM REGISTRY — the gate every factual assertion passes through.
 * =============================================================================
 *  Nothing in this codebase may state a checkable fact about AquaPure unless a
 *  claim in content/claims.json says it can. That includes page copy, metadata,
 *  JSON-LD, the knowledge export and anything the content engine generates.
 *
 *  Why a registry rather than a convention: the failure mode we are guarding
 *  against is not a developer typing a wrong number once. It is a generated
 *  page confidently repeating "12,000+ customers" across forty URLs and a dozen
 *  schema blocks, at which point the claim is load-bearing and nobody remembers
 *  whether it was ever true. A single gate makes the answer to "can we say this?"
 *  a lookup instead of a judgement call.
 *
 *  The registry is validated at module load, so a contradiction between a
 *  claim's status and its publication flag breaks `next build` — not production.
 * =============================================================================
 */

export type ClaimStatus =
  | 'verified'
  | 'self_asserted'
  | 'unverified'
  | 'expired'
  | 'disputed'
  | 'prohibited'

export type ClaimKind =
  | 'operational'
  | 'identity'
  | 'statistic'
  | 'regulatory'
  | 'technical'
  | 'evidence'
  | 'commercial'
  | 'superlative'
  | 'health'

export type Claim = {
  id: string
  claim: string
  kind: ClaimKind
  status: ClaimStatus
  source: string
  lastVerified: string
  allowedForPublication: boolean
  /** Optional published value, for claims that carry a figure. */
  value?: string
  /** A verified claim goes stale on its own after this many days. */
  reverifyAfterDays?: number
  notes?: string
}

class ClaimError extends Error {
  constructor(detail: string) {
    super(`[claims] ${detail}`)
    this.name = 'ClaimError'
  }
}

/** Statuses whose claims may appear in published output. */
const PUBLISHABLE_STATUSES: ReadonlySet<ClaimStatus> = new Set(['verified', 'self_asserted'])

/** These kinds can never be self-asserted — they need evidence or they stay off. */
const EVIDENCE_REQUIRED_KINDS: ReadonlySet<ClaimKind> = new Set([
  'statistic',
  'regulatory',
  'evidence',
  'commercial',
])

/** These kinds can never be published at all. */
const ALWAYS_BLOCKED_KINDS: ReadonlySet<ClaimKind> = new Set(['superlative', 'health'])

const DAY_MS = 24 * 60 * 60 * 1000

function daysSince(isoDate: string): number | null {
  if (!isoDate) return null
  const then = Date.parse(isoDate)
  if (Number.isNaN(then)) return null
  return Math.floor((Date.now() - then) / DAY_MS)
}

/**
 * A verified claim that has outrun its re-verification window becomes `expired`
 * without anyone touching the file. Freshness that depends on a human
 * remembering is not freshness.
 */
function effectiveStatus(claim: Claim): ClaimStatus {
  if (claim.status !== 'verified' || !claim.reverifyAfterDays) return claim.status
  const age = daysSince(claim.lastVerified)
  if (age === null) return 'expired'
  return age > claim.reverifyAfterDays ? 'expired' : 'verified'
}

function validate(claims: Claim[]): void {
  if (!Array.isArray(claims) || claims.length === 0) {
    throw new ClaimError('content/claims.json has no claims')
  }

  const seen = new Set<string>()

  for (const claim of claims) {
    const where = `claim "${claim.id}"`

    if (!claim.id || !/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(claim.id)) {
      throw new ClaimError(`${where}: id must be lower_snake_case`)
    }
    if (seen.has(claim.id)) throw new ClaimError(`${where}: duplicate id`)
    seen.add(claim.id)

    if (!claim.claim?.trim()) throw new ClaimError(`${where}: "claim" text is required`)

    const status = effectiveStatus(claim)
    const shouldAllow = PUBLISHABLE_STATUSES.has(status) && !ALWAYS_BLOCKED_KINDS.has(claim.kind)

    // The two fields exist so a human can read the file and a machine can gate
    // on it. If they disagree, one of them is a lie — fail rather than pick.
    if (claim.allowedForPublication !== shouldAllow) {
      throw new ClaimError(
        `${where}: status "${status}" (kind "${claim.kind}") implies allowedForPublication=${shouldAllow}, but the file says ${claim.allowedForPublication}. Fix one of them.`,
      )
    }

    if (EVIDENCE_REQUIRED_KINDS.has(claim.kind) && claim.status === 'self_asserted') {
      throw new ClaimError(
        `${where}: kind "${claim.kind}" cannot be self_asserted. Statistics, certifications, licences and evidence need a source, or they stay unverified.`,
      )
    }

    if (PUBLISHABLE_STATUSES.has(status) && !claim.source.trim()) {
      throw new ClaimError(`${where}: publishable claims must record a "source"`)
    }

    if (PUBLISHABLE_STATUSES.has(status) && !claim.lastVerified.trim()) {
      throw new ClaimError(`${where}: publishable claims must record "lastVerified"`)
    }

    if (claim.lastVerified && Number.isNaN(Date.parse(claim.lastVerified))) {
      throw new ClaimError(`${where}: lastVerified "${claim.lastVerified}" is not an ISO date`)
    }
  }
}

const claims = (registry.claims as Claim[]).map((claim) => ({
  ...claim,
  status: effectiveStatus(claim),
  allowedForPublication:
    PUBLISHABLE_STATUSES.has(effectiveStatus(claim)) && !ALWAYS_BLOCKED_KINDS.has(claim.kind),
}))

validate(registry.claims as Claim[])

const byId = new Map(claims.map((claim) => [claim.id, claim]))

/* --- Reading the registry -------------------------------------------------- */

export function allClaims(): Claim[] {
  return claims
}

export function getClaim(id: string): Claim | undefined {
  return byId.get(id)
}

/**
 * The gate. Unknown ids are false, not an error: a page asking about a claim
 * that no longer exists should go quiet, not crash the site.
 */
export function isPublishable(id: string): boolean {
  return byId.get(id)?.allowedForPublication ?? false
}

/**
 * The gate, for code paths where a missing claim is a programming error rather
 * than a content decision — a schema builder, say. Fails the build.
 */
export function requireClaim(id: string): Claim {
  const claim = byId.get(id)
  if (!claim) throw new ClaimError(`unknown claim id "${id}"`)
  if (!claim.allowedForPublication) {
    throw new ClaimError(
      `claim "${id}" is ${claim.status} and cannot be published. Verify it in content/claims.json first.`,
    )
  }
  return claim
}

/**
 * A figure, or nothing. Call sites read as `const n = publishableValue('x')` and
 * then `{n && <Stat …/>}` — the absent case is the default, so a claim losing
 * its verification removes the number from the page instead of zeroing it.
 */
export function publishableValue(id: string): string | undefined {
  const claim = byId.get(id)
  if (!claim?.allowedForPublication) return undefined
  return claim.value?.trim() || undefined
}

/** Everything a content brief is allowed to assert. */
export function publishableClaims(): Claim[] {
  return claims.filter((claim) => claim.allowedForPublication)
}

export function blockedClaims(): Claim[] {
  return claims.filter((claim) => !claim.allowedForPublication)
}

/** Claims still waiting on the business — what docs and the owner checklist read. */
export function claimsNeedingVerification(): Claim[] {
  return claims.filter(
    (claim) => claim.status === 'unverified' || claim.status === 'expired' || claim.status === 'disputed',
  )
}

/* --- Screening text -------------------------------------------------------- */

export type ClaimViolation = {
  claimId: string
  status: ClaimStatus
  matched: string
  reason: string
}

/**
 * Patterns that give away an unpublishable claim in prose. Deliberately narrow:
 * a screen that fires on "best" in "best suited to a villa" gets switched off
 * within a week, and a screen that is switched off protects nothing.
 */
const TEXT_SIGNATURES: Array<{ claimId: string; patterns: RegExp[] }> = [
  {
    claimId: 'market_leadership',
    patterns: [
      /\b(?:the\s+)?(?:#\s?1|number one|no\.?\s?1)\b[^.]{0,40}\b(?:compan|provider|installer|service|choice)/i,
      /\b(?:best|top|leading|largest|foremost|premier)\b[^.]{0,30}\b(?:water\s+(?:filtration|filter|purifier|treatment))\s+compan/i,
      /\bUAE'?s\s+(?:best|leading|top|no\.?\s?1|number one)\b/i,
      /\bDubai'?s\s+(?:best|leading|top|no\.?\s?1|number one)\b/i,
    ],
  },
  {
    claimId: 'health_outcomes',
    patterns: [
      /\b(?:prevents?|cures?|treats?|heals?)\b[^.]{0,40}\b(?:disease|illness|cancer|infection|kidney|condition)/i,
      /\bmedically\s+(?:proven|recommended)\b/i,
      /\b(?:boosts?|improves?)\s+(?:your\s+)?immun/i,
    ],
  },
  {
    claimId: 'safety_guarantee',
    patterns: [
      /\b100\s?%\s+(?:pure|safe|clean|contaminant[- ]free|bacteria[- ]free)\b/i,
      /\b(?:guarantee[sd]?|guaranteed)\b[^.]{0,30}\b(?:safe|pure|potable)\b/i,
      /\bcompletely\s+(?:removes?|eliminates?)\s+all\b/i,
    ],
  },
  {
    claimId: 'customers_served',
    patterns: [/\b\d{1,3}(?:,\d{3})+\s?\+?\s+(?:households|customers|clients|homes|families)\b/i],
  },
  {
    claimId: 'average_rating',
    patterns: [/\b[1-5](?:\.\d)\s?(?:\/\s?5|out of 5|star)\b/i],
  },
  {
    claimId: 'review_count',
    patterns: [/\b\d{2,3}(?:,\d{3})*\s+(?:reviews|ratings)\b/i],
  },
  {
    claimId: 'years_in_business',
    patterns: [
      /\b(?:over|more than)?\s?\d{1,2}\+?\s+years?\s+(?:of\s+)?(?:experience|in business|serving)\b/i,
      /\b(?:founded|established|since)\s+(?:in\s+)?(?:19|20)\d{2}\b/i,
    ],
  },
  {
    claimId: 'published_pricing',
    patterns: [
      /\bAED\s?\d/i,
      /\b\d+\s?(?:AED|dirhams?)\b/i,
      /\b(?:starting|starts|prices?)\s+(?:from|at)\s+\d/i,
    ],
  },
  {
    claimId: 'licensed_uae_business',
    patterns: [/\b(?:DED|trade)\s+licen[cs]e\b/i, /\blicen[cs]ed\s+UAE\s+business\b/i],
  },
  {
    claimId: 'nsf_wqa_certified_media',
    patterns: [/\b(?:NSF|WQA)[\s/-]*(?:and|&|\/)?\s*(?:WQA|NSF)?\s*(?:certified|approved)\b/i],
  },
  {
    claimId: 'esma_approved_equipment',
    patterns: [/\bESMA[\s-]*(?:approved|certified)\b/i],
  },
  {
    claimId: 'dubai_municipality_compliant',
    patterns: [/\bDubai Municipality\s+(?:compliant|approved|certified)\b/i],
  },
  {
    claimId: 'technicians_insured',
    patterns: [
      /\b(?:fully\s+)?insured\s+technicians?\b/i,
      /\btechnicians?\s+(?:are|is)\s+(?:fully\s+)?insured\b/i,
      /\bthird[- ]party\s+liability\b/i,
    ],
  },
  {
    claimId: 'technicians_certified',
    patterns: [/\bcertified\s+technicians?\b/i],
  },
  {
    claimId: 'amc_saving_30_40',
    patterns: [/\bsave\s+\d{1,2}\s?(?:–|-|to)\s?\d{1,2}\s?%/i, /\b\d{1,2}\s?%\s+(?:less|cheaper)\b/i],
  },
  {
    claimId: 'local_tds_figures',
    patterns: [
      /\b(?:TDS|hardness)\s+(?:in|of|for)\s+(?:Dubai|Abu Dhabi|Sharjah|Ajman|Fujairah|Ras Al Khaimah|Umm Al Quwain|the UAE)\s+is\s+(?:about\s+)?\d/i,
      /\b(?:Dubai|Abu Dhabi|Sharjah)\s+(?:tap\s+)?water\s+(?:measures|is)\s+(?:around\s+)?\d+\s?(?:ppm|mg\/l)/i,
    ],
  },
]

/**
 * Screen prose for claims it is not allowed to make. Used by the content
 * pipeline's validators and available to any test that wants to assert a page
 * stays clean.
 */
/**
 * Claims the site may NAME without asserting them, and the scoping language
 * that has to accompany the mention.
 *
 * This is a hole in the screen, so it is built to be as small as possible.
 *
 * The need is real. The strongest thing this site can say about certification
 * is that the industry's badges usually mean less than readers assume — that
 * "NSF certified" on water-treatment marketing is typically NSF/ANSI 42 for
 * material safety, which certifies the housing is safe to touch drinking water
 * and certifies nothing about what the equipment removes. Explaining that
 * requires naming NSF, and a plain text screen cannot tell the difference
 * between naming a claim and making one.
 *
 * So the exemption is conditional, not a bypass: it applies only to text that
 * also contains the scoping language in `requires`. Text that says
 * "NSF certified" without ever narrowing what that covers is still a
 * violation, which is the case worth catching. Every entry needs a `why`, and
 * `tests/claims.test.ts` holds the list to a hard ceiling so it cannot grow
 * into a general escape hatch.
 */
export type ClaimDiscussion = { requires: RegExp; why: string }

export const DISCUSSABLE_CLAIMS: ReadonlyMap<string, ClaimDiscussion> = new Map([
  [
    'nsf_wqa_certified_media',
    {
      requires:
        /material requirements only|material safety and structural integrity only|certifies nothing about what|does not certify/i,
      why:
        'content/faqs.json → nsf-certified-meaning teaches a reader how to read an ' +
        'NSF badge, quoting manufacturers\' own scoping. It claims no certification ' +
        'for AquaPure; nsf_wqa_certified_media stays unverified. See docs/EQUIPMENT-DATA.md.',
    },
  ],
])

/**
 * Screen text for claims it is not allowed to make.
 *
 * `discusses` names claims this text deliberately mentions in order to explain
 * them. A named claim is forgiven only if the required scoping language is
 * present — see DISCUSSABLE_CLAIMS.
 *
 * `scope` is where that scoping language is looked for, and defaults to `text`.
 * It exists because a reader consumes a whole record, not one field: an FAQ's
 * question can name a badge while the narrowing sits in its answer, and judging
 * the question alone would flag honest content. Callers that screen field by
 * field should pass the record's full text as the scope.
 */
export function screenText(
  text: string,
  discusses: readonly string[] = [],
  scope: string = text,
): ClaimViolation[] {
  const violations: ClaimViolation[] = []

  for (const { claimId, patterns } of TEXT_SIGNATURES) {
    const claim = byId.get(claimId)
    if (claim?.allowedForPublication) continue

    // Naming a claim in order to interrogate it is allowed, but only where the
    // text also narrows what the badge actually covers.
    if (discusses.includes(claimId)) {
      const discussion = DISCUSSABLE_CLAIMS.get(claimId)
      if (discussion && discussion.requires.test(scope)) continue
    }

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (!match) continue
      violations.push({
        claimId,
        status: claim?.status ?? 'unverified',
        matched: match[0].trim(),
        reason:
          claim?.kind === 'superlative' || claim?.kind === 'health'
            ? `Claim "${claimId}" is ${claim.status} and can never be published.`
            : `Claim "${claimId}" is ${claim?.status ?? 'unknown'}. Verify it in content/claims.json before publishing this wording.`,
      })
      break
    }
  }

  return violations
}

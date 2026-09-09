/**
 * Screens content/*.json for claims it is not allowed to make.
 *
 * Claim-aware: a record carrying a `claimId` whose claim is not publishable is
 * skipped, because the render layer already gates it — those records are parked
 * on purpose, waiting for the business to file evidence. Anything else that
 * trips the screen is text that would actually reach a page.
 */
import { screenText, isPublishable } from '@/lib/claims'
import { readdirSync, readFileSync } from 'node:fs'

export type Finding = { file: string; claimId: string; matched: string; context: string }

/**
 * A string plus the claims the record it came from is allowed to discuss.
 *
 * Attribution has to survive the walk. Screening a whole file as one blob
 * cannot tell which record a phrase came from, so an exemption granted to one
 * FAQ would silently cover every other record in the file.
 */
type Candidate = { text: string; discusses: readonly string[]; scope: string }

function walk(
  value: unknown,
  gated: boolean,
  discusses: readonly string[],
  scope: string,
  out: Candidate[],
): void {
  if (typeof value === 'string') {
    if (!gated) out.push({ text: value, discusses, scope })
    return
  }
  if (Array.isArray(value)) {
    value.forEach((v) => walk(v, gated, discusses, scope, out))
    return
  }
  if (!value || typeof value !== 'object') return

  const record = value as Record<string, unknown>
  // A record whose claim is unpublishable never renders, so its text is parked
  // rather than published. Its children inherit that.
  const claimId = typeof record.claimId === 'string' ? record.claimId : undefined
  const nowGated = gated || (claimId !== undefined && !isPublishable(claimId))

  // `discussesClaims` marks a record that names a blocked claim in order to
  // explain it. It is not a bypass: lib/claims.ts still requires the scoping
  // language before forgiving the mention. Inherited by children, because an
  // FAQ's answer is a child of the record that declares it.
  const declared = Array.isArray(record.discussesClaims)
    ? record.discussesClaims.filter((c): c is string => typeof c === 'string')
    : []
  const nowDiscusses = declared.length > 0 ? [...discusses, ...declared] : discusses
  // A record declaring a discussion becomes the scope for its own children, so
  // the narrowing may live in any of its fields. Without this, an FAQ question
  // naming a badge is judged apart from the answer that qualifies it.
  const nowScope = declared.length > 0 ? JSON.stringify(record) : scope

  for (const [key, child] of Object.entries(record)) {
    if (key.startsWith('_')) continue // `_note` fields are developer commentary
    walk(child, nowGated, nowDiscusses, nowScope, out)
  }
}

/**
 * Files that are not published prose and so are not screened.
 *
 * `claims.json` states the claims, including the forbidden ones — screening it
 * would flag the registry for containing its own contents. `queries.json` holds
 * the search queries people type, and "best water filter company in Dubai" is
 * a query to track, not a claim the site makes about itself. Neither file is
 * ever rendered as page copy.
 */
const NOT_PUBLISHED_PROSE = new Set(['claims.json', 'queries.json'])

export function screenContentDirectory(dir = 'content'): Finding[] {
  const findings: Finding[] = []

  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json') && !NOT_PUBLISHED_PROSE.has(f))) {
    const candidates: Candidate[] = []
    walk(JSON.parse(readFileSync(`${dir}/${file}`, 'utf8')), false, [], '', candidates)

    for (const { text, discusses, scope } of candidates) {
      for (const violation of screenText(text, discusses, scope || text)) {
        const at = text.indexOf(violation.matched)
        findings.push({
          file,
          claimId: violation.claimId,
          matched: violation.matched,
          context: text.slice(Math.max(0, at - 70), at + 90),
        })
      }
    }
  }

  return findings
}

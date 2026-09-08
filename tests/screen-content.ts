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

function walk(value: unknown, gated: boolean, out: string[]): void {
  if (typeof value === 'string') {
    if (!gated) out.push(value)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((v) => walk(v, gated, out))
    return
  }
  if (!value || typeof value !== 'object') return

  const record = value as Record<string, unknown>
  // A record whose claim is unpublishable never renders, so its text is parked
  // rather than published. Its children inherit that.
  const claimId = typeof record.claimId === 'string' ? record.claimId : undefined
  const nowGated = gated || (claimId !== undefined && !isPublishable(claimId))

  for (const [key, child] of Object.entries(record)) {
    if (key.startsWith('_')) continue // `_note` fields are developer commentary
    walk(child, nowGated, out)
  }
}

export function screenContentDirectory(dir = 'content'): Finding[] {
  const findings: Finding[] = []

  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'claims.json')) {
    const strings: string[] = []
    walk(JSON.parse(readFileSync(`${dir}/${file}`, 'utf8')), false, strings)

    for (const text of strings) {
      for (const violation of screenText(text)) {
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

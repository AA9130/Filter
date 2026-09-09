import { isIconKey } from '@/lib/icons'
import { isImageKey } from '@/lib/images'
import { getClaim } from '@/lib/claims'

/**
 * Content validation at the boundary.
 *
 * Content is edited by non-developers, so a missing field must fail loudly at
 * build time with a message that names the file and the record — never render a
 * half-empty page to a customer. These run once at module load; because every
 * page is statically generated, a bad edit breaks `next build`, not production.
 *
 * The reference checks matter as much as the shape checks. A service pointing
 * at a FAQ id that no longer exists, or a location listing a service slug that
 * was renamed, produces a page with a silently missing section — the class of
 * bug nobody notices until a crawler has been reading the broken version for a
 * month.
 */

export class ContentError extends Error {
  constructor(source: string, detail: string) {
    super(`[content] ${source}: ${detail}`)
    this.name = 'ContentError'
  }
}

type Rules = {
  strings?: string[]
  arrays?: string[]
  /** Arrays whose entries are objects: field → required keys on each entry. */
  objectArrays?: Record<string, string[]>
  /** Same, but the field may be absent entirely. Validated only when present. */
  optionalObjectArrays?: Record<string, string[]>
  /**
   * Fields that must appear together or not at all, as [field, partner].
   *
   * Used for data that would be misleading unsourced: operating limits without
   * the note saying where they come from and what they are not is exactly the
   * unattributed specification this project refuses to publish.
   */
  pairs?: [string, string][]
  icons?: string[]
  images?: string[]
  claims?: string[]
  dates?: string[]
}

function label(source: string, record: Record<string, unknown>, index: number) {
  const id = record.slug ?? record.id ?? record.name ?? record.title ?? record.q ?? `#${index}`
  return `${source} → "${String(id)}"`
}

function checkRecord(where: string, record: Record<string, unknown>, rules: Rules): void {
  for (const field of rules.strings ?? []) {
    const value = record[field]
    if (typeof value !== 'string' || value.trim() === '') {
      throw new ContentError(where, `"${field}" must be a non-empty string`)
    }
  }

  for (const field of rules.arrays ?? []) {
    const value = record[field]
    if (!Array.isArray(value) || value.length === 0) {
      throw new ContentError(where, `"${field}" must be a non-empty array`)
    }
    if (value.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
      throw new ContentError(where, `"${field}" must contain only non-empty strings`)
    }
  }

  const checkObjectArray = (field: string, keys: string[], value: unknown): void => {
    if (!Array.isArray(value) || value.length === 0) {
      throw new ContentError(where, `"${field}" must be a non-empty array of objects`)
    }
    value.forEach((entry, i) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        throw new ContentError(where, `"${field}[${i}]" must be an object`)
      }
      for (const key of keys) {
        const inner = (entry as Record<string, unknown>)[key]
        if (typeof inner !== 'string' || inner.trim() === '') {
          throw new ContentError(where, `"${field}[${i}].${key}" must be a non-empty string`)
        }
      }
    })
  }

  for (const [field, keys] of Object.entries(rules.objectArrays ?? {})) {
    checkObjectArray(field, keys, record[field])
  }

  for (const [field, keys] of Object.entries(rules.optionalObjectArrays ?? {})) {
    if (record[field] !== undefined) checkObjectArray(field, keys, record[field])
  }

  for (const [field, partner] of rules.pairs ?? []) {
    const hasField = record[field] !== undefined
    const hasPartner = typeof record[partner] === 'string' && record[partner] !== ''
    if (hasField && !hasPartner) {
      throw new ContentError(
        where,
        `"${field}" is present but "${partner}" is missing. Figures must carry the note that says where they came from and what they are not — unsourced specifications are exactly what this project does not publish.`,
      )
    }
    if (hasPartner && !hasField) {
      throw new ContentError(where, `"${partner}" is present but "${field}" is missing`)
    }
  }

  for (const field of rules.icons ?? []) {
    if (!isIconKey(record[field])) {
      throw new ContentError(
        where,
        `"${field}" is "${String(record[field])}", which is not a known icon. Add it to lib/icons.ts or use an existing key.`,
      )
    }
  }

  for (const field of rules.images ?? []) {
    if (!isImageKey(record[field])) {
      throw new ContentError(
        where,
        `"${field}" is "${String(record[field])}", which is not a known image. Add it to lib/images.ts (and public/images/) or use an existing key.`,
      )
    }
  }

  // A claimId that does not resolve would silently gate content off forever —
  // the failure looks identical to "the claim is unverified", so it must fail
  // loudly instead.
  for (const field of rules.claims ?? []) {
    const id = record[field]
    if (typeof id !== 'string' || !getClaim(id)) {
      throw new ContentError(
        where,
        `"${field}" is "${String(id)}", which is not a claim id in content/claims.json. Content gated on a claim that does not exist can never be published.`,
      )
    }
  }

  for (const field of rules.dates ?? []) {
    const value = record[field]
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
      throw new ContentError(where, `"${field}" must be an ISO date (YYYY-MM-DD)`)
    }
  }
}

/** Validate a collection, returning it typed. Throws on the first problem. */
export function validateAll<T>(source: string, data: unknown, rules: Rules): T[] {
  if (!Array.isArray(data)) throw new ContentError(source, 'expected a JSON array')
  if (data.length === 0) throw new ContentError(source, 'is empty')

  const seenSlugs = new Set<string>()
  const seenIds = new Set<string>()

  data.forEach((record: Record<string, unknown>, i) => {
    const where = label(source, record, i)
    checkRecord(where, record, rules)

    // Slugs are URLs — they must be unique and URL-safe or routing breaks
    if (typeof record.slug === 'string') {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) {
        throw new ContentError(where, `slug "${record.slug}" must be lowercase-kebab-case`)
      }
      if (seenSlugs.has(record.slug)) {
        throw new ContentError(where, `duplicate slug "${record.slug}" — slugs become URLs`)
      }
      seenSlugs.add(record.slug)
    }

    if (typeof record.id === 'string') {
      if (seenIds.has(record.id)) {
        throw new ContentError(where, `duplicate id "${record.id}" — ids are used for cross-references`)
      }
      seenIds.add(record.id)
    }
  })

  return data as T[]
}

export function validateObject<T>(source: string, data: unknown, required: string[]): T {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ContentError(source, 'expected a JSON object')
  }
  for (const field of required) {
    if ((data as Record<string, unknown>)[field] === undefined) {
      throw new ContentError(source, `missing required field "${field}"`)
    }
  }
  return data as T
}

/**
 * Cross-collection reference checking. Called once, after every collection has
 * loaded, because a reference cannot be checked until both ends exist.
 */
export function validateReferences(
  source: string,
  records: ReadonlyArray<Record<string, unknown>>,
  fields: Record<string, ReadonlySet<string>>,
): void {
  records.forEach((record, i) => {
    const where = label(source, record, i)

    for (const [field, valid] of Object.entries(fields)) {
      const refs = record[field]
      if (refs === undefined) continue
      if (!Array.isArray(refs)) throw new ContentError(where, `"${field}" must be an array`)

      for (const ref of refs) {
        if (typeof ref !== 'string' || !valid.has(ref)) {
          throw new ContentError(
            where,
            `"${field}" points at "${String(ref)}", which does not exist. Fix the reference or add the record — a dangling reference renders as a silently missing section.`,
          )
        }
      }
      // Self-reference produces a "related" link back to the current page
      if (typeof record.slug === 'string' && refs.includes(record.slug)) {
        throw new ContentError(where, `"${field}" includes its own slug`)
      }
    }
  })
}

/** Every row of a comparison table must have one value per column. */
export function validateComparisons(
  source: string,
  records: ReadonlyArray<Record<string, unknown>>,
): void {
  records.forEach((record, i) => {
    const comparison = record.comparison as
      | { columns?: unknown; rows?: unknown; caption?: unknown }
      | undefined
    const hasSlot = Array.isArray(record.sections)
      && (record.sections as Array<{ slot?: string }>).some((s) => s?.slot === 'comparison')

    if (!comparison) {
      if (hasSlot) {
        throw new ContentError(
          label(source, record, i),
          'a section declares slot "comparison" but the record has no `comparison` table',
        )
      }
      return
    }

    const where = label(source, record, i)
    const { columns, rows, caption } = comparison
    if (typeof caption !== 'string' || !caption.trim()) {
      throw new ContentError(where, 'comparison.caption is required — it is the table\'s accessible name')
    }
    if (!Array.isArray(columns) || columns.length < 2) {
      throw new ContentError(where, 'comparison.columns needs at least two columns')
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ContentError(where, 'comparison.rows is empty')
    }
    rows.forEach((row: { label?: unknown; values?: unknown }, r) => {
      if (typeof row?.label !== 'string' || !row.label.trim()) {
        throw new ContentError(where, `comparison.rows[${r}].label is required`)
      }
      if (!Array.isArray(row.values) || row.values.length !== columns.length) {
        throw new ContentError(
          where,
          `comparison.rows[${r}] ("${row.label}") has ${Array.isArray(row.values) ? row.values.length : 0} values but there are ${columns.length} columns`,
        )
      }
    })
    if (!hasSlot) {
      throw new ContentError(where, 'has a `comparison` table but no section declares slot "comparison", so it would never render')
    }
  })
}

import { isIconKey } from '@/lib/icons'
import { isImageKey } from '@/lib/images'

/**
 * Content validation at the boundary.
 *
 * Content is edited by non-developers, so a missing field must fail loudly at
 * build time with a message that names the file and the record — never render a
 * half-empty page to a customer. These run once at module load; because every
 * page is statically generated, a bad edit breaks `next build`, not production.
 */

class ContentError extends Error {
  constructor(source: string, detail: string) {
    super(`[content] ${source}: ${detail}`)
    this.name = 'ContentError'
  }
}

type Rules = {
  strings?: string[]
  arrays?: string[]
  icons?: string[]
  images?: string[]
  optional?: string[]
}

function label(source: string, record: Record<string, unknown>, index: number) {
  const id = record.slug ?? record.name ?? record.title ?? record.q ?? `#${index}`
  return `${source} → "${String(id)}"`
}

/** Validate a collection, returning it typed. Throws on the first problem. */
export function validateAll<T>(source: string, data: unknown, rules: Rules): T[] {
  if (!Array.isArray(data)) throw new ContentError(source, 'expected a JSON array')
  if (data.length === 0) throw new ContentError(source, 'is empty')

  const seen = new Set<string>()

  data.forEach((record: Record<string, unknown>, i) => {
    const where = label(source, record, i)

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

    // Slugs are URLs — they must be unique and URL-safe or routing breaks
    if (typeof record.slug === 'string') {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) {
        throw new ContentError(where, `slug "${record.slug}" must be lowercase-kebab-case`)
      }
      if (seen.has(record.slug)) {
        throw new ContentError(where, `duplicate slug "${record.slug}" — slugs become URLs`)
      }
      seen.add(record.slug)
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

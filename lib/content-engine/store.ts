import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ApprovalStatus, PipelineRecord, ValidationReport } from './types'
import { unclearable } from './validators'

/**
 * Pipeline persistence: JSON files under content/pipeline/.
 *
 * Files rather than a database, on purpose. The brief.pipeline is a review
 * workflow with a handful of items in flight, and its most valuable property is
 * that a reviewer can read a brief and a draft in a pull request. A database
 * would make that worse and add an operational dependency to a static site.
 *
 * The directory is git-ignored for drafts and committed for approved records,
 * so the audit trail of what was approved and by whom lives in the repository
 * history — which is exactly where it is useful a year later.
 */

const ROOT = join(process.cwd(), 'content', 'pipeline')

async function ensureDir(): Promise<void> {
  await mkdir(ROOT, { recursive: true })
}

function pathFor(id: string): string {
  return join(ROOT, `${id}.json`)
}

export async function saveRecord(record: PipelineRecord): Promise<string> {
  await ensureDir()
  const file = pathFor(record.id)
  await writeFile(file, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
  return file
}

export async function loadRecord(id: string): Promise<PipelineRecord | null> {
  try {
    return JSON.parse(await readFile(pathFor(id), 'utf8')) as PipelineRecord
  } catch {
    return null
  }
}

export async function listRecords(): Promise<PipelineRecord[]> {
  await ensureDir()
  const files = (await readdir(ROOT)).filter((file) => file.endsWith('.json'))
  const records = await Promise.all(
    files.map(async (file) => {
      try {
        return JSON.parse(await readFile(join(ROOT, file), 'utf8')) as PipelineRecord
      } catch {
        return null
      }
    }),
  )
  return records.filter((record): record is PipelineRecord => record !== null)
}

export function note(record: PipelineRecord, event: string, detail?: string): PipelineRecord {
  return {
    ...record,
    history: [...record.history, { at: new Date().toISOString(), event, ...(detail ? { detail } : {}) }],
  }
}

/**
 * The status a record should be in given its validation report.
 *
 * Note what this function cannot return: `approved`. Validation moves a record
 * to `awaiting-review` at best. Nothing in this file can approve anything,
 * which is the property that makes the human step real rather than decorative.
 */
export function statusAfterValidation(report: ValidationReport): ApprovalStatus {
  if (unclearable(report).length > 0) return 'rejected'
  return report.passed ? 'awaiting-review' : 'changes-requested'
}

export class ApprovalError extends Error {
  constructor(message: string) {
    super(`[pipeline] ${message}`)
    this.name = 'ApprovalError'
  }
}

/**
 * Human approval. The only route from a validated draft to a publishable one.
 *
 * `reviewer` is required and must be a real identifier, because an audit trail
 * whose approvals are attributed to "system" records nothing. And a record with
 * an unclearable issue — a prohibited claim — cannot be approved at all; the
 * text has to change first.
 */
export async function approve({
  id,
  reviewer,
  notes = '',
}: {
  id: string
  reviewer: string
  notes?: string
}): Promise<PipelineRecord> {
  const record = await loadRecord(id)
  if (!record) throw new ApprovalError(`no record "${id}"`)
  if (!record.draft) throw new ApprovalError(`record "${id}" has no draft to approve`)
  if (!record.validation) {
    throw new ApprovalError(`record "${id}" has not been validated. Validate before approving.`)
  }
  if (!reviewer.trim() || reviewer.trim().toLowerCase() === 'system') {
    throw new ApprovalError('a real reviewer identifier is required — approvals are an audit record')
  }

  const blocked = unclearable(record.validation)
  if (blocked.length > 0) {
    throw new ApprovalError(
      `record "${id}" contains ${blocked.length} prohibited claim(s) and cannot be approved. Change the text:\n` +
        blocked.map((issue) => `  - ${issue.message}`).join('\n'),
    )
  }

  if (!record.validation.passed) {
    throw new ApprovalError(
      `record "${id}" has ${record.validation.errors.length} validation error(s). Fix them and re-validate:\n` +
        record.validation.errors.map((issue) => `  - [${issue.code}] ${issue.message}`).join('\n'),
    )
  }

  const approved = note(
    {
      ...record,
      status: 'approved' as ApprovalStatus,
      review: { by: reviewer.trim(), at: new Date().toISOString(), notes },
    },
    'approved',
    `by ${reviewer.trim()}`,
  )

  await saveRecord(approved)
  return approved
}

export async function reject({
  id,
  reviewer,
  reason,
}: {
  id: string
  reviewer: string
  reason: string
}): Promise<PipelineRecord> {
  const record = await loadRecord(id)
  if (!record) throw new ApprovalError(`no record "${id}"`)

  const rejected = note(
    { ...record, status: 'rejected' as ApprovalStatus, review: { by: reviewer, at: new Date().toISOString(), notes: reason } },
    'rejected',
    reason,
  )
  await saveRecord(rejected)
  return rejected
}

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Observation } from './types'

/**
 * Observation storage: one append-only JSONL file.
 *
 * Append-only because the value of this data is the trend, and a trend needs
 * every reading including the ones that were disappointing. A store that could
 * be edited in place would eventually be edited in place.
 *
 * JSONL rather than JSON: appending a line is atomic enough for this, and the
 * file stays diffable, greppable and mergeable when two people record
 * observations on the same day.
 */

const FILE = join(process.cwd(), 'content', 'visibility', 'observations.jsonl')

async function ensureDir(): Promise<void> {
  await mkdir(join(process.cwd(), 'content', 'visibility'), { recursive: true })
}

export async function appendObservation(observation: Observation): Promise<void> {
  await ensureDir()
  const { appendFile } = await import('node:fs/promises')
  await appendFile(FILE, `${JSON.stringify(observation)}\n`, 'utf8')
}

export async function readObservations(): Promise<Observation[]> {
  try {
    const raw = await readFile(FILE, 'utf8')
    return raw
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .flatMap((line) => {
        try {
          return [JSON.parse(line) as Observation]
        } catch {
          // A corrupt line must not take the whole history with it.
          console.warn('[visibility] skipping unparseable observation line')
          return []
        }
      })
  } catch {
    return []
  }
}

export async function writeReportFile(report: unknown): Promise<string> {
  await ensureDir()
  const path = join(process.cwd(), 'content', 'visibility', 'report.json')
  await writeFile(path, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  return path
}

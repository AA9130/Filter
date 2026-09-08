/**
 * Content pipeline CLI.
 *
 *   npm run content -- brief <queryId|"free text query">
 *   npm run content -- run <queryId> [--force]
 *   npm run content -- validate <recordId>
 *   npm run content -- approve <recordId> --reviewer "Name" [--notes "..."]
 *   npm run content -- list
 *   npm run content -- backlog
 *
 * The commands map one-to-one onto the pipeline stages, so the CLI is also the
 * documentation of what the stages are.
 */
import { getSearchQueries } from '@/lib/content'
import {
  buildBrief, runPipeline, validateDraft, approve, loadRecord, listRecords, saveRecord,
} from '@/lib/content-engine/pipeline'
import { statusAfterValidation, note } from '@/lib/content-engine/store'
import { buildPrompt } from '@/lib/content-engine/generate'

const args = process.argv.slice(2)
const command = args[0]

function flag(name: string): string | undefined {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? undefined : args[index + 1]
}
const has = (name: string) => args.includes(`--${name}`)

function bail(message: string): never {
  console.error(`\n${message}\n`)
  process.exit(1)
}

async function resolveQuery(token: string): Promise<{ id: string; query: string }> {
  const queries = await getSearchQueries()
  const match = queries.find((q) => q.id === token)
  if (match) return { id: match.id, query: match.query }
  // Free text is allowed so a topic can be explored before it is in the database.
  return { id: token.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), query: token }
}

async function main(): Promise<void> {
  switch (command) {
    case 'brief': {
      const token = args[1] ?? bail('usage: content brief <queryId|"query text">')
      const { id, query } = await resolveQuery(token)
      const brief = await buildBrief({ queryId: id, query })

      console.log(`\n── BRIEF ────────────────────────────────────────────────`)
      console.log(`topic          ${brief.topic}`)
      console.log(`page kind      ${brief.pageKind}   schema: ${brief.schemaType}`)
      console.log(`intent         ${brief.primaryIntent}${brief.secondaryIntents.length ? ` (+ ${brief.secondaryIntents.join(', ')})` : ''}`)
      console.log(`entity         ${brief.primaryEntity}`)
      if (brief.relatedEntities.length) console.log(`related        ${brief.relatedEntities.join(', ')}`)
      if (brief.targetLocation) console.log(`emirate        ${brief.targetLocation}`)
      if (brief.targetService) console.log(`service        ${brief.targetService}`)

      console.log(`\ncoverage       ${brief.coverage.recommendation.toUpperCase()}`)
      console.log(`               ${brief.coverage.gap}`)
      if (brief.coverage.partial.length) {
        console.log(`  overlaps:`)
        for (const p of brief.coverage.partial) {
          console.log(`    ${String(Math.round(p.overlap * 100)).padStart(3)}%  ${p.url}`)
        }
      }

      console.log(`\nmust answer:`)
      for (const question of brief.questionsToAnswer) console.log(`  · ${question}`)

      console.log(`\nfacts licensed (${brief.factsRequired.length}):`)
      for (const fact of brief.factsRequired) console.log(`  ✓ ${fact}`)

      console.log(`\nclaims BLOCKED (${brief.claimsForbidden.length}):`)
      for (const claim of brief.claimsForbidden) console.log(`  ✗ ${claim.id}`)

      console.log(`\ninternal links (${brief.internalLinks.length}):`)
      for (const link of brief.internalLinks) console.log(`  → ${link.url}  — ${link.why}`)

      console.log(`\nsections:`)
      for (const section of brief.recommendedSections) console.log(`  ${section}`)

      if (has('prompt')) {
        console.log(`\n── GENERATOR PROMPT ─────────────────────────────────────\n`)
        console.log(buildPrompt(brief))
      } else {
        console.log(`\n(add --prompt to print the generator prompt this brief produces)`)
      }
      console.log()
      break
    }

    case 'run': {
      const token = args[1] ?? bail('usage: content run <queryId> [--force]')
      const { id, query } = await resolveQuery(token)
      const record = await runPipeline({ queryId: id, query, force: has('force') })

      console.log(`\nrecord   ${record.id}`)
      console.log(`status   ${record.status}`)
      if (record.status === 'rejected' && !record.draft) {
        console.log(`\nskipped: ${record.brief.coverage.gap}`)
        console.log(`re-run with --force to generate anyway.\n`)
        break
      }
      printValidation(record.validation)
      console.log(`\nnext: review content/pipeline/${record.id}.json, then`)
      console.log(`      npm run content -- approve ${record.id} --reviewer "Your Name"\n`)
      break
    }

    case 'validate': {
      const id = args[1] ?? bail('usage: content validate <recordId>')
      const record = await loadRecord(id)
      if (!record) bail(`no record "${id}"`)
      if (!record.draft) bail(`record "${id}" has no draft`)

      const validation = await validateDraft(record.draft, record.brief)
      await saveRecord(
        note({ ...record, validation, status: statusAfterValidation(validation) }, 'revalidated'),
      )
      printValidation(validation)
      console.log()
      break
    }

    case 'approve': {
      const id = args[1] ?? bail('usage: content approve <recordId> --reviewer "Name"')
      const reviewer = flag('reviewer') ?? bail('--reviewer is required: approvals are an audit record')
      try {
        const record = await approve({ id, reviewer, notes: flag('notes') ?? '' })
        console.log(`\napproved ${record.id} by ${record.review?.by} at ${record.review?.at}\n`)
      } catch (error) {
        bail(String(error instanceof Error ? error.message : error))
      }
      break
    }

    case 'list': {
      const records = await listRecords()
      if (records.length === 0) {
        console.log('\nno pipeline records yet. try: npm run content -- run <queryId>\n')
        break
      }
      console.log()
      for (const record of records) {
        const errors = record.validation?.errors.length ?? 0
        const geo = record.validation ? `GEO ${record.validation.geoScore}` : 'unvalidated'
        console.log(
          `${record.status.padEnd(18)} ${String(errors).padStart(2)} err  ${geo.padEnd(15)} ${record.id}`,
        )
      }
      console.log()
      break
    }

    case 'backlog': {
      const queries = await getSearchQueries()
      const open = queries.filter((q) => !q.contentExists).sort((a, b) => a.priority - b.priority)
      console.log(`\n${open.length} of ${queries.length} tracked queries have no page:\n`)
      for (const query of open) {
        console.log(`  P${query.priority}  ${query.id.padEnd(42)} ${query.query}`)
      }
      console.log(`\nnpm run content -- brief <id>   to see what a page would need.\n`)
      break
    }

    default:
      console.log(`
content pipeline

  brief <queryId|"query">   build and print a content brief (add --prompt)
  run <queryId> [--force]   brief → draft → validate, saved to content/pipeline/
  validate <recordId>       re-run validation on a saved record
  approve <recordId>        --reviewer "Name" [--notes "..."]
  list                      all pipeline records and their status
  backlog                   tracked queries with no page yet
`)
  }
}

function printValidation(validation: Awaited<ReturnType<typeof validateDraft>> | null): void {
  if (!validation) {
    console.log('\nnot validated')
    return
  }
  console.log(`\nvalidation  ${validation.passed ? 'PASSED' : 'FAILED'}   GEO ${validation.geoScore}/100`)
  if (validation.errors.length) {
    console.log(`\n  ${validation.errors.length} error(s):`)
    for (const issue of validation.errors) {
      console.log(`    ✗ [${issue.validator}/${issue.code}]${issue.at ? ` ${issue.at}:` : ''} ${issue.message}`)
    }
  }
  if (validation.warnings.length) {
    console.log(`\n  ${validation.warnings.length} warning(s):`)
    for (const issue of validation.warnings.slice(0, 12)) {
      console.log(`    ! [${issue.validator}/${issue.code}] ${issue.message}`)
    }
    if (validation.warnings.length > 12) {
      console.log(`    … and ${validation.warnings.length - 12} more`)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

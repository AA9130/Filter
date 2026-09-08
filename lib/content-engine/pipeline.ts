import { buildBrief } from './brief'
import { templateGenerator, type Generator } from './generate'
import { validateDraft } from './validators'
import { saveRecord, statusAfterValidation, note } from './store'
import type { PipelineRecord } from './types'

export * from './types'
export { buildBrief } from './brief'
export { classifyIntent, extractEntities, inferPageKind } from './intent'
export { retrieveKnowledge, analyseCoverage } from './retrieval'
export { templateGenerator, buildPrompt } from './generate'
export { validateDraft, unclearable } from './validators'
export { approve, reject, loadRecord, listRecords, saveRecord } from './store'

/**
 * Run one topic through the pipeline, up to but NOT including publication.
 *
 * The stages are ordered so that the cheapest way to stop is first. Coverage
 * analysis runs before generation, so a topic already answered costs nothing
 * and returns `skip` — the single most valuable output this pipeline produces,
 * because a second page on a covered topic competes with the first.
 */
export async function runPipeline({
  queryId,
  query,
  generator = templateGenerator,
  /** Generate even when coverage says the topic is already answered. */
  force = false,
}: {
  queryId: string
  query: string
  generator?: Generator
  force?: boolean
}): Promise<PipelineRecord> {
  const id = `${queryId}--${new Date().toISOString().slice(0, 10)}`
  const brief = await buildBrief({ queryId, query })

  let record: PipelineRecord = {
    id,
    queryId,
    status: 'draft',
    brief,
    draft: null,
    validation: null,
    review: null,
    publishedUrl: null,
    history: [{ at: new Date().toISOString(), event: 'brief-created' }],
  }

  if (brief.coverage.recommendation === 'skip' && !force) {
    record = note(record, 'skipped', brief.coverage.gap)
    record = { ...record, status: 'rejected' }
    await saveRecord(record)
    return record
  }

  const draft = await generator.generate(brief)
  record = note({ ...record, draft }, 'draft-generated', `${generator.name}${generator.model ? ` (${generator.model})` : ''}`)

  const validation = await validateDraft(draft, brief)
  record = note(
    { ...record, validation, status: statusAfterValidation(validation) },
    'validated',
    `${validation.errors.length} error(s), ${validation.warnings.length} warning(s), GEO ${validation.geoScore}/100`,
  )

  await saveRecord(record)
  return record
}

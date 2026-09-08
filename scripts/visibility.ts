/**
 * AI visibility tracking CLI.
 *
 *   npm run visibility -- platforms
 *   npm run visibility -- queries
 *   npm run visibility -- record --query <id> --platform chatgpt --presence cited \
 *                          --url <cited url> --position 1 \
 *                          --competitors "Brand A,Brand B" --by "Your Name"
 *   npm run visibility -- report
 *
 * `record` is the only way data enters this system, and that is deliberate —
 * see lib/visibility/adapters for why no platform can be polled automatically.
 */
import { getSearchQueries } from '@/lib/content'
import {
  adapters, blindSpots, manualAdapter, appendObservation, readObservations,
  buildReport, writeReportFile, DEFAULT_SCORE_CONFIG,
} from '@/lib/visibility'
import type { Platform, PresenceLevel } from '@/lib/visibility'

const args = process.argv.slice(2)
const command = args[0]

function flag(name: string): string | undefined {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? undefined : args[index + 1]
}

function bail(message: string): never {
  console.error(`\n${message}\n`)
  process.exit(1)
}

const PRESENCE: PresenceLevel[] = ['absent', 'mentioned', 'cited', 'recommended', 'top-recommendation']
const PLATFORMS: Platform[] = ['google', 'google-ai-mode', 'chatgpt', 'gemini', 'perplexity', 'copilot', 'claude']

async function main(): Promise<void> {
  switch (command) {
    case 'platforms': {
      console.log('\nplatform adapters:\n')
      for (const adapter of adapters) {
        const availability = adapter.availability()
        console.log(`  ${availability.available ? '●' : '○'} ${adapter.platform.padEnd(16)} ${adapter.label}`)
        if (!availability.available) console.log(`      ${availability.reason}\n`)
      }
      console.log('  ● manual           Manual observation — the one that works today\n')
      break
    }

    case 'queries': {
      const queries = await getSearchQueries()
      const observations = await readObservations()
      const observed = new Set(observations.map((observation) => observation.queryId))
      console.log(`\n${queries.length} tracked queries (${observed.size} with at least one observation):\n`)
      for (const query of [...queries].sort((a, b) => a.priority - b.priority)) {
        console.log(`  ${observed.has(query.id) ? '✓' : ' '} P${query.priority}  ${query.id.padEnd(42)} ${query.query}`)
      }
      console.log()
      break
    }

    case 'record': {
      const queryId = flag('query') ?? bail('--query <id> is required (see: visibility queries)')
      const platform = (flag('platform') ?? bail(`--platform is required, one of: ${PLATFORMS.join(', ')}`)) as Platform
      const presence = (flag('presence') ?? bail(`--presence is required, one of: ${PRESENCE.join(', ')}`)) as PresenceLevel
      const by = flag('by') ?? bail('--by "Your Name" is required — an observation without an observer is not evidence')

      if (!PLATFORMS.includes(platform)) bail(`unknown platform "${platform}"`)
      if (!PRESENCE.includes(presence)) bail(`unknown presence "${presence}"`)

      const queries = await getSearchQueries()
      const query = queries.find((q) => q.id === queryId)
      if (!query) bail(`unknown query "${queryId}" — add it to content/queries.json first`)

      const positionRaw = flag('position')
      const observation = manualAdapter.record({
        date: flag('date'),
        platform,
        queryId,
        query: query.query,
        presence,
        urlCited: flag('url') ?? null,
        position: positionRaw ? Number(positionRaw) : null,
        competitors: (flag('competitors') ?? '').split(',').map((name) => name.trim()).filter(Boolean),
        answerText: flag('answer') ?? null,
        sourceUrls: (flag('sources') ?? '').split(',').map((url) => url.trim()).filter(Boolean),
        observedBy: by,
        notes: flag('notes') ?? '',
      })

      await appendObservation(observation)
      console.log(`\nrecorded: ${platform} / ${queryId} → ${presence}${observation.urlCited ? ` (cited ${observation.urlCited})` : ''}\n`)
      break
    }

    case 'report': {
      const [observations, queries] = await Promise.all([readObservations(), getSearchQueries()])
      const report = buildReport({
        observations,
        allQueries: queries.map((query) => ({ id: query.id, query: query.query, priority: query.priority })),
        blindSpots: blindSpots(),
      })

      console.log(`\n╭─ AI VISIBILITY ───────────────────────────────────────────────────`)
      console.log(`│  ${report.overall.observationCount} observation(s) recorded`)
      console.log(`╰───────────────────────────────────────────────────────────────────\n`)

      if (observations.length === 0) {
        console.log('No observations recorded yet, so there is nothing to score.')
        console.log('This is an empty dataset, not a visibility score of zero — the')
        console.log('difference matters, and the report will not pretend otherwise.\n')
        console.log('Record one:')
        console.log('  npm run visibility -- record --query best-water-filter-company-in-dubai \\')
        console.log('    --platform chatgpt --presence absent --by "Your Name"\n')
      } else {
        console.log(`visibility score     ${report.overall.visibilityScore}/100`)
        console.log(`share of voice       ${(report.overall.shareOfVoice * 100).toFixed(1)}%`)
        console.log(`citation rate        ${(report.overall.citationRate * 100).toFixed(1)}%`)
        console.log(`recommendation rate  ${(report.overall.recommendationRate * 100).toFixed(1)}%`)

        console.log(`\nby query:`)
        for (const query of report.tracked) {
          console.log(`  ${String(query.visibilityScore).padStart(3)}/100  ${String(query.observations).padStart(2)} obs  ${query.query}`)
        }

        if (report.competitorFrequency.length > 0) {
          console.log(`\ncompetitors seen:`)
          for (const competitor of report.competitorFrequency.slice(0, 12)) {
            console.log(`  ${String(competitor.appearances).padStart(3)}×  ${(competitor.shareOfVoice * 100).toFixed(1).padStart(5)}%  ${competitor.name}`)
          }
        }
      }

      console.log(`\n${report.unobserved.length} tracked quer${report.unobserved.length === 1 ? 'y' : 'ies'} never observed:`)
      for (const query of report.unobserved.slice(0, 10)) {
        console.log(`  P${query.priority}  ${query.query}`)
      }
      if (report.unobserved.length > 10) console.log(`  … and ${report.unobserved.length - 10} more`)

      console.log(`\nblind spots — platforms this cannot see automatically:`)
      for (const spot of report.blindSpots) console.log(`  ○ ${spot.platform}`)

      console.log(`\nscoring: ${JSON.stringify(DEFAULT_SCORE_CONFIG.weights)}`)
      const path = await writeReportFile(report)
      console.log(`written to ${path.replace(process.cwd() + '/', '')}\n`)
      break
    }

    default:
      console.log(`
AI visibility tracking

  platforms   which adapters exist, and which can actually run
  queries     tracked queries and whether they have been observed
  record      record one observation (see docs/AI-VISIBILITY.md)
  report      score what has been recorded, and say what is unseen
`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

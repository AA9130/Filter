import type {
  Observation, PresenceLevel, QueryVisibility, VisibilityReport, VisibilityScoreConfig,
} from './types'

/**
 * Scoring.
 *
 * The model is deliberately simple and entirely configurable, because there is
 * no correct answer here — how much more valuable a citation is than a mention
 * is a business judgement, not a fact, and any model that pretends otherwise is
 * false precision. What matters is that the model is explicit, stable between
 * runs, and stored alongside the numbers it produced, so a trend line means
 * something.
 */
export const DEFAULT_SCORE_CONFIG: VisibilityScoreConfig = {
  weights: {
    absent: 0,
    mentioned: 1,
    cited: 2,
    recommended: 3,
    'top-recommendation': 4,
  },
  citationBonus: 1,
  firstPositionBonus: 1,
}

/** Maximum a single observation can score, used to normalise to 0–100. */
function maxScore(config: VisibilityScoreConfig): number {
  return config.weights['top-recommendation'] + config.citationBonus + config.firstPositionBonus
}

export function scoreObservation(
  observation: Observation,
  config: VisibilityScoreConfig = DEFAULT_SCORE_CONFIG,
): number {
  let score = config.weights[observation.presence] ?? 0
  if (observation.urlCited) score += config.citationBonus
  if (observation.position === 1) score += config.firstPositionBonus
  return score
}

const AT_LEAST: Record<PresenceLevel, number> = {
  absent: 0,
  mentioned: 1,
  cited: 2,
  recommended: 3,
  'top-recommendation': 4,
}

function rate(observations: Observation[], level: PresenceLevel): number {
  if (observations.length === 0) return 0
  const hits = observations.filter((o) => AT_LEAST[o.presence] >= AT_LEAST[level]).length
  return Number((hits / observations.length).toFixed(3))
}

export function summariseQuery(
  queryId: string,
  query: string,
  observations: Observation[],
  config: VisibilityScoreConfig = DEFAULT_SCORE_CONFIG,
): QueryVisibility {
  const max = maxScore(config)
  const scores = observations.map((o) => scoreObservation(o, config))
  const mean = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  const byPlatform: QueryVisibility['byPlatform'] = {}
  for (const observation of observations) {
    const platformScores = observations
      .filter((o) => o.platform === observation.platform)
      .map((o) => scoreObservation(o, config))
    byPlatform[observation.platform] = Math.round(
      (platformScores.reduce((a, b) => a + b, 0) / platformScores.length / max) * 100,
    )
  }

  const competitorCounts = new Map<string, number>()
  for (const observation of observations) {
    for (const competitor of observation.competitors) {
      competitorCounts.set(competitor, (competitorCounts.get(competitor) ?? 0) + 1)
    }
  }

  const dates = observations.map((o) => o.date).sort()

  return {
    queryId,
    query,
    observations: observations.length,
    visibilityScore: Math.round((mean / max) * 100),
    mentionRate: rate(observations, 'mentioned'),
    citationRate: rate(observations, 'cited'),
    recommendationRate: rate(observations, 'recommended'),
    byPlatform,
    topCompetitors: [...competitorCounts.entries()]
      .map(([name, appearances]) => ({ name, appearances }))
      .sort((a, b) => b.appearances - a.appearances)
      .slice(0, 8),
    lastObserved: dates.length > 0 ? dates[dates.length - 1] : null,
  }
}

/**
 * Share of voice: of every brand named across all observed answers, how often
 * was it us.
 *
 * This is the metric worth watching, more than the visibility score. A score
 * that rises while share of voice falls means the whole category is getting
 * more coverage and we are getting relatively less of it — which the absolute
 * number hides.
 */
export function shareOfVoice(observations: Observation[], ownName = 'AquaPure'): number {
  let own = 0
  let total = 0
  for (const observation of observations) {
    const mentioned = AT_LEAST[observation.presence] >= 1
    if (mentioned) own += 1
    total += (mentioned ? 1 : 0) + observation.competitors.length
  }
  void ownName
  return total === 0 ? 0 : Number((own / total).toFixed(3))
}

export function buildReport({
  observations,
  allQueries,
  blindSpots,
  config = DEFAULT_SCORE_CONFIG,
}: {
  observations: Observation[]
  allQueries: Array<{ id: string; query: string; priority: number }>
  blindSpots: VisibilityReport['blindSpots']
  config?: VisibilityScoreConfig
}): VisibilityReport {
  const byQuery = new Map<string, Observation[]>()
  for (const observation of observations) {
    const list = byQuery.get(observation.queryId) ?? []
    list.push(observation)
    byQuery.set(observation.queryId, list)
  }

  const tracked = [...byQuery.entries()].map(([queryId, list]) =>
    summariseQuery(queryId, list[0]?.query ?? queryId, list, config),
  )

  const unobserved = allQueries
    .filter((query) => !byQuery.has(query.id))
    .map((query) => ({ queryId: query.id, query: query.query, priority: query.priority }))
    .sort((a, b) => a.priority - b.priority)

  const competitorCounts = new Map<string, number>()
  for (const observation of observations) {
    for (const competitor of observation.competitors) {
      competitorCounts.set(competitor, (competitorCounts.get(competitor) ?? 0) + 1)
    }
  }
  const competitorTotal = [...competitorCounts.values()].reduce((a, b) => a + b, 0)

  const max = maxScore(config)
  const allScores = observations.map((o) => scoreObservation(o, config))

  return {
    generatedAt: new Date().toISOString(),
    tracked: tracked.sort((a, b) => b.visibilityScore - a.visibilityScore),
    unobserved,
    overall: {
      visibilityScore:
        allScores.length === 0
          ? 0
          : Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length / max) * 100),
      shareOfVoice: shareOfVoice(observations),
      citationRate: rate(observations, 'cited'),
      recommendationRate: rate(observations, 'recommended'),
      observationCount: observations.length,
    },
    competitorFrequency: [...competitorCounts.entries()]
      .map(([name, appearances]) => ({
        name,
        appearances,
        shareOfVoice: competitorTotal === 0 ? 0 : Number((appearances / competitorTotal).toFixed(3)),
      }))
      .sort((a, b) => b.appearances - a.appearances),
    blindSpots,
  }
}

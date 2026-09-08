/**
 * =============================================================================
 *  AI VISIBILITY TRACKING — types
 * =============================================================================
 *  What this measures: for a given query, on a given platform, on a given date
 *  — was AquaPure mentioned, was it cited with a URL, was it recommended, and
 *  who else was.
 *
 *  What it does NOT do is pretend to have APIs that do not exist. Google AI
 *  Overviews, ChatGPT, Gemini and Perplexity do not offer a "did you cite this
 *  domain" endpoint, and answers vary between users, sessions and days. So the
 *  adapter interface has an `availability` field, the manual adapter is the one
 *  that actually works today, and an adapter with no credentials reports that
 *  plainly instead of returning zeros that look like data.
 *
 *  Zeros that look like data are the specific failure this file is written to
 *  avoid — the same failure as "0+ Happy customers", one layer up.
 * =============================================================================
 */

export type Platform =
  | 'google'
  | 'google-ai-mode'
  | 'chatgpt'
  | 'gemini'
  | 'perplexity'
  | 'copilot'
  | 'claude'

/** Strength of presence in one answer, ascending. */
export type PresenceLevel = 'absent' | 'mentioned' | 'cited' | 'recommended' | 'top-recommendation'

export type Observation = {
  /** ISO date the observation was made. */
  date: string
  platform: Platform
  queryId: string
  query: string
  presence: PresenceLevel
  /** Whether a URL on this domain appeared in the answer's sources. */
  urlCited: string | null
  /** Position in the answer's recommendation order, when there is one. */
  position: number | null
  /** Competitors named in the same answer, in the order they appeared. */
  competitors: string[]
  /** The answer text, so a later reading can be re-scored against new rules. */
  answerText: string | null
  /** Every source URL the answer offered, ours and everyone else's. */
  sourceUrls: string[]
  /** How this observation was obtained. Provenance matters here too. */
  method: 'manual' | 'api' | 'imported'
  observedBy: string
  notes: string
}

export type VisibilityScoreConfig = {
  weights: Record<PresenceLevel, number>
  /** Extra credit for a cited URL on top of the presence level. */
  citationBonus: number
  /** Extra credit for being first among recommendations. */
  firstPositionBonus: number
}

export type QueryVisibility = {
  queryId: string
  query: string
  observations: number
  /** Mean weighted score, 0–100 normalised against the maximum. */
  visibilityScore: number
  mentionRate: number
  citationRate: number
  recommendationRate: number
  byPlatform: Partial<Record<Platform, number>>
  topCompetitors: Array<{ name: string; appearances: number }>
  lastObserved: string | null
}

export type VisibilityReport = {
  generatedAt: string
  /** Queries with at least one observation. */
  tracked: QueryVisibility[]
  /** Queries in the database that have never been observed. */
  unobserved: Array<{ queryId: string; query: string; priority: number }>
  overall: {
    visibilityScore: number
    shareOfVoice: number
    citationRate: number
    recommendationRate: number
    observationCount: number
  }
  competitorFrequency: Array<{ name: string; appearances: number; shareOfVoice: number }>
  /** Platforms with no adapter available, so the report says what it cannot see. */
  blindSpots: Array<{ platform: Platform; reason: string }>
}

export type AdapterAvailability =
  | { available: true }
  | { available: false; reason: string }

/**
 * A platform adapter. `check` is only callable when `availability()` reports
 * available — an adapter that cannot run must say so rather than return an
 * empty result, because an empty result is indistinguishable from "we are not
 * mentioned anywhere", and that would be a false conclusion drawn from a
 * missing credential.
 */
export type PlatformAdapter = {
  platform: Platform
  /** Human name for reports. */
  label: string
  availability(): AdapterAvailability
  check(query: { id: string; query: string }): Promise<Observation>
}

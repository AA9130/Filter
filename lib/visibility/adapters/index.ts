import type { AdapterAvailability, Observation, Platform, PlatformAdapter } from '../types'

/**
 * Platform adapters.
 *
 * Every adapter below except the manual one is unavailable, and says so.
 *
 * That is not a stub waiting to be filled in — it is the accurate state of the
 * world. None of Google AI Overviews, ChatGPT, Gemini, Perplexity or Copilot
 * expose an interface for "was this domain cited in your answer to this
 * question", and their answers are personalised and non-deterministic besides.
 * Anything claiming to automate this is either scraping a consumer interface —
 * against those services' terms, and fragile — or inferring it from something
 * else and not saying so.
 *
 * So the architecture is honest about it: `availability()` gates `check()`, an
 * unavailable adapter throws rather than returning an empty observation, and
 * the report lists unavailable platforms as explicit blind spots. A missing
 * credential must never read as "we are not mentioned".
 *
 * If a platform ships an API, implement `check` here and flip `availability`.
 * The scoring, storage and reporting above it need no changes.
 */

export class AdapterUnavailableError extends Error {
  constructor(platform: Platform, reason: string) {
    super(`[visibility] ${platform} adapter unavailable: ${reason}`)
    this.name = 'AdapterUnavailableError'
  }
}

function unavailable(
  platform: Platform,
  label: string,
  reason: string,
): PlatformAdapter {
  return {
    platform,
    label,
    availability: (): AdapterAvailability => ({ available: false, reason }),
    async check(): Promise<Observation> {
      throw new AdapterUnavailableError(platform, reason)
    },
  }
}

/**
 * The adapter that works: a person runs the query, reads the answer, and
 * records what they saw. Slow, entirely reliable, and the only method whose
 * provenance can be stated.
 *
 * `record` is what a CLI or a form calls. It does no inference — the presence
 * level is a human judgement, because "recommended" versus "mentioned" is a
 * reading of the answer's tone that a regex would get wrong in both directions.
 */
export const manualAdapter = {
  platform: 'manual' as const,
  label: 'Manual observation',
  availability: (): AdapterAvailability => ({ available: true }),

  record(input: Omit<Observation, 'method' | 'date'> & { date?: string }): Observation {
    return {
      ...input,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      method: 'manual',
    }
  },
}

const NO_API =
  'No public API exposes whether a given domain was cited in an answer. Answers are also personalised and non-deterministic, so a single automated sample would not be comparable between runs. Record observations manually — see docs/AI-VISIBILITY.md.'

export const adapters: PlatformAdapter[] = [
  unavailable(
    'google',
    'Google Search',
    'Classic ranking data is available through Google Search Console once the property is verified — use that rather than scraping. Connect it and import, see docs/AI-VISIBILITY.md.',
  ),
  unavailable('google-ai-mode', 'Google AI Mode / AI Overviews', NO_API),
  unavailable('chatgpt', 'ChatGPT', NO_API),
  unavailable('gemini', 'Google Gemini', NO_API),
  unavailable('perplexity', 'Perplexity', NO_API),
  unavailable('copilot', 'Microsoft Copilot', NO_API),
  unavailable('claude', 'Claude', NO_API),
]

export function adapterFor(platform: Platform): PlatformAdapter | undefined {
  return adapters.find((adapter) => adapter.platform === platform)
}

/** Platforms the report cannot see, with the reason, for the blind-spot list. */
export function blindSpots(): Array<{ platform: Platform; reason: string }> {
  return adapters.flatMap((adapter) => {
    const availability = adapter.availability()
    return availability.available
      ? []
      : [{ platform: adapter.platform, reason: availability.reason }]
  })
}

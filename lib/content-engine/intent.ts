import type { ExtractedEntities, Intent, PageKind } from './types'

/**
 * Intent classification and entity extraction.
 *
 * Deliberately rule-based rather than model-based. Two reasons: it is
 * deterministic, so the same query always produces the same brief and a
 * regression is visible in a diff; and it needs no API key, so the pipeline's
 * first three stages run in CI, in a test, and on a laptop with no network.
 *
 * A model would classify marginally better on unusual phrasings. It would also
 * make the stage that decides what the generator is allowed to know depend on a
 * generator — which is the wrong dependency direction for the one part of this
 * system whose job is restraint.
 */

const INTENT_SIGNALS: Array<{ intent: Intent; patterns: RegExp[] }> = [
  {
    intent: 'troubleshooting',
    patterns: [
      /\b(?:why is|why does|why do|not working|stopped|leak(?:ing|s)?|broken|fault|problem|noisy|smell(?:s|ing)?|low pressure|no water|slow)\b/i,
      /\b(?:fix|repair|troubleshoot|diagnose)\b/i,
    ],
  },
  {
    intent: 'transactional',
    patterns: [
      /\b(?:install(?:ation)?|installer|service|repair|replace(?:ment)?|maintenance|amc|book|hire|near me|company|supplier)\b/i,
    ],
  },
  {
    intent: 'commercial-investigation',
    patterns: [
      /\b(?:best|which|vs\.?|versus|compare|comparison|cost|price|how much|worth it|recommend|top|suitable|choose|choosing)\b/i,
    ],
  },
  {
    intent: 'informational',
    patterns: [
      /\b(?:what is|what are|how (?:does|do|often|to)|is .* safe|do i need|explain|guide|meaning|difference)\b/i,
    ],
  },
]

const EMIRATES: Array<{ slug: string; patterns: RegExp[] }> = [
  { slug: 'dubai', patterns: [/\bdubai\b/i, /\bmarina\b/i, /\bjvc\b/i, /\bdeira\b/i, /\bal barsha\b/i, /\bmirdif\b/i] },
  { slug: 'abu-dhabi', patterns: [/\babu dhabi\b/i, /\bkhalifa city\b/i, /\bmussafah\b/i, /\byas island\b/i, /\bal reem\b/i] },
  { slug: 'sharjah', patterns: [/\bsharjah\b/i, /\bal nahda\b/i, /\bal majaz\b/i, /\bmuweilah\b/i] },
  { slug: 'ajman', patterns: [/\bajman\b/i, /\bal nuaimiya\b/i, /\bemirates city\b/i] },
  { slug: 'ras-al-khaimah', patterns: [/\bras al khaimah\b/i, /\brak\b/i, /\bal hamra\b/i, /\bmina al arab\b/i] },
  { slug: 'fujairah', patterns: [/\bfujairah\b/i, /\bdibba\b/i] },
  { slug: 'umm-al-quwain', patterns: [/\bumm al quwain\b/i, /\buaq\b/i] },
]

const TECHNOLOGIES: Array<{ name: string; patterns: RegExp[] }> = [
  { name: 'reverse osmosis', patterns: [/\bro\b/i, /\breverse osmosis\b/i, /\bmembrane\b/i] },
  { name: 'ultraviolet disinfection', patterns: [/\buv\b/i, /\bultraviolet\b/i, /\bsteril/i, /\bdisinfect/i] },
  { name: 'ion-exchange softening', patterns: [/\bsoften(?:er|ing)?\b/i, /\bhard water\b/i, /\bion exchange\b/i, /\bresin\b/i] },
  { name: 'activated carbon', patterns: [/\bcarbon\b/i, /\bchlorine\b/i, /\btaste\b/i, /\bodour\b/i, /\bodor\b/i] },
  { name: 'sediment filtration', patterns: [/\bsediment\b/i, /\bsand\b/i, /\brust\b/i, /\bpre-?filter\b/i] },
  { name: 'whole-house filtration', patterns: [/\bwhole[- ]house\b/i, /\bwhole[- ]villa\b/i, /\bpoint of entry\b/i] },
]

const PROBLEMS: Array<{ name: string; patterns: RegExp[] }> = [
  { name: 'limescale', patterns: [/\blimescale\b/i, /\bscale\b/i, /\bhard water\b/i, /\bwhite (?:marks|deposit)/i] },
  { name: 'high TDS', patterns: [/\btds\b/i, /\bsalty\b/i, /\bdissolved solids\b/i] },
  { name: 'bad taste or odour', patterns: [/\btaste[sd]?\b/i, /\bsmell[sd]?\b/i, /\bodou?r\b/i, /\bchlorine\b/i] },
  { name: 'low water pressure', patterns: [/\blow (?:water )?pressure\b/i, /\bslow (?:flow|fill)\b/i, /\btrickle\b/i] },
  { name: 'leakage', patterns: [/\bleak(?:ing|s|age)?\b/i, /\bdrip(?:ping)?\b/i] },
  { name: 'cloudy or discoloured water', patterns: [/\bcloudy\b/i, /\byellow\b/i, /\bbrown\b/i, /\bmurky\b/i, /\bdiscolou?r/i] },
  { name: 'filter replacement due', patterns: [/\breplace(?:ment)?\b/i, /\bhow often\b/i, /\bcartridge\b/i, /\bchange\b/i] },
]

const SERVICE_SIGNALS: Array<{ slug: string; patterns: RegExp[] }> = [
  { slug: 'water-filter-installation', patterns: [/\binstall/i, /\bfit(?:ting|ted)?\b/i] },
  { slug: 'ro-water-purifier', patterns: [/\bro\b/i, /\breverse osmosis\b/i, /\bpurifier\b/i, /\btds\b/i] },
  { slug: 'whole-house-water-filtration', patterns: [/\bwhole[- ](?:house|villa)\b/i, /\bpoint of entry\b/i] },
  { slug: 'water-softener', patterns: [/\bsoften/i, /\blimescale\b/i, /\bhard water\b/i] },
  { slug: 'uv-water-purification', patterns: [/\buv\b/i, /\bultraviolet\b/i, /\bdisinfect/i, /\bsteril/i] },
  { slug: 'water-filter-replacement', patterns: [/\breplace/i, /\bcartridge\b/i, /\bmembrane\b/i, /\bspare/i] },
  { slug: 'water-filter-repair', patterns: [/\brepair\b/i, /\bleak/i, /\bfix\b/i, /\bfault\b/i, /\bnot working\b/i, /\blow pressure\b/i] },
  { slug: 'water-filter-amc', patterns: [/\bamc\b/i, /\bmaintenance\b/i, /\bcontract\b/i, /\bservicing\b/i] },
  { slug: 'system-relocation', patterns: [/\brelocat/i, /\bmov(?:e|ing)\b/i, /\bshift/i] },
  { slug: 'free-demo-consultation', patterns: [/\bfree\b/i, /\bdemo\b/i, /\bwater test\b/i, /\bconsult/i] },
]

const PRODUCT_SIGNALS: Array<{ slug: string; patterns: RegExp[] }> = [
  { slug: 'compact-under-sink-ro', patterns: [/\bunder[- ]sink\b/i, /\bcompact\b/i, /\bapartment\b/i] },
  { slug: 'slim-tankless-ro', patterns: [/\btankless\b/i, /\bslim\b/i, /\bno tank\b/i] },
  { slug: 'modular-ro-with-uv', patterns: [/\bmodular\b/i, /\bro (?:with|and) uv\b/i] },
  { slug: 'self-cleaning-villa-pre-filter', patterns: [/\bpre-?filter\b/i, /\bself[- ]cleaning\b/i, /\bsand\b/i] },
  { slug: 'whole-villa-filtration', patterns: [/\bvilla\b/i, /\bwhole[- ]villa\b/i] },
  { slug: 'chemical-free-disinfection', patterns: [/\bchemical[- ]free\b/i, /\bceramic\b/i] },
  { slug: 'automatic-water-softener', patterns: [/\bsoftener\b/i] },
]

function matchAll<T extends { patterns: RegExp[] }>(items: T[], text: string): T[] {
  return items.filter((item) => item.patterns.some((pattern) => pattern.test(text)))
}

/**
 * Primary intent plus everything else that fired. A query is usually more than
 * one thing — "best RO purifier in Dubai" is commercial, local and
 * transactional at once — and a brief that flattens it to one loses the reason
 * the page needs both a comparison and a booking path.
 */
export function classifyIntent(query: string): { primary: Intent; secondary: Intent[] } {
  const matched = INTENT_SIGNALS.filter((signal) =>
    signal.patterns.some((pattern) => pattern.test(query)),
  ).map((signal) => signal.intent)

  const isLocal = EMIRATES.some((e) => e.patterns.some((p) => p.test(query)))
  const all = isLocal ? [...matched, 'local' as Intent] : matched

  // Order matters: the most specific intent that fired wins as primary, because
  // a troubleshooting query dressed as a question is still troubleshooting.
  const PRIORITY: Intent[] = [
    'troubleshooting',
    'commercial-investigation',
    'transactional',
    'informational',
    'local',
    'navigational',
  ]

  const primary = PRIORITY.find((intent) => all.includes(intent)) ?? 'informational'
  return { primary, secondary: [...new Set(all)].filter((intent) => intent !== primary) }
}

export function extractEntities(query: string): ExtractedEntities {
  const services = matchAll(SERVICE_SIGNALS, query).map((s) => s.slug)
  const products = matchAll(PRODUCT_SIGNALS, query).map((p) => p.slug)
  const locations = matchAll(EMIRATES, query).map((e) => e.slug)
  const problems = matchAll(PROBLEMS, query).map((p) => p.name)
  const technologies = matchAll(TECHNOLOGIES, query).map((t) => t.name)

  // The primary entity is the most specific thing named. Technology beats
  // problem beats service beats location, because "RO in Dubai" is a page about
  // RO that mentions Dubai, not a page about Dubai that mentions RO.
  const primary =
    technologies[0] ?? problems[0] ?? services[0] ?? locations[0] ?? 'water filtration'

  return { primary, services, products, locations, problems, technologies }
}

/**
 * What shape of page a topic wants. A comparison or a symptom is a guide; a
 * "near me" is a location page; a named service is a service page. Getting this
 * wrong is how sites end up with a blog post competing against their own
 * service page for the same query.
 */
export function inferPageKind(query: string, intent: Intent, entities: ExtractedEntities): PageKind {
  if (/\bvs\.?\b|\bversus\b|\bcompare\b|\bdifference\b/i.test(query)) return 'guide'
  if (intent === 'troubleshooting') return 'guide'
  if (intent === 'informational') return 'guide'

  // A query phrased as a question wants an answer, not a service page — even
  // when it names a service. "How much does RO installation cost in Dubai"
  // mentions installation and Dubai, but a reader asking it wants the factors
  // that drive the price, and pointing them at the service page answers a
  // question they did not ask. This is also how a site avoids a guide and a
  // service page competing for the same query.
  if (/^(?:how|what|why|when|which|is|are|do|does|can|should)\b/i.test(query.trim())) {
    return 'guide'
  }
  if (intent === 'transactional' && entities.locations.length > 0 && entities.services.length === 0) {
    return 'location'
  }
  if (entities.products.length > 0 && entities.services.length === 0) return 'product'
  if (entities.services.length > 0) return 'service'
  return 'guide'
}

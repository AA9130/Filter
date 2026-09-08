import { site, absoluteUrl } from '@/lib/site'

/**
 * robots.txt as a route handler rather than Next's `robots.ts` metadata file,
 * for one reason: comments. This file is read by the site owner and by whoever
 * inherits it, and a crawler policy nobody understands is a crawler policy
 * somebody eventually breaks. The generator cannot emit comments.
 *
 * Policy: everything public is crawlable, by search crawlers and by AI answer
 * engines alike. Only /api/ is closed, because it has no indexable content.
 *
 * On the AI crawlers specifically — being listed here does not make AquaPure
 * appear in any AI answer. All this does is remove a reason to be excluded.
 * Every one of these agents is an independent system with its own selection
 * criteria, and none of them publish them.
 */

const SEARCH_CRAWLERS = [
  'Googlebot',
  'Googlebot-Image',
  'Bingbot',
  'Applebot',
  'DuckDuckBot',
  'Slurp',
  'YandexBot',
  'Baiduspider',
]

/**
 * AI and answer-engine agents, grouped by what they are actually for. The
 * distinction matters if the owner ever wants to allow retrieval but not
 * training: the "user-triggered fetch" and "search index" agents are what put a
 * page into an answer, and the training agents are not.
 */
const AI_AGENTS: Array<{ agent: string; note: string }> = [
  // Retrieval and answer-engine indexes — these are the ones that matter for
  // being cited in an answer.
  { agent: 'OAI-SearchBot', note: 'OpenAI — ChatGPT Search index' },
  { agent: 'ChatGPT-User', note: 'OpenAI — fetch triggered by a user asking about a page' },
  { agent: 'PerplexityBot', note: 'Perplexity — search index' },
  { agent: 'Perplexity-User', note: 'Perplexity — user-triggered fetch' },
  { agent: 'Claude-SearchBot', note: 'Anthropic — search index' },
  { agent: 'Claude-User', note: 'Anthropic — user-triggered fetch' },
  { agent: 'Google-Extended', note: 'Google — Gemini grounding and AI features (a robots token, not a crawler)' },
  { agent: 'Applebot-Extended', note: 'Apple — Apple Intelligence' },
  { agent: 'MistralAI-User', note: 'Mistral — user-triggered fetch' },
  { agent: 'Amazonbot', note: 'Amazon — Alexa and related answers' },
  { agent: 'meta-externalagent', note: 'Meta — AI and search' },
  // Model-training crawlers. Allowed here because the business wants maximum
  // eligibility; this is the line to change if that position ever changes.
  { agent: 'GPTBot', note: 'OpenAI — model training' },
  { agent: 'ClaudeBot', note: 'Anthropic — model training' },
  { agent: 'CCBot', note: 'Common Crawl — feeds many downstream datasets' },
]

export const dynamic = 'force-static'

export function GET(): Response {
  const lines: string[] = [
    `# robots.txt for ${site.name} — ${site.url}`,
    '# Policy: all public pages are open to search crawlers and AI answer engines.',
    '# Only /api/ is closed; it serves no indexable content.',
    '# See docs/SEO-ARCHITECTURE.md for the reasoning behind this file.',
    '',
    '# --- Default: everything, for everyone -----------------------------------',
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    '# --- Search crawlers, named explicitly -----------------------------------',
    '# Naming them is defensive: a future edit that tightens the wildcard rule',
    '# cannot accidentally take these with it.',
  ]

  for (const agent of SEARCH_CRAWLERS) {
    lines.push('', `User-agent: ${agent}`, 'Allow: /', 'Disallow: /api/')
  }

  lines.push(
    '',
    '# --- AI and answer-engine agents -----------------------------------------',
    '# Allowing an agent does not cause AquaPure to appear in its answers. It',
    '# only removes a reason to be excluded. Each system decides for itself.',
  )

  for (const { agent, note } of AI_AGENTS) {
    lines.push('', `# ${note}`, `User-agent: ${agent}`, 'Allow: /', 'Disallow: /api/')
  }

  lines.push(
    '',
    '# --- Discovery ------------------------------------------------------------',
    `Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    `Host: ${site.url.replace(/^https?:\/\//, '')}`,
    '',
    '# A plain-text summary of the business, its services, locations and guides,',
    '# for systems that prefer one document to a crawl:',
    `# ${absoluteUrl('/llms.txt')}`,
    '',
  )

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}

/**
 * Post-build SEO/GEO audit.
 *
 * Reads the prerendered HTML and reports on what a crawler would actually
 * receive — titles, descriptions, canonicals, heading structure, schema types,
 * internal links, image alts, and any unverified claim that has leaked into a
 * page.
 *
 * Distinct from the test suite on purpose: the tests assert invariants and
 * fail, this prints a picture and exits non-zero only on a real problem. The
 * report is what you read before a launch; the tests are what stop a
 * regression.
 *
 *   npm run build && npm run audit:seo
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { absoluteUrl, site } from '@/lib/site'
import { claimsNeedingVerification } from '@/lib/claims'

const BUILD = join(process.cwd(), '.next', 'server', 'app')

if (!existsSync(BUILD)) {
  console.error('\nNo build found. Run `npm run build` first.\n')
  process.exit(1)
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : []
  })
}

type Page = {
  path: string
  html: string
  title: string | null
  description: string | null
  canonical: string | null
  h1Count: number
  h2Count: number
  schemaTypes: string[]
  internalLinks: number
  images: number
  imagesWithoutAlt: number
  words: number
}

const FORBIDDEN: Array<[RegExp, string]> = [
  [/12,000/, 'customer count'],
  [/\b4\.9\s?\/\s?5\b/, 'average rating'],
  [/1,284/, 'review count'],
  // Naming NSF is allowed — the site teaches readers how to read the badge.
  // Claiming it for AquaPure is not. See UNSCOPED_NSF below for the other half.
  [/(?:we|our|us|AquaPure)[^.<]{0,80}\b(?:NSF|WQA)[\s/-]*(?:certified|approved)/i,
    'NSF certification as its own'],
  [/\bESMA\b/, 'ESMA approval'],
  [/Dubai Municipality (?:Compl|plumbing|approv)/i, 'municipality compliance'],
  [/fully insured/i, 'technician insurance'],
  [/DED trade licence/i, 'trade licence'],
  [/Certified [Tt]echnicians/, 'technician certification'],
  [/\bAED\s?\d/, 'a published price'],
]

/**
 * The scoping language that has to travel with any mention of NSF.
 *
 * Mirrors DISCUSSABLE_CLAIMS in lib/claims.ts, which is the authority. The
 * duplication is deliberate: this script audits built HTML, where record-level
 * provenance is gone, so it checks the property that must hold on the page.
 */
const UNSCOPED_NSF =
  /material requirements only|material safety and structural integrity only|certifies nothing about what|does not certify/i

function analyse(file: string): Page {
  const rel = relative(BUILD, file).replace(/\.html$/, '')
  const html = readFileSync(file, 'utf8')
  const path = rel === 'index' ? '/' : `/${rel}`

  const schemaTypes = new Set<string>()
  for (const block of html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs) ?? []) {
    const raw = block
      .replace(/^<script type="application\/ld\+json">/, '')
      .replace(/<\/script>$/, '')
      .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    try {
      const parsed = JSON.parse(raw) as { '@graph'?: Array<{ '@type'?: unknown }> }
      for (const node of parsed['@graph'] ?? []) {
        const type = node['@type']
        schemaTypes.add(Array.isArray(type) ? type.join('+') : String(type))
      }
    } catch {
      schemaTypes.add('INVALID')
    }
  }

  const images = html.match(/<img\b[^>]*>/g) ?? []
  const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')

  return {
    path,
    html,
    title: html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null,
    description: html.match(/name="description" content="([^"]*)"/)?.[1] ?? null,
    canonical: html.match(/rel="canonical" href="([^"]*)"/)?.[1] ?? null,
    h1Count: (html.match(/<h1[\s>]/g) ?? []).length,
    h2Count: (html.match(/<h2[\s>]/g) ?? []).length,
    schemaTypes: [...schemaTypes],
    internalLinks: (html.match(/href="\/[^"]*"/g) ?? []).length,
    images: images.length,
    imagesWithoutAlt: images.filter((image) => !/\salt="/.test(image)).length,
    words: text.split(/\s+/).filter((word) => word.length > 1).length,
  }
}

const pages = walk(BUILD).map(analyse).sort((a, b) => a.path.localeCompare(b.path))
const problems: string[] = []
const notes: string[] = []

console.log(`\n╭─ SEO / GEO AUDIT ─────────────────────────────────────────────────────`)
console.log(`│  ${site.url}`)
console.log(`│  ${pages.length} prerendered pages`)
console.log(`╰───────────────────────────────────────────────────────────────────────\n`)

const pad = (value: string | number, width: number) => String(value).padEnd(width)
console.log(
  `${pad('page', 44)}${pad('title', 6)}${pad('h1', 4)}${pad('h2', 4)}${pad('words', 7)}${pad('links', 7)}${pad('img', 5)}schema`,
)
console.log('─'.repeat(120))

for (const page of pages) {
  const titleLength = page.title?.length ?? 0
  const titleFlag = !page.title ? 'MISS' : titleLength > 65 ? 'long' : titleLength < 20 ? 'short' : 'ok'
  console.log(
    pad(page.path, 44) +
      pad(titleFlag, 6) +
      pad(page.h1Count, 4) +
      pad(page.h2Count, 4) +
      pad(page.words, 7) +
      pad(page.internalLinks, 7) +
      pad(page.images, 5) +
      page.schemaTypes.filter((type) => type !== 'WebSite').join(', '),
  )

  const where = page.path
  if (!page.title) problems.push(`${where}: no <title>`)
  if (!page.description) problems.push(`${where}: no meta description`)
  if (!page.canonical) problems.push(`${where}: no canonical`)
  else if (page.canonical !== absoluteUrl(where) && !where.startsWith('/_')) {
    problems.push(`${where}: canonical is ${page.canonical}, expected ${absoluteUrl(where)}`)
  }
  if (page.h1Count !== 1) problems.push(`${where}: ${page.h1Count} h1 elements (expected 1)`)
  if (page.imagesWithoutAlt > 0) problems.push(`${where}: ${page.imagesWithoutAlt} image(s) with no alt`)
  if (page.schemaTypes.includes('INVALID')) problems.push(`${where}: JSON-LD does not parse`)
  if (!page.schemaTypes.some((type) => type.includes('Organization'))) {
    problems.push(`${where}: does not reference the organisation entity`)
  }
  if (!page.html.includes(`${site.url}/#organization`) && !where.startsWith('/_')) {
    problems.push(`${where}: organisation @id missing`)
  }

  for (const [pattern, what] of FORBIDDEN) {
    if (pattern.test(page.html)) problems.push(`${where}: publishes ${what} — an unverified claim`)
  }

  // A page may name NSF only while narrowing what the certification covers.
  // Naming it and leaving the reader to assume it certifies performance is the
  // misleading case, and it is the one this catches.
  if (/\bNSF\b/.test(page.html) && !UNSCOPED_NSF.test(page.html)) {
    problems.push(
      `${where}: names NSF without narrowing what the certification covers — ` +
        `add the scoping language or remove the mention`,
    )
  }

  if (titleLength > 65) notes.push(`${where}: title is ${titleLength} chars and will be truncated`)
  if ((page.description?.length ?? 0) > 165) {
    notes.push(`${where}: description is ${page.description?.length} chars and will be truncated`)
  }
  if (page.words < 300 && !where.startsWith('/_')) {
    notes.push(`${where}: only ${page.words} words of rendered text`)
  }
  if (page.internalLinks < 10 && !where.startsWith('/_')) {
    notes.push(`${where}: only ${page.internalLinks} internal links`)
  }
}

/* --- Coverage of the schema surface -------------------------------------- */
const allSchema = new Set(pages.flatMap((page) => page.schemaTypes))
console.log(`\nschema types in use: ${[...allSchema].sort().join(', ')}`)

for (const expected of ['Organization+LocalBusiness', 'WebSite', 'BreadcrumbList', 'FAQPage', 'Service', 'Product', 'TechArticle', 'CollectionPage']) {
  if (!allSchema.has(expected)) problems.push(`no page emits ${expected}`)
}

/* --- Claims still outstanding -------------------------------------------- */
const outstanding = claimsNeedingVerification()
console.log(`\n${outstanding.length} claim(s) awaiting verification — these are suppressed from every page:`)
for (const claim of outstanding) {
  console.log(`  · [${claim.status}] ${claim.id}`)
}

/* --- Verdict -------------------------------------------------------------- */
if (notes.length > 0) {
  console.log(`\n${notes.length} note(s):`)
  for (const note of notes.slice(0, 25)) console.log(`  ! ${note}`)
  if (notes.length > 25) console.log(`  … and ${notes.length - 25} more`)
}

if (problems.length > 0) {
  console.log(`\n${problems.length} problem(s):`)
  for (const problem of problems) console.log(`  ✗ ${problem}`)
  console.log()
  process.exit(1)
}

console.log(`\n✓ no problems found across ${pages.length} pages\n`)

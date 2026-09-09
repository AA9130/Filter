import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import sitemap from '@/app/sitemap'
import { GET as robotsGet } from '@/app/robots.txt/route'
import { GET as llmsGet } from '@/app/llms.txt/route'
import { site, absoluteUrl } from '@/lib/site'
import { getServices, getProducts, getLocations, getGuides } from '@/lib/content'

/**
 * The three generated text routes, tested by invoking the route handlers
 * directly. No server, no build — if the sitemap omits a page or robots blocks
 * a crawler, this fails in milliseconds.
 */

describe('sitemap.xml', () => {
  test('includes every page that should be indexed', async () => {
    const entries = await sitemap()
    const urls = new Set(entries.map((entry) => entry.url))

    const [services, products, locations, guides] = await Promise.all([
      getServices(), getProducts(), getLocations(), getGuides(),
    ])

    for (const path of ['/', '/services', '/products', '/locations', '/guides', '/faqs', '/about', '/contact']) {
      assert.ok(urls.has(absoluteUrl(path)), `sitemap is missing ${path}`)
    }
    for (const service of services) {
      assert.ok(urls.has(absoluteUrl(`/services/${service.slug}`)), `missing service ${service.slug}`)
    }
    for (const product of products) {
      assert.ok(urls.has(absoluteUrl(`/products/${product.slug}`)), `missing product ${product.slug}`)
    }
    for (const location of locations) {
      assert.ok(urls.has(absoluteUrl(`/locations/${location.slug}`)), `missing location ${location.slug}`)
    }
    for (const guide of guides) {
      assert.ok(urls.has(absoluteUrl(`/guides/${guide.slug}`)), `missing guide ${guide.slug}`)
    }
  })

  test('excludes what must not be indexed', async () => {
    const entries = await sitemap()
    for (const entry of entries) {
      assert.doesNotMatch(entry.url, /\/api\//, `API route in sitemap: ${entry.url}`)
      assert.doesNotMatch(entry.url, /\/pipeline\//, `pipeline record in sitemap: ${entry.url}`)
      assert.doesNotMatch(entry.url, /[?#]/, `query or fragment in sitemap: ${entry.url}`)
    }
  })

  test('every URL is canonical: https, no www, no trailing slash', async () => {
    for (const entry of await sitemap()) {
      assert.ok(entry.url.startsWith(site.url), `not on the canonical origin: ${entry.url}`)
      assert.doesNotMatch(entry.url, /www\./)
      assert.doesNotMatch(entry.url, /\/$/, `trailing slash: ${entry.url}`)
    }
  })

  test('no duplicate URLs', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)
    assert.equal(new Set(urls).size, urls.length, 'the sitemap lists a URL twice')
  })

  test('guides carry their real updated date, not the build date', async () => {
    // A lastmod that moves on every deploy tells a crawler the whole site
    // changed when it did not, and stops being believed.
    const entries = await sitemap()
    const guides = await getGuides()
    for (const guide of guides) {
      const entry = entries.find((e) => e.url === absoluteUrl(`/guides/${guide.slug}`))
      assert.ok(entry)
      const lastmod = new Date(entry.lastModified as Date).toISOString().slice(0, 10)
      assert.equal(lastmod, guide.updated, `${guide.slug}: lastmod is not the guide's updated date`)
    }
  })

  test('priorities are sane and homepage is highest', async () => {
    const entries = await sitemap()
    const home = entries.find((entry) => entry.url === site.url)
    assert.equal(home?.priority, 1)
    for (const entry of entries) {
      assert.ok((entry.priority ?? 0) > 0 && (entry.priority ?? 0) <= 1, `bad priority: ${entry.url}`)
    }
  })
})

describe('robots.txt', () => {
  const body = async () => await robotsGet().text()

  test('allows the wildcard agent and blocks only /api/', async () => {
    const text = await body()
    assert.match(text, /User-agent: \*\nAllow: \/\nDisallow: \/api\//)
    // Nothing else may be disallowed — a stray Disallow is how a site
    // deindexes itself quietly.
    const disallows = [...text.matchAll(/^Disallow: (.+)$/gm)].map((match) => match[1].trim())
    assert.deepEqual([...new Set(disallows)], ['/api/'])
  })

  test('does not block any search crawler', async () => {
    const text = await body()
    for (const agent of ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot', 'YandexBot']) {
      const block = text.match(new RegExp(`User-agent: ${agent}\\n(.*\\n)*?\\n`))
      assert.ok(block, `${agent} is not named in robots.txt`)
      assert.match(block[0], /Allow: \//, `${agent} is not allowed`)
    }
  })

  test('does not block any AI answer engine', async () => {
    // Being listed here does not cause AquaPure to appear in any AI answer.
    // It only removes a reason to be excluded.
    const text = await body()
    for (const agent of [
      'OAI-SearchBot', 'ChatGPT-User', 'GPTBot',
      'PerplexityBot', 'Perplexity-User',
      'ClaudeBot', 'Claude-User', 'Claude-SearchBot',
      'Google-Extended', 'Applebot-Extended', 'meta-externalagent',
    ]) {
      assert.ok(text.includes(`User-agent: ${agent}`), `${agent} is not named in robots.txt`)
    }
  })

  test('points at the sitemap and llms.txt on the canonical host', async () => {
    const text = await body()
    assert.ok(text.includes(`Sitemap: ${absoluteUrl('/sitemap.xml')}`))
    assert.ok(text.includes(absoluteUrl('/llms.txt')))
    assert.ok(text.includes(`Host: ${site.url.replace('https://', '')}`))
  })

  test('is served as plain text', () => {
    assert.match(robotsGet().headers.get('Content-Type') ?? '', /text\/plain/)
  })
})

describe('llms.txt', () => {
  test('describes the business, its services, locations and guides', async () => {
    const text = await (await llmsGet()).text()
    const [services, locations, guides] = await Promise.all([
      getServices(), getLocations(), getGuides(),
    ])

    assert.ok(text.startsWith(`# ${site.name}`))
    assert.ok(text.includes(site.phone.e164))
    assert.ok(text.includes(site.email))

    for (const service of services) {
      assert.ok(text.includes(service.title), `llms.txt omits the service ${service.title}`)
    }
    for (const location of locations) {
      assert.ok(text.includes(location.name), `llms.txt omits ${location.name}`)
      assert.ok(text.includes(location.utility), `llms.txt omits ${location.name}'s utility`)
    }
    for (const guide of guides) {
      assert.ok(text.includes(guide.title), `llms.txt omits the guide ${guide.title}`)
    }
  })

  test('states what is deliberately NOT claimed', async () => {
    // A document that says why it has no rating is more useful to a system
    // assessing reliability than one that simply omits the topic.
    const text = await (await llmsGet()).text()
    for (const statement of [
      'No customer count, average rating, review count',
      'No certification, licence, insurance',
      'No prices, price ranges',
      'No TDS, hardness or water-quality figure',
      'No claim to be the best',
      'No health or medical outcome',
    ]) {
      assert.ok(text.includes(statement), `llms.txt does not disclaim: ${statement}`)
    }
  })

  test('contains no unverified claim', async () => {
    const { screenText } = await import('@/lib/claims')
    const text = await (await llmsGet()).text()
    // The disclaimer block deliberately names the things not claimed, so screen
    // only the part above it, which is the part that asserts things.
    const asserted = text.split('The following are NOT claimed')[0]
    // llms.txt reproduces every FAQ answer, including the one that explains what
    // an NSF badge does and does not certify. That mention is forgiven only
    // because the scoping language travels with it — screenText re-checks that
    // here rather than taking the exemption on trust.
    const violations = screenText(asserted, ['nsf_wqa_certified_media'])
    assert.deepEqual(
      violations.map((violation) => violation.claimId),
      [],
      `llms.txt asserts blocked claims: ${JSON.stringify(violations)}`,
    )
  })
})

import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { site, absoluteUrl, isRealProfileUrl } from '@/lib/site'
import { buildMetadata } from '@/lib/seo'
import { PHOTOGRAPHIC_KEYS } from '@/lib/images'

/**
 * SEO tests in two halves.
 *
 * The first half tests the builders directly — pure functions, no build needed.
 *
 * The second half reads the PRERENDERED HTML in .next/server/app and asserts on
 * what a crawler would actually receive. That distinction matters: a metadata
 * object that looks right in a unit test and a `<link rel="canonical">` that
 * reaches the page are different facts, and it was the second one that was
 * broken before (the counter rendered "0+" server-side while the content said
 * 12,000+). Testing the output is the only way to catch that class of bug.
 *
 * The HTML half skips itself when there is no build, so `npm test` works on a
 * clean checkout. `npm run verify` builds first, so CI always runs it.
 */

const BUILD_DIR = join(process.cwd(), '.next', 'server', 'app')
const hasBuild = existsSync(BUILD_DIR)

describe('URL construction', () => {
  test('the canonical origin is https and has no trailing slash', () => {
    assert.match(site.url, /^https:\/\//)
    assert.doesNotMatch(site.url, /\/$/)
  })

  test('absoluteUrl produces one shape for every path', () => {
    assert.equal(absoluteUrl('/'), site.url)
    assert.equal(absoluteUrl('/services'), `${site.url}/services`)
    assert.equal(absoluteUrl('services'), `${site.url}/services`)
    assert.equal(absoluteUrl('/services/'), `${site.url}/services`)
    assert.equal(absoluteUrl('//services//'), `${site.url}/services`)
  })

  test('an absolute URL passes through unchanged', () => {
    assert.equal(absoluteUrl('https://example.com/x'), 'https://example.com/x')
  })

  test('bare-domain profile URLs are rejected for sameAs', () => {
    for (const bad of [
      'https://facebook.com/', 'https://facebook.com', 'https://instagram.com/',
      'http://www.facebook.com/aquapure', 'not a url', '',
    ]) {
      assert.equal(isRealProfileUrl(bad), false, `should reject: ${bad}`)
    }
    for (const good of [
      'https://www.facebook.com/aquapureuae',
      'https://www.google.com/maps/place/aquapure',
    ]) {
      assert.equal(isRealProfileUrl(good), true, `should accept: ${good}`)
    }
  })
})

describe('metadata builder', () => {
  test('sets a canonical, OpenGraph and Twitter card', () => {
    const meta = buildMetadata({
      title: 'Test', description: 'A description long enough to be plausible.', path: '/x',
    })
    assert.equal(meta.alternates?.canonical, `${site.url}/x`)
    assert.equal(meta.openGraph?.url, `${site.url}/x`)
    assert.equal((meta.twitter as { card?: string } | undefined)?.card, 'summary_large_image')
  })

  test('emits no keywords meta tag', () => {
    // Google has ignored it for two decades, and the previous implementation
    // shipped the same twelve keywords on every page — the textbook shape of
    // keyword stuffing.
    const meta = buildMetadata({ title: 'T', description: 'D', path: '/' })
    assert.equal((meta as Record<string, unknown>).keywords, undefined)
  })

  test('an article carries its dates', () => {
    const meta = buildMetadata({
      title: 'T', description: 'D', path: '/guides/x', type: 'article',
      published: '2026-01-01', modified: '2026-02-01', authorName: 'Team',
    })
    const og = meta.openGraph as Record<string, unknown>
    assert.equal(og.publishedTime, '2026-01-01')
    assert.equal(og.modifiedTime, '2026-02-01')
  })
})

/* --- The prerendered output ----------------------------------------------- */

type Page = { file: string; path: string; html: string }
let pages: Page[] = []

before(() => {
  if (!hasBuild) return
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry)
      return statSync(full).isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : []
    })

  pages = walk(BUILD_DIR).map((file) => {
    const rel = relative(BUILD_DIR, file).replace(/\.html$/, '')
    return {
      file: rel,
      path: rel === 'index' ? '/' : `/${rel}`,
      html: readFileSync(file, 'utf8'),
    }
  })
})

describe('prerendered HTML', { skip: hasBuild ? false : 'no build — run `npm run build` first' }, () => {
  const indexable = () => pages.filter((page) => !page.file.startsWith('_'))

  test('the build produced the expected page set', () => {
    const paths = new Set(pages.map((page) => page.path))
    for (const required of [
      '/', '/services', '/products', '/locations', '/guides', '/faqs', '/about', '/contact',
      '/services/ro-water-purifier', '/services/water-filter-installation',
      '/locations/dubai', '/locations/abu-dhabi', '/locations/umm-al-quwain',
      '/guides/ro-vs-uv-water-purifier', '/guides/is-uae-tap-water-safe-to-drink',
      '/products/compact-under-sink-ro',
    ]) {
      assert.ok(paths.has(required), `missing prerendered page: ${required}`)
    }
    assert.ok(pages.length >= 40, `only ${pages.length} pages prerendered`)
  })

  test('every page has a title, description and canonical', () => {
    for (const page of indexable()) {
      assert.match(page.html, /<title>[^<]{10,}<\/title>/, `${page.path}: no usable title`)
      assert.match(
        page.html,
        /name="description" content="[^"]{50,}"/,
        `${page.path}: no usable meta description`,
      )
      const canonical = page.html.match(/rel="canonical" href="([^"]+)"/)
      assert.ok(canonical, `${page.path}: no canonical`)
      assert.equal(canonical[1], absoluteUrl(page.path), `${page.path}: canonical points elsewhere`)
    }
  })

  test('every page has exactly one h1', () => {
    for (const page of pages) {
      const count = (page.html.match(/<h1[\s>]/g) ?? []).length
      assert.equal(count, 1, `${page.path}: ${count} h1 elements`)
    }
  })

  test('no canonical uses www or http', () => {
    for (const page of pages) {
      const canonicals = page.html.match(/rel="canonical" href="([^"]+)"/g) ?? []
      for (const canonical of canonicals) {
        assert.doesNotMatch(canonical, /www\./, `${page.path}: www in canonical`)
        assert.doesNotMatch(canonical, /http:\/\//, `${page.path}: http in canonical`)
      }
    }
  })

  test('every page carries a valid JSON-LD graph', () => {
    for (const page of pages) {
      const blocks = page.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs) ?? []
      assert.ok(blocks.length > 0, `${page.path}: no JSON-LD`)

      for (const block of blocks) {
        const raw = block
          .replace(/^<script type="application\/ld\+json">/, '')
          .replace(/<\/script>$/, '')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
        let parsed: { '@context'?: string; '@graph'?: unknown[] }
        assert.doesNotThrow(() => { parsed = JSON.parse(raw) }, `${page.path}: JSON-LD does not parse`)
        parsed = JSON.parse(raw)
        assert.equal(parsed['@context'], 'https://schema.org', `${page.path}: bad @context`)
        assert.ok(Array.isArray(parsed['@graph']) && parsed['@graph'].length > 0, `${page.path}: empty @graph`)
        for (const node of parsed['@graph'] as Array<{ '@type'?: unknown }>) {
          assert.ok(node['@type'], `${page.path}: JSON-LD node with no @type`)
        }
      }
    }
  })

  test('every page references the single organisation entity', () => {
    // One @id, everywhere. A crawler resolving forty pages should accumulate
    // evidence about one business, not reconcile forty descriptions of it.
    for (const page of pages) {
      assert.ok(
        page.html.includes(`${site.url}/#organization`),
        `${page.path}: does not reference the canonical organisation @id`,
      )
    }
  })

  test('no unverified claim reaches any page', () => {
    // The regression test for the whole exercise. Each of these was on the
    // live site and none has evidence on file.
    const forbidden: Array<[RegExp, string]> = [
      [/12,000/, 'customer count'],
      [/\b4\.9\s?\/\s?5\b/, 'average rating'],
      [/1,284/, 'review count'],
      [/\bNSF\b/, 'NSF certification'],
      [/\bESMA\b/, 'ESMA approval'],
      [/Dubai Municipality (?:Compl|plumbing|approv)/i, 'municipality compliance'],
      [/fully insured/i, 'technician insurance'],
      [/DED trade licence/i, 'trade licence'],
      [/Certified [Tt]echnicians/, 'technician certification'],
      [/Licensed UAE [Bb]usiness/, 'business licence'],
      [/\bAED\s?\d/, 'a published price'],
      [/postalCode/, 'a fabricated postal code'],
    ]
    for (const page of pages) {
      for (const [pattern, what] of forbidden) {
        assert.doesNotMatch(page.html, pattern, `${page.path} publishes ${what}`)
      }
    }
  })

  test('no stat renders as zero', () => {
    // The specific bug: AnimatedCounter initialised at 0, so the prerendered
    // HTML said "0+ Happy customers" while the content said 12,000+.
    for (const page of pages) {
      assert.doesNotMatch(page.html, />0<\/span>\s*<!-- -->\+/, `${page.path}: a counter rendered 0+`)
      for (const label of ['Happy customers', 'Emirates covered', 'Years experience', 'Average rating']) {
        assert.ok(!page.html.includes(label), `${page.path}: ungated stat label "${label}"`)
      }
    }
  })

  test('every image has an alt attribute', () => {
    for (const page of pages) {
      const images = page.html.match(/<img\b[^>]*>/g) ?? []
      for (const image of images) {
        assert.match(image, /\salt="/, `${page.path}: <img> with no alt — ${image.slice(0, 90)}`)
      }
    }
  })

  test('every image declares dimensions or fill, so nothing shifts on load', () => {
    for (const page of pages) {
      const images = page.html.match(/<img\b[^>]*>/g) ?? []
      for (const image of images) {
        const sized = /\swidth="/.test(image) && /\sheight="/.test(image)
        const filled = /position:absolute/.test(image) || /\ssizes="100vw"/.test(image)
        assert.ok(sized || filled, `${page.path}: <img> with no dimensions — ${image.slice(0, 90)}`)
      }
    }
  })

  test('a FAQ answer is in the markup, not behind a click', () => {
    const faqs = pages.find((page) => page.path === '/faqs')
    assert.ok(faqs)
    // Answers live in the <details> body whether or not it is open, which is
    // what makes them readable by a crawler that does not execute JavaScript.
    assert.ok(
      faqs.html.includes('Desalinated') || faqs.html.includes('desalination'),
      'FAQ answer text is not in the prerendered markup',
    )
    const detailsCount = (faqs.html.match(/<details/g) ?? []).length
    assert.ok(detailsCount >= 25, `only ${detailsCount} FAQ items rendered`)
  })

  test('location pages do not share their body copy', () => {
    const locations = pages.filter((page) => page.path.startsWith('/locations/'))
    assert.equal(locations.length, 7)
    // Take a long, distinctive slice of each page's rendered prose and assert
    // no two match — the mechanical test for doorway pages.
    const fingerprints = locations.map((page) => {
      const paragraphs = [...page.html.matchAll(/<p class="mt-4 text-base leading-relaxed text-ink-soft">([^<]{120,})</g)]
      return paragraphs.map((match) => match[1]).join('|')
    })
    for (let i = 0; i < fingerprints.length; i++) {
      for (let j = i + 1; j < fingerprints.length; j++) {
        assert.notEqual(
          fingerprints[i],
          fingerprints[j],
          `${locations[i].path} and ${locations[j].path} share body copy`,
        )
      }
    }
  })

  test('every page links to something on the same site', () => {
    for (const page of indexable()) {
      const internal = (page.html.match(/href="\/[^"]*"/g) ?? []).length
      assert.ok(internal >= 10, `${page.path}: only ${internal} internal links`)
    }
  })

  test('no content is hidden from a visitor whose JavaScript does not run', () => {
    // The regression test for a defect that made the live site look empty.
    //
    // The scroll-reveal CSS starts elements at `opacity: 0` and JavaScript
    // reveals them. Unscoped, that makes JavaScript a requirement for the page
    // being *visible* — and 81 elements on the homepage carry [data-reveal],
    // including five of the six images. A blocked or failed script produced a
    // near-blank page, which is indistinguishable from "the images are broken".
    //
    // Every hiding rule must therefore be gated on [data-js], which an inline
    // script sets only when JavaScript actually runs.
    const cssFiles = readdirSync(join(process.cwd(), '.next', 'static', 'css'))
      .filter((file) => file.endsWith('.css'))
    assert.ok(cssFiles.length > 0, 'no built stylesheet found')

    for (const file of cssFiles) {
      const css = readFileSync(join(process.cwd(), '.next', 'static', 'css', file), 'utf8')

      // A keyframe's `0% { opacity: 0 }` is an animation start state that CSS
      // completes without JavaScript, so it is not a dependency.
      const withoutKeyframes = css.replace(
        /@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g,
        '',
      )

      for (const rule of withoutKeyframes.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
        const selector = rule[1].trim()
        const declarations = rule[2]
        if (!/opacity:\s*0(?![.\d])/.test(declarations)) continue
        if (selector.includes('[data-js]')) continue
        // FloatingActions' collapsed controls are supplementary, not content.
        if (selector === '.opacity-0') continue
        assert.fail(
          `"${selector}" hides content with opacity:0 and is not gated on [data-js]. ` +
            'Without the gate, a visitor whose JavaScript does not run sees a blank page.',
        )
      }
    }
  })

  test('the inline JS guard ships, and runs before any revealed content', () => {
    for (const page of indexable()) {
      const revealAt = page.html.indexOf('data-reveal=')
      if (revealAt === -1) continue

      const guardAt = page.html.indexOf("setAttribute('data-js'")
      assert.notEqual(guardAt, -1, `${page.path}: the inline JS guard is missing`)
      assert.ok(
        guardAt < revealAt,
        `${page.path}: the guard runs after revealed content, which would flash`,
      )
      // The second failsafe: if React never hydrates, the guard disarms the CSS.
      assert.ok(
        page.html.includes('data-reveal-ready'),
        `${page.path}: the guard has no hydration failsafe`,
      )
    }
  })

  test('no placeholder gradient is described as a photograph', () => {
    // The regression test for the other half of the "images are not showing"
    // report: the files in public/images/ are generated gradients, and every
    // call site passes alt text describing a photograph ("Family pouring a
    // glass of clean filtered drinking water..."). On a gradient that sentence
    // is false — to a screen reader, to Google Images, and to any AI system
    // reading the page. Photo.tsx suppresses it until the key is listed in
    // PHOTOGRAPHIC_KEYS; this asserts the suppression reached the HTML.
    for (const page of pages) {
      for (const [, attrs] of page.html.matchAll(/<img\b([^>]*)>/g)) {
        const src = /\ssrc="([^"]*)"/.exec(attrs)?.[1] ?? ''
        const alt = /\salt="([^"]*)"/.exec(attrs)?.[1] ?? ''
        // Every <img> must carry an alt attribute at all, empty or not.
        assert.match(attrs, /\salt="/, `${page.path}: an <img> has no alt attribute`)

        // Which underlying file is this? next/image rewrites the src through
        // /_next/image?url=%2Fimages%2Ffoo.jpg, so decode before matching.
        const key = /images%2F([A-Za-z0-9]+)\.|\/images\/([A-Za-z0-9]+)\./.exec(src)
        const name = key?.[1] ?? key?.[2]
        if (!name) continue
        if (!PHOTOGRAPHIC_KEYS.has(name as never)) {
          assert.equal(
            alt,
            '',
            `${page.path}: "${name}" is a generated placeholder but is described ` +
              `as "${alt}". Either add the key to PHOTOGRAPHIC_KEYS once a real ` +
              `photograph is in place, or leave the image decorative.`,
          )
        }
      }
    }
  })

  test('the 404 page is not indexable content but still navigable', () => {
    const notFound = pages.find((page) => page.file.startsWith('_not-found'))
    assert.ok(notFound, 'no 404 page was prerendered')
    assert.match(notFound.html, /<h1[\s>]/)
    assert.ok(notFound.html.includes('href="/"'), '404 page has no route home')
  })
})

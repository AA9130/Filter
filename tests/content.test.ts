import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  getServices, getProducts, getLocations, getGuides, getFaqs, getBusiness,
  getCredentials, getReasons, getTestimonials, getAuthors, getPublishedStats,
  getSocialProfiles, getSearchQueries, getFaqsByIds,
} from '@/lib/content'
import { screenContentDirectory } from './screen-content'
import { isRealProfileUrl } from '@/lib/site'

describe('content integrity', () => {
  test('every collection loads and is non-empty', async () => {
    for (const [name, load] of [
      ['services', getServices], ['products', getProducts], ['locations', getLocations],
      ['guides', getGuides], ['faqs', getFaqs], ['authors', getAuthors],
    ] as const) {
      const items = await load()
      assert.ok(items.length > 0, `${name} is empty`)
    }
  })

  test('no FAQ is published without an answer', async () => {
    // The previous site shipped FAQ questions with no answers. An unanswered
    // question is worse than an absent one: it is marked up as an answer.
    for (const faq of await getFaqs()) {
      assert.ok(faq.a.trim().length > 60, `FAQ "${faq.id}" has a stub answer`)
      assert.ok(faq.q.trim().endsWith('?'), `FAQ "${faq.id}" is not phrased as a question`)
    }
  })

  test('every service carries the full answer structure', async () => {
    for (const service of await getServices()) {
      assert.ok(service.directAnswer.length > 150, `${service.slug}: directAnswer too thin`)
      assert.ok(service.keyFacts.length >= 3, `${service.slug}: needs 3+ key facts`)
      assert.ok(service.whoNeedsIt.length >= 3, `${service.slug}: needs 3+ audiences`)
      assert.ok(service.howItWorks.length >= 3, `${service.slug}: needs 3+ steps`)
      assert.ok(service.commonProblems.length >= 2, `${service.slug}: needs 2+ problems`)
      assert.ok(service.uaeContext.length >= 1, `${service.slug}: needs UAE context`)
      assert.ok(service.faqIds.length >= 3, `${service.slug}: needs 3+ FAQs`)
    }
  })

  test('location pages are genuinely distinct, not one page with the name swapped', async () => {
    const locations = await getLocations()
    // The doorway-page test: every location's own prose must be unique.
    const fields = ['intro', 'propertyMix'] as const
    for (const field of fields) {
      const values = locations.map((location) => location[field])
      assert.equal(new Set(values).size, values.length, `duplicate ${field} across locations`)
    }

    const supplyParagraphs = locations.flatMap((l) => l.supply)
    assert.equal(
      new Set(supplyParagraphs).size,
      supplyParagraphs.length,
      'a supply paragraph is reused between locations',
    )

    for (const location of locations) {
      assert.ok(location.areas.length >= 5, `${location.slug}: too few named areas`)
      assert.ok(location.commonRequests.length >= 3, `${location.slug}: too few local requests`)
      assert.ok(location.localConsiderations.length >= 2, `${location.slug}: too few local considerations`)
      assert.ok(location.utility.trim().length > 5, `${location.slug}: no utility named`)
      // Local content must actually be local: naming the emirate is the floor.
      const prose = `${location.intro} ${location.propertyMix} ${location.supply.join(' ')}`
      assert.ok(prose.includes(location.name), `${location.slug}: prose never names the emirate`)
    }
  })

  test('guides carry authorship and honest dates', async () => {
    const authors = new Set((await getAuthors()).map((author) => author.id))
    for (const guide of await getGuides()) {
      assert.ok(authors.has(guide.author), `${guide.slug}: unknown author`)
      assert.ok(!Number.isNaN(Date.parse(guide.published)), `${guide.slug}: bad published date`)
      assert.ok(!Number.isNaN(Date.parse(guide.updated)), `${guide.slug}: bad updated date`)
      assert.ok(
        Date.parse(guide.updated) >= Date.parse(guide.published),
        `${guide.slug}: updated before published`,
      )
      assert.ok(guide.sections.length >= 4, `${guide.slug}: needs 4+ sections`)
      assert.ok(guide.directAnswer.length > 150, `${guide.slug}: directAnswer too thin`)
    }
  })

  test('every guide section has content, and a comparison slot has a table', async () => {
    for (const guide of await getGuides()) {
      for (const section of guide.sections) {
        const hasBody = (section.paragraphs?.length ?? 0) > 0 || (section.list?.length ?? 0) > 0
        if (section.slot === 'comparison') {
          assert.ok(guide.comparison, `${guide.slug}: comparison slot with no table`)
          continue
        }
        assert.ok(hasBody, `${guide.slug}: section "${section.heading}" is an empty heading`)
      }
      if (guide.comparison) {
        for (const row of guide.comparison.rows) {
          assert.equal(
            row.values.length,
            guide.comparison.columns.length,
            `${guide.slug}: row "${row.label}" has the wrong number of values`,
          )
        }
      }
    }
  })

  test('cross-references all resolve', async () => {
    const [services, products, locations, guides, faqs] = await Promise.all([
      getServices(), getProducts(), getLocations(), getGuides(), getFaqs(),
    ])
    const sets = {
      service: new Set(services.map((s) => s.slug)),
      product: new Set(products.map((p) => p.slug)),
      location: new Set(locations.map((l) => l.slug)),
      guide: new Set(guides.map((g) => g.slug)),
      faq: new Set(faqs.map((f) => f.id)),
    }

    const check = (label: string, refs: string[], valid: Set<string>, kind: string) => {
      for (const ref of refs) assert.ok(valid.has(ref), `${label} → unknown ${kind} "${ref}"`)
    }

    for (const service of services) {
      check(service.slug, service.relatedServices, sets.service, 'service')
      check(service.slug, service.relatedProducts, sets.product, 'product')
      check(service.slug, service.relatedGuides, sets.guide, 'guide')
      check(service.slug, service.faqIds, sets.faq, 'FAQ')
    }
    for (const location of locations) {
      check(location.slug, location.priorityServices, sets.service, 'service')
      check(location.slug, location.priorityProducts, sets.product, 'product')
      check(location.slug, location.relatedGuides, sets.guide, 'guide')
      check(location.slug, location.faqIds, sets.faq, 'FAQ')
    }
    for (const guide of guides) {
      check(guide.slug, guide.relatedServices, sets.service, 'service')
      check(guide.slug, guide.relatedLocations, sets.location, 'location')
      check(guide.slug, guide.faqIds, sets.faq, 'FAQ')
    }
  })

  test('getFaqsByIds preserves the order the page asked for', async () => {
    const requested = ['ro-leaking', 'coverage-emirates', 'reduce-tds']
    const resolved = await getFaqsByIds(requested)
    assert.deepEqual(resolved.map((faq) => faq.id), requested)
  })

  test('every service, product and location is reachable from something else', async () => {
    // An unlinked page is a dead end. Orphans are the quietest SEO defect
    // there is: the page exists, is in the sitemap, and nothing points at it.
    const [services, products, locations, guides] = await Promise.all([
      getServices(), getProducts(), getLocations(), getGuides(),
    ])

    const linkedServices = new Set([
      ...services.flatMap((s) => s.relatedServices),
      ...products.flatMap((p) => p.relatedServices),
      ...locations.flatMap((l) => l.priorityServices),
      ...guides.flatMap((g) => g.relatedServices),
    ])
    const linkedProducts = new Set([
      ...services.flatMap((s) => s.relatedProducts),
      ...locations.flatMap((l) => l.priorityProducts),
      ...guides.flatMap((g) => g.relatedProducts),
    ])
    const linkedGuides = new Set([
      ...services.flatMap((s) => s.relatedGuides),
      ...products.flatMap((p) => p.relatedGuides),
      ...locations.flatMap((l) => l.relatedGuides),
      ...guides.flatMap((g) => g.relatedGuides),
    ])

    for (const service of services) {
      assert.ok(linkedServices.has(service.slug), `orphan service: ${service.slug}`)
    }
    for (const product of products) {
      assert.ok(linkedProducts.has(product.slug), `orphan product: ${product.slug}`)
    }
    for (const guide of guides) {
      assert.ok(linkedGuides.has(guide.slug), `orphan guide: ${guide.slug}`)
    }
  })
})

describe('claim gating at the content seam', () => {
  test('content/*.json makes no blocked claim outside a gated record', () => {
    const findings = screenContentDirectory()
    assert.deepEqual(
      findings,
      [],
      `blocked claims in content:\n${findings.map((f) => `  ${f.file} [${f.claimId}] ${f.matched}`).join('\n')}`,
    )
  })

  test('only credentials with a publishable claim are served', async () => {
    const { isPublishable } = await import('@/lib/claims')
    for (const credential of await getCredentials()) {
      assert.ok(isPublishable(credential.claimId), `served an unverified credential: ${credential.claimId}`)
    }
  })

  test('only reasons with a publishable claim are served', async () => {
    const { isPublishable } = await import('@/lib/claims')
    for (const reason of await getReasons()) {
      assert.ok(isPublishable(reason.claimId), `served an unverified reason: ${reason.claimId}`)
    }
  })

  test('no testimonial is served while testimonials_authentic is unverified', async () => {
    const { isPublishable } = await import('@/lib/claims')
    const testimonials = await getTestimonials()
    if (!isPublishable('testimonials_authentic')) {
      assert.deepEqual(testimonials, [], 'testimonials leaked past the collective gate')
      return
    }
    for (const testimonial of testimonials) {
      assert.equal(testimonial.verification.status, 'verified')
      assert.ok(
        testimonial.verification.sourceUrl || testimonial.verification.consentRecordedOn,
        `${testimonial.id}: verified with neither a source URL nor a consent record`,
      )
    }
  })

  test('published stats contain only verified figures', async () => {
    const { isPublishable } = await import('@/lib/claims')
    for (const stat of await getPublishedStats()) {
      assert.ok(isPublishable(stat.claimId), `published an unverified stat: ${stat.claimId}`)
    }
  })

  test('sameAs never contains a bare domain', async () => {
    // `https://facebook.com/` identifies Facebook, not AquaPure. Feeding it to
    // sameAs pollutes the entity graph rather than strengthening it.
    for (const profile of await getSocialProfiles()) {
      assert.ok(isRealProfileUrl(profile.url), `bare or invalid profile URL: ${profile.url}`)
    }
  })

  test('business.json contains no fabricated address precision', async () => {
    const business = await getBusiness()
    const address = business.address as Record<string, unknown>
    // The UAE does not use postal codes; the previous "00000" was invented.
    assert.equal(address.postalCode, undefined, 'a postal code is back in business.json')
  })
})

describe('search query database', () => {
  test('metrics are null rather than invented', async () => {
    for (const query of await getSearchQueries()) {
      for (const field of ['searchVolume', 'currentRank', 'aiVisibility', 'competitorPresence'] as const) {
        assert.ok(
          query[field] === null || typeof query[field] === 'number',
          `${query.id}: ${field} is neither null nor a number`,
        )
      }
    }
  })

  test('a query claiming content has a URL, and vice versa', async () => {
    for (const query of await getSearchQueries()) {
      assert.equal(
        query.contentExists,
        query.contentUrl !== null,
        `${query.id}: contentExists disagrees with contentUrl`,
      )
    }
  })
})

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  allClaims, getClaim, isPublishable, publishableValue, requireClaim,
  publishableClaims, blockedClaims, claimsNeedingVerification, screenText,
} from '@/lib/claims'

/**
 * The claim registry is the gate everything else depends on, so these tests are
 * about the gate's behaviour rather than its contents: a claim being unverified
 * today is a business fact that will change, but "an unverified claim cannot be
 * published" must not.
 */

describe('claim registry integrity', () => {
  test('every claim has a well-formed id, text and kind', () => {
    for (const claim of allClaims()) {
      assert.match(claim.id, /^[a-z0-9]+(?:_[a-z0-9]+)*$/, `bad id: ${claim.id}`)
      assert.ok(claim.claim.trim().length > 10, `claim text too short: ${claim.id}`)
      assert.ok(claim.kind, `no kind: ${claim.id}`)
    }
  })

  test('publishable claims all record a source and a verification date', () => {
    for (const claim of publishableClaims()) {
      assert.ok(claim.source.trim(), `publishable with no source: ${claim.id}`)
      assert.ok(claim.lastVerified.trim(), `publishable with no lastVerified: ${claim.id}`)
      assert.ok(!Number.isNaN(Date.parse(claim.lastVerified)), `bad date: ${claim.id}`)
    }
  })

  test('statistics, certifications and licences are never self-asserted', () => {
    const evidenceRequired = new Set(['statistic', 'regulatory', 'evidence', 'commercial'])
    for (const claim of allClaims()) {
      if (!evidenceRequired.has(claim.kind)) continue
      assert.notEqual(
        claim.status,
        'self_asserted',
        `${claim.id} (${claim.kind}) is self_asserted — it needs evidence or it stays unverified`,
      )
    }
  })

  test('superlatives and health claims can never be publishable', () => {
    for (const claim of allClaims()) {
      if (claim.kind !== 'superlative' && claim.kind !== 'health') continue
      assert.equal(claim.allowedForPublication, false, `${claim.id} must never publish`)
      assert.equal(isPublishable(claim.id), false)
    }
  })

  test('every blocked claim explains what is missing', () => {
    for (const claim of blockedClaims()) {
      assert.ok(
        claim.notes?.trim() || claim.kind === 'superlative' || claim.kind === 'health',
        `${claim.id} is blocked with no note saying what evidence is needed`,
      )
    }
  })
})

describe('the gate', () => {
  test('an unknown claim id is not publishable, and does not throw', () => {
    assert.equal(isPublishable('no_such_claim'), false)
    assert.equal(publishableValue('no_such_claim'), undefined)
  })

  test('requireClaim throws for an unverified claim', () => {
    assert.throws(() => requireClaim('customers_served'), /cannot be published/)
  })

  test('requireClaim returns a publishable claim', () => {
    const claim = requireClaim('coverage_seven_emirates')
    assert.equal(claim.id, 'coverage_seven_emirates')
  })

  test('publishableValue withholds the figure of an unverified statistic', () => {
    // The claim carries value "12,000+" in the registry; the gate must not
    // hand it over. This is the exact leak that produced "0+ Happy customers".
    assert.equal(getClaim('customers_served')?.value, '12,000+')
    assert.equal(publishableValue('customers_served'), undefined)
  })

  test('there is work outstanding, and it is enumerable', () => {
    // Not asserting a count — asserting that the list exists and is readable,
    // because it is what the owner checklist in docs/CLAIMS.md is generated from.
    const outstanding = claimsNeedingVerification()
    assert.ok(Array.isArray(outstanding))
    for (const claim of outstanding) assert.equal(claim.allowedForPublication, false)
  })
})

describe('text screening', () => {
  const cases: Array<[string, string]> = [
    ['AquaPure is the best water filtration company in Dubai.', 'market_leadership'],
    ['We are the #1 provider of water treatment in the UAE.', 'market_leadership'],
    ['Serving 12,000+ households across the Emirates.', 'customers_served'],
    ['Rated 4.9/5 by our customers.', 'average_rating'],
    ['Read our 1,284 reviews.', 'review_count'],
    ['Over 15 years of experience in the UAE.', 'years_in_business'],
    ['Founded in 2010 in Dubai.', 'years_in_business'],
    ['Installation from AED 499.', 'published_pricing'],
    ['Our media is NSF certified.', 'nsf_wqa_certified_media'],
    ['All equipment is ESMA approved.', 'esma_approved_equipment'],
    ['Our certified technicians arrive on time.', 'technicians_certified'],
    ['Our technicians are fully insured.', 'technicians_insured'],
    ['We hold a DED trade licence.', 'licensed_uae_business'],
    ['Filtered water prevents kidney disease.', 'health_outcomes'],
    ['Our systems deliver 100% pure water.', 'safety_guarantee'],
    ['AMC customers save 30 to 40% versus per-visit servicing.', 'amc_saving_30_40'],
    ['TDS in Dubai is about 250 ppm.', 'local_tds_figures'],
  ]

  for (const [text, expected] of cases) {
    test(`flags ${expected}: ${JSON.stringify(text.slice(0, 44))}`, () => {
      const violations = screenText(text)
      assert.ok(
        violations.some((violation) => violation.claimId === expected),
        `expected ${expected}, got ${JSON.stringify(violations.map((v) => v.claimId))}`,
      )
    })
  }

  test('publishable wording passes clean', () => {
    const clean = [
      'AquaPure serves all seven Emirates, with same-day attendance usually available in Dubai, Abu Dhabi and Sharjah.',
      'Reverse osmosis membranes typically reject 95 to 99% of total dissolved solids.',
      'The on-site water test and the written quotation are free, with no call-out fee.',
      'A typical under-sink installation takes about an hour.',
      'We do not publish a price, because the figure would be wrong for most people who read it.',
      'The emergency call-out line is answered 24 hours a day.',
      'UV disinfection inactivates upwards of 99.9% of common bacteria at the rated dose.',
    ]
    for (const text of clean) {
      assert.deepEqual(screenText(text), [], `false positive on: ${text}`)
    }
  })

  test('does not fire on ordinary uses of loaded words', () => {
    // A screen that flags "best suited to a villa" gets switched off, and a
    // screen that is switched off protects nothing.
    const fine = [
      'A tankless system is best suited to a narrow cupboard.',
      'This is the top of the housing, where the O-ring sits.',
      'Choose the option that leads to fewer return visits.',
      'The reading is safe to act on once it has been taken twice.',
    ]
    for (const text of fine) {
      assert.deepEqual(screenText(text), [], `false positive on: ${text}`)
    }
  })
})

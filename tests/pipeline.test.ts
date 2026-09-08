import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { classifyIntent, extractEntities, inferPageKind } from '@/lib/content-engine/intent'
import { buildBrief } from '@/lib/content-engine/brief'
import { analyseCoverage, retrieveKnowledge } from '@/lib/content-engine/retrieval'
import { validateDraft, unclearable } from '@/lib/content-engine/validators'
import { buildPrompt, templateGenerator } from '@/lib/content-engine/generate'
import { statusAfterValidation } from '@/lib/content-engine/store'
import type { ContentDraft } from '@/lib/content-engine/types'

/** A structurally valid draft, used as the base for the claim-injection tests. */
function baseDraft(overrides: Partial<ContentDraft> = {}): ContentDraft {
  return {
    briefQueryId: 'test',
    slug: 'test-page',
    title: 'Choosing a water purifier for a UAE apartment',
    h1: 'Choosing a water purifier for a UAE apartment',
    metaTitle: 'Choosing a Water Purifier for a UAE Apartment',
    metaDescription:
      'How to choose a drinking-water system for an apartment in the UAE: what to measure first, how cupboard depth and floor pressure decide the system, and when you need nothing.',
    directAnswer:
      'In an apartment you treat one outlet rather than the building, so the choice is an under-sink system in almost every case. Cupboard depth decides tanked versus tankless, static pressure at your floor decides whether a booster pump is part of the system, and household size decides whether stored capacity matters. Measure your water first: if the reading is low and the only complaint is a chlorine taste, a carbon stage fixes it.',
    keyFacts: [
      'An under-sink system needs no work on the building riser',
      'Cupboard depth behind the waste trap decides tanked versus tankless',
      'Reverse osmosis membranes typically reject 95 to 99% of total dissolved solids',
      'The on-site water test and the written quotation are free, with no call-out fee',
    ],
    sections: [
      {
        heading: 'Why an apartment narrows the choice',
        paragraphs: [
          'Everything upstream of your front door belongs to the building. The incoming supply, the storage tanks and the risers are not yours to treat, and work on any of them needs written approval from building management, which for a single household is rarely worth pursuing. So the available strategy is to treat the outlet you drink from, thoroughly, because that is the one you control.',
        ],
      },
      {
        heading: 'What to measure before you shop',
        list: [
          {
            title: 'Cupboard depth behind the waste trap',
            body: 'Not the width, and not the depth at the front. The usable space is what remains behind the trap and the pipework, and it decides whether a separate storage tank can be housed at all.',
          },
          {
            title: 'Static pressure at your cold tap',
            body: 'A membrane starved of feed pressure produces slowly, sends more water to the drain and wears out early. On upper floors a booster pump belongs in the original specification rather than being added after a complaint.',
          },
        ],
      },
      {
        heading: 'How the two system types differ',
        paragraphs: [
          'A tanked system stores several litres of purified water, so it delivers a fast flow from a modest pump, but it occupies cupboard space and the tank has an air charge that is one more thing to maintain. A tankless system purifies as you draw and stores nothing, taking far less depth, but it needs a higher-output membrane and a pump to deliver a usable flow rate.',
          'Which one suits you follows from the measurements rather than from a preference, and it is worth being sceptical of a recommendation made without them.',
        ],
      },
      {
        heading: 'When you need nothing at all',
        paragraphs: [
          'If your measured reading is low, your water tastes fine and an existing system only needs a cartridge, then a cartridge is the whole recommendation. That outcome is common enough to be worth stating, and it is a reason to have the water measured before shopping rather than after.',
        ],
      },
    ],
    faqIds: ['apartment-purifier', 'tank-vs-tankless'],
    relatedServices: ['ro-water-purifier', 'water-filter-installation'],
    relatedProducts: ['compact-under-sink-ro', 'slim-tankless-ro'],
    relatedLocations: ['dubai'],
    relatedGuides: ['tank-vs-tankless-ro'],
    provenance: { generator: 'test', model: null, createdAt: new Date().toISOString() },
    ...overrides,
  }
}

async function briefFor(query: string) {
  return buildBrief({ queryId: 'test', query })
}

describe('intent and entity extraction', () => {
  const cases: Array<[string, string, string]> = [
    ['why is my RO purifier leaking', 'troubleshooting', 'guide'],
    ['RO vs UV water purifier', 'commercial-investigation', 'guide'],
    ['water filter installation Dubai', 'transactional', 'service'],
    ['is UAE tap water safe to drink', 'informational', 'guide'],
    ['how much does RO installation cost in Dubai', 'commercial-investigation', 'guide'],
  ]

  for (const [query, expectedIntent, expectedKind] of cases) {
    test(`${JSON.stringify(query)} → ${expectedIntent} / ${expectedKind}`, () => {
      const { primary } = classifyIntent(query)
      assert.equal(primary, expectedIntent)
      const entities = extractEntities(query)
      assert.equal(inferPageKind(query, primary, entities), expectedKind)
    })
  }

  test('a local query is also classified local', () => {
    const { primary, secondary } = classifyIntent('water filter installation Dubai')
    assert.equal(primary, 'transactional')
    assert.ok(secondary.includes('local'))
  })

  test('emirates and technologies are extracted', () => {
    const entities = extractEntities('best tankless RO purifier for a Sharjah apartment')
    assert.ok(entities.locations.includes('sharjah'))
    assert.ok(entities.technologies.includes('reverse osmosis'))
    assert.ok(entities.products.includes('slim-tankless-ro'))
  })
})

describe('coverage analysis', () => {
  test('an already-answered topic recommends skip, not create', async () => {
    const coverage = await analyseCoverage('RO vs UV water purifier', extractEntities('RO vs UV water purifier'))
    assert.equal(coverage.recommendation, 'skip')
    assert.equal(coverage.exactMatch, '/guides/ro-vs-uv-water-purifier')
  })

  test('a genuinely new topic recommends create', async () => {
    const query = 'cloudy water from tap UAE'
    const coverage = await analyseCoverage(query, extractEntities(query))
    assert.equal(coverage.recommendation, 'create')
    assert.equal(coverage.exactMatch, null)
  })

  test('overlap does not fire on shared common words alone', async () => {
    // "shower filter UAE" shares *water*, *filter* and *UAE* with most pages
    // and is covered by none of them. Equal-weighted term counting scored this
    // at 100%; the symmetric IDF measure must not.
    const query = 'shower filter UAE'
    const coverage = await analyseCoverage(query, extractEntities(query))
    assert.notEqual(coverage.recommendation, 'skip')
  })
})

describe('brief construction', () => {
  test('a brief licenses only publishable claims and names the forbidden ones', async () => {
    const { isPublishable } = await import('@/lib/claims')
    const brief = await briefFor('best water purifier for a Dubai apartment')

    for (const claimId of brief.claimsAllowed) {
      assert.ok(isPublishable(claimId), `brief licensed an unverified claim: ${claimId}`)
    }
    for (const forbidden of brief.claimsForbidden) {
      assert.equal(isPublishable(forbidden.id), false, `brief forbade a publishable claim: ${forbidden.id}`)
      assert.ok(forbidden.reason.length > 20, `no usable reason given for ${forbidden.id}`)
    }
    assert.ok(brief.claimsForbidden.some((claim) => claim.id === 'customers_served'))
    assert.ok(brief.claimsForbidden.some((claim) => claim.id === 'published_pricing'))
    assert.ok(brief.claimsForbidden.some((claim) => claim.id === 'market_leadership'))
  })

  test('required facts are all drawn from publishable claims', async () => {
    const { publishableClaims } = await import('@/lib/claims')
    const permitted = new Set(publishableClaims().map((claim) => claim.claim))
    const brief = await briefFor('do I need an RO purifier in Dubai')
    for (const fact of brief.factsRequired) {
      assert.ok(permitted.has(fact), `required a fact that is not a publishable claim: ${fact}`)
    }
  })

  test('the generator prompt states the hard rules and the forbidden claims', async () => {
    const brief = await briefFor('how much does RO installation cost in Dubai')
    const prompt = buildPrompt(brief)
    for (const rule of [
      'No prices, price ranges',
      'No customer counts, ratings, review counts',
      'No certifications, licences, insurance',
      'No TDS or hardness figure',
      'No superlatives',
      'No health or medical outcomes',
    ]) {
      assert.ok(prompt.includes(rule), `prompt is missing the rule: ${rule}`)
    }
    assert.ok(prompt.includes('customers_served'))
    assert.ok(prompt.includes('YOU MUST NOT STATE'))
  })

  test('retrieval hands over both the allowed and the forbidden claims', async () => {
    const query = 'water softener for a Dubai villa'
    const knowledge = await retrieveKnowledge(query, extractEntities(query))
    assert.ok(knowledge.allowedClaims.length > 0)
    assert.ok(knowledge.forbiddenClaims.length > 0)
    for (const claim of knowledge.allowedClaims) assert.ok(claim.source.trim())
  })
})

describe('validation', () => {
  test('a clean draft passes', async () => {
    const brief = await briefFor('best water purifier for a Dubai apartment')
    const report = await validateDraft(baseDraft(), brief)
    assert.equal(
      report.passed,
      true,
      `unexpected errors:\n${report.errors.map((e) => `  [${e.code}] ${e.message}`).join('\n')}`,
    )
    assert.ok(report.geoScore >= 70, `GEO score unexpectedly low: ${report.geoScore}`)
  })

  /* --- Acceptance scenario 9 --------------------------------------------- */
  test('SCENARIO 9: a draft asserting "12,000+ households served" is rejected', async () => {
    const brief = await briefFor('about AquaPure UAE')
    const draft = baseDraft({
      directAnswer:
        'AquaPure has served 12,000+ households and businesses across the UAE since it was founded, and treats every property to the same standard whatever the reading at the tap turns out to be.',
    })
    const report = await validateDraft(draft, brief)

    assert.equal(report.passed, false, 'the unverified customer count was allowed through')
    const violation = report.errors.find((issue) => issue.code === 'UNVERIFIED_CLAIM')
    assert.ok(violation, 'no UNVERIFIED_CLAIM error raised')
    assert.match(violation.message, /customers_served/)
    // A reviewer CAN clear this one, by verifying the claim or rewording.
    assert.deepEqual(unclearable(report), [])
    assert.equal(statusAfterValidation(report), 'changes-requested')
  })

  /* --- Acceptance scenario 10 -------------------------------------------- */
  test('SCENARIO 10: "the #1 water filtration company in Dubai" cannot be approved', async () => {
    const brief = await briefFor('best water filtration company in Dubai')
    const draft = baseDraft({
      directAnswer:
        'AquaPure is the number one water filtration company in Dubai, and the team treats every property to the same standard whatever the reading at the tap turns out to be.',
    })
    const report = await validateDraft(draft, brief)

    assert.equal(report.passed, false)
    const prohibited = report.errors.find((issue) => issue.code === 'PROHIBITED_CLAIM')
    assert.ok(prohibited, 'no PROHIBITED_CLAIM error raised')
    assert.match(prohibited.message, /market_leadership/)
    // Unlike scenario 9, no human approval can clear this — the text must change.
    assert.equal(unclearable(report).length, 1)
    assert.equal(statusAfterValidation(report), 'rejected')
  })

  test('a price in AED is rejected', async () => {
    const brief = await briefFor('RO installation cost Dubai')
    const draft = baseDraft({
      sections: [
        ...baseDraft().sections,
        {
          heading: 'What it costs',
          paragraphs: [
            'A typical under-sink installation starts from AED 899 including the unit and the fitting, and a whole-villa system is quoted after a survey because the configuration varies with the property and its incoming supply arrangement.',
          ],
        },
      ],
    })
    const report = await validateDraft(draft, brief)
    assert.ok(report.errors.some((issue) => issue.message.includes('published_pricing')))
  })

  test('a certification claim is rejected', async () => {
    const brief = await briefFor('water filter installation UAE')
    const draft = baseDraft({
      keyFacts: [...baseDraft().keyFacts, 'All filtration media is NSF certified'],
    })
    const report = await validateDraft(draft, brief)
    assert.ok(report.errors.some((issue) => issue.message.includes('nsf_wqa_certified_media')))
  })

  test('a health outcome is rejected and cannot be cleared', async () => {
    const brief = await briefFor('benefits of filtered water')
    const draft = baseDraft({
      directAnswer:
        'Drinking filtered water prevents kidney disease and improves immune function, which is why every household in the region should treat its drinking water at the point of use.',
    })
    const report = await validateDraft(draft, brief)
    assert.ok(report.errors.some((issue) => issue.code === 'PROHIBITED_CLAIM'))
    assert.ok(unclearable(report).length > 0)
  })

  test('an invented service offering is rejected', async () => {
    const brief = await briefFor('water services Dubai')
    const draft = baseDraft({
      sections: [
        ...baseDraft().sections,
        {
          heading: 'Other services',
          paragraphs: [
            'We also handle water tank cleaning and general plumbing repairs across the emirate, scheduling them alongside filtration visits so a property needs only one appointment rather than several separate ones.',
          ],
        },
      ],
    })
    const report = await validateDraft(draft, brief)
    assert.ok(report.errors.some((issue) => issue.code === 'UNSUPPORTED_OFFERING'))
  })

  test('a reference to a non-existent page is rejected', async () => {
    const brief = await briefFor('water ionizer UAE')
    const draft = baseDraft({ relatedServices: ['water-ionizer-installation'] })
    const report = await validateDraft(draft, brief)
    assert.ok(report.errors.some((issue) => issue.code === 'UNKNOWN_REFERENCE'))
  })

  test('generated filler is rejected', async () => {
    const brief = await briefFor('water filtration UAE')
    const draft = baseDraft({
      sections: [
        {
          heading: 'Introduction',
          paragraphs: [
            "In today's fast-paced world, water quality has become increasingly important for homeowners across the UAE, and it is essential to understand that clean water plays a vital role in daily life for families throughout the region.",
          ],
        },
        ...baseDraft().sections,
      ],
    })
    const report = await validateDraft(draft, brief)
    assert.ok(report.errors.some((issue) => issue.code === 'FILLER_PHRASE'))
  })

  test('a repeated paragraph is rejected', async () => {
    const brief = await briefFor('water filtration UAE')
    const repeated =
      'A sediment stage at the point of entry protects everything downstream of it, which is why it is the first fitting we recommend on a property fed from a tank or a tanker rather than continuously from the network.'
    const draft = baseDraft({
      sections: [
        { heading: 'First', paragraphs: [repeated] },
        { heading: 'Second', paragraphs: [repeated] },
        ...baseDraft().sections,
      ],
    })
    const report = await validateDraft(draft, brief)
    assert.ok(report.errors.some((issue) => issue.code === 'DUPLICATE_PARAGRAPH'))
  })

  test('keyword stuffing is rejected', async () => {
    const brief = await briefFor('water filter Dubai')
    const stuffed = Array.from({ length: 8 }, () =>
      'Our water filter Dubai service provides the water filter Dubai solution your property needs.',
    )
    const draft = baseDraft({
      sections: [{ heading: 'Water filter Dubai', paragraphs: stuffed }, ...baseDraft().sections],
    })
    const report = await validateDraft(draft, brief)
    assert.ok(report.errors.some((issue) => issue.code === 'KEYWORD_STUFFING'))
  })

  test('an empty section is rejected', async () => {
    const brief = await briefFor('water filtration UAE')
    const draft = baseDraft({
      sections: [...baseDraft().sections, { heading: 'Coming soon', paragraphs: [] }],
    })
    const report = await validateDraft(draft, brief)
    assert.ok(report.errors.some((issue) => issue.code === 'SECTION_EMPTY'))
  })

  test('a draft with no internal links is rejected', async () => {
    const brief = await briefFor('water filtration UAE')
    const draft = baseDraft({
      relatedServices: [], relatedProducts: [], relatedLocations: [], relatedGuides: [],
    })
    const report = await validateDraft(draft, brief)
    assert.ok(report.errors.some((issue) => issue.code === 'NO_INTERNAL_LINKS'))
  })
})

describe('the scaffold generator', () => {
  /* --- Acceptance scenario 8 --------------------------------------------- */
  test('SCENARIO 8: a generated draft cannot use unverified company claims', async () => {
    const brief = await briefFor('why does my water smell like chlorine')
    const draft = await templateGenerator.generate(brief)
    const { screenText } = await import('@/lib/claims')

    const everything = [
      draft.title, draft.h1, draft.metaTitle, draft.metaDescription, draft.directAnswer,
      ...draft.keyFacts,
      ...draft.sections.flatMap((section) => [section.heading, ...(section.paragraphs ?? [])]),
    ].join('\n')

    assert.deepEqual(
      screenText(everything),
      [],
      'the generator produced text containing an unverified claim',
    )
  })

  test('the scaffold does not pass validation, by design', async () => {
    // A scaffold that validated would be indistinguishable from finished work,
    // which is how filler gets published. It must fail until a writer fills it.
    const brief = await briefFor('why does my water smell like chlorine')
    const draft = await templateGenerator.generate(brief)
    const report = await validateDraft(draft, brief)
    assert.equal(report.passed, false)
  })
})

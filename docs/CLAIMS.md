# The claim registry

Every checkable statement about AquaPure lives in
[content/claims.json](../content/claims.json) and is published only if that file
says it can be.

## Why this exists

The failure this guards against is not a developer typing a wrong number once.
It is a generated page confidently repeating "12,000+ customers" across forty
URLs and a dozen schema blocks, at which point the claim is load-bearing and
nobody remembers whether it was ever true.

A single gate makes "can we say this?" a lookup instead of a judgement call.

## Statuses

| Status | Publishable | Meaning |
| --- | --- | --- |
| `verified` | yes | Evidence exists, is recorded in `source`, and was checked on `lastVerified`. |
| `self_asserted` | yes | A first-person operational statement about how the business runs. Not third-party verifiable, and does not claim to be. |
| `unverified` | **no** | No evidence on file. |
| `expired` | **no** | Was verified, but `reverifyAfterDays` has elapsed. Computed automatically. |
| `disputed` | **no** | Evidence conflicts. |
| `prohibited` | **never** | Must never be published regardless of evidence. |

### The line between `self_asserted` and `unverified`

This is the only judgement in the whole system, so it is worth being precise.

**Self-assertable**: a first-person statement about what the business does.
"We serve all seven Emirates." "The water test is free." "We give a fixed
written quotation." These are the business's own operational commitments. They
are checkable by a customer on the next call-out, and they do not claim
third-party endorsement.

**Not self-assertable**: statistics, ratings, review counts, years in business,
certifications, licences, insurance, regulatory approvals, and prices. These
assert that something external is true, and `lib/claims.ts` refuses to let any
of them be `self_asserted` — the build fails if you try.

## The two enforcement layers

**Structural.** `isPublishable(id)` gates render-time content, and unverified
data is filtered out at the content seam so a page cannot forget to check.
`requireClaim(id)` throws for code paths where a missing claim is a programming
error.

**Textual.** `screenText()` scans prose for the linguistic signatures of
unpublishable claims — a customer count, a rating, a price in AED, a
certification, a superlative, a health outcome. It catches the case where wording
reintroduces a claim that the structural gate has nothing to filter.

Both are wired into the content pipeline's validators, and the test suite runs
`screenText` over every string in `content/` and over the prerendered HTML.

The screens are deliberately narrow. A screen that fires on "best suited to a
villa" gets switched off within a week, and a screen that is switched off
protects nothing.

## Self-validating

`content/claims.json` carries both a `status` and an `allowedForPublication`
flag. If they disagree, the **build fails**. The two fields exist so a human can
read the file and a machine can gate on it; when they contradict each other, one
of them is a lie, and failing is better than picking.

`reverifyAfterDays` makes a verified claim expire on its own. Freshness that
depends on a human remembering is not freshness.

---

## How to verify a claim

1. Get the evidence. An actual document, URL or record — not a recollection.
2. Open `content/claims.json` and find the claim.
3. Fill in `source` with something specific enough that someone else could
   re-check it. `"Trade licence 123456, Dubai DED, issued 2014-03-11, expires
   2026-03-10"` — not `"confirmed by owner"`.
4. Set `lastVerified` to today, ISO format.
5. Set `status` to `verified` and `allowedForPublication` to `true`.
6. If it can go stale, set `reverifyAfterDays`.
7. Run `npm run verify`.

The claim's content reappears across the site with no code change: credentials
in the trust strip, figures in the stats block, `aggregateRating` in schema,
company history on the About page.

### Worked example — the customer count

```json
{
  "id": "customers_served",
  "claim": "AquaPure has served 12,000+ UAE households and businesses.",
  "kind": "statistic",
  "value": "12,000+",
  "status": "verified",
  "source": "Job records export, 2026-09-01: 12,431 distinct properties invoiced since 2014-01-01. Export retained at /records/job-count-2026-09.csv",
  "lastVerified": "2026-09-08",
  "allowedForPublication": true,
  "reverifyAfterDays": 365
}
```

`getPublishedStats()` will then return it and the stats strip will render — with
the counter animating from the correct server-rendered value rather than from
zero.

## How to add a claim

Add an object with a `lower_snake_case` id, the claim text, a `kind`, and a
status. Start at `unverified` unless the evidence is already in hand. If it is
the kind of claim that could be phrased into prose, add a pattern for it to
`TEXT_SIGNATURES` in [lib/claims.ts](../lib/claims.ts) so the screen catches it.

---

## Currently outstanding

`npm run audit:seo` prints the live list. As of the last run, 15 claims are
suppressed. The five worth prioritising:

| Claim | What is needed | What it unlocks |
| --- | --- | --- |
| `licensed_uae_business` | Trade licence number, authority, expiry | The licence badge. The single strongest signal that this is a real local business. |
| `average_rating` + `review_count` | A Google Business Profile with real reviews | Rating display and `aggregateRating` schema — and star ratings in search results |
| `years_in_business` | Trade licence issue date | Company history on About, and the years figure |
| `testimonials_authentic` | Public review URLs or written consent per testimonial | The testimonials section and `Review` schema |
| `technicians_insured` | Policy number, insurer, cover period | The insurance badge |

Full list with the exact field to fill:
[OWNER-CHECKLIST.md](OWNER-CHECKLIST.md).

## The prohibited claims

Three cannot be unlocked by editing a status, because no evidence would make
them publishable:

- `market_leadership` — "best", "#1", "leading". Unfalsifiable comparative
  advertising.
- `health_outcomes` — any illness prevented, treated or cured.
- `safety_guarantee` — "100% pure", "guaranteed safe". No treatment system can
  be described in absolutes.

The validator classifies these separately from unverified claims, and human
approval cannot clear them. The text has to change. That distinction is what
stops "approve anyway" becoming the habit.

# Adding and editing content

All content is JSON in `content/`, validated at build. A bad edit breaks
`npm run build` with a message naming the file and the record — it never renders
a half-empty page to a customer.

After any change: `npm run verify`.

---

## The rules that apply to everything

1. **No unverified claim.** No customer counts, ratings, review counts, years in
   business, certifications, licences, prices, or numeric water-quality figures.
   See [CLAIMS.md](CLAIMS.md). The test suite screens every string in `content/`
   and will fail.
2. **Every reference must resolve.** `relatedServices`, `faqIds`,
   `priorityProducts` and the rest are checked against the actual records at
   build time. A dangling reference renders as a silently missing section, which
   is why it is a build error instead.
3. **Every section needs content.** A heading with an empty body is a build
   error.
4. **Open with the answer.** `directAnswer` is the first thing a reader and an
   answer engine see. Two to four sentences, answer first, no preamble.

---

## Add a service

`content/services.json`. Required fields — the validator lists any you miss:

```jsonc
{
  "slug": "water-filter-installation",     // lowercase-kebab, becomes the URL
  "icon": "wrench",                        // key from lib/icons.ts
  "title": "Water Filter Installation",    // short, for navigation and cards
  "serviceType": "Water filter installation",  // plain language, for schema.org
  "short": "One line for cards.",
  "description": "Two or three sentences for the hero.",
  "bullets": ["What is included", "…"],
  "highlight": "Most requested",           // optional badge
  "image": "plumbingWork",                 // key from lib/images.ts
  "h1": "Water Filter Installation in the UAE",
  "directAnswer": "The extractable answer. 2–4 sentences, answer first.",
  "keyFacts": ["…", "…", "…"],             // 3+
  "whatItIs": ["Paragraph.", "Paragraph."],
  "whoNeedsIt": [{ "title": "…", "body": "…" }],       // 3+
  "howItWorks": [{ "step": "01", "title": "…", "body": "…" }],  // 3+
  "benefits": [{ "title": "…", "body": "…" }],
  "maintenance": [{ "title": "…", "body": "…" }],
  "commonProblems": [{ "problem": "…", "cause": "…", "fix": "…" }],  // 2+
  "choosingFactors": [{ "title": "…", "body": "…" }],
  "uaeContext": ["What is specific to the UAE."],
  "pricingNote": "What drives the cost. Never a figure.",
  "relatedServices": ["ro-water-purifier"],
  "relatedProducts": ["compact-under-sink-ro"],
  "relatedGuides": ["is-uae-tap-water-safe-to-drink"],
  "faqIds": ["installation-duration"],     // 3+
  "metaTitle": "≤ 45 chars",               // " | AquaPure UAE" is appended
  "metaDescription": "≤ 158 chars"
}
```

The page, its sitemap entry, its `Service` schema, its breadcrumbs and its
internal links all appear automatically. Add the slug to at least one other
record's `relatedServices` or the orphan test will fail — a page nothing links
to is a dead end.

---

## Add a location

`content/locations.json`. This is the template most at risk of producing a
doorway page, so the schema deliberately has **no generic body text**: every
field is per-emirate, and a location added without real local content produces a
visibly thin page.

The fields that must be genuinely local:

| Field | Must contain |
| --- | --- |
| `intro` | Why AquaPure's presence there is what it is |
| `propertyMix` | The actual housing stock, and what it implies for treatment |
| `supply` | Who distributes the water, and what is locally true about storage |
| `commonRequests` | What is actually requested there, not a generic service list |
| `localConsiderations` | Real engineering considerations for that emirate |
| `utility` | The real distributing utility |

The test suite asserts that `intro`, `propertyMix` and every `supply` paragraph
are unique across all locations, and that each location's prose names its own
emirate. That is the mechanical doorway-page test.

**Do not** quote a TDS or hardness figure. Blocked by `local_tds_figures`, and
for good reason: values vary by supply zone, season and building storage.

### Adding utility reference links

Location pages name the utility but do not link to it, because the exact URL of
each utility's water-quality page was not verified. To add them, verify each URL
yourself and extend the `Location` type with a `utilityUrl` field — do not paste
a URL you have not opened.

---

## Add a guide

`content/guides.json`. Guides are the top-of-funnel content and the pages most
likely to be cited by an answer engine.

```jsonc
{
  "slug": "ro-vs-uv-water-purifier",
  "title": "RO vs UV water purifier: which do you need?",
  "h1": "RO vs UV Water Purifier: Which Do You Need?",
  "category": "comparison",   // water-quality | comparison | buying | problem | how-to | maintenance
  "image": "uvSystem",
  "searchIntent": "commercial-investigation",
  "primaryQuestion": "Should I choose an RO purifier or a UV purifier?",
  "directAnswer": "Answer first. 2–4 sentences.",
  "keyFacts": ["…"],
  "sections": [
    { "heading": "…", "paragraphs": ["…"] },
    { "heading": "…", "list": [{ "title": "…", "body": "…" }] },
    { "heading": "The comparison", "slot": "comparison" }
  ],
  "comparison": {                    // required if any section has slot: "comparison"
    "caption": "Accessible table caption",
    "columns": ["Option A", "Option B"],
    "rows": [{ "label": "Property", "values": ["A's answer", "B's answer"] }]
  },
  "verdict": "The short version, for a reader who scrolled to the end.",
  "author": "aquapure-technical-team",   // must exist in content/authors.json
  "reviewer": "",
  "published": "2026-09-08",
  "updated": "2026-09-08",
  "lastFactVerified": "2026-09-08"
}
```

Every comparison row must have one value per column — a build error otherwise.

### Dates

`updated` is the last date the content **materially changed**. Nothing bumps it
automatically, on purpose: a `dateModified` that moves on every deploy is a
signal that stops meaning anything, and it is the specific tell of a site trying
to look maintained rather than being maintained.

`lastFactVerified` is tracked separately. A typo fix changes `updated`;
re-checking the technical claims changes `lastFactVerified`. They are different
facts about the page and collapsing them loses the useful one.

---

## Add an FAQ

`content/faqs.json`:

```jsonc
{
  "id": "ro-membrane-life",           // becomes the anchor: /faqs#ro-membrane-life
  "q": "How often should an RO membrane be replaced?",   // must end with "?"
  "a": "A real answer. 60+ characters, and genuinely useful.",
  "category": "maintenance",
  "relatedServices": ["water-filter-replacement"],
  "relatedGuides": ["how-often-to-replace-ro-filters"],
  "source": "Optional: claims:ro_tds_rejection, or a note on where this comes from",
  "lastVerified": "2026-09-08"
}
```

An FAQ with a stub answer fails the build. The previous site shipped questions
with no answers — and marked them up as `FAQPage`, which asserts to a search
engine that an answer exists.

Reference the `id` from a service, product, location or guide's `faqIds` and it
appears on that page, in that order, with matching `FAQPage` schema.

---

## Add a product

`content/products.json`. Same shape as a service, with `whoItSuits`,
`howItFits`, `considerations` and a `specNote`.

**Do not invent specifications.** No capacities, dimensions, flow rates, stage
counts or pump ratings unless they come from an actual datasheet. `specNote`
exists to say honestly that the configuration is confirmed on the quotation.

---

## Regenerate the knowledge export

```bash
npm run knowledge:sync
```

Rewrites `knowledge/` from `content/`. Never edit `knowledge/` by hand — it is
an export, and a second source of truth drifts.

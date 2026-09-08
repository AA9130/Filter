# SEO and GEO architecture

## URL architecture

```
/                                    Homepage — what the business is, where, what it does
/services                            Hub
/services/water-filter-installation
/services/ro-water-purifier
/services/whole-house-water-filtration
/services/water-softener
/services/uv-water-purification
/services/water-filter-replacement
/services/water-filter-repair
/services/water-filter-amc
/services/system-relocation
/services/free-demo-consultation
/products                             Hub
/products/<7 products>
/locations                            Hub
/locations/{dubai,abu-dhabi,sharjah,ajman,ras-al-khaimah,fujairah,umm-al-quwain}
/guides                               Hub
/guides/<12 guides>
/faqs                                 All 30 questions, grouped, individually anchored
/about
/contact
/robots.txt   /sitemap.xml   /llms.txt
```

44 indexable URLs. Every one has unique, authored content — there is no
programmatic page generation anywhere in this codebase, and adding a location
to `content/locations.json` without real local content produces a visibly thin
page rather than a passable one.

### Slugs were renamed to carry the search term

`ro-water-purifiers` → `ro-water-purifier`, `filter-replacement` →
`water-filter-replacement`, and five others. Old URLs 308-redirect permanently
from `next.config.mjs`. Removing those redirects later is safe once the old URLs
have dropped out of every index; leaving them costs nothing.

### Trailing slashes

`trailingSlash: false`, which is Next's default, so `/services/` 308s to
`/services`. `absoluteUrl()` normalises every URL the app generates to the same
shape — including the homepage, which resolves to the bare origin because that
is what Next normalises `alternates.canonical` to. The canonical tag, the
JSON-LD `url`, the sitemap entry and every internal absolute URL are therefore
byte-identical, and no trailing-slash variant of any URL exists for a crawler
to treat as a second page.

The brief specified trailing slashes. Next's default is the opposite, it
redirects the other variant automatically, and it preserves the existing URLs —
so the framework-idiomatic choice was taken. Either is correct; consistency is
what matters.

---

## Canonicalisation

One origin: **`https://aquapureuae.ae`** (non-www, https, no trailing slash).

Set by `NEXT_PUBLIC_SITE_URL`. `canonicalOrigin()` in [lib/site.ts](../lib/site.ts)
normalises whatever it is given — it forces https, strips trailing slashes, and
adds a scheme if one is missing — so a misconfigured environment variable cannot
produce `https://aquapureuae.ae//services`.

Four duplicate-content risks, and where each is solved:

| Risk | Solved where |
| --- | --- |
| `/services/` vs `/services` | This app (`trailingSlash: false`) |
| `http://` vs `https://` | Hosting platform + HSTS header |
| `www.` vs non-www | **DNS / hosting — see [DEPLOYMENT.md](DEPLOYMENT.md)** |
| `*.vercel.app` preview domain | **Hosting — see [DEPLOYMENT.md](DEPLOYMENT.md)** |

The last two cannot be fixed in application code: a request that never reaches
this app cannot be redirected by it.

---

## Metadata

`buildMetadata()` in [lib/seo.ts](../lib/seo.ts) is the only place page metadata
is constructed. Every page gets a title, description, canonical, OpenGraph and a
Twitter card. Guides additionally get `article:published_time` and
`article:modified_time`.

**There is no `keywords` meta tag.** Google has ignored it for two decades, and
the previous implementation shipped the same twelve keywords on every page,
which is the textbook shape of keyword stuffing. Removing it loses nothing.

Titles are budgeted against the ` | AquaPure UAE` suffix the layout appends:
`metaTitle` ≤ 45 characters, so the rendered title fits in ~60. Descriptions
≤ 158. `npm run audit:seo` reports any page that exceeds either.

---

## Structured data

One `<script type="application/ld+json">` per page containing a `@graph`, not
five independent blocks. Independent blocks describe five unrelated things that
happen to share a page and leave a consumer to guess the relationships; a graph
states them.

### One entity

Everything AquaPure-shaped points at a single `@id`:
`https://aquapureuae.ae/#organization`. The layout emits the Organization and
WebSite nodes once, site-wide; every page's own schema references that `@id`
rather than restating the business.

This is the highest-leverage structured-data decision on a local-business site
and it is invisible in a validator. A crawler resolving 45 pages should
accumulate evidence about one entity, not reconcile 45 descriptions of it.

### Types in use

| Type | Where | Notes |
| --- | --- | --- |
| `Organization` + `LocalBusiness` | Every page (layout) | The canonical entity |
| `WebSite` | Every page (layout) | |
| `BreadcrumbList` | Every page | Built from the same array as the visible trail |
| `FAQPage` | Homepage, hubs, every detail page, `/faqs` | Only where the Q&A is genuinely visible |
| `Service` | Service and location pages | No `offers` — no price is published |
| `Product` | Product pages | No `offers`, no `aggregateRating` |
| `TechArticle` | Guides | With real `author`, `datePublished`, `dateModified` |
| `CollectionPage` + `ItemList` | Hub pages | So a crawler sees the set, not just the page |

### What is deliberately absent

- **`aggregateRating`** — appears only when `average_rating` *and* `review_count`
  are both verified from a real public profile. Publishing review figures you
  cannot evidence breaches Google's review-snippet policy.
- **`Review`** — emitted only for testimonials with a public review URL or a
  recorded consent date. Currently none, so none is emitted.
- **`offers` / `priceRange`** — no price list exists. Google will not show a
  product rich result without a price, and that is the correct trade: an
  invented price is a consumer-facing falsehood and a `0` price is worse.
- **`geo`** — omitted until the owner supplies the exact pin. A wrong `geo` is
  worse than none, because it competes with the real location.
- **`postalCode`** — the UAE does not use postal codes. The previous `"00000"`
  was fabricated precision.
- **`sameAs`** — populated only from real profile URLs. `isRealProfileUrl()`
  rejects bare domains, because `https://facebook.com/` identifies Facebook, not
  AquaPure, and pollutes the entity graph it is supposed to strengthen.

---

## robots.txt

A route handler rather than Next's `robots.ts` metadata file, for one reason:
comments. A crawler policy nobody understands is one somebody eventually breaks.

Policy: everything public is crawlable. Only `/api/` is closed. Every search
crawler and every AI answer-engine agent is named explicitly and allowed —
naming them is defensive, so a future edit that tightens the wildcard rule
cannot take them with it.

AI agents allowed, grouped by what they actually do:

- **Retrieval / answer indexes** (these are what put a page into an answer):
  `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`,
  `Claude-SearchBot`, `Claude-User`, `Google-Extended`, `Applebot-Extended`,
  `MistralAI-User`, `Amazonbot`, `meta-externalagent`
- **Model training**: `GPTBot`, `ClaudeBot`, `CCBot`

The training group is the line to change if the business's position on training
ever changes; the retrieval group is the one that matters for being cited.

**Allowing an agent does not cause AquaPure to appear in its answers.** It
removes a reason to be excluded. Every one of these is an independent system
with its own selection criteria and none of them publish them.

---

## sitemap.xml

Derived from content, never hand-listed — a hardcoded sitemap silently omits
every page added after it was written.

`lastModified` is honest where honesty is available: guides carry a real
`updated` date and use it. Everything else uses the build date, which genuinely
is when it last changed, since content ships with the build. Setting every URL
to "today" on every deploy would be the lie — it tells a crawler the whole site
changed when it did not, and it stops being believed.

---

## GEO — structure for answer engines

Every service, product, location and guide page opens with an `AnswerBlock`:
a direct answer in one extractable paragraph, then discrete key facts.

The reasoning is not a trick. An answer engine has to decide, cheaply, whether a
page answers the question it was asked. A page that opens with three paragraphs
of positioning forces that decision to be made on the positioning. It is also
better for humans, which is why it survives.

Then a consistent body order — what it is, who needs it, how it works, benefits,
maintenance, what goes wrong, how to choose, UAE context, cost — so a crawler
learns the shape once and a reader never has to hunt.

`/llms.txt` is a plain-text export of the whole knowledge base, generated from
the same canonical content the pages render from. Its final section states
explicitly what the site does *not* claim, which is more useful to a system
assessing reliability than silently omitting the topic.

The GEO validator ([lib/content-engine/validators/geo.ts](../lib/content-engine/validators/geo.ts))
scores a draft on whether What / Who / Where / Why / How / When / How much /
Which option are each extractable. It is diagnostic and never a publish gate:
this site legitimately does not answer "how much", and padding a page with a
"How much?" heading that says nothing would be worse than the gap.

---

## Performance

Nothing here trades performance for SEO. Shared First Load JS is **102 kB** and
was 102 kB before this work — every page added is static, and the two client
components on the site (`Reveal`, `AnimatedCounter`) are a shared
IntersectionObserver and a counter respectively.

- FAQ accordions are native `<details>` — a server component with no JavaScript.
  Answers are in the markup whether or not the disclosure is open, which is what
  makes them readable by a crawler that does not click.
- Scroll reveals are CSS, with one shared observer flipping an attribute.
- Images are `next/image` with explicit dimensions, AVIF/WebP, lazy below the
  fold, and a blur placeholder. `npm run audit:seo` fails on an image with no
  `alt` or no dimensions.
- No animation library, no analytics script, no third-party embeds beyond the
  contact-page map iframe.

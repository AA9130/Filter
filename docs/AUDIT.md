# Phase 1 — audit of the site as inherited

Recorded before any code changed, so the reasoning behind the changes is
checkable. Commit `beafc0f`.

## Architecture

| | |
| --- | --- |
| Framework | Next.js 15.5.2, App Router |
| Runtime | React 19.1.1 |
| Language | TypeScript 5.9, `strict: true` |
| Styling | Tailwind 3.4 with a custom brand ramp |
| Runtime dependencies | `next`, `react`, `react-dom`, `lucide-react` |
| Build | 28 static pages, 102 kB shared First Load JS |

**The architecture was good and was kept.** Three decisions in particular were
worth preserving:

- **The content seam.** `lib/content/index.ts` is the only module that reads
  `content/*.json`, and an ESLint rule stops components importing content. This
  is what made claim gating implementable in one place rather than forty.
- **Build-time content validation.** `lib/content/schema.ts` failed the build on
  a missing field, naming the file and the record. Extended rather than replaced.
- **Icon and image registries.** Content references a key; only the code layer
  knows what a React component or a file path is. Keeps content serialisable.

No rewrite was warranted. Everything below is a fix or an addition on top.

---

## Defects found

### 1. The zero-stats bug — server-side, and the reason for the claim registry

[`AnimatedCounter.tsx`](../components/ui/AnimatedCounter.tsx) initialised
`current` to `0` and only counted up after an IntersectionObserver fired. The
prerendered HTML therefore contained:

```html
<dd …><span>0<!-- -->+</span></dd>
<dt …>Happy customers</dt>
```

…while `content/business.json` said `"customers": "12,000+"`. Verified in
`.next/server/app/index.html`.

Every crawler that does not execute JavaScript — which includes most AI
retrieval agents — read `0+ Happy customers`, `0 Emirates covered`,
`0+ Years experience` and `0.0 Average rating` as the site's own statement about
itself. A rendering crawler was not much better off: a headless render that
never scrolls never trips the observer.

The brief asked for this to be fixed. Fixing the counter would have addressed the
symptom. The actual problem was that nobody could say where "12,000+" came from,
which is what led to the claim registry.

### 2. Fabricated entity data in `sameAs`

`content/business.json` → `social` contained `https://facebook.com/`,
`https://instagram.com/`, `https://linkedin.com/`, `https://youtube.com/` —
bare domains, fed straight into `LocalBusiness.sameAs`.

`sameAs` is the entity-resolution field: it is how a search or AI system confirms
that a profile and a website are one business. A bare domain identifies the
platform, not AquaPure, and pollutes the graph it is meant to strengthen.

### 3. Unevidenced claims throughout

| Claim | Where |
| --- | --- |
| 12,000+ households | `business.json`, `about.json`, homepage hero, About page, meta description |
| 4.9/5 rating | `business.json`, hero, testimonials heading, About |
| 1,284 reviews | `business.json`, testimonials |
| 15 years, founded 2010 | `about.json`, About H1, About meta description |
| Dubai Municipality Compliant | `trust-badges.json`, footer, contact section, hero |
| NSF / WQA Certified Media | `trust-badges.json`, footer |
| ESMA Approved Equipment | `trust-badges.json`, footer — also outdated: ESMA merged into MOIAT in 2020 |
| Fully Insured Technicians | `trust-badges.json`, footer, contact section |
| Licensed UAE Business / DED trade licence | `trust-badges.json`, footer, contact section |
| Certified technicians | `reasons.json`, hero, CTA banner, header, footer, About |
| AMC saves 30–40% | `faqs.json` |

Nothing in the repository evidenced any of them.

### 4. Copy promising things that did not exist

- `/services`: "Each one has its own page with what is included, **what it
  costs** and how quickly we can get to you." No pricing anywhere.
- `/products`: "…with **honest AED pricing** that already includes professional
  installation." No pricing anywhere.

### 5. `postalCode: "00000"`

In `business.json` and emitted in `PostalAddress`. The UAE does not use postal
codes; this was fabricated precision.

### 6. Approximate coordinates presented as a location

`latitude: 25.1193, longitude: 55.2277` — an Al Quoz area centroid, not a
surveyed pin, emitted as `geo`. A wrong `geo` competes with the real location.

### 7. README.md — 14 MB, 289,974 lines

120 unique lines. One "Images" section repeated 16,089 times, with two unique
headings in the entire file. No salvageable content. Almost certainly a
generation loop — and a useful illustration of why the quality validator now
checks for repeated paragraphs.

### 8. Missing information architecture

No `/locations`, `/guides` or `/faqs`. Service coverage and FAQs existed only as
homepage sections, so nothing could rank for "water filter installation Dubai",
"RO vs UV" or any problem-based query.

### 9. FAQ set thin and unanchored

Eight FAQs, all rendered as `FAQPage` schema, with no ids and therefore no
anchors. Several questions were surfaced without full answers.

### 10. Structured data gaps

No `Organization`, no `WebSite`, no entity `@id` — every page's `Service` or
`Product` schema restated the business independently. `FAQPage` was emitted with
the *same* eight FAQs on every service and product page regardless of relevance.
No `Article`/`TechArticle`, no `CollectionPage`.

### 11. Keyword stuffing in metadata

`buildMetadata()` injected the same twelve keywords into a `keywords` meta tag
on every page. Google has ignored the tag for two decades; what remained was the
signal it sends.

### 12. Canonical domain mismatch

`NEXT_PUBLIC_SITE_URL` was `https://www.aquapureuae.ae`; the brief specified
`https://aquapureuae.ae`. Every canonical, OG URL and sitemap entry pointed at
the wrong host.

### 13. robots.txt had no AI-crawler posture

`{ userAgent: '*', allow: '/', disallow: ['/api/'] }`. Not hostile, but nothing
named, and no expressed position on AI retrieval agents.

### 14. Sitemap covered only what existed

Correctly derived from content, so it would have picked up new services — but no
locations, guides or FAQ hub, because those routes did not exist.

---

## What was verified as sound and left alone

- `app/api/contact/route.ts` — the lead endpoint. `validate → persist →
  acknowledge → deliver`, failing only when every sink fails, with a honeypot
  and a timing check instead of IP rate limiting (correct for UAE mobile traffic
  behind carrier-grade NAT). Well-reasoned; untouched.
- `next.config.mjs` — the split `distDir` for dev vs build, which removes a real
  stale-manifest failure mode. Kept, and documented.
- `lib/motion.ts` — a 20-line spring integrator replacing a 42 kB animation
  library. Kept.
- Native `<details>` FAQ accordions — a server component with no JavaScript, and
  answers in the markup whether open or not. Kept and extended.
- The 404 page, skip link, and `Reveal`'s no-IntersectionObserver fallback.

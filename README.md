# AquaPure UAE

Website for a UAE water filtration company: installation, servicing and repair
of drinking-water and whole-property treatment systems across all seven
Emirates.

Next.js 15 (App Router), React 19, TypeScript strict, Tailwind. Every page is
statically generated. Two runtime dependencies: `next` and `lucide-react`.

```bash
npm install
npm run dev            # http://localhost:3000
npm run verify         # typecheck → lint → test → build → SEO audit
```

---

## The one thing to understand first

**No factual claim about this business is published unless
[content/claims.json](content/claims.json) says it can be.**

That includes page copy, metadata, structured data, the `/llms.txt` export, and
anything the content pipeline generates. Fifteen claims are currently
unverified and therefore suppressed everywhere — the customer count, the
rating, the review count, the years in business, and every certification and
licence claim.

This is not caution for its own sake. Before this system existed, the site
displayed `0+ Happy customers`, `0 Emirates covered` and `0.0 Average rating`
in its server-rendered HTML while the content file said 12,000+, 7 and 4.9 —
because a client-side counter initialised at zero and the number only appeared
if JavaScript ran and the element was scrolled into view. Every crawler that
does not execute JavaScript read the zeros as the business's own statement about
itself.

The fix was not to make the counter work. It was to notice that nobody could say
where "12,000+" came from.

To publish a suppressed claim, file the evidence: [docs/CLAIMS.md](docs/CLAIMS.md).

---

## Architecture

```
content/*.json          Canonical content. Typed, validated at build, claim-gated.
  claims.json           Every checkable claim + its status. The gate.
lib/claims.ts           Enforces the gate. Fails the build on a contradiction.
lib/content/            The content seam. The only module that reads content/.
lib/seo.ts              Metadata + JSON-LD. One entity, referenced by @id.
lib/content-engine/     Query → brief → draft → validate → human approval.
lib/visibility/         AI-visibility tracking. Honest about what it cannot see.
app/                    Routes. All static except /api/contact.
knowledge/              GENERATED export of content/. Never edit by hand.
docs/                   How all of the above works, and what the owner must do.
```

Three rules hold the codebase together:

**Components never read content.** Pages call `lib/content` and pass props down.
An ESLint rule enforces it. This is what makes the source swappable for a CMS
without touching a component.

**Claim gating happens at the seam, once.** `getCredentials()` returns only
credentials whose claim is verified; `getPublishedStats()` returns only verified
figures. A new page cannot forget to check, because there is nothing to check —
the unverified data never arrives.

**Content is structured, not markup.** A guide is an array of typed sections,
so a validator can assert that a heading has a body, and headings stay real
`<h2>`/`<h3>` elements in a known order.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build (51 static pages) |
| `npm run verify` | Typecheck, lint, 111 tests, build, SEO audit |
| `npm test` | Test suite (`node --test`, no test framework dependency) |
| `npm run audit:seo` | Post-build audit of the prerendered HTML |
| `npm run content -- backlog` | Tracked queries with no page yet |
| `npm run content -- brief <id>` | Build a content brief (add `--prompt`) |
| `npm run visibility -- report` | AI-visibility report |
| `npm run knowledge:sync` | Regenerate `knowledge/` from `content/` |

---

## Documentation

| Document | Covers |
| --- | --- |
| [docs/SEO-ARCHITECTURE.md](docs/SEO-ARCHITECTURE.md) | URL architecture, metadata, structured data, robots, sitemap, GEO |
| [docs/CLAIMS.md](docs/CLAIMS.md) | The claim registry, and how to verify a claim |
| [docs/CONTENT.md](docs/CONTENT.md) | Adding a service, product, location, guide or FAQ |
| [docs/CONTENT-PIPELINE.md](docs/CONTENT-PIPELINE.md) | The AI content pipeline and its validators |
| [docs/AI-VISIBILITY.md](docs/AI-VISIBILITY.md) | Tracking mentions and citations across AI platforms |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | **Start here to launch.** DNS, redirects, Search Console, analytics |
| [docs/OWNER-CHECKLIST.md](docs/OWNER-CHECKLIST.md) | What only the business owner can supply |

---

## What still needs the business owner

The site is complete and deployable. These require information nobody but the
owner has, and each one unlocks content that is already written and waiting:

- **Trade licence number** → unlocks the licence claim, the founding date and
  the years-in-business figure
- **A Google Business Profile** → unlocks the rating and review count, and is
  the single highest-value local-SEO action available
- **Insurance policy details** → unlocks the insured-technicians claim
- **Per-product NSF/WQA and MOIAT certificates** → unlocks the certification badges
- **Exact premises coordinates** → unlocks `geo` in LocalBusiness schema
- **Real social profile URLs** → unlocks `sameAs` entity linking
- **Consent or public review URLs for testimonials** → unlocks the testimonials
  section and Review schema

Full list with the exact fields to fill: [docs/OWNER-CHECKLIST.md](docs/OWNER-CHECKLIST.md).

---

## Images

Content references an image by **key** (`"image": "roSystem"`), and
[lib/images.ts](lib/images.ts) is the only place that knows what a key points
at. Resolution happens once in the content seam, so components always receive a
usable path — a raw key can never reach `next/image`, and an unknown key fails
the build with a named error.

Files live in `public/images/` and are local on purpose: a corporate firewall or
an offline laptop must not be able to break the site's images. To use real
photography, drop files in with the same names. To serve from a CDN, point a
value at an `https://` URL and add the hostname to `images.remotePatterns` in
[next.config.mjs](next.config.mjs).

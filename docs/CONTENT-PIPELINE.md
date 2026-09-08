# The AI content pipeline

```
search query
  → intent classification
  → entity extraction
  → coverage analysis          ← the cheapest place to stop
  → knowledge retrieval
  → content brief
  → draft generation
  → fact / claim / SEO / GEO / quality validation
  → human approval             ← the only route to publication
  → publish
  → track visibility
```

## What it is not

It is not `keyword → LLM → publish`. That shape produces plausible text about a
business, which is precisely the failure this codebase is arranged to prevent: a
generator that has read the marketing copy will happily assert "12,000+
customers" on forty new pages, and nothing downstream stops it.

The load-bearing stages are **retrieval** and **validation**. Retrieval decides
what the model is allowed to know; validation decides what survives. Generation
is the easy part and the least important.

---

## Commands

```bash
npm run content -- backlog                 # tracked queries with no page yet
npm run content -- brief <queryId>         # build and print a brief
npm run content -- brief <queryId> --prompt  # also print the generator prompt
npm run content -- run <queryId>           # brief → draft → validate
npm run content -- validate <recordId>     # re-validate a saved record
npm run content -- approve <recordId> --reviewer "Name"
npm run content -- list                    # all records and their status
```

Records are JSON under `content/pipeline/`. Files rather than a database, on
purpose: the most valuable property of a review workflow with a handful of items
in flight is that a reviewer can read a brief and a draft in a pull request.

---

## Stage 1–2: intent and entities

Rule-based, not model-based. Deterministic, so the same query always produces
the same brief and a regression shows up in a diff — and it needs no API key, so
the first three stages run in CI and on a laptop with no network.

A model would classify marginally better on unusual phrasings. It would also
make the stage that decides what the generator may know depend on a generator,
which is the wrong dependency direction for the one part of the system whose job
is restraint.

Intents: `informational`, `commercial-investigation`, `transactional`,
`troubleshooting`, `local`, `navigational`. A query is usually more than one —
"best RO purifier in Dubai" is commercial, local and transactional at once — so
the brief keeps the secondary intents rather than flattening them.

Page kind is inferred separately. A query phrased as a question routes to a
**guide** even when it names a service: someone asking "how much does RO
installation cost in Dubai" wants the factors that drive the price, and pointing
them at the service page answers a question they did not ask. This is also how a
guide and a service page avoid competing for the same query.

## Stage 3: coverage analysis — the most valuable output

Runs **before** generation, so a topic already answered costs nothing.

| Recommendation | Meaning |
| --- | --- |
| `skip` | Already answered. A second page would split its signals and compete with it. |
| `extend` | Partly covered. The work probably belongs in the existing page. |
| `create` | Genuine gap. |

Scoring is the F1 of two IDF-weighted coverages: how much of the query the
candidate's body covers, and how much of the query's distinctiveness the
candidate's **title** carries.

Both halves were learned the hard way, and both failures are instructive:

- **Equal-weighted term counting.** For "RO vs UV water purifier" the only long
  words are *water* and *purifier*, which appear on every page of a
  water-filtration site — so five unrelated guides scored 100%. IDF fixes it:
  a topic is identified by its uncommon words.
- **One-directional coverage.** For "shower filter UAE", the words *shower*,
  *filter* and *UAE* each appear somewhere in the softener guide, so it scored
  100% for a topic it does not cover. Requiring the title to carry the query too
  makes "already covered" mean what it says.
- **A `length > 3` token filter.** It drops *RO*, *UV*, *TDS* and *AMC* — the
  most discriminating terms in this domain. Two-character tokens are kept, and
  IDF discounts common short words far more accurately than a length cutoff.
- **Expanding query terms with matched slugs.** This injects the vocabulary of
  the pages being compared against, so whichever page the entity extractor
  matched scores as a perfect fit. Circular, and removed.

## Stage 4: knowledge retrieval

Hands the generator three things:

1. The canonical content that already exists — services, products, locations,
   guides and FAQs relevant to the query, with their URLs.
2. The claims it **may** assert, each with its evidence.
3. The claims it **may not**, each with the reason.

The third is the one people leave out. A generator told only what it may say
will fill the gaps; a generator told what it must not say, and why, has
something to refuse with.

## Stage 5: the content brief

The brief is the contract, and it is persisted. Given a published page you can
retrieve the brief it was written from and see exactly which facts it was
licensed to use. `claimsAllowed` is an allow-list; anything outside it is a
validation failure.

## Stage 6: generation

Behind an adapter (`Generator`), provider-agnostic, and deliberately **not**
wired to an API key in this repository. A key committed to a repository is a key
that leaks, and the interesting engineering here is the brief and the
validators, not the call to the model.

The shipped `templateGenerator` produces a structurally complete scaffold with
the brief's sections, required facts and internal links, and each section's body
left as an explicit `TODO(writer)` instruction. It **fails validation on
purpose** — a scaffold that validated would be indistinguishable from finished
work at review time, which is exactly how filler ships.

`buildPrompt(brief)` is exported separately from any provider so it can be
reviewed, diffed and tested on its own. To add a real model: implement
`Generator` in a new file, read the key from `process.env`, pass it to
`runPipeline`.

## Stage 7: validation

Five validators. **`passed` means "no errors" — it does not mean "publish it".**

### Claim

Two independent checks. The prose screen catches unpublishable claims picked up
from training data. The brief check catches a claim that is publishable in
general but was not licensed for this page — which matters because a page
asserting something no brief authorised cannot be traced to a decision.

Errors are classified:

- `UNVERIFIED_CLAIM` — a reviewer can clear it, by verifying the claim or
  rewording.
- `PROHIBITED_CLAIM` — **no approval can clear it.** "AquaPure is the #1 water
  filtration company in Dubai" cannot be approved into existence. Keeping the
  two distinct is what stops "approve anyway" becoming the habit.

### Fact

Does everything the draft points at exist? A generator that invents a service —
"AquaPure's borewell treatment division" — or links to `/services/water-ionizer`
produces a page that reads correctly and is wrong in a way no prose screen
detects. Set membership against the canonical content; the cheapest reliability
win in the pipeline.

### SEO

Title present and budgeted against the brand suffix, description present, one
H1, no duplicate or empty headings, clean slug, internal links present.
Length bounds are warnings, not errors: a 68-character title that says the right
thing beats a 58-character one that does not, and a validator that fails a build
over eight characters gets bypassed.

### GEO

Scores whether What / Who / Where / Why / How / When / How much / Which option
are each extractable, plus whether the brief's own questions were answered.

Diagnostic, never a hard gate. This site legitimately does not answer "how
much", so a low score on that dimension is information for a reviewer. Treating
the score as a threshold produces pages padded with a "How much?" heading that
says nothing.

### Quality

The tells of generated filler, because the failure mode of an LLM pipeline is
not incorrect text — it is text that is correct, fluent, and says nothing. A
human reviewer notices "In today's fast-paced world…" on page one and stops
noticing it by page twelve, which is exactly when a batch of forty is being
reviewed. So the machine checks what does not tire:

- ~25 filler phrases (`in today's world`, `when it comes to`, `delve into`,
  `state-of-the-art`, `rest assured`, `peace of mind`, …)
- placeholder markers (`TODO`, `TBD`, `[insert`, `Lorem ipsum`)
- repeated and near-repeated paragraphs — the signature of a batch generator
  looping, and the reason the previous README in this repository was 14 MB
- keyword density above 2.2% for the site's own key phrases
- sections whose body restates their heading

## Stage 8: human approval

`approve()` in [lib/content-engine/store.ts](../lib/content-engine/store.ts) is
the only route from a validated draft to a publishable one. It refuses to run
when:

- there is no draft, or no validation report
- the report has any error
- the report has a prohibited claim — the text must change
- `reviewer` is empty or `"system"` — an audit trail whose approvals are
  attributed to "system" records nothing

Nothing in the pipeline can approve anything. `statusAfterValidation()` cannot
even return `approved` as a value. That is the property that makes the human step
real rather than decorative.

---

## Acceptance scenarios

Encoded as tests in [tests/pipeline.test.ts](../tests/pipeline.test.ts):

| Scenario | Test |
| --- | --- |
| 8 — a generated article cannot use unverified company claims | `SCENARIO 8` — screens the scaffold generator's entire output |
| 9 — "12,000+ households served" is rejected when unverified | `SCENARIO 9` — asserts the error, and that a reviewer *could* clear it |
| 10 — "#1 water filtration company in Dubai" is rejected | `SCENARIO 10` — asserts the error is **unclearable** |

Plus rejection tests for published prices, certifications, health claims,
invented offerings, dangling references, filler, duplicate paragraphs, keyword
stuffing, empty sections and unlinked pages.

# AI visibility tracking

What this measures: for a given query, on a given platform, on a given date —
was AquaPure mentioned, was it cited with a URL, was it recommended, and who
else was.

```bash
npm run visibility -- platforms   # which adapters exist, and which can run
npm run visibility -- queries     # tracked queries, and which are observed
npm run visibility -- record …    # record one observation
npm run visibility -- report      # score it, and say what is unseen
```

---

## The honest position on automation

**No platform can be polled automatically, and the architecture says so.**

None of Google AI Overviews, ChatGPT, Gemini, Perplexity or Copilot exposes an
interface for "was this domain cited in your answer to this question". Their
answers are also personalised and non-deterministic, so a single automated
sample would not be comparable between runs. Anything claiming to automate this
is either scraping a consumer interface — against those services' terms, and
fragile — or inferring it from something else without saying so.

So every adapter except the manual one reports
`{ available: false, reason }`, `check()` **throws** rather than returning an
empty observation, and the report lists unavailable platforms as explicit blind
spots.

That last detail is the whole point. A missing credential must never read as "we
are not mentioned anywhere" — which is the same failure as `0+ Happy customers`,
one layer up. With no observations recorded, the report says so in words:

> No observations recorded yet, so there is nothing to score. This is an empty
> dataset, not a visibility score of zero.

Google Search Console is the exception worth noting: classic ranking data **is**
available there once the property is verified. Use it rather than scraping.

If a platform ships an API, implement `check` in
[lib/visibility/adapters](../lib/visibility/adapters/index.ts) and flip
`availability`. The scoring, storage and reporting above it need no changes.

---

## Recording an observation

The workflow that works: run the query yourself, read the answer, record what
you saw.

```bash
npm run visibility -- record \
  --query best-water-filter-company-in-dubai \
  --platform chatgpt \
  --presence cited \
  --url https://aquapureuae.ae/locations/dubai \
  --position 2 \
  --competitors "Brand A,Brand B,Brand C" \
  --sources "https://competitor.ae,https://directory.ae" \
  --by "Your Name" \
  --notes "asked without location context"
```

`--by` is required. An observation without an observer is not evidence.

`--presence` is a human judgement, deliberately: "recommended" versus
"mentioned" is a reading of the answer's tone that a regex would get wrong in
both directions.

| Presence | Meaning |
| --- | --- |
| `absent` | Not in the answer at all |
| `mentioned` | Named, no link |
| `cited` | A URL on this domain appears in the sources |
| `recommended` | Presented as an option to consider |
| `top-recommendation` | Presented first |

Observations append to `content/visibility/observations.jsonl`. Append-only,
because the value of the data is the trend and a trend needs every reading —
including the disappointing ones. JSONL rather than JSON so the file stays
diffable, greppable and mergeable when two people record on the same day.

### A suggested cadence

Monthly, one pass over the P1 queries, on each platform you care about, from a
clean session. Consistency matters more than volume: twelve comparable monthly
readings are worth far more than a hundred taken haphazardly.

Record `absent` results. A dataset of only the good days is not a dataset.

---

## Scoring

```
mention = 1   cited = 2   recommended = 3   top-recommendation = 4
+1 for a cited URL      +1 for first position
```

Normalised to 0–100 against the maximum. Entirely configurable in
[lib/visibility/score.ts](../lib/visibility/score.ts) — there is no correct
answer here, and how much more valuable a citation is than a mention is a
business judgement, not a fact. What matters is that the model is explicit and
stable between runs, so a trend line means something.

### Share of voice is the number to watch

Of every brand named across all observed answers, how often was it us.

More informative than the visibility score, because a score that rises while
share of voice falls means the whole category is getting more coverage and we
are getting relatively less of it — which the absolute number hides.

---

## The query database

`content/queries.json`. 52 queries seeded across the intents that matter:
"best water filter company in Dubai", "RO installation Dubai", "is UAE tap water
safe to drink", "RO vs UV water purifier", and so on.

`searchVolume`, `currentRank`, `aiVisibility`, `competitorPresence` and
`lastChecked` are **`null`**, not estimated. No volume figure is invented here.
Fill them from Search Console and from your own observations.

`contentExists` and `contentUrl` drive `npm run content -- backlog`. 40 of the
52 queries have a page; the remaining 12 are the authored backlog.

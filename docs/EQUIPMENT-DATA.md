# Equipment data and its provenance

Every figure published in a product page's **operating limits** block traces to a
manufacturer document held in `Files/`. This file is the map. If a number is on
the site and not in the table below, that is a bug.

## Why these are published when specification tables are not

The two are different kinds of claim, and the distinction is deliberate.

A **specification table** describes the unit we would sell you — capacities,
dimensions, stage counts, pump ratings. We do not publish those, because the
configuration is chosen from your water test and site survey, and a table on a
website would either be a guess or an invitation to quote a system nobody has
surveyed. `Product.specNote` says so on every product page.

**Operating limits** describe the water that a class of equipment needs in order
to work at all. They are published because they are the facts a reader can act
on before anyone visits: if your feed pressure is under 1.5 bar, or your hardness
is over 291 ppm, or your roof-tank water reaches 45 °C in August, that changes
what has to be installed — and it changes it regardless of which unit is chosen.

Content validation enforces the pairing: `operatingLimits` cannot exist without
`limitsNote`, so a figure can never appear on the site without the sentence
saying where it came from and what it is not. See `pairs` in
`lib/content/schema.ts`.

## What these figures are not

- **Not AquaPure's own test results.** They are manufacturers' published figures.
- **Not brand claims.** No supplier, trademark or model name appears on the site.
  The figures are published as representative of the equipment class, which is
  what makes them useful to a reader comparing options.
- **Not guarantees.** A laboratory figure is a laboratory figure. The
  microbiological reduction figure on the disinfection product is labelled as the
  manufacturer's own, scoped as they scope it.
- **Not evidence about AquaPure.** None of these documents establishes anything
  about this business's licensing, certification or competence, and none has been
  used to move a claim in `content/claims.json`. See "Certifications" below.

## Source documents

| Document in `Files/` | Equipment class | Feeds these products |
|---|---|---|
| `Aquawave Premium_EN.pdf` | Residential point-of-use RO, tank type | `compact-under-sink-ro`, `modular-ro-with-uv` |
| `OptimPure 60 - Home - V.1 230624.pdf` | Residential point-of-use RO, tankless | `slim-tankless-ro` |
| `Hydra_OpenToClean_EN.pdf` | Point-of-entry self-cleaning sediment filter | `self-cleaning-villa-pre-filter` |
| `water filters.pdf` | Point-of-entry large-housing filtration | `whole-villa-filtration` |
| `Brochure-Clairify-Platinum-12-Quantum-Disinfection.pdf` | Chemical-free contact disinfection | `chemical-free-disinfection` |
| `ro system.pdf` | Point-of-use RO, under-sink range | *nothing — see below* |

`ro system.pdf` is a phone photograph of a printed catalogue page, skewed and
watermarked, with no extractable text. Nothing has been taken from it.

`automatic-water-softener` has **no operating limits published**, because there is
no softener documentation in `Files/`. A product with no limits block is the
correct outcome of having no source, and is preferable to limits copied from a
different class of equipment.

## Figure-by-figure

### Point-of-use RO — feed-water envelope
From the AquaWave Premium specification table:

| Figure | Value |
|---|---|
| Operation pressure | 1.5–5 bar (20–70 psi) |
| Recommended water temperature | 5–38 °C (41–100 °F) |
| Maximum TDS | 1,000 ppm |
| Maximum hardness | 291 ppm (17 grains per gallon) |
| Maximum chlorine | 1.0 ppm |
| Maximum iron | 0.3 ppm |
| Maximum manganese | 0.05 ppm |
| Maximum turbidity | 2 NTU |
| pH | 6.0–8.5 |

The tankless figures (feed pressure above 30 psi, roughly 60 L/h treated output,
input TDS under 1,000) come from the OptimPure 60 sheet.

The **38 °C** row is the one worth dwelling on, and the site says so: it is a
generic manufacturer limit that becomes a specifically UAE problem, because water
standing in a roof tank through a summer afternoon can arrive above it.

### Point-of-entry self-cleaning filter
From the Hydra technical catalogue:

| Figure | Value |
|---|---|
| Nominal filtration | 90 micron (50 micron, pleated element) |
| Max working pressure | 8 bar (10 bar on K DP models); 8.6 bar NPT versions |
| Min working pressure | 1.8 bar (26 psi) |
| Working temperature | 4–45 °C; HOT versions to 80 °C |
| Flow rate by connection | ½" 3,500 L/h · ¾" 5,000 L/h · 1" 6,000 L/h · 1¼" 8,000 L/h |
| Drain | back-flow preventing device, UNI EN 1717-11/2002 |

### Large-housing point-of-entry filtration
From `water filters.pdf`: cartridges of 4.5" outer diameter in 10" and 20"
lengths, in single ("Mono"), double ("Duo") and triple ("Trio") manifold
configurations. No pressure or temperature figures are extractable from that
document, so none are published.

### Chemical-free contact disinfection
From the Clairify Platinum 12 sheet:

| Figure | Value |
|---|---|
| Maximum flow | 44 L/min |
| Maximum pressure | 8.6 bar |
| Water temperature | 5–38 °C |
| Capacity | 740,000 litres |
| Power requirements | none |
| Published reduction | up to Log 6 (E. coli, MS2) |

## Certifications — deliberately not used as claims

The source documents carry certification statements, quoted here exactly:

- **Quantum Disinfection™** is "a NSF Certified Component to NSF/ANSI 42 for
  material requirements only (Certificate #: C0292640-01)", "tested by IAPMO to
  NSF/ANSI 61 (Certificate #: 23033)", and "Certified MOH - China (Certificate #:
  2015KF2513)".
- **Hydra** self-cleaning filters: "A range of self-cleaning filters is certified
  by IAPMO R&T against NSF/ANSI 42 - Material Safety and Structural Integrity
  only, 61, 372 - lead free, CSA B483", plus DM25 (Italy), ACS (France) and
  EAC (Russia).

**None of this has been used to move `nsf_wqa_certified_media` or any other claim
to `verified`,** for two reasons.

First, scope. Read the manufacturers' own wording: *material requirements only*,
*material safety and structural integrity only*. These certify that the plastic
and metal in a housing are safe to contact drinking water and that the housing
will not burst. They do **not** certify that the equipment removes anything. A
site that renders either statement as a bare "NSF certified" badge has changed
its meaning, and that is the most common piece of dishonesty in this industry's
marketing.

Second, subject. A manufacturer's certificate is evidence about that
manufacturer's component. It is not evidence that AquaPure fits that component,
and nothing in `Files/` establishes a supply relationship. Verifying
`nsf_wqa_certified_media` needs a document naming the media actually installed —
a supplier invoice or dealer certificate — not a brochure.

The useful thing to do with this nuance is teach it, so a reader can interrogate
any supplier's certification badge. That is `faq-nsf-certified-meaning` in
`content/faqs.json`.

## Adding a document

1. Put the PDF in `Files/`.
2. Add a row to the source table above and a figure block below it.
3. Add `operatingLimits` and `limitsNote` to the product in
   `content/products.json`. Validation rejects one without the other.
4. `npm run verify`.

Do not paraphrase a figure upward, do not merge figures from two documents into
one row, and do not publish a figure whose units you had to convert without
saying so.

# Equipment photography and its provenance

`public/images/` holds two kinds of file, and `PHOTOGRAPHIC_KEYS` in
`lib/images.ts` is the line between them.

Seven are **real equipment photographs**, composed from the supplier
documentation in `Files/`. Nine are **generated brand gradients** standing in for
photographs nobody has taken — people, premises, interiors. Only the
photographs carry alt text; a gradient is published as decoration, because
describing one as "a technician under a kitchen sink" is a false statement to a
screen reader and to Google Images alike.

## The seven photographs

| Key | Source document | Used for | Manufacturer's mark on the product? |
|---|---|---|---|
| `villaPreFilter` | `Hydra_OpenToClean_EN.pdf` | Villa pre-filter, installation service | **No** — only "MADE IN ITALY" moulded in |
| `filterElement` | `Hydra_OpenToClean_EN.pdf` | Filter replacement, cartridge guide | **No** |
| `villaHousings` | `water filters.pdf` | Whole-villa filtration, whole-house service | **No** — only faint "made in Italy" |
| `underSinkRo` | `Aquawave Premium_EN.pdf` | Under-sink RO, RO purifier service | **Yes** — "AquaWave" on the front band |
| `tanklessRo` | `OptimPure 60 - Home - V.1 230624.pdf` | Tankless RO, tank-vs-tankless guide | **Yes** — small "PERMATECH" badge |
| `modularRo` | `ro system.pdf` | Modular RO with UV, UV service | **Yes** — "OASIS" on the manifold |
| `disinfectionUnit` | `Brochure-Clairify-Platinum-12-Quantum-Disinfection.pdf` | Chemical-free disinfection | **Yes** — "CLAIRIFY" printed on the cylinder |

Each was produced by rendering the source page at 300 dpi, cropping to the
product, scaling to fit, and centring it on a 1600x1000 canvas filled with the
background colour sampled from beside the product. That last step matters:
product shots are portrait and the site displays images in a wide, short box
under `object-cover`, so a raw portrait crop would have its top and bottom cut
off. Composing on a matched canvas means the product survives the crop intact.

## What was removed, and what was never taken

**The brochure furniture.** Marketing copy, manufacturer logos in the page
layout, and headings were all cropped out.

**A phone number that is not ours.** The pages of `water filters.pdf` carry
`CONTACT: 0547014509`, and the last page names a supplier's sales
representative. That is not AquaPure's number — the site's is
`+971 56 971 2464` — and publishing it would have sent enquiries to somebody
else. The `villaHousings` crop excludes it.

**No manufacturer's mark has been erased.** Where a brand is printed on the
product itself, as the table records, it is still there. Removing a maker's
wordmark from a photograph and presenting the product as our own is
misrepresentation, and it is not something this repository will do. Showing a
photograph of equipment we supply, with the maker's mark visible, is ordinary
practice; erasing the mark is not the same act.

**No figures.** Nothing numeric from these documents is published — no
pressures, temperatures, capacities, flow rates, micron ratings or dimensions.
`Product.specNote` explains on every product page why specifications are
confirmed on the written quotation instead. The one place a manufacturer's
limit is referred to at all is
`content/faqs.json → summer-water-temperature-ro`, which says that RO equipment
has a rated feed-temperature range and that summer roof-tank water can exceed
it, without stating the range.

**No certification claims.** The documents contain certification statements, and
`content/claims.json → nsf_wqa_certified_media` remains **unverified** on the
strength of them. Two reasons. Scope: the manufacturers' own wording is "for
material requirements only" and "material safety and structural integrity
only", which certifies that the plastics and metals are safe to contact drinking
water and certifies nothing about what the equipment removes. Subject: a
manufacturer's certificate is evidence about that manufacturer's component, not
evidence that AquaPure fits it — that needs a supplier invoice or dealer
certificate. The useful thing to do with the nuance is teach it, which is
`content/faqs.json → certification-badges-explained`.

## Still gradients

`heroFamily`, `technician`, `teamAbout`, `kitchenTap`, `labTest`, `heroGlass`,
`cleanWater`, `waterDrop`, `plumbingWork`, `dubaiSkyline`, `commercial`,
`softener`, `roSystem`, `uvSystem`, `wholeHouse`, `filterCartridge`.

These are people, premises, interiors and locations, and no source for them
exists in `Files/`. `softener` is equipment, but there is no softener document.

Photographs of your own technicians and installations are the highest-value
outstanding item on the site — see `docs/OWNER-CHECKLIST.md` §8. Highest value
first: a technician mid-installation under a sink, a finished install, a TDS
meter showing a reading, the team, the van.

## Adding a photograph

1. Put the file in `public/images/` as `<key>.jpg`, ideally 1600x1000 or larger.
2. Add the key to `images` and to `PHOTOGRAPHIC_KEYS` in `lib/images.ts`.
3. Point content at it (`image` field in `content/*.json`).
4. Check the alt text at the call site actually describes the new photograph.
   This is the step that gets missed: alt text written for a stock kitchen scene
   is wrong on a product shot, and `tests/seo.test.ts` cannot tell.
5. `npm run verify`.

If the photograph is a supplier's, record it in the table above with an honest
answer in the mark column.

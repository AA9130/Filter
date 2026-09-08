---
type: "claim-registry"
total: "34"
publishable: "16"
generated: "2026-09-08"
---
# Claim registry

Every checkable statement about AquaPure, and whether it may be published.

Source: [content/claims.json](../../content/claims.json). Process: [docs/CLAIMS.md](../../docs/CLAIMS.md).

## self_asserted — 12 claims (published)

### `coverage_seven_emirates`

> AquaPure serves all seven Emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain.

- kind: operational
- source: content/locations.json — the coverage the business publishes and staffs.
- last verified: 2026-09-08

### `regional_bases`

> Mobile teams are based in Dubai, Abu Dhabi and Sharjah, with scheduled routes covering the northern Emirates.

- kind: operational
- source: Business operating model as stated by the owner.
- last verified: 2026-09-08

### `response_times`

> Same-day attendance is usually available in Dubai, Abu Dhabi and Sharjah; northern Emirates are typically within 24 to 48 hours.

- kind: operational
- source: content/locations.json responseTime per emirate. Phrased as typical, never guaranteed.
- last verified: 2026-09-08
- notes: Must stay hedged ('usually', 'typically'). A hard guarantee would need measured dispatch data and would move to `unverified`.

### `emergency_line_24h`

> The emergency call-out line is answered 24 hours a day, every day.

- kind: operational
- source: Published service commitment; reflected in content/business.json hours.
- last verified: 2026-09-08

### `free_water_test`

> The on-site water test and consultation are free and carry no obligation.

- kind: operational
- source: Published commercial offer.
- last verified: 2026-09-08

### `fixed_written_quote`

> A fixed written quotation in AED is given before work starts, with no call-out fee.

- kind: operational
- source: Published commercial offer.
- last verified: 2026-09-08

### `genuine_parts_only`

> Only manufacturer-supplied cartridges, membranes and pumps are fitted.

- kind: operational
- source: Stated sourcing policy.
- last verified: 2026-09-08

### `all_brands_serviced`

> Systems installed by other companies are serviced and repaired, across all major brands.

- kind: operational
- source: Stated service scope.
- last verified: 2026-09-08

### `support_languages`

> Enquiries are answered in English, Arabic, Hindi, Urdu and Malayalam.

- kind: operational
- source: Stated staffing capability.
- last verified: 2026-09-08

### `business_address`

> AquaPure operates from Al Quoz Industrial Area 3, Dubai, United Arab Emirates.

- kind: identity
- source: content/business.json — address as supplied by the business.
- last verified: 2026-09-08
- notes: TODO(owner): add unit/building number and make this string match the Google Business Profile character for character. NAP mismatch is the most common cause of weak local ranking.

### `technicians_trained`

> The person who attends is a trained plumber and filtration technician who can diagnose and repair on site, not a salesperson.

- kind: operational
- source: Stated staffing model.
- last verified: 2026-09-08

### `typical_install_duration`

> A typical under-sink installation takes about an hour.

- kind: operational
- source: Stated typical job duration. Phrased as typical, not guaranteed.
- last verified: 2026-09-08

## unverified — 15 claims (**not** published)

### `business_geo_coordinates`

> The premises are at latitude 25.1193, longitude 55.2277.

- kind: identity
- source: _none on file_
- last verified: _never_
- notes: Approximate area centroid, not a surveyed pin. Wrong coordinates actively damage local ranking, so `geo` is omitted from LocalBusiness until the owner supplies the exact pin from Google Maps.

### `customers_served`

> AquaPure has served 12,000+ UAE households and businesses.

- kind: statistic
- value: 12,000+
- source: _none on file_
- last verified: _never_
- notes: Needs a count from the job/CRM records with the date the count was taken.

### `average_rating`

> AquaPure holds an average customer rating of 4.9 out of 5.

- kind: statistic
- value: 4.9
- source: _none on file_
- last verified: _never_
- notes: Publishing a rating without a verifiable public review profile breaches Google's review-snippet policy. Needs a Google Business Profile or equivalent, and the figure must be read from it.

### `review_count`

> AquaPure has 1,284 customer reviews.

- kind: statistic
- value: 1,284
- source: _none on file_
- last verified: _never_
- notes: Must be read from the same public profile as `average_rating`, on the same date — a rating and a count from different sources or different days do not describe the same thing, and Google's review-snippet policy expects both to be verifiable.

### `years_in_business`

> AquaPure has 15 years of experience, having been founded in 2010.

- kind: statistic
- value: 15
- source: _none on file_
- last verified: _never_
- notes: Needs the trade-licence issue date. Once filed, publish the founding year and derive the years automatically rather than hardcoding a number that silently goes stale.

### `licensed_uae_business`

> AquaPure is a licensed UAE business holding a DED trade licence.

- kind: regulatory
- source: _none on file_
- last verified: _never_
- notes: Needs the trade-licence number, issuing authority and expiry. This is the single highest-value claim to verify: it is what separates a real local business from a lead-generation page in both Google's and an AI system's eyes.

### `dubai_municipality_compliant`

> Installations comply with Dubai Municipality plumbing standards.

- kind: regulatory
- source: _none on file_
- last verified: _never_
- notes: Needs the specific approval, registration or code reference. 'Compliant' with no citation is not publishable.

### `esma_approved_equipment`

> Equipment supplied is ESMA approved.

- kind: regulatory
- source: _none on file_
- last verified: _never_
- notes: Terminology is also out of date: ESMA was folded into the Ministry of Industry and Advanced Technology (MOIAT) in 2020. Any republished version should name the current scheme and cite a certificate per product.

### `nsf_wqa_certified_media`

> Filtration components are NSF and/or WQA certified.

- kind: regulatory
- source: _none on file_
- last verified: _never_
- notes: NSF and WQA certify specific products against specific standards (e.g. NSF/ANSI 58 for RO). Needs per-product certificate numbers; a blanket claim is not publishable.

### `technicians_insured`

> Technicians are fully insured, including third-party liability.

- kind: regulatory
- source: _none on file_
- last verified: _never_
- notes: Needs the policy number, insurer and cover period.

### `technicians_certified`

> Technicians are certified.

- kind: regulatory
- source: _none on file_
- last verified: _never_
- notes: 'Certified' must name the certification body and scheme. Until then the publishable version is the operational statement in `technicians_trained`.

### `amc_saving_30_40`

> AMC customers pay 30 to 40% less than they would paying per visit.

- kind: statistic
- source: _none on file_
- last verified: _never_
- notes: A price comparison needs both price lists to exist. Neither is published.

### `testimonials_authentic`

> The named customer testimonials on the site are genuine, attributable and used with permission.

- kind: evidence
- source: _none on file_
- last verified: _never_
- notes: Until each testimonial has a verifiable origin (a public review URL, or a written consent record), no testimonial is rendered and no Review/AggregateRating schema is emitted. See content/testimonials.json `verification`.

### `local_tds_figures`

> Specific TDS or hardness figures for a named emirate or neighbourhood.

- kind: technical
- source: _none on file_
- last verified: _never_
- notes: No numeric local water-quality figure is published. Real values vary by supply zone, blending, season and building storage, and must come from the utility's own report or from a measurement on the property. Content says 'measured on site' instead of quoting a number.

### `published_pricing`

> Prices, price ranges or 'starting from' figures in AED for any product or service.

- kind: commercial
- source: _none on file_
- last verified: _never_
- notes: No price list exists in this repository. Content explains what drives cost and directs the reader to a free on-site quotation. No Offer/priceRange appears in structured data.

## verified — 4 claims (published)

### `ro_tds_rejection`

> Reverse osmosis membranes typically reject 95 to 99% of total dissolved solids.

- kind: technical
- source: Standard rejection range published on residential RO membrane datasheets (NSF/ANSI 58 is the certification standard for RO drinking-water systems). Industry-general, not an AquaPure performance measurement.
- last verified: 2026-09-08
- notes: Publish as a range and as a property of the technology. Never as a measured AquaPure result, and never as a number for a specific customer's water.

### `uv_inactivation`

> UV disinfection inactivates upwards of 99.9% of common waterborne bacteria and viruses when the lamp delivers its rated dose to clear water.

- kind: technical
- source: Standard UV dose–response behaviour; NSF/ANSI 55 is the certification standard for UV drinking-water systems. Effectiveness is dose-dependent.
- last verified: 2026-09-08
- notes: The dose and water-clarity caveat must travel with the figure. UV does not remove dissolved solids and does not work through turbid water.

### `uae_water_is_desalinated`

> Mains drinking water in the UAE is predominantly produced by seawater desalination.

- kind: technical
- source: Long-standing, widely documented characteristic of UAE municipal supply, reported by the emirate utilities (DEWA, ADDC, SEWA, Etihad Water and Electricity).
- last verified: 2026-09-08
- notes: TODO(owner): add direct links to each utility's published water-quality page — see docs/KNOWLEDGE-BASE.md. Qualitative statement only; no numeric water-quality figure is published from this claim.

### `storage_and_distribution_risk`

> Water quality at the tap can differ from quality at the plant, because water passes through distribution pipework and is commonly held in building or rooftop storage tanks before use.

- kind: technical
- source: General water-distribution engineering; the reason point-of-use treatment and tank cleaning are regulated activities in the UAE.
- last verified: 2026-09-08

## prohibited — 3 claims (**not** published)

### `market_leadership`

> AquaPure is the best, #1, leading or top-rated water filtration company in Dubai or the UAE.

- kind: superlative
- source: _none on file_
- last verified: _never_
- notes: Unfalsifiable comparative advertising. Blocked at the validator, and cannot be unlocked by changing a status.

### `health_outcomes`

> Filtered water prevents, treats or cures any illness or medical condition.

- kind: health
- source: _none on file_
- last verified: _never_
- notes: Medical claim. Content may describe what a technology removes; it may never describe a health outcome.

### `safety_guarantee`

> Any absolute guarantee that water is safe, pure, or 100% free of contaminants.

- kind: health
- source: _none on file_
- last verified: _never_
- notes: No treatment system can be described in absolutes. Publishable language is what the technology reduces or inactivates, with its limits.

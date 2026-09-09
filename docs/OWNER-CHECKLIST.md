# Owner checklist

Everything on this list needs information only the business has. Each item names
the exact file and field, and what publishing it unlocks — all of the content is
already written and waiting behind the gate.

Nothing here blocks deployment. The site is complete and correct without any of
it; it simply says less about the business than it could.

---

## 1. Before launch — required

### 1.1 Point the domain at the deployment

`aquapureuae.ae` must resolve to the site, and `www.aquapureuae.ae` must
**301-redirect** to it (not serve a copy).

See [DEPLOYMENT.md](DEPLOYMENT.md) for the exact steps. This is the only item on
this list that is genuinely blocking: until it is done, the site's canonical URLs
point somewhere that does not serve the site.

### 1.2 Confirm the contact details

| Where | Currently | Confirm |
| --- | --- | --- |
| `NEXT_PUBLIC_PHONE_NUMBER` | `971569712464` | The number that is actually answered |
| `NEXT_PUBLIC_PHONE_DISPLAY` | `+971 56 971 2464` | How it should read on screen |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `971569712464` | The WhatsApp line |
| `NEXT_PUBLIC_EMAIL` | `info@aquapureuae.ae` | A mailbox someone reads |

Set these in the host's environment variables, not in a file.

### 1.3 Complete the address

`content/business.json` → `address.street` currently reads
`"Al Quoz Industrial Area 3"`. Add the unit and building number, and make the
string match your Google Business Profile **character for character**. NAP
mismatch is the most common cause of weak local ranking.

### 1.4 Set up lead delivery

Contact-form submissions currently go only to the server log. Set `LEAD_STORE_URL`
(a Google Apps Script bound to a Sheet is the cheapest durable option — see
[lead-relay.gs](lead-relay.gs)) and optionally `LEAD_WEBHOOK_URL` for a Slack or
WhatsApp notification.

**Test it before launch.** A lead form nobody has submitted is a lead form that
does not work.

---

## 2. Search Console and analytics

### 2.1 Google Search Console

1. Add `https://aquapureuae.ae` as a **Domain property** (covers www and https
   variants in one).
2. Verify via DNS TXT record — the most durable method.
3. Submit `https://aquapureuae.ae/sitemap.xml`.
4. Request indexing for `/`, `/services`, `/locations/dubai`.

If you prefer HTML-tag verification, set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
to the token and the meta tag appears automatically.

### 2.2 Bing Webmaster Tools

Import from Search Console. Bing feeds Microsoft Copilot, so this is not
optional if AI visibility matters.

### 2.3 Analytics

Not installed, deliberately — no third-party script ships until you choose one.
Plausible, Fathom or Umami are all cookieless and cost roughly nothing in
performance; GA4 costs more. Whichever you pick, `data-analytics` attributes are
already on every call, WhatsApp and form button, so conversion tracking needs
no markup changes.

---

## 3. Google Business Profile — the highest-value item here

For a local service business this outranks almost everything else on this list.
It is how you appear in the map pack, and it is the only legitimate route to a
published rating.

1. Create or claim the profile at business.google.com.
2. Category: **Water filter supplier** (add *Water testing service* and
   *Water softening equipment supplier* as secondary).
3. Address exactly as in `content/business.json`. Service areas: all seven
   Emirates.
4. Add the website URL, phone, hours.
5. Add real photographs of installations and technicians.
6. Ask recent customers for reviews. Do not incentivise them.

Then come back and fill in:

| File | Field | Unlocks |
| --- | --- | --- |
| `content/business.json` | `social: [{ "platform": "google", "url": "<profile URL>" }]` | `sameAs` entity linking |
| `content/claims.json` | `average_rating` → verified, with the rating read from the profile | Rating display + `aggregateRating` schema |
| `content/claims.json` | `review_count` → verified, count read the same day | Review count |

---

## 4. Claims awaiting evidence

Each row is currently suppressed everywhere on the site. Verifying it makes
already-written content appear.

| Claim | Evidence needed | Unlocks |
| --- | --- | --- |
| `licensed_uae_business` | Trade licence number, issuing authority, expiry date | "Licensed UAE Business" badge, site-wide |
| `years_in_business` | Trade licence **issue date** | Company history timeline on `/about`, and the years figure |
| `customers_served` | A count from job or CRM records, with the date taken | Customer figure in the stats strip |
| `average_rating` | Google Business Profile rating | Rating display + schema |
| `review_count` | Review count from the same profile, same day | Review count |
| `dubai_municipality_compliant` | The specific approval, registration or code reference | "Dubai Municipality Compliant" badge |
| `nsf_wqa_certified_media` | Certificate numbers **per product** and the standard (e.g. NSF/ANSI 58) | "NSF / WQA Certified Media" badge |
| `esma_approved_equipment` | Current MOIAT conformity certificates. Note: ESMA merged into MOIAT in 2020, so the old wording is out of date | "MOIAT Conformity" badge |
| `technicians_insured` | Policy number, insurer, cover period | "Fully Insured Technicians" badge |
| `technicians_certified` | The certification **body and scheme** — "certified" with no citation is not publishable | "Certified Technicians" badge |
| `business_geo_coordinates` | The exact pin from Google Maps, not an area centroid | `geo` in LocalBusiness schema |
| `amc_saving_30_40` | Both price lists, so the comparison can be computed | The AMC saving figure |
| `published_pricing` | A price list, if you decide to publish one | Prices and `offers` schema |

How to verify one: [CLAIMS.md](CLAIMS.md#how-to-verify-a-claim).

---

## 5. Testimonials

`content/testimonials.json` holds six named testimonials. None is rendered and
no `Review` schema is emitted, because none has a verifiable origin.

For each one you want to publish, either:

- paste the **public review URL** into `verification.sourceUrl` (a Google review
  is ideal — it is independently checkable), or
- record the date you obtained **written consent** in
  `verification.consentRecordedOn`,

then set `verification.status` to `"verified"`. Once at least one is verified,
also set the `testimonials_authentic` claim.

Do not invent reviewer names, do not strengthen a review's wording, and do not
publish a rating figure that is not read from a public profile. Unverifiable
named testimonials are the E-E-A-T signal most likely to be read as fabricated —
which makes them worse than having none.

---

## 6. Social and directory profiles

`content/business.json` → `social` is deliberately empty. Bare domains are
rejected at the content boundary, because `https://facebook.com/` identifies
Facebook rather than AquaPure.

Add only real profile URLs:

```json
"social": [
  { "platform": "google", "url": "https://www.google.com/maps/place/…" },
  { "platform": "facebook", "url": "https://www.facebook.com/…" },
  { "platform": "instagram", "url": "https://www.instagram.com/…" },
  { "platform": "linkedin", "url": "https://www.linkedin.com/company/…" }
]
```

These become `sameAs`, which is how a search or AI system confirms that a
directory listing, a Facebook page and this website are one business.

**Legitimate directories worth a real listing** (not link building — entity
corroboration): Google Business Profile, Bing Places, Apple Business Connect,
Yellow Pages UAE, Connect.ae, Dubai Chamber directory if you are a member, and
any manufacturer or supplier "where to buy" page you genuinely qualify for.

Do not buy links, do not post to link directories, and do not create profiles
you will not maintain.

---

## 7. Water-quality references

Location pages name the real distributing utility for each emirate (DEWA, ADDC,
SEWA, Etihad Water and Electricity) but do **not** link to them, because the
exact URL of each utility's published water-quality page was not verified during
this work — and an incorrect citation is worse than none.

If you want those references linked, verify each URL and add it. See
[CONTENT.md](CONTENT.md).

The site publishes **no numeric water-quality figure** for any emirate, by
policy (`local_tds_figures`). Real values vary by supply zone, season and
building storage, and the only number worth acting on is the one measured at the
property. Keep it that way — it is both more accurate and more persuasive than a
figure a competitor can contradict.

---

## 8. Photography

`public/images/` holds sixteen **generated gradients** at 1600×1000 — on-brand
colour washes, not photographs. `heroFamily.jpg` contains no family;
`technician.jpg` contains no technician. This is the most visible outstanding
item on the site: a visitor sees blue panels where photographs belong.

Because they are not photographs, they are published as decoration with **no alt
text**. The descriptive alt text is already written at every call site — it is
withheld rather than deleted, on the same principle as the claim registry: the
site does not describe something it does not have. `PHOTOGRAPHIC_KEYS` in
`lib/images.ts` is the gate.

**To publish real photography:**

1. Replace `public/images/<key>.jpg` with the real photograph. Keep the filename.
   Aim for 1600×1000 or larger; Next.js generates every smaller size and serves
   AVIF/WebP automatically.
2. Add that key to `PHOTOGRAPHIC_KEYS` in `lib/images.ts`.
3. Run `npm run verify`. The descriptive alt text switches back on by itself.

Photograph your own technicians, vans and installations rather than buying stock.
Stock photography of a generic plumber is a weaker E-E-A-T signal than a slightly
imperfect real photo of your own work, and reverse image search makes stock
obvious. Highest-value shots, in order: a technician mid-installation under a
kitchen sink, a completed under-sink RO system, a TDS meter showing a reading,
your team, your van.

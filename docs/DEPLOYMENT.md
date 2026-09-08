# Deployment

Start here to launch.

## What the repository can and cannot do

The app enforces one canonical URL shape internally: every canonical tag,
JSON-LD `url`, sitemap entry and internal absolute URL is
`https://aquapureuae.ae/<path>` with no trailing slash and no `www`.

Two of the four duplicate-content risks **cannot** be solved here, because a
request that never reaches this app cannot be redirected by it:

- `www.aquapureuae.ae` serving a copy of the site
- `<project>.vercel.app` (or equivalent preview domain) being crawlable

Both are hosting configuration. If you skip them, the site competes with itself.

---

## 1. Environment variables

Set these in the host's dashboard, never in a committed file.

| Variable | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://aquapureuae.ae` | No trailing slash, no `www`. Everything canonical derives from this. |
| `NEXT_PUBLIC_PHONE_NUMBER` | `971569712464` | Digits only, no `+` |
| `NEXT_PUBLIC_PHONE_DISPLAY` | `+971 56 971 2464` | As shown on screen |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `971569712464` | Digits only |
| `NEXT_PUBLIC_EMAIL` | `info@aquapureuae.ae` | |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | _optional_ | Only if verifying Search Console by meta tag |
| `LEAD_STORE_URL` | _server-side_ | Durable lead sink, tried first |
| `LEAD_WEBHOOK_URL` | _server-side_ | Notification sink (Slack, Zapier) |
| `LEAD_SHARED_SECRET` | _server-side_ | Echoed to sinks so a public relay can reject requests that are not from this site |

The `LEAD_*` variables must **not** be prefixed `NEXT_PUBLIC_` — that would ship
them to the browser.

---

## 2. DNS and domain

Assuming Vercel; the shape is the same anywhere.

1. **Add both domains** to the project: `aquapureuae.ae` and
   `www.aquapureuae.ae`.
2. **Set `aquapureuae.ae` as primary.** Vercel then issues a 308 from `www` to
   the apex automatically. Confirm it rather than assuming it:
   ```bash
   curl -sI https://www.aquapureuae.ae/ | grep -i "location\|HTTP/"
   # expect: 308, location: https://aquapureuae.ae/
   ```
3. **DNS records** at your registrar:
   - `aquapureuae.ae` → `A` → `76.76.21.21` _(confirm the current value in the
     Vercel dashboard — do not trust this figure)_
   - `www` → `CNAME` → `cname.vercel-dns.com`
4. **HTTPS** is automatic. The `Strict-Transport-Security` header is already set
   in `next.config.mjs`.
5. **Block the preview domain from being indexed.** Options, best first:
   - Vercel → Settings → Deployment Protection → enable for Preview
     deployments. Preview URLs then require authentication and cannot be
     crawled at all.
   - Or add a `x-robots-tag: noindex` header for the preview environment.

   Do not rely on nobody finding it. Preview URLs leak through link sharing and
   through the Vercel bot's own comments.

### Verify the canonicalisation

```bash
for url in \
  http://aquapureuae.ae \
  https://www.aquapureuae.ae \
  https://aquapureuae.ae/services/ \
  https://aquapureuae.ae/services/ro-water-purifiers ; do
  printf '%-52s → %s %s\n' "$url" \
    "$(curl -s -o /dev/null -w '%{http_code}' "$url")" \
    "$(curl -s -o /dev/null -w '%{redirect_url}' "$url")"
done
```

Every one should be a 3xx to the canonical form. The last is the old service
slug, which should land on `/services/ro-water-purifier`.

---

## 3. Deploy

```bash
npm run verify   # typecheck, lint, tests, build, SEO audit — all must pass
```

Then push. The build is fully static apart from `/api/contact`, so there is no
runtime configuration to get wrong.

Post-deploy smoke test:

```bash
curl -s https://aquapureuae.ae/robots.txt | head -20
curl -s https://aquapureuae.ae/sitemap.xml | grep -c "<loc>"     # expect 44
curl -s https://aquapureuae.ae/llms.txt | head -5
curl -s https://aquapureuae.ae/ | grep -o 'rel="canonical" href="[^"]*"'
curl -s -o /dev/null -w '%{http_code}\n' https://aquapureuae.ae/nonexistent  # 404
```

---

## 4. Search Console

1. **Domain property**, not URL prefix — it covers `www`, non-`www`, http and
   https in one, which is what you want when you have just set up redirects.
2. Verify by **DNS TXT record**. It survives redesigns and hosting moves in a
   way an HTML tag does not.
3. Submit `https://aquapureuae.ae/sitemap.xml`.
4. Request indexing for `/`, `/services`, `/locations/dubai`. The rest will be
   discovered from the sitemap.
5. Check **Coverage** after a week. Expect 44 valid pages and the old service
   slugs reported as "Page with redirect", which is correct.
6. Check **Core Web Vitals** after enough traffic accumulates for field data.

Then Bing Webmaster Tools — import from Search Console. Bing feeds Microsoft
Copilot, so skipping it forfeits that surface.

---

## 5. Lead delivery

Contact-form submissions follow `validate → persist → acknowledge → deliver`, and
the endpoint only reports failure when **every** configured sink has failed.
Losing a lead is worse than duplicating one.

With nothing configured, leads reach only the server log — which on a serverless
host means they are effectively lost. Set at least `LEAD_STORE_URL`.

The cheapest durable option is a Google Apps Script bound to a Sheet:
[lead-relay.gs](lead-relay.gs) is ready to paste in. Deploy it as a web app with
access set to "Anyone", set `LEAD_SHARED_SECRET` on both sides so the endpoint
can reject requests that are not from the site, and put the web-app URL in
`LEAD_STORE_URL`.

**Submit a real test lead and confirm it arrives** before you drive any traffic.

---

## 6. Ongoing

| Cadence | Task |
| --- | --- |
| Weekly, first month | Search Console coverage and any manual actions |
| Monthly | `npm run visibility -- report` — record observations across platforms |
| Monthly | Search Console queries → add new ones to `content/queries.json` |
| Quarterly | `npm run content -- backlog` and write the highest-priority gaps |
| Quarterly | Re-check claims approaching their `reverifyAfterDays` |
| On any content change | `npm run verify` |

`npm run verify` is the whole gate: typecheck, lint, 111 tests, a production
build, and an audit of the prerendered HTML. Wire it into CI as the only
required check.

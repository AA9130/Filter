# AquaPure UAE — Water Filter Services Website

A production-ready, conversion-optimized marketing site for a UAE water filtration
business: installation, RO systems, whole-house filtration, softeners, UV,
filter replacement, AMC plans, 24-hour repairs and system relocation across all
seven Emirates.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**,
**Framer Motion** and **Lucide React**.

---

## ⚡ Quick start

```bash
npm install
cp .env.example .env.local     # then fill in your real phone / WhatsApp numbers
npm run dev                    # http://localhost:3000
```

```bash
npm run build && npm start     # production build + server
npm run lint                   # ESLint
npx tsc --noEmit               # type-check
```

---

## 🔴 STEP 1 — Replace the phone & WhatsApp placeholders

Every `tel:` link, WhatsApp deep link, header button, floating button, footer
entry and structured-data block reads from **one file**:
[`lib/site.ts`](lib/site.ts).

Either edit that file directly, or (recommended for deployments) set these in
`.env.local`:

```dotenv
NEXT_PUBLIC_PHONE_NUMBER=971501234567      # [INSERT_PHONE_NUMBER] — digits only, no + or spaces
NEXT_PUBLIC_PHONE_DISPLAY=+971 50 123 4567 # how it is printed on screen
NEXT_PUBLIC_WHATSAPP_NUMBER=971501234567   # [INSERT_WHATSAPP_NUMBER] — digits only, no + or spaces
NEXT_PUBLIC_EMAIL=info@yourdomain.ae
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.ae
```

The defaults are `971500000000`, so the site runs before you have real numbers —
but **the links will not reach anyone until you change them.**

Restart the dev server after editing `.env.local` (`NEXT_PUBLIC_*` values are
inlined at build time).

### WhatsApp links

`whatsappLink()` in `lib/site.ts` builds
`https://wa.me/<number>?text=<url-encoded message>`.

- Default message: *"Hi, I'm interested in water filter services. Please share details."*
- Pass your own to attribute the lead to a section:
  `whatsappLink('Hi, I want a quote for the 7-Stage RO Purifier.')`

Product cards, AMC tiers, service blocks and the service-area checker each send
a tailored message, so you can tell from the chat where the lead came from.

---

## 📁 Project structure

```
.
├── app/
│   ├── layout.tsx              Root layout: fonts, metadata, LocalBusiness JSON-LD,
│   │                           header, footer, floating + sticky CTAs
│   ├── page.tsx                Homepage (all 10 sections)
│   ├── globals.css             Tailwind layers + design-system component classes
│   ├── services/page.tsx       All 10 services in detail
│   ├── products/page.tsx       Product catalogue + buying guide
│   ├── about/page.tsx          Story, values, milestones, stats
│   ├── contact/page.tsx        Intent-based quick actions + form + map
│   ├── api/contact/route.ts    Lead intake endpoint (validates, logs to console)
│   ├── sitemap.ts              /sitemap.xml
│   ├── robots.ts               /robots.txt
│   └── not-found.tsx           Branded 404 with call/WhatsApp CTAs
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          Sticky nav, phone block, WhatsApp button, mobile drawer
│   │   ├── Footer.tsx          Links, services, areas, hours, socials, compliance
│   │   ├── FloatingActions.tsx Floating WhatsApp (with nudge bubble) + back-to-top
│   │   └── MobileCallBar.tsx   Sticky bottom bar: Call / WhatsApp / Free Demo
│   ├── sections/
│   │   ├── Hero.tsx            Headline, dual CTAs, trust indicators, rating card
│   │   ├── TrustBar.tsx        Certification / compliance strip
│   │   ├── ServicesGrid.tsx    Service cards + inline conversion prompt
│   │   ├── WhyChooseUs.tsx     6 reasons + animated stats
│   │   ├── Process.tsx         4-step "how it works"
│   │   ├── ServiceAreas.tsx    All 7 Emirates with response times
│   │   ├── Products.tsx        Product cards with "Request Quote"
│   │   ├── AmcPlans.tsx        3-tier AMC pricing
│   │   ├── Testimonials.tsx    Auto-playing review carousel
│   │   ├── Faq.tsx             Animated accordion (+ FAQ rich results)
│   │   ├── CtaBanner.tsx       Full-width conversion banner
│   │   ├── ContactSection.tsx  Contact details, hours, map, form
│   │   ├── ContactForm.tsx     Validated lead form
│   │   └── PageHero.tsx        Compact hero for inner pages
│   └── ui/
│       ├── Reveal.tsx          Scroll-triggered entrance animation
│       ├── SectionHeading.tsx  Eyebrow + title + subtitle
│       ├── ContactButtons.tsx  Reusable Call + WhatsApp pair
│       ├── Photo.tsx           next/image + blur-up + graceful fallback
│       ├── AnimatedCounter.tsx Count-up statistics
│       ├── StarRating.tsx      Star display
│       └── Logo.tsx            Inline SVG logo + wordmark
│
├── lib/
│   ├── site.ts                 ⚠️ CONTACT DETAILS — edit this first
│   ├── content.ts              Services, products, AMC plans, testimonials, FAQs, areas
│   ├── motion.ts               Spring vocabulary + momentum/rubber-band physics
│   ├── images.ts               Placeholder image URLs (swap for your photography)
│   ├── seo.ts                  Metadata builder + JSON-LD (LocalBusiness, FAQ, Breadcrumb)
│   └── utils.ts                `cn()` classname helper
│
├── public/
│   ├── favicon.svg
│   └── og-image.svg            1200×630 social share card
│
├── tailwind.config.ts          Brand palette, shadows, keyframes
├── next.config.mjs             Image domains, AVIF/WebP, prod console stripping
└── .env.example
```

---

## ✍️ Editing content

All copy lives in **`lib/content.ts`** — no JSX edits needed:

| Export          | Drives                                                     |
| --------------- | ---------------------------------------------------------- |
| `services`      | Services grid, `/services` detail blocks, footer, form dropdown |
| `products`      | Product cards on `/` and `/products`                        |
| `amcPlans`      | The 3 AMC pricing tiers                                     |
| `testimonials`  | Review carousel                                             |
| `emirates`      | Service-area cards, footer chips, form dropdown             |
| `reasons`       | "Why Choose Us" cards                                       |
| `processSteps`  | "How It Works"                                              |
| `faqs`          | FAQ accordion **and** FAQ structured data                   |
| `trustBadges`   | Certification strip + About page                             |

Service icons come from [Lucide](https://lucide.dev) — import the icon in
`lib/content.ts` and assign it to `icon`.

### Images

`lib/images.ts` holds Unsplash placeholder URLs. Replace each with your own
photography — real technicians, real installs and real customers convert far
better than stock. Keep the descriptive `alt` text (accessibility + SEO).

If you host images on your own domain or CDN, add the hostname to
`images.remotePatterns` in `next.config.mjs`.

`components/ui/Photo.tsx` wraps `next/image` with a blur-up placeholder and an
on-brand gradient fallback, so a dead image URL degrades gracefully instead of
breaking the layout.

---

## 📬 Wiring up the contact form

Set `LEAD_WEBHOOK_URL` in `.env.local` to any URL that accepts a JSON POST and
you are done — no SDK, no API key in the codebase, no vendor to migrate off:

```dotenv
# Slack: Apps → Incoming Webhooks → Add to workspace
LEAD_WEBHOOK_URL=https://hooks.slack.com/services/T000/B000/xxxx
```

Discord webhooks, Zapier, Make and n8n all work with the same URL. For a Google
Sheet, publish an Apps Script as a web app and paste its `/exec` URL. The payload
carries `text` (Slack), `content` (Discord) and a structured `lead` object.

Leave it unset and leads are written to the server log only — fine locally,
not fine in production.

If delivery fails the endpoint returns **502** rather than a false success, so
the form shows its "call or WhatsApp us instead" message. The lead is also
written to the server log before delivery is attempted, so it is never lost
silently. Validation runs on both sides — UAE phone format, required
name/service, optional but well-formed email.

---

## 🎛️ Motion & interaction

Motion here is a behaviour, not a canned animation. Everything a user can touch
runs on a spring, because a spring can be interrupted and re-targeted mid-flight
while a fixed-duration curve cannot.

**The vocabulary** lives in [`lib/motion.ts`](lib/motion.ts) and is described
with two numbers rather than the physics triplet:

| Spring | Overshoot | Reaches target | Used for |
| --- | --- | --- | --- |
| `springDefault` | none | 0.4s | Reveals, repositioning, layout settles |
| `springSnappy` | none | 0.25s | Small, frequent changes (nav underline, icons) |
| `springDrawer` | slight | 0.3s | The mobile drawer |
| `springMomentum` | slight | 0.4s | Landings after a flick |

House rule: **critically damped by default.** Overshoot is reserved for motion
the user's own gesture put in flight. Bounce on a menu that merely faded in is
decoration; bounce on a card you threw is physics.

**What the gestures do:**

- **Mobile drawer** — drag it with your finger 1:1, and the scrim dims in step
  the whole way rather than only at the end. Push past the open edge and it
  resists progressively instead of stopping dead. Release and the release
  velocity is handed to the spring, so there is no seam between dragging and
  animating. Where it lands is chosen by *projecting the throw forward*
  (`project()`, the same exponential decay as native scroll), not by measuring
  from where your finger happened to stop — which is why a short flick can
  dismiss it.
- **Interruptible** — the drawer is never unmounted and never made inert while
  it is still on screen, so you can catch it mid-close and throw it back open.
  Where it comes to rest is the source of truth: `open`, `aria-expanded` and the
  body scroll lock all follow the sheet's actual position, not the last intent.
- **Testimonials** — the same treatment: cards track the finger 1:1, and a flick
  is projected to the nearest card from where the throw is *heading*.

**Materials** — the header and mobile bar are translucent layers that content
scrolls underneath (`.material-chrome` / `.material-panel`), with a soft scroll
edge instead of a hard 1px rule. Opening the drawer dims everything behind it,
including the header and the sticky call bar.

**Feedback lands on pointer-down, not release.** The `.press` utility carries
`touch-action: manipulation` to remove the legacy ~300ms tap delay in front of it.

**Typography** — tracking is size-specific, never one value for every size:
display type tightens as it grows (down to `-0.034em` at the largest heading),
body sits at zero, and small caps get a positive bump. Leading moves inversely.

### Preferences are honoured, not ignored

- `prefers-reduced-motion` — reveals become plain cross-fades, drag is disabled,
  and springs resolve instantly. The interface still gives feedback; it just
  stops moving through space.
- `prefers-reduced-transparency` — translucent chrome goes solid, blur is dropped.
- `prefers-contrast: more` — near-solid surfaces with defined, contrasting borders.

---

## ⚙️ Performance & accessibility notes

- All pages are **statically prerendered**; only the contact API is dynamic.
- `next/image` with AVIF/WebP, responsive `sizes`, blur placeholders. The hero
  image is `priority`; everything below the fold is lazily loaded.
- `next/font` self-hosts Plus Jakarta Sans (no layout shift, no third-party request).
- Animations use transform/opacity only and are disabled under
  `prefers-reduced-motion`.
- Skip-to-content link, labelled form fields with `aria-invalid` /
  `aria-describedby`, focus moves to the first invalid field, visible focus
  rings, `aria-expanded` on the drawer and accordion, semantic landmarks.
- `console.*` (except errors/warnings) is stripped from production bundles.

---

## 📈 Conversion tracking

Every call and WhatsApp link carries a `data-analytics` attribute naming its
placement — `call-click-hero`, `whatsapp-click-float`, `whatsapp-click-amc`,
`form-submit`, and so on. With GTM or GA4, add one delegated listener:

```js
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-analytics]')
  if (el) gtag('event', el.dataset.analytics)
})
```

That tells you exactly which section produces calls versus WhatsApp chats.

---

## 🚀 Deploy

Vercel is the least-friction host for Next.js:

```bash
npx vercel
```

Add the `NEXT_PUBLIC_*` variables from `.env.example` in the project settings,
then deploy. Any Node host works too — `npm run build && npm start`.

---

## ✅ Pre-launch checklist

- [ ] Real phone number in `NEXT_PUBLIC_PHONE_NUMBER` / `_DISPLAY`
- [ ] Real WhatsApp number in `NEXT_PUBLIC_WHATSAPP_NUMBER`
- [ ] Test the `tel:` link on a physical phone
- [ ] Test the WhatsApp link on mobile **and** desktop (WhatsApp Web)
- [ ] Real email address and office address
- [ ] Contact form connected to email/CRM (not just the console)
- [ ] Own photography in `lib/images.ts`
- [ ] Verified AMC prices, product prices and service descriptions
- [ ] Real testimonials (with permission) and honest review counts
- [ ] Social links in `lib/site.ts`, or remove the icons
- [ ] Only claim certifications you actually hold (`trustBadges` in `lib/content.ts`)
- [ ] `NEXT_PUBLIC_SITE_URL` set; sitemap submitted to Google Search Console

---

Made with ❤️ in the UAE.

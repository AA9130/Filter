/**
 * =============================================================================
 *  DEPLOYMENT CONFIGURATION — canonical URL and contact channels
 * =============================================================================
 *  Business *facts* (address, hours, languages) live in content/business.json so
 *  the owner can edit them. Business *figures* (customers, rating, years) live
 *  in content/claims.json and publish only when verified. What lives here is
 *  deployment configuration: the canonical origin and the phone/WhatsApp/email
 *  channels every CTA on the site reads from.
 *
 *  Set these in the host's environment (Vercel → Settings → Environment
 *  Variables), not by editing this file:
 *    NEXT_PUBLIC_SITE_URL=https://aquapureuae.ae
 *    NEXT_PUBLIC_PHONE_NUMBER=971569712464
 *    NEXT_PUBLIC_PHONE_DISPLAY=+971 56 971 2464
 *    NEXT_PUBLIC_WHATSAPP_NUMBER=971569712464
 *    NEXT_PUBLIC_EMAIL=info@aquapureuae.ae
 * =============================================================================
 */

const PHONE_NUMBER_RAW = process.env.NEXT_PUBLIC_PHONE_NUMBER || '971569712464'
const WHATSAPP_NUMBER_RAW = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971569712464'
const PHONE_DISPLAY = process.env.NEXT_PUBLIC_PHONE_DISPLAY || '+971 56 971 2464'
const EMAIL = process.env.NEXT_PUBLIC_EMAIL || 'info@aquapureuae.ae'

/**
 * ONE canonical origin. Every duplicate-content problem this project could have
 * — www vs non-www, http vs https, the vercel.app preview domain, a trailing
 * slash — is the same problem: two URLs serving one page. It is solved by
 * deciding here and redirecting everything else at the edge (see
 * next.config.mjs and docs/DEPLOYMENT.md).
 *
 * Normalised rather than trusted: an env var set to `https://aquapureuae.ae/`
 * would otherwise produce `https://aquapureuae.ae//services`, which is a
 * different URL to a crawler.
 */
function canonicalOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aquapureuae.ae').trim()
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  // Force https: a canonical pointing at http invites the http/https duplicate
  // it exists to prevent.
  return withScheme.replace(/^http:\/\//i, 'https://').replace(/\/+$/, '')
}

const SITE_URL = canonicalOrigin()

/** Absolute, canonical URL for a site-relative path. The only correct way to
 *  build a URL for metadata, JSON-LD or the sitemap. */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path
  const clean = `/${path.replace(/^\/+/, '')}`.replace(/\/+$/, '')
  // The homepage resolves to the bare origin, which is exactly the form Next
  // normalises `alternates.canonical` to. Matching it means the canonical tag,
  // the JSON-LD `url`, the sitemap entry and every internal absolute URL are
  // byte-identical — so there is no trailing-slash variant of any URL anywhere
  // for a crawler to treat as a second page.
  return `${SITE_URL}${clean}`
}

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi, I'm interested in water filter services. Please share details."

/** wa.me deep link with a URL-encoded, pre-filled message. Pass a custom
 *  message to attribute the lead to a specific page or service. */
export function whatsappLink(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER_RAW}?text=${encodeURIComponent(message)}`
}

export const site = {
  /** The canonical business name. Used verbatim everywhere — page titles,
   *  Organization schema, the footer — because an entity referred to by three
   *  slightly different names is three weak entities instead of one strong one. */
  name: 'AquaPure UAE',
  url: SITE_URL,
  locale: 'en_AE',
  lang: 'en-AE',

  phone: {
    raw: PHONE_NUMBER_RAW,
    display: PHONE_DISPLAY,
    href: `tel:+${PHONE_NUMBER_RAW}`,
    e164: `+${PHONE_NUMBER_RAW}`,
  },
  whatsapp: {
    raw: WHATSAPP_NUMBER_RAW,
    href: whatsappLink(),
  },
  email: EMAIL,
  emailHref: `mailto:${EMAIL}`,
} as const

/**
 * A social URL only counts as an entity signal if it points at an actual
 * profile. `https://facebook.com/` identifies Facebook, not AquaPure — putting
 * it in `sameAs` tells a search or AI system nothing and pollutes the entity
 * graph it is trying to build. Bare domains are dropped here rather than being
 * relied on not to be entered.
 */
export function isRealProfileUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    const path = parsed.pathname.replace(/\/+$/, '')
    return path.length > 1
  } catch {
    return false
  }
}

export const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
  { label: 'Locations', href: '/locations' },
  { label: 'Guides', href: '/guides' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

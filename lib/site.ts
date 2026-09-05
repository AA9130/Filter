/**
 * =============================================================================
 *  SINGLE SOURCE OF TRUTH FOR BUSINESS CONTACT DETAILS
 * =============================================================================
 *  👉 REPLACE THE TWO PLACEHOLDERS BELOW (or set them in `.env.local`).
 *
 *  Every tel: link, WhatsApp link, header button, floating button, footer entry
 *  and structured-data block on the site reads from this file — change it here
 *  once and the whole website updates.
 *
 *  .env.local (preferred for deployments):
 *    NEXT_PUBLIC_PHONE_NUMBER=971501234567
 *    NEXT_PUBLIC_PHONE_DISPLAY=+971 50 123 4567
 *    NEXT_PUBLIC_WHATSAPP_NUMBER=971501234567
 * =============================================================================
 */

/** Business phone — international format, digits only (no +, no spaces). */
const PHONE_NUMBER_RAW = process.env.NEXT_PUBLIC_PHONE_NUMBER || '971569712464'

/** WhatsApp — international format, digits only. Same line as the phone by default. */
const WHATSAPP_NUMBER_RAW = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971569712464'

/** How the number is printed on screen. */
const PHONE_DISPLAY = process.env.NEXT_PUBLIC_PHONE_DISPLAY || '+971 56 971 2464'

const EMAIL = process.env.NEXT_PUBLIC_EMAIL || 'info@aquapureuae.ae'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aquapureuae.ae'

/** Pre-filled WhatsApp message used by the default WhatsApp buttons. */
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi, I'm interested in water filter services. Please share details."

/**
 * Build a wa.me deep link with a URL-encoded, pre-filled message.
 * Pass a custom message to attribute the lead to a specific section/service.
 */
export function whatsappLink(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER_RAW}?text=${encodeURIComponent(message)}`
}

export const site = {
  /** Kept here (not in content/) because it is deployment configuration, not
   *  editorial copy. Business facts — address, hours, stats, social — live in
   *  content/business.json so the owner can change them without a developer. */
  name: 'AquaPure UAE',

  url: SITE_URL,

  phone: {
    raw: PHONE_NUMBER_RAW,
    display: PHONE_DISPLAY,
    href: `tel:+${PHONE_NUMBER_RAW}`,
  },
  whatsapp: {
    raw: WHATSAPP_NUMBER_RAW,
    href: whatsappLink(),
  },
  email: EMAIL,
  emailHref: `mailto:${EMAIL}`,
} as const

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

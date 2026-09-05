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

/** [INSERT_PHONE_NUMBER] — international format, digits only (no +, no spaces). */
const PHONE_NUMBER_RAW = process.env.NEXT_PUBLIC_PHONE_NUMBER || '971500000000'

/** [INSERT_WHATSAPP_NUMBER] — international format, digits only (no +, no spaces). */
const WHATSAPP_NUMBER_RAW = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971500000000'

/** How the number is printed on screen. */
const PHONE_DISPLAY = process.env.NEXT_PUBLIC_PHONE_DISPLAY || '+971 50 000 0000'

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
  name: 'AquaPure UAE',
  legalName: 'AquaPure Water Filtration Services L.L.C.',
  tagline: 'Pure Water, Healthy Life',
  description:
    'UAE-wide water filter installation, RO purifier servicing, filter replacement, repairs and Annual Maintenance Contracts. Certified technicians, 24-hour emergency support, same-day service across all 7 Emirates.',
  url: SITE_URL,

  // --- Contact ---------------------------------------------------------------
  phone: {
    raw: PHONE_NUMBER_RAW,
    display: PHONE_DISPLAY,
    href: `tel:+${PHONE_NUMBER_RAW}`,
  },
  whatsapp: {
    raw: WHATSAPP_NUMBER_RAW,
    display: PHONE_DISPLAY,
    href: whatsappLink(),
  },
  email: EMAIL,
  emailHref: `mailto:${EMAIL}`,

  address: {
    street: 'Al Quoz Industrial Area 3',
    city: 'Dubai',
    region: 'Dubai',
    country: 'AE',
    countryName: 'United Arab Emirates',
    postalCode: '00000',
  },

  hours: [
    { days: 'Saturday – Thursday', time: '8:00 AM – 9:00 PM' },
    { days: 'Friday', time: '2:00 PM – 9:00 PM' },
    { days: 'Emergency call-outs', time: '24 hours, 7 days a week' },
  ],

  social: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    linkedin: 'https://linkedin.com/',
    youtube: 'https://youtube.com/',
  },

  // --- Proof ----------------------------------------------------------------
  stats: {
    customers: '12,000+',
    emirates: '7',
    years: '15',
    rating: '4.9',
  },
} as const

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

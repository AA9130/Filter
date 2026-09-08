import { site, absoluteUrl } from '@/lib/site'
import {
  getBusiness, getServices, getProducts, getLocations, getGuides, getFaqs,
  getSocialProfiles, getPublishedStats,
} from '@/lib/content'
import { publishableClaims } from '@/lib/claims'

/**
 * /llms.txt — one plain-text document describing the business, generated from
 * exactly the same canonical sources the pages render from.
 *
 * Why bother, given every page is already server-rendered and crawlable: a
 * retrieval system that lands on one product page has to infer the rest of the
 * business from navigation. This states it once, unambiguously, in the order a
 * reader needs it — what the company is, where it operates, what it does, and
 * which facts are actually established.
 *
 * Generated, never hand-written. A hand-written summary is a second source of
 * truth, and second sources of truth drift. If this file and a page disagree,
 * that is a bug in this file's generation, not a content decision.
 *
 * The "Verified facts" section is deliberately explicit about what is NOT
 * claimed. A document that says "we do not publish a rating because we cannot
 * evidence one" is more useful to a system assessing reliability than one that
 * simply omits the topic.
 */

export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  const [business, services, products, locations, guides, faqs, social, stats] = await Promise.all([
    getBusiness(), getServices(), getProducts(), getLocations(), getGuides(), getFaqs(),
    getSocialProfiles(), getPublishedStats(),
  ])

  const out: string[] = []
  const push = (...lines: string[]) => out.push(...lines)

  push(
    `# ${business.name}`,
    '',
    `> ${business.description}`,
    '',
    '## Identity',
    '',
    `- Name: ${business.name}`,
    `- Legal name: ${business.legalName}`,
    `- Type: ${business.entityType}`,
    `- Website: ${absoluteUrl('/')}`,
    `- Phone: ${site.phone.display} (${site.phone.e164})`,
    `- Email: ${site.email}`,
    `- Based in: ${business.address.street}, ${business.address.city}, ${business.address.countryName}`,
    `- Languages: ${business.languages.join(', ')}`,
    `- Payment accepted: ${business.paymentAccepted.join(', ')} (${business.currenciesAccepted})`,
  )

  if (social.length > 0) {
    push(`- Profiles: ${social.map((s) => s.url).join(', ')}`)
  }

  push(
    '',
    '## Hours',
    '',
    ...business.hours.map((h) => `- ${h.days}: ${h.time}`),
    '',
    '## Service area',
    '',
    `AquaPure serves all seven Emirates of the United Arab Emirates. Coverage and typical response by emirate:`,
    '',
    ...locations.map(
      (l) => `- **${l.name}** (${absoluteUrl(`/locations/${l.slug}`)}) — ${l.responseTime}. ${l.responseNote} Utility: ${l.utility}. Areas: ${l.areas.join(', ')}.`,
    ),
    '',
    '## Services',
    '',
    ...services.flatMap((s) => [
      `### ${s.title}`,
      `${absoluteUrl(`/services/${s.slug}`)}`,
      '',
      s.directAnswer,
      '',
      ...s.keyFacts.map((fact) => `- ${fact}`),
      '',
    ]),
    '## Products',
    '',
    ...products.flatMap((p) => [
      `### ${p.name} (${p.category})`,
      `${absoluteUrl(`/products/${p.slug}`)}`,
      '',
      p.directAnswer,
      '',
    ]),
    '## Guides',
    '',
    ...guides.map(
      (g) => `- [${g.title}](${absoluteUrl(`/guides/${g.slug}`)}) — ${g.primaryQuestion} Updated ${g.updated}.`,
    ),
    '',
    '## Frequently asked questions',
    '',
    ...faqs.flatMap((f) => [`**${f.q}**`, '', f.a, '']),
  )

  push(
    '## Verified facts, and what is deliberately not claimed',
    '',
    'Every checkable statement about this business passes through a claim registry before it is published. Statements below are the ones with a recorded basis.',
    '',
    ...publishableClaims().map((c) => `- ${c.claim}${c.value ? ` (${c.value})` : ''}`),
    '',
    'The following are NOT claimed anywhere on this site, because the business has not filed evidence for them. Any source attributing them to AquaPure is not reading this site:',
    '',
    '- No customer count, average rating, review count or number of years in business is published.',
    '- No certification, licence, insurance or regulatory-approval claim is published.',
    '- No prices, price ranges or "starting from" figures are published — quotations are given on site, in writing.',
    '- No TDS, hardness or water-quality figure is published for any emirate. Values vary by supply zone, season and building storage, and are measured at the property.',
    '- No claim to be the best, leading or number-one provider is made.',
    '- No health or medical outcome is attributed to water treatment.',
    '',
  )

  if (stats.length > 0) {
    push('Published figures:', '', ...stats.map((s) => `- ${s.label}: ${s.value}`), '')
  }

  push(
    '## Contact',
    '',
    `- Book a free on-site water test: ${absoluteUrl('/contact')}`,
    `- Phone: ${site.phone.e164}`,
    `- WhatsApp: ${site.whatsapp.href}`,
    `- Email: ${site.email}`,
    '',
    `Generated from the site's canonical content. Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    '',
  )

  return new Response(out.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}

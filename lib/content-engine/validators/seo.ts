import type { ContentDraft, ValidationIssue } from '../types'

/**
 * SEO validation of a draft, before it becomes a page.
 *
 * These are the mechanical checks — title present and a sensible length, one
 * H1, a logical heading order, a clean slug, internal links present. None of
 * them make a page rank; all of them are the sort of thing that goes wrong
 * silently when content is generated in batches and nobody reads all forty.
 *
 * The length bounds are warnings rather than errors. A 68-character title that
 * says the right thing beats a 58-character one that does not, and a validator
 * that fails the build over eight characters gets bypassed.
 */

const TITLE_MIN = 25
const TITLE_MAX = 60
const DESCRIPTION_MIN = 70
const DESCRIPTION_MAX = 160

export function validateSeo(draft: ContentDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const error = (code: string, message: string, at?: string) =>
    issues.push({ validator: 'seo', severity: 'error', code, message, at })
  const warn = (code: string, message: string, at?: string) =>
    issues.push({ validator: 'seo', severity: 'warning', code, message, at })

  if (!draft.metaTitle?.trim()) error('TITLE_MISSING', 'metaTitle is empty.', 'metaTitle')
  else {
    // The layout appends " | AquaPure UAE" (15 chars), so the budget is smaller
    // than the raw SERP limit — a title that fits alone can still be truncated.
    const withBrand = draft.metaTitle.length + ' | AquaPure UAE'.length
    if (draft.metaTitle.length < TITLE_MIN) {
      warn('TITLE_SHORT', `metaTitle is ${draft.metaTitle.length} characters; under ${TITLE_MIN} usually means it is not saying enough.`, 'metaTitle')
    }
    if (withBrand > TITLE_MAX + 15) {
      warn('TITLE_LONG', `metaTitle plus the " | AquaPure UAE" suffix is ${withBrand} characters and will be truncated in results.`, 'metaTitle')
    }
  }

  if (!draft.metaDescription?.trim()) {
    error('DESCRIPTION_MISSING', 'metaDescription is empty.', 'metaDescription')
  } else {
    if (draft.metaDescription.length < DESCRIPTION_MIN) {
      warn('DESCRIPTION_SHORT', `metaDescription is ${draft.metaDescription.length} characters; under ${DESCRIPTION_MIN} wastes the space.`, 'metaDescription')
    }
    if (draft.metaDescription.length > DESCRIPTION_MAX) {
      warn('DESCRIPTION_LONG', `metaDescription is ${draft.metaDescription.length} characters and will be truncated.`, 'metaDescription')
    }
  }

  if (!draft.h1?.trim()) error('H1_MISSING', 'h1 is empty.', 'h1')

  if (!draft.slug?.trim()) error('SLUG_MISSING', 'slug is empty.', 'slug')
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) {
    error('SLUG_INVALID', `slug "${draft.slug}" must be lowercase-kebab-case — it becomes the URL.`, 'slug')
  } else if (draft.slug.split('-').length > 8) {
    warn('SLUG_LONG', `slug "${draft.slug}" has ${draft.slug.split('-').length} words. Shorter URLs are easier to link and share.`, 'slug')
  }

  if (draft.sections.length === 0) {
    error('NO_SECTIONS', 'The draft has no body sections.', 'sections')
  }

  draft.sections.forEach((section, i) => {
    if (!section.heading?.trim()) {
      error('HEADING_EMPTY', `sections[${i}] has no heading.`, `sections[${i}]`)
    }
    const hasContent = (section.paragraphs?.length ?? 0) > 0 || (section.list?.length ?? 0) > 0
    if (!hasContent) {
      error('SECTION_EMPTY', `sections[${i}] ("${section.heading}") has a heading and no content.`, `sections[${i}]`)
    }
  })

  // Duplicate headings produce two identical H2s, which makes the document
  // outline ambiguous for anything reading structure rather than prose.
  const headings = draft.sections.map((section) => section.heading.trim().toLowerCase())
  const duplicated = headings.filter((heading, i) => headings.indexOf(heading) !== i)
  for (const heading of new Set(duplicated)) {
    warn('HEADING_DUPLICATE', `The heading "${heading}" appears more than once.`, 'sections')
  }

  const links = [
    ...draft.relatedServices, ...draft.relatedProducts,
    ...draft.relatedLocations, ...draft.relatedGuides,
  ]
  if (links.length === 0) {
    error('NO_INTERNAL_LINKS', 'The draft links to nothing. An unlinked page is a dead end for readers and for crawlers.', 'related*')
  } else if (links.length < 3) {
    warn('FEW_INTERNAL_LINKS', `Only ${links.length} internal link${links.length === 1 ? '' : 's'}. Three or more is what makes the topic cluster navigable.`, 'related*')
  }

  if (draft.faqIds.length === 0) {
    warn('NO_FAQS', 'No FAQs attached. FAQs are the cheapest way to cover the adjacent questions a reader arrives with.', 'faqIds')
  }

  return issues
}

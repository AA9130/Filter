import Reveal from '@/components/ui/Reveal'
import ComparisonTable from '@/components/sections/ComparisonTable'
import type { Comparison, Section } from '@/lib/content'

/**
 * Renders a guide body: headings, paragraphs, titled lists, and the comparison
 * table wherever a section declares `slot: 'comparison'`.
 *
 * Content is structured rather than a blob of HTML or Markdown for two reasons.
 * A validator can assert that a section actually has content — an empty heading
 * is a real failure mode when content is edited by hand. And headings stay real
 * `<h2>`/`<h3>` elements in a known order, so the document outline a crawler
 * reads is the outline the author intended, not whatever a Markdown renderer
 * happened to emit.
 */
export default function ProseSections({
  sections,
  comparison,
  /** Heading level for section headings. Body sections sit under the page H1. */
  as: Heading = 'h2',
}: {
  sections: Section[]
  comparison?: Comparison
  as?: 'h2' | 'h3'
}) {
  const Sub = Heading === 'h2' ? 'h3' : 'h4'

  return (
    <div className="mx-auto max-w-4xl space-y-14">
      {sections.map((section) => (
        <Reveal as="section" key={section.heading}>
          <Heading className="text-xl font-bold leading-snug sm:text-2xl">{section.heading}</Heading>

          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="mt-4 text-base leading-relaxed text-ink-soft">
              {paragraph}
            </p>
          ))}

          {section.list && (
            <ul className="mt-6 space-y-4">
              {section.list.map((point) => (
                <li
                  key={point.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft"
                >
                  <Sub className="text-sm font-bold text-ink sm:text-base">{point.title}</Sub>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{point.body}</p>
                </li>
              ))}
            </ul>
          )}

          {section.slot === 'comparison' && comparison && (
            <ComparisonTable comparison={comparison} className="mt-6" />
          )}
        </Reveal>
      ))}
    </div>
  )
}

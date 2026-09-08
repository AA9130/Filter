import { CheckCircle2 } from 'lucide-react'

/**
 * The direct answer and the key facts, at the top of every service, product,
 * location and guide page.
 *
 * This is the single most important structural decision for AI-search
 * eligibility on this site, and it is not a trick. An answer engine has to
 * decide, cheaply, whether a page answers the question it was asked. A page
 * that opens with three paragraphs of positioning before reaching the answer
 * forces that decision to be made on the positioning. A page that opens with
 * the answer, in one extractable block, does not.
 *
 * It is also better for humans, which is the reason it survives: the reader who
 * wanted the answer gets it, and the reader who wanted the detail scrolls.
 */
export default function AnswerBlock({
  question,
  answer,
  facts,
}: {
  /** Optional visible framing of what the block answers. */
  question?: string
  answer: string
  facts: string[]
}) {
  return (
    <section className="section-tight bg-white" aria-label="Direct answer">
      <div className="container-page">
        <div className="mx-auto max-w-4xl">
          {question && (
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-600">
              {question}
            </p>
          )}
          <div className="mt-4 rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50/70 to-aqua-100/40 p-6 sm:p-8">
            <p className="text-base leading-relaxed text-ink sm:text-lg">{answer}</p>
          </div>

          {facts.length > 0 && (
            <>
              <h2 className="mt-10 text-lg font-bold">Key facts</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {facts.map((fact) => (
                  <li key={fact} className="flex items-start gap-2.5">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-eco-500" />
                    <span className="text-sm leading-relaxed text-ink-soft">{fact}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

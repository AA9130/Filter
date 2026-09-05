import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import { processSteps } from '@/lib/content'

export default function Process() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="How It Works"
          title="From your first message to clean water — usually the same day"
          subtitle="Four simple steps, no jargon and no obligation to buy anything."
        />

        <ol className="relative mt-14 grid gap-6 lg:grid-cols-4">
          {/* Connecting line on desktop */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-brand-100 via-brand-300 to-brand-100 lg:block"
          />

          {processSteps.map((step, i) => (
            <Reveal as="li" key={step.step} delay={i * 0.1} className="relative">
              <div className="flex flex-col items-start">
                <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-lg font-extrabold text-white shadow-lift">
                  {step.step}
                </span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
